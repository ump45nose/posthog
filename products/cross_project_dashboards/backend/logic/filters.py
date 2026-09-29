"""Validation for dashboard-level filters on a cross-project dashboard.

A cross-project dashboard applies one filter set to tiles in several projects. Only filters
whose meaning survives that hop are allowed. A filter carrying an identifier means something
different in every project, so it is refused rather than dropped: a dropped filter produces a
plausible wrong number instead of an error.
"""

from typing import Any

from rest_framework import serializers

# Property filter types carrying an id that only resolves inside one project.
PROJECT_BOUND_PROPERTY_TYPES = frozenset(
    {
        "cohort",
        "group",
        "flag",
        "feature",
        "data_warehouse",
        "data_warehouse_person_property",
        "error_tracking_issue",
        "hogql",
    }
)

PROJECT_BOUND_BREAKDOWN_TYPES = frozenset({"cohort", "group", "data_warehouse"})

REFUSAL = (
    "This filter only works inside one project, so a cross-project dashboard cannot apply it. "
    "Use a date range, an interval, or a property filter that refers to a property by name."
)


def validate_cross_project_filters(filters: dict[str, Any] | None) -> None:
    """Raise ValidationError when a filter set cannot cross a project boundary."""
    if not filters:
        return

    for property_filter in filters.get("properties") or []:
        if not isinstance(property_filter, dict):
            continue
        property_type = property_filter.get("type")
        if property_type in PROJECT_BOUND_PROPERTY_TYPES:
            raise serializers.ValidationError({"properties": f"{property_type}: {REFUSAL}"})

    breakdown = filters.get("breakdown_filter")
    if isinstance(breakdown, dict):
        if breakdown.get("breakdown_type") in PROJECT_BOUND_BREAKDOWN_TYPES:
            raise serializers.ValidationError({"breakdown_filter": REFUSAL})
        if breakdown.get("breakdown_group_type_index") is not None:
            raise serializers.ValidationError({"breakdown_filter": REFUSAL})
