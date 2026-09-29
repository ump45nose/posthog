"""DRF views for cross_project_dashboards."""

from typing import Any

from django.db.models import Prefetch, QuerySet

from rest_framework import viewsets

from posthog.api.routing import TeamAndOrgViewSetMixin
from posthog.permissions import PostHogFeatureFlagPermission

from products.cross_project_dashboards.backend.facade.api import CrossProjectDashboard, CrossProjectDashboardTile
from products.cross_project_dashboards.backend.presentation.serializers import CrossProjectDashboardSerializer


class CrossProjectDashboardViewSet(TeamAndOrgViewSetMixin, viewsets.ModelViewSet):
    """Dashboards the organization owns, holding insights from several projects."""

    scope_object = "cross_project_dashboard"
    serializer_class = CrossProjectDashboardSerializer
    queryset = CrossProjectDashboard.objects.all()
    lookup_field = "id"
    # Server-side rollout boundary: the flag gates the API, not only the UI.
    posthog_feature_flag = "cross-project-dashboards"
    permission_classes = [PostHogFeatureFlagPermission]

    def safely_get_queryset(self, queryset: QuerySet) -> QuerySet:
        return (
            queryset.filter(organization_id=self.organization_id, deleted=False)
            .prefetch_related(
                Prefetch(
                    "tiles",
                    queryset=CrossProjectDashboardTile.objects.filter(deleted=False).order_by("created_at"),
                )
            )
            .order_by("-created_at")
        )

    def get_serializer_context(self) -> dict[str, Any]:
        return {**super().get_serializer_context(), "organization_id": self.organization_id}

    def perform_destroy(self, instance: CrossProjectDashboard) -> None:
        instance.deleted = True
        instance.save(update_fields=["deleted"])
