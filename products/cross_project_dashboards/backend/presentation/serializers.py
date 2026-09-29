"""DRF serializers for cross_project_dashboards."""

from typing import Any, cast

from django.db import transaction

from rest_framework import serializers

from posthog.api.shared import UserBasicSerializer
from posthog.models import User

from products.cross_project_dashboards.backend.facade.api import (
    CrossProjectDashboard,
    CrossProjectDashboardTile,
    assert_can_reference_insight,
    validate_cross_project_filters,
)


class CrossProjectDashboardTileSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False)

    class Meta:
        model = CrossProjectDashboardTile
        fields = ["id", "project_id", "insight_id", "layouts", "color", "filters_overrides"]
        extra_kwargs = {
            "project_id": {"help_text": "Id of the project the tile's insight belongs to."},
            "insight_id": {"help_text": "Id of the insight the tile renders."},
            "layouts": {"help_text": "Grid position and size of the tile, keyed by layout size."},
            "color": {"help_text": "Optional colour applied to the tile."},
            "filters_overrides": {"help_text": "Filters applied to this tile only."},
        }


class CrossProjectDashboardSerializer(serializers.ModelSerializer):
    """Carries tile references only.

    The response holds no insight names, queries or results. Each reader fetches each tile from
    that tile's own project endpoint, so their access, quota and cache key stay correct there.
    """

    tiles = CrossProjectDashboardTileSerializer(many=True, required=False)
    created_by = UserBasicSerializer(read_only=True)

    class Meta:
        model = CrossProjectDashboard
        fields = [
            "id",
            "name",
            "description",
            "filters",
            "tiles",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]
        extra_kwargs = {
            "name": {"help_text": "Name shown in the dashboard list and page header."},
            "description": {"help_text": "Optional longer description."},
            "filters": {
                "help_text": (
                    "Dashboard-level filters applied to every tile. Supports a date range, an "
                    "interval, and property filters that refer to a property by name. Filters "
                    "carrying a project-specific id are rejected."
                )
            },
        }

    def validate_filters(self, value: dict[str, Any]) -> dict[str, Any]:
        validate_cross_project_filters(value)
        return value

    def create(self, validated_data: dict[str, Any]) -> CrossProjectDashboard:
        tiles = validated_data.pop("tiles", [])
        request = self.context["request"]
        dashboard = CrossProjectDashboard.objects.create(
            organization_id=self.context["organization_id"],
            created_by=cast(User, request.user),
            **validated_data,
        )
        self._replace_tiles(dashboard, tiles)
        return dashboard

    def update(self, instance: CrossProjectDashboard, validated_data: dict[str, Any]) -> CrossProjectDashboard:
        tiles = validated_data.pop("tiles", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        if tiles is not None:
            self._replace_tiles(instance, tiles)
        return instance

    def _replace_tiles(self, dashboard: CrossProjectDashboard, tiles: list[dict[str, Any]]) -> None:
        user = cast(User, self.context["request"].user)
        for tile in tiles:
            assert_can_reference_insight(user, tile["project_id"], tile["insight_id"])

        with transaction.atomic():
            dashboard.tiles.filter(deleted=False).update(deleted=True)
            for tile in tiles:
                CrossProjectDashboardTile.objects.update_or_create(
                    dashboard=dashboard,
                    project_id=tile["project_id"],
                    insight_id=tile["insight_id"],
                    defaults={
                        "organization_id": dashboard.organization_id,
                        "layouts": tile.get("layouts", {}),
                        "color": tile.get("color"),
                        "filters_overrides": tile.get("filters_overrides", {}),
                        "deleted": False,
                    },
                )
