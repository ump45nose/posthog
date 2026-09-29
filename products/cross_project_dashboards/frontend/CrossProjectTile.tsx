import { useEffect, useState } from 'react'

import { LemonSkeleton } from '@posthog/lemon-ui'

import { InsightCard } from 'lib/components/Cards/InsightCard/InsightCard'
import { InsightErrorState } from 'scenes/insights/EmptyStates/EmptyStates'

import { DashboardPlacement, type InsightModel } from '~/types'

import type { TileUnavailableReason } from './crossProjectTileFetch'
import { fetchCrossProjectTile } from './crossProjectTileFetch'

const UNAVAILABLE_COPY: Record<TileUnavailableReason, string> = {
    'no-access': 'You do not have access to this insight. Ask an admin of its project for access.',
    'not-found': 'This insight no longer exists. Remove the tile or point it at another insight.',
    failed: 'This tile could not load. Refresh the page to try again.',
}

export interface CrossProjectTileProps {
    projectId: number
    insightId: number
    filtersOverride?: Record<string, unknown>
}

export function CrossProjectTile({ projectId, insightId, filtersOverride }: CrossProjectTileProps): JSX.Element {
    const [insight, setInsight] = useState<InsightModel | null>(null)
    const [unavailable, setUnavailable] = useState<TileUnavailableReason | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        void fetchCrossProjectTile(projectId, insightId, filtersOverride).then((result) => {
            if (cancelled) {
                return
            }
            setInsight(result.insight)
            setUnavailable(result.unavailable)
            setLoading(false)
        })
        return () => {
            cancelled = true
        }
    }, [projectId, insightId, filtersOverride])

    if (loading) {
        return <LemonSkeleton className="h-60 w-full" data-attr="cross-project-tile-loading" />
    }

    if (unavailable || !insight) {
        return (
            <InsightErrorState
                data-attr="cross-project-tile-unavailable"
                title={UNAVAILABLE_COPY[unavailable ?? 'failed']}
                excludeDetail
            />
        )
    }

    return (
        <InsightCard
            insight={insight}
            placement={DashboardPlacement.Dashboard}
            showEditingControls={false}
            showDetailsControls={false}
        />
    )
}
