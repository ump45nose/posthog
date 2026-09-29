import { SceneExport } from 'scenes/sceneTypes'

import { SceneContent } from '~/layout/scenes/components/SceneContent'
import { SceneTitleSection } from '~/layout/scenes/components/SceneTitleSection'

import { CrossProjectDashboardsList } from './CrossProjectDashboardsList'
import { crossProjectDashboardsListLogic } from './crossProjectDashboardsListLogic'

export const scene: SceneExport = {
    component: CrossProjectDashboardsScene,
    logic: crossProjectDashboardsListLogic,
}

export function CrossProjectDashboardsScene(): JSX.Element {
    return (
        <SceneContent>
            <SceneTitleSection
                name="Cross-project dashboards"
                description="Put insights from several projects on one page. Each tile shows one project."
                resourceType={{ type: 'dashboard' }}
            />
            <CrossProjectDashboardsList />
        </SceneContent>
    )
}
