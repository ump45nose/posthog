import { useActions, useValues } from 'kea'

import { IconPlus } from '@posthog/icons'
import { LemonButton, LemonInput, LemonModal, LemonTable, LemonTableColumn } from '@posthog/lemon-ui'

import { LemonTableLink } from 'lib/lemon-ui/LemonTable/LemonTableLink'
import { SceneExport } from 'scenes/sceneTypes'

import { SceneContent } from '~/layout/scenes/components/SceneContent'
import { SceneTitleSection } from '~/layout/scenes/components/SceneTitleSection'

import { crossProjectDashboardsListLogic } from './crossProjectDashboardsListLogic'
import type { CrossProjectDashboardApi } from './generated/api.schemas'

export const scene: SceneExport = {
    component: CrossProjectDashboardsScene,
    logic: crossProjectDashboardsListLogic,
}

export function CrossProjectDashboardsScene(): JSX.Element {
    const { dashboards, dashboardsLoading, isNewModalOpen, newName, isCreating } = useValues(
        crossProjectDashboardsListLogic
    )
    const { openNewModal, closeNewModal, setNewName, createDashboard } = useActions(crossProjectDashboardsListLogic)

    const columns: LemonTableColumn<CrossProjectDashboardApi, keyof CrossProjectDashboardApi | undefined>[] = [
        {
            title: 'Name',
            dataIndex: 'name',
            render: (_, dashboard) => (
                <LemonTableLink to={`/cross-project-dashboards/${dashboard.id}`} title={dashboard.name} />
            ),
        },
        {
            title: 'Projects',
            render: (_, dashboard) => new Set((dashboard.tiles ?? []).map((tile) => tile.project_id)).size,
        },
        {
            title: 'Tiles',
            render: (_, dashboard) => (dashboard.tiles ?? []).length,
        },
    ]

    return (
        <SceneContent>
            <SceneTitleSection
                name="Cross-project dashboards"
                description="Put insights from several projects on one page. Each tile shows one project."
                resourceType={{ type: 'dashboard' }}
                actions={
                    <LemonButton
                        type="primary"
                        icon={<IconPlus />}
                        onClick={openNewModal}
                        data-attr="cross-project-dashboard-new"
                    >
                        New dashboard
                    </LemonButton>
                }
            />
            <LemonTable
                dataSource={dashboards}
                columns={columns}
                loading={dashboardsLoading}
                data-attr="cross-project-dashboards-table"
                emptyState="No cross-project dashboards yet."
            />
            <LemonModal
                isOpen={isNewModalOpen}
                onClose={closeNewModal}
                title="New cross-project dashboard"
                footer={
                    <>
                        <LemonButton type="secondary" onClick={closeNewModal}>
                            Cancel
                        </LemonButton>
                        <LemonButton
                            type="primary"
                            onClick={createDashboard}
                            disabledReason={!newName.trim() ? 'Give the dashboard a name first' : undefined}
                            loading={isCreating}
                            data-attr="cross-project-dashboard-new-confirm"
                        >
                            Create
                        </LemonButton>
                    </>
                }
            >
                <LemonInput
                    value={newName}
                    onChange={setNewName}
                    placeholder="Company overview"
                    autoFocus
                    data-attr="cross-project-dashboard-new-name"
                />
            </LemonModal>
        </SceneContent>
    )
}
