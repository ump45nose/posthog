import { expectLogic } from 'kea-test-utils'

import { organizationLogic } from 'scenes/organizationLogic'

import { initKeaTests } from '~/test/init'

import { crossProjectDashboardLogic } from './crossProjectDashboardLogic'
import { crossProjectDashboardsPartialUpdate, crossProjectDashboardsRetrieve } from './generated/api'

jest.mock('./generated/api', () => ({
    __esModule: true,
    crossProjectDashboardsRetrieve: jest.fn(),
    crossProjectDashboardsPartialUpdate: jest.fn(),
    crossProjectDashboardsTilesDestroy: jest.fn(),
}))

const mockedRetrieve = crossProjectDashboardsRetrieve as jest.Mock
const mockedPartialUpdate = crossProjectDashboardsPartialUpdate as jest.Mock

const DASHBOARD_ID = '01a0f19d-1c44-715a-a679-188869bd033f'

const dashboardWith = (filters: Record<string, unknown>): Record<string, unknown> => ({
    id: DASHBOARD_ID,
    name: 'Pageviews across projects',
    filters,
    tiles: [],
})

describe('crossProjectDashboardLogic', () => {
    let logic: ReturnType<typeof crossProjectDashboardLogic.build>

    // The mock persists what it was sent, so a reload reads back the saved filters as the API would.
    let stored: Record<string, unknown> = {}

    const mountWith = async (filters: Record<string, unknown>): Promise<void> => {
        stored = filters
        logic = crossProjectDashboardLogic({ id: DASHBOARD_ID })
        logic.mount()
        await expectLogic(logic).toFinishAllListeners()
    }

    beforeEach(() => {
        mockedRetrieve.mockReset()
        mockedPartialUpdate.mockReset()
        stored = {}
        mockedRetrieve.mockImplementation(async () => dashboardWith(stored))
        mockedPartialUpdate.mockImplementation(async (_org, _id, body) => {
            stored = body.filters
            return dashboardWith(stored)
        })
        initKeaTests()
        organizationLogic.mount()
        organizationLogic.actions.loadCurrentOrganizationSuccess({ id: 'org-1', name: 'Org' } as any)
    })

    afterEach(() => {
        logic?.unmount()
    })

    // A date change must not clobber the rest of the blob, and must not write a bound nobody chose:
    // the backend also stores property filters here, and a null bound would override each insight's own.
    it.each([
        ['drops the bound that was not chosen', {}, '-7d', null, { date_from: '-7d' }],
        ['replaces a previous range', { date_from: '-30d' }, '-7d', null, { date_from: '-7d' }],
        [
            'keeps filters it does not own',
            { properties: [{ type: 'event', key: 'browser', value: 'Chrome' }] },
            '-7d',
            null,
            { properties: [{ type: 'event', key: 'browser', value: 'Chrome' }], date_from: '-7d' },
        ],
        ['clears both bounds', { date_from: '-7d', date_to: '-1d' }, null, null, {}],
        [
            'writes an explicit range',
            {},
            '2026-01-01',
            '2026-01-31',
            { date_from: '2026-01-01', date_to: '2026-01-31' },
        ],
    ])('setDates %s', async (_name, existing, dateFrom, dateTo, expected) => {
        await mountWith(existing as Record<string, unknown>)

        logic.actions.setDates(dateFrom as string | null, dateTo as string | null)
        await expectLogic(logic).toFinishAllListeners()

        expect(mockedPartialUpdate).toHaveBeenCalledTimes(1)
        expect(mockedPartialUpdate.mock.calls[0][2]).toEqual({ filters: expected })
    })

    it('reloads the dashboard after saving, so the tiles refetch on the new range', async () => {
        await mountWith({})
        expect(mockedRetrieve).toHaveBeenCalledTimes(1)

        logic.actions.setDates('-7d', null)
        await expectLogic(logic).toFinishAllListeners()

        expect(mockedRetrieve).toHaveBeenCalledTimes(2)
        expect(logic.values.dashboardFilters).toEqual({ date_from: '-7d' })
    })
})
