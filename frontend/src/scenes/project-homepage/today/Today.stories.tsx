import type { Meta, StoryObj } from '@storybook/react'
import { within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { FEATURE_FLAGS } from 'lib/constants'
import { App } from 'scenes/App'
import { urls } from 'scenes/urls'

import { mswDecorator } from '~/mocks/browser'
import { EMPTY_PAGINATED_RESPONSE } from '~/mocks/handlers'

import { makeReport, mockSignals } from 'products/signals/frontend/inbox/__mocks__/inboxMocks'
import { SignalReportStatus } from 'products/signals/frontend/inbox/types'
import type { BriefingApi, BriefingItemApi } from 'products/today/frontend/generated/api.schemas'

const SPACES = [
    {
        id: 'space-me',
        name: 'me',
        channel_type: 'private',
        github_integration: null,
        repositories: [],
        auto_archive_after_days: null,
        created_at: '2026-09-01T09:00:00Z',
        starred: true,
        system_role: 'personal',
    },
    {
        id: 'space-general',
        name: 'general',
        channel_type: 'public',
        github_integration: null,
        repositories: [],
        auto_archive_after_days: null,
        created_at: '2026-09-01T09:00:00Z',
        starred: false,
        system_role: 'general',
    },
    {
        id: 'space-checkout',
        name: 'checkout',
        channel_type: 'public',
        github_integration: null,
        repositories: [],
        auto_archive_after_days: null,
        created_at: '2026-09-02T09:00:00Z',
        starred: true,
        system_role: null,
    },
]

const CONVERSATIONS = [
    {
        id: 'chat-1',
        title: 'Why did signups spike on Monday?',
        status: 'idle',
        type: 'assistant',
        updated_at: '2026-09-28T16:10:00Z',
    },
    {
        id: 'chat-2',
        title: 'Weekly retention by plan',
        status: 'idle',
        type: 'assistant',
        updated_at: '2026-09-25T09:00:00Z',
    },
]

const PINNED_SESSIONS = [
    {
        id: 'task-pinned',
        title: 'Fix the flaky checkout test',
        archived: false,
        last_activity_at: '2026-09-28T17:40:00Z',
        latest_run: { status: 'in_progress' },
    },
]

const RECENT_SESSIONS = [
    ...PINNED_SESSIONS,
    {
        id: 'task-1',
        title: 'Add a retry to the billing webhook',
        archived: false,
        last_activity_at: '2026-09-28T18:05:00Z',
        latest_run: { status: 'completed' },
    },
    {
        id: 'task-2',
        title: 'Investigate the drop in trial starts',
        archived: false,
        last_activity_at: '2026-09-27T11:20:00Z',
        latest_run: { status: 'failed' },
    },
]

const LIBRARY = [
    { id: 'fs-1', path: 'Unfiled/Insights/Checkout funnel', type: 'insight', ref: 'abc123' },
    { id: 'fs-2', path: 'Unfiled/Dashboards/Growth overview', type: 'dashboard', ref: '12' },
    { id: 'fs-3', path: 'Unfiled/Feature flags/one-page-checkout', type: 'feature_flag', ref: '7' },
]

const REPORTS = [
    makeReport({
        id: 'report-1',
        title: 'Signup form rejects plus-addressed emails',
        summary:
            'Sign-ups with a plus sign in the email address fail validation since the last release.\n\n## Impact\n\nNew teams that use plus addressing cannot finish signing up.',
        status: SignalReportStatus.READY,
        signal_count: 12,
        updated_at: '2026-09-28T07:00:00Z',
        priority: 'P1',
        actionability: 'immediately_actionable',
        source_products: ['error_tracking', 'session_replay'],
        implementation_pr_url: 'https://github.com/example/app/pull/42',
    }),
    makeReport({
        id: 'report-2',
        title: 'Pricing page visitors drop off at the plan table',
        summary: 'Most visitors who reach the plan table leave without starting a trial.',
        status: SignalReportStatus.READY,
        signal_count: 5,
        updated_at: '2026-09-27T16:00:00Z',
        priority: 'P3',
        actionability: 'requires_human_input',
        source_products: ['analytics'],
        suggested_prompts: [
            'Which plans do visitors compare before they leave?',
            'Draft an experiment for the plan table',
        ],
    }),
    makeReport({
        id: 'report-3',
        title: 'LLM costs doubled for the summarize tool',
        summary: 'Token usage for the summarize tool doubled after the prompt change.',
        status: SignalReportStatus.PENDING_INPUT,
        signal_count: 3,
        updated_at: '2026-09-27T10:00:00Z',
        priority: 'P2',
        actionability: 'immediately_actionable',
        source_products: ['llm_analytics'],
    }),
]

function briefingItem(overrides: Partial<BriefingItemApi> & Pick<BriefingItemApi, 'key' | 'label'>): BriefingItemApi {
    return {
        title: overrides.label,
        signal: '',
        url: '/project/1/inbox',
        rank: 1,
        in_text: true,
        group: 'report',
        source: 'self_driving',
        reason: 'waiting_for_you',
        state: 'open',
        ...overrides,
    }
}

const PERSONAL_BRIEFING: BriefingApi = {
    id: 'briefing-1',
    local_day: '2026-09-28',
    headline: 'Two reports need your input this morning',
    paragraphs: [
        [
            { text: 'The ', item_key: null, highlight: false },
            { text: 'signup form rejects plus-addressed emails', item_key: 'report:report-1', highlight: true },
            { text: ', and a fix is waiting for your review. ', item_key: null, highlight: false },
            { text: 'LLM costs doubled', item_key: 'report:report-3', highlight: false },
            { text: ' for the summarize tool after the prompt change.', item_key: null, highlight: false },
        ],
        [
            { text: 'Trial starts on ', item_key: null, highlight: false },
            { text: 'the growth dashboard', item_key: 'dashboard:12', highlight: false },
            { text: ' fell 18% week over week, and ', item_key: null, highlight: false },
            { text: 'the error rate alert', item_key: 'alert:5', highlight: false },
            { text: ' is firing. ', item_key: null, highlight: false },
            { text: 'Ticket #1042', item_key: 'ticket:t-1', highlight: false },
            { text: ' has 3 unread messages.', item_key: null, highlight: false },
        ],
    ],
    items: [
        briefingItem({
            key: 'report:report-1',
            label: 'Plus-addressed signups fail',
            signal: 'P1, fix ready for review',
            rank: 1,
        }),
        briefingItem({
            key: 'report:report-3',
            label: 'Summarize tool costs doubled',
            signal: 'P2, claimed by you',
            rank: 2,
        }),
        briefingItem({
            key: 'dashboard:12',
            label: 'Growth overview',
            signal: 'Trial starts down 18%',
            url: '/project/1/dashboard/12',
            rank: 3,
            group: 'dashboard',
            source: 'product_analytics',
            reason: 'dashboard_you_viewed',
        }),
        briefingItem({
            key: 'alert:5',
            label: 'Error rate alert',
            signal: 'Firing since 07:10',
            url: '/project/1/insights/abc123/alerts?alert_id=5',
            rank: 4,
            group: 'dashboard',
            source: 'alerts',
            reason: 'alert_firing',
        }),
        briefingItem({
            key: 'ticket:t-1',
            label: 'Ticket #1042',
            signal: '3 unread messages',
            url: '/project/1/support/tickets/t-1',
            rank: 5,
            group: 'other',
            source: 'support',
            reason: 'assigned_ticket',
        }),
        briefingItem({
            key: 'report:report-2',
            label: 'Pricing page drop-off',
            signal: 'P3, suggested reviewer',
            rank: 6,
            in_text: false,
            reason: 'suggested_reviewer',
            state: 'done',
        }),
        briefingItem({
            key: 'github:example/app#42',
            label: 'Retry the billing webhook',
            signal: 'Review requested',
            url: 'https://github.com/example/app/pull/42',
            rank: 7,
            in_text: false,
            group: 'other',
            source: 'github',
            reason: 'review_requested',
        }),
    ],
    more_reports_count: 4,
    status: 'ready',
    writer: 'llm',
    created_at: '2026-09-28T06:00:00Z',
    ready_at: '2026-09-28T06:00:21Z',
}

// Today keeps sample mode, the open pane and the sidebar width in local storage, which outlives a story.
// Clearing it makes each story start clean, so only the sample stories show sample reports.
function clearTodayStorage(Story: () => JSX.Element): JSX.Element {
    for (const key of Object.keys(window.localStorage)) {
        if (/today/i.test(key)) {
            window.localStorage.removeItem(key)
        }
    }
    return <Story />
}

const meta: Meta = {
    component: App,
    title: 'Scenes-App/Project Homepage/Today',
    // No snapshots while the Today layout is still changing quickly. The stories stay for local development.
    tags: ['test-skip'],
    decorators: [
        clearTodayStorage,
        mswDecorator({
            get: {
                '/api/projects/:team_id/signals/reports/': { results: REPORTS, count: 7 },
                '/api/projects/:team_id/signals/reports/:id/': (req) => [
                    200,
                    REPORTS.find((report) => report.id === req.params.id) ?? REPORTS[0],
                ],
                '/api/projects/:team_id/signals/reports/:id/signals/': (req) => [
                    200,
                    // Error tracking signals fetch their issue, which these stories do not mock.
                    {
                        signals: mockSignals(String(req.params.id), 6).filter(
                            (signal) => signal.source_product !== 'error_tracking'
                        ),
                    },
                ],
                '/api/projects/:team_id/today/briefing/': () => [404, { detail: 'Not found.' }],
                '/api/projects/:team_id/task_channels/': SPACES,
                '/api/projects/:team_id/task_channels/:id/': (req) => [
                    200,
                    SPACES.find((space) => space.id === req.params.id) ?? SPACES[0],
                ],
                '/api/projects/:team_id/tasks/': ({ request }) => {
                    const params = new URL(request.url).searchParams
                    const results = params.get('pinned')
                        ? PINNED_SESSIONS
                        : params.get('created_by') || params.get('channel') === 'space-checkout'
                          ? RECENT_SESSIONS
                          : []
                    return [200, { results, count: results.length, next: null, previous: null }]
                },
                '/api/environments/:team_id/conversations/': { results: CONVERSATIONS, next: null },
                '/api/environments/:team_id/file_system/': ({ request }) => {
                    const type = new URL(request.url).searchParams.get('type')
                    const results = type ? LIBRARY.filter((entry) => entry.type === type) : LIBRARY
                    return [200, { results, count: results.length }]
                },
                '/api/environments/:team_id/file_system/unfiled/': { results: [], count: 0 },
            },
        }),
    ],
    parameters: {
        layout: 'fullscreen',
        viewMode: 'story',
        mockDate: '2026-09-28 18:30:00',
        pageUrl: urls.projectHomepage(),
        featureFlags: [FEATURE_FLAGS.TODAY_RAIL_NAV],
        testOptions: { waitForLoadersToDisappear: true },
    },
}
export default meta

type Story = StoryObj<{}>

export const Home: Story = {}

export const HomeWithPersonalBriefing: Story = {
    decorators: [mswDecorator({ get: { '/api/projects/:team_id/today/briefing/': PERSONAL_BRIEFING } })],
}

export const HomeWithPersonalBriefingDraft: Story = {
    decorators: [
        mswDecorator({
            get: {
                '/api/projects/:team_id/today/briefing/': {
                    ...PERSONAL_BRIEFING,
                    status: 'writing',
                    writer: 'template',
                    ready_at: null,
                },
            },
        }),
    ],
}

export const HomeWithSampleReports: Story = {
    parameters: { pageUrl: `${urls.projectHomepage()}?sample=1` },
}

export const SampleReportPage: Story = {
    parameters: { pageUrl: `${urls.todayReport('sample-pr')}?sample=1` },
}

export const HomeWithNoReports: Story = {
    decorators: [
        mswDecorator({
            get: { '/api/projects/:team_id/signals/reports/': EMPTY_PAGINATED_RESPONSE },
        }),
    ],
}

export const HomeWhenReportsFailToLoad: Story = {
    decorators: [
        mswDecorator({
            get: { '/api/projects/:team_id/signals/reports/': () => [500, { detail: 'Server error' }] },
        }),
    ],
}

export const ReportWithPullRequest: Story = {
    parameters: { pageUrl: urls.todayReport('report-1') },
}

export const ReportWithSuggestedPrompts: Story = {
    parameters: { pageUrl: urls.todayReport('report-2') },
}

export const SpacesPane: Story = {
    play: async ({ canvasElement }) => {
        await userEvent.click(await within(canvasElement).findByLabelText('Spaces'))
    },
}

export const SpacePage: Story = {
    parameters: { pageUrl: urls.taskSpace('space-checkout') },
}

export const LibraryAllObjects: Story = {
    parameters: { pageUrl: urls.library() },
}

export const LibraryFeatureFlags: Story = {
    parameters: { pageUrl: urls.library('feature_flag') },
}

export const ToolsPane: Story = {
    play: async ({ canvasElement }) => {
        await userEvent.click(await within(canvasElement).findByLabelText('Tools'))
    },
}
