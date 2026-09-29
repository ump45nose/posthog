from posthog.api.routing import RouterRegistry

from products.cross_project_dashboards.backend.presentation.views import CrossProjectDashboardViewSet


def register_routes(routers: RouterRegistry) -> None:
    routers.organizations.register(
        r"cross_project_dashboards",
        CrossProjectDashboardViewSet,
        "organization_cross_project_dashboards",
        ["organization_id"],
    )
