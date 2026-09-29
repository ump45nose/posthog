/**
 * Auto-generated Zod validation schemas from the Django backend OpenAPI schema.
 * To modify these schemas, update the Django serializers or views, then run:
 *   hogli build:openapi
 * Questions or issues? #team-devex on Slack
 *
 * PostHog API - generated
 * OpenAPI spec version: 1.0.0
 */
import * as zod from 'zod'

/**
 * Dashboards the organization owns, holding insights from several projects.
 */
export const crossProjectDashboardsCreateBodyNameMax = 400

export const crossProjectDashboardsCreateBodyTilesItemProjectIdMin = -2147483648
export const crossProjectDashboardsCreateBodyTilesItemProjectIdMax = 2147483647

export const crossProjectDashboardsCreateBodyTilesItemInsightIdMin = -2147483648
export const crossProjectDashboardsCreateBodyTilesItemInsightIdMax = 2147483647

export const crossProjectDashboardsCreateBodyTilesItemColorMax = 400

export const CrossProjectDashboardsCreateBody = /* @__PURE__ */ zod
    .object({
        name: zod
            .string()
            .max(crossProjectDashboardsCreateBodyNameMax)
            .describe('Name shown in the dashboard list and page header.'),
        description: zod.string().optional().describe('Optional longer description.'),
        filters: zod
            .unknown()
            .optional()
            .describe(
                'Dashboard-level filters applied to every tile. Supports a date range, an interval, and property filters that refer to a property by name. Filters carrying a project-specific id are rejected.'
            ),
        tiles: zod
            .array(
                zod.object({
                    id: zod.uuid().optional(),
                    project_id: zod
                        .number()
                        .min(crossProjectDashboardsCreateBodyTilesItemProjectIdMin)
                        .max(crossProjectDashboardsCreateBodyTilesItemProjectIdMax)
                        .describe("Id of the project the tile's insight belongs to."),
                    insight_id: zod
                        .number()
                        .min(crossProjectDashboardsCreateBodyTilesItemInsightIdMin)
                        .max(crossProjectDashboardsCreateBodyTilesItemInsightIdMax)
                        .describe('Id of the insight the tile renders.'),
                    layouts: zod
                        .unknown()
                        .optional()
                        .describe('Grid position and size of the tile, keyed by layout size.'),
                    color: zod
                        .string()
                        .max(crossProjectDashboardsCreateBodyTilesItemColorMax)
                        .nullish()
                        .describe('Optional colour applied to the tile.'),
                    filters_overrides: zod.unknown().optional().describe('Filters applied to this tile only.'),
                })
            )
            .optional(),
    })
    .describe(
        "Carries tile references only.\n\nThe response holds no insight names, queries or results. Each reader fetches each tile from\nthat tile's own project endpoint, so their access, quota and cache key stay correct there."
    )

/**
 * Dashboards the organization owns, holding insights from several projects.
 */
export const crossProjectDashboardsUpdateBodyNameMax = 400

export const crossProjectDashboardsUpdateBodyTilesItemProjectIdMin = -2147483648
export const crossProjectDashboardsUpdateBodyTilesItemProjectIdMax = 2147483647

export const crossProjectDashboardsUpdateBodyTilesItemInsightIdMin = -2147483648
export const crossProjectDashboardsUpdateBodyTilesItemInsightIdMax = 2147483647

export const crossProjectDashboardsUpdateBodyTilesItemColorMax = 400

export const CrossProjectDashboardsUpdateBody = /* @__PURE__ */ zod
    .object({
        name: zod
            .string()
            .max(crossProjectDashboardsUpdateBodyNameMax)
            .describe('Name shown in the dashboard list and page header.'),
        description: zod.string().optional().describe('Optional longer description.'),
        filters: zod
            .unknown()
            .optional()
            .describe(
                'Dashboard-level filters applied to every tile. Supports a date range, an interval, and property filters that refer to a property by name. Filters carrying a project-specific id are rejected.'
            ),
        tiles: zod
            .array(
                zod.object({
                    id: zod.uuid().optional(),
                    project_id: zod
                        .number()
                        .min(crossProjectDashboardsUpdateBodyTilesItemProjectIdMin)
                        .max(crossProjectDashboardsUpdateBodyTilesItemProjectIdMax)
                        .describe("Id of the project the tile's insight belongs to."),
                    insight_id: zod
                        .number()
                        .min(crossProjectDashboardsUpdateBodyTilesItemInsightIdMin)
                        .max(crossProjectDashboardsUpdateBodyTilesItemInsightIdMax)
                        .describe('Id of the insight the tile renders.'),
                    layouts: zod
                        .unknown()
                        .optional()
                        .describe('Grid position and size of the tile, keyed by layout size.'),
                    color: zod
                        .string()
                        .max(crossProjectDashboardsUpdateBodyTilesItemColorMax)
                        .nullish()
                        .describe('Optional colour applied to the tile.'),
                    filters_overrides: zod.unknown().optional().describe('Filters applied to this tile only.'),
                })
            )
            .optional(),
    })
    .describe(
        "Carries tile references only.\n\nThe response holds no insight names, queries or results. Each reader fetches each tile from\nthat tile's own project endpoint, so their access, quota and cache key stay correct there."
    )

/**
 * Dashboards the organization owns, holding insights from several projects.
 */
export const crossProjectDashboardsPartialUpdateBodyNameMax = 400

export const crossProjectDashboardsPartialUpdateBodyTilesItemProjectIdMin = -2147483648
export const crossProjectDashboardsPartialUpdateBodyTilesItemProjectIdMax = 2147483647

export const crossProjectDashboardsPartialUpdateBodyTilesItemInsightIdMin = -2147483648
export const crossProjectDashboardsPartialUpdateBodyTilesItemInsightIdMax = 2147483647

export const crossProjectDashboardsPartialUpdateBodyTilesItemColorMax = 400

export const CrossProjectDashboardsPartialUpdateBody = /* @__PURE__ */ zod
    .object({
        name: zod
            .string()
            .max(crossProjectDashboardsPartialUpdateBodyNameMax)
            .optional()
            .describe('Name shown in the dashboard list and page header.'),
        description: zod.string().optional().describe('Optional longer description.'),
        filters: zod
            .unknown()
            .optional()
            .describe(
                'Dashboard-level filters applied to every tile. Supports a date range, an interval, and property filters that refer to a property by name. Filters carrying a project-specific id are rejected.'
            ),
        tiles: zod
            .array(
                zod.object({
                    id: zod.uuid().optional(),
                    project_id: zod
                        .number()
                        .min(crossProjectDashboardsPartialUpdateBodyTilesItemProjectIdMin)
                        .max(crossProjectDashboardsPartialUpdateBodyTilesItemProjectIdMax)
                        .describe("Id of the project the tile's insight belongs to."),
                    insight_id: zod
                        .number()
                        .min(crossProjectDashboardsPartialUpdateBodyTilesItemInsightIdMin)
                        .max(crossProjectDashboardsPartialUpdateBodyTilesItemInsightIdMax)
                        .describe('Id of the insight the tile renders.'),
                    layouts: zod
                        .unknown()
                        .optional()
                        .describe('Grid position and size of the tile, keyed by layout size.'),
                    color: zod
                        .string()
                        .max(crossProjectDashboardsPartialUpdateBodyTilesItemColorMax)
                        .nullish()
                        .describe('Optional colour applied to the tile.'),
                    filters_overrides: zod.unknown().optional().describe('Filters applied to this tile only.'),
                })
            )
            .optional(),
    })
    .describe(
        "Carries tile references only.\n\nThe response holds no insight names, queries or results. Each reader fetches each tile from\nthat tile's own project endpoint, so their access, quota and cache key stay correct there."
    )
