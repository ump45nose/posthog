import type { HookCallback, HookInput } from "@anthropic-ai/claude-agent-sdk";
import type { ProcessKilledParams } from "../../../acp-extensions";
import { MemoryWatchdogKillReader } from "../../../server/memory-watchdog";
import type { Logger } from "../../../utils/logger";

const BYTES_PER_GIB = 1024 ** 3;

function formatGib(bytes: number): string {
  return `${(bytes / BYTES_PER_GIB).toFixed(1)} GiB`;
}

export function formatMemoryKillNotice(kills: ProcessKilledParams[]): string {
  const lines = kills.map(
    (kill) =>
      `- ${kill.at}: stopped \`${kill.comm}\` (pid ${kill.pid}) with ${kill.signal}. Its process tree used ${formatGib(kill.treeRssBytes)}. Sandbox memory was at ${formatGib(kill.memoryCurrentBytes)} of ${formatGib(kill.memoryLimitBytes)}.`,
  );
  return [
    "## Sandbox memory watchdog",
    "",
    "The sandbox stopped a shell command because the sandbox was close to its memory limit:",
    ...lines,
    "",
    "The exit status of that command is from this stop, not from the command itself.",
    "If you run the same command again without changes, the sandbox will stop it again.",
    "Run a smaller command instead: fewer test files, fewer parallel workers, or one package at a time.",
  ].join("\n");
}

// The Bash tool only sees an exit code when the watchdog stops its process
// tree, so without this notice the agent reruns the same command.
export const createMemoryKillNoticeHook = (
  logger: Logger,
  reader: MemoryWatchdogKillReader = new MemoryWatchdogKillReader(),
  startedAtMs: number = Date.now(),
): HookCallback => {
  return async (input: HookInput) => {
    if (
      input.hook_event_name !== "PostToolUse" &&
      input.hook_event_name !== "PostToolUseFailure"
    ) {
      return { continue: true };
    }
    if (input.tool_name !== "Bash") return { continue: true };

    let kills: ProcessKilledParams[];
    try {
      kills = (await reader.readNewKills()).filter(
        (kill) => Date.parse(kill.at) >= startedAtMs,
      );
    } catch (error) {
      logger.debug("Memory watchdog events read failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { continue: true };
    }
    if (kills.length === 0) return { continue: true };

    return {
      continue: true,
      hookSpecificOutput: {
        hookEventName: input.hook_event_name,
        additionalContext: formatMemoryKillNotice(kills),
      },
    };
  };
};
