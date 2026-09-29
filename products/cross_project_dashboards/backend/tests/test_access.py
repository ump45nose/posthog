import pytest
from posthog.test.base import BaseTest

from rest_framework.serializers import ValidationError

from posthog.models import Organization, Team

from products.cross_project_dashboards.backend.logic import assert_can_reference_insight
from products.product_analytics.backend.facade.models import Insight


class TestAssertCanReferenceInsight(BaseTest):
    def test_allows_an_insight_in_a_reachable_project(self):
        insight = Insight.objects.create(team=self.team, name="Signups")
        assert_can_reference_insight(self.user, self.team.pk, insight.pk)

    def test_rejects_an_insight_in_another_organization(self):
        other_organization = Organization.objects.create(name="Other")
        other_team = Team.objects.create(organization=other_organization, name="Other project")
        insight = Insight.objects.create(team=other_team, name="Secret")
        with pytest.raises(ValidationError):
            assert_can_reference_insight(self.user, other_team.pk, insight.pk)

    def test_rejects_an_insight_that_does_not_exist(self):
        with pytest.raises(ValidationError):
            assert_can_reference_insight(self.user, self.team.pk, 999999)

    def test_rejects_a_project_that_does_not_exist(self):
        with pytest.raises(ValidationError):
            assert_can_reference_insight(self.user, 999999, 1)

    def test_rejects_an_insight_from_a_different_project(self):
        other_team = Team.objects.create(organization=self.organization, name="Second project")
        insight = Insight.objects.create(team=other_team, name="Elsewhere")
        with pytest.raises(ValidationError):
            assert_can_reference_insight(self.user, self.team.pk, insight.pk)
