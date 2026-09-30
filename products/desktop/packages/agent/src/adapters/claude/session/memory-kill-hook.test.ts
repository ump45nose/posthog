import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { HookInput } from "@anthropic-ai/claude-agent-sdk";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MemoryWatchdogKillReader } from "../../../server/memory-watchdog";
import { Logger } from "../../../utils/logger";
import { createMemoryKillNoticeHook } from "./memory-kill-hook";

const GIB = 1024 ** 3;
const STARTED_AT_SECONDS = 1_800_000_000;

function killRecord(pid: number, ts: number): string {
  return JSON.stringify({
    event: "kill",
    ts,
    pid,
    comm: "bash",
    tree_rss: 22 * GIB,
    current: 27 * GIB,
    limit: 32 * GIB,
    signal: "SIGKILL",
  });
}

function bashInput(
  hookEventName: "PostToolUse" | "PostToolUseFailure",
): HookInput {
  return {
    session_id: "s",
    transcript_path: "/tmp/t",
    cwd: "/tmp",
    hook_event_name: hookEventName,
    tool_name: "Bash",
    tool_input: { command: "pnpm test" },
    tool_use_id: "toolu_1",
    ...(hookEventName === "PostToolUse"
      ? { tool_response: "" }
      : { error: "Exit code 137" }),
  } as unknown as HookInput;
}

describe("createMemoryKillNoticeHook", () => {
  let dir: string;
  let path: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "memory-kill-hook-"));
    path = join(dir, "events.jsonl");
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it.each(["PostToolUse", "PostToolUseFailure"] as const)(
    "tells the agent about a new kill once after a %s Bash call",
    async (hookEventName) => {
      await writeFile(
        path,
        `${killRecord(7, STARTED_AT_SECONDS - 60)}\n${killRecord(8, STARTED_AT_SECONDS + 5)}\n`,
      );
      const hook = createMemoryKillNoticeHook(
        new Logger({ debug: false }),
        new MemoryWatchdogKillReader(path),
        STARTED_AT_SECONDS * 1000,
      );
      const opts = { signal: new AbortController().signal };

      const first = (await hook(bashInput(hookEventName), "toolu_1", opts)) as {
        hookSpecificOutput?: {
          hookEventName: string;
          additionalContext: string;
        };
      };
      const second = await hook(bashInput(hookEventName), "toolu_2", opts);

      expect(first.hookSpecificOutput?.hookEventName).toBe(hookEventName);
      const context = first.hookSpecificOutput?.additionalContext ?? "";
      expect(context).toContain("(pid 8) with SIGKILL");
      expect(context).toContain("22.0 GiB");
      expect(context).not.toContain("pid 7");
      expect(second).toEqual({ continue: true });
    },
  );
});
