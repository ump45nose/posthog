import { useActions, useValues } from 'kea'
import { useState } from 'react'

import { LemonButton, LemonInput, LemonSwitch } from '@posthog/lemon-ui'

import { RestrictionScope, useRestrictedArea } from 'lib/components/RestrictedArea'
import { TeamMembershipLevel } from 'lib/constants'
import { teamLogic } from 'scenes/teamLogic'

const DEFAULT_WAIT_PERIOD_DAYS = 14
const MAX_WAIT_PERIOD_DAYS = 365

export function SurveyGlobalWaitPeriod(): JSX.Element {
    const { currentTeam, currentTeamLoading } = useValues(teamLogic)
    const { updateCurrentTeam } = useActions(teamLogic)
    const restrictedReason = useRestrictedArea({
        scope: RestrictionScope.Project,
        minimumAccessLevel: TeamMembershipLevel.Admin,
    })

    const savedDays = currentTeam?.survey_config?.seenSurveyWaitPeriodInDays || null
    const [enabled, setEnabled] = useState(!!savedDays)
    const [days, setDays] = useState<number | undefined>(savedDays ?? DEFAULT_WAIT_PERIOD_DAYS)

    const nextDays = enabled ? (days ?? null) : null
    const isValid =
        nextDays === null || (Number.isInteger(nextDays) && nextDays > 0 && nextDays <= MAX_WAIT_PERIOD_DAYS)

    return (
        <div className="flex flex-col gap-2 items-start">
            <LemonSwitch
                data-attr="survey-global-wait-period-switch"
                label="Wait between surveys"
                bordered
                checked={enabled}
                onChange={setEnabled}
                disabledReason={restrictedReason}
            />
            {enabled && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span>Don't show a user any survey for</span>
                    <LemonInput
                        type="number"
                        size="small"
                        min={1}
                        max={MAX_WAIT_PERIOD_DAYS}
                        value={days}
                        onChange={setDays}
                        className="w-20 tabular-nums"
                        disabledReason={restrictedReason}
                        data-attr="survey-global-wait-period-input"
                    />
                    <span>days after they see one.</span>
                </div>
            )}
            <LemonButton
                type="primary"
                data-attr="survey-global-wait-period-save"
                loading={currentTeamLoading}
                disabledReason={
                    restrictedReason ??
                    (!isValid
                        ? `Enter a whole number of days from 1 to ${MAX_WAIT_PERIOD_DAYS}.`
                        : nextDays === savedDays
                          ? 'No changes to save'
                          : undefined)
                }
                onClick={() =>
                    updateCurrentTeam({
                        survey_config: {
                            ...currentTeam?.survey_config,
                            seenSurveyWaitPeriodInDays: nextDays,
                        },
                    })
                }
            >
                Save
            </LemonButton>
        </div>
    )
}
