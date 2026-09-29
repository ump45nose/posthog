import '@testing-library/jest-dom'

import { cleanup, render, screen, waitFor } from '@testing-library/react'

import { initKeaTests } from '~/test/init'

import { CrossProjectTile } from './CrossProjectTile'
import * as tileFetch from './crossProjectTileFetch'

jest.mock('lib/components/Cards/InsightCard/InsightCard', () => ({
    InsightCard: ({ insight }: { insight: { name: string } }) => <div data-attr="insight-card">{insight.name}</div>,
}))

describe('CrossProjectTile', () => {
    beforeEach(() => {
        initKeaTests()
    })

    afterEach(() => {
        cleanup()
        jest.restoreAllMocks()
    })

    it('renders the insight once its project answers', async () => {
        jest.spyOn(tileFetch, 'fetchCrossProjectTile').mockResolvedValue({
            insight: { name: 'Signups' } as any,
            unavailable: null,
        })

        render(<CrossProjectTile projectId={42} insightId={7} />)

        await waitFor(() => expect(screen.getByText('Signups')).toBeInTheDocument())
    })

    it('renders an unavailable tile without a name when access is denied', async () => {
        jest.spyOn(tileFetch, 'fetchCrossProjectTile').mockResolvedValue({
            insight: null,
            unavailable: 'no-access',
        })

        render(<CrossProjectTile projectId={42} insightId={7} />)

        await waitFor(() => expect(screen.getByText(/do not have access/i)).toBeInTheDocument())
        expect(screen.queryByText('Signups')).not.toBeInTheDocument()
        expect(screen.queryByTestId('insight-card')).not.toBeInTheDocument()
    })

    it('renders an unavailable tile when the insight is gone', async () => {
        jest.spyOn(tileFetch, 'fetchCrossProjectTile').mockResolvedValue({
            insight: null,
            unavailable: 'not-found',
        })

        render(<CrossProjectTile projectId={42} insightId={7} />)

        await waitFor(() => expect(screen.getByText(/no longer exists/i)).toBeInTheDocument())
    })

    it('fetches from the tile own project', async () => {
        const spy = jest
            .spyOn(tileFetch, 'fetchCrossProjectTile')
            .mockResolvedValue({ insight: { name: 'X' } as any, unavailable: null })

        render(<CrossProjectTile projectId={99} insightId={3} />)

        await waitFor(() => expect(spy).toHaveBeenCalledWith(99, 3, undefined))
    })
})
