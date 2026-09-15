import django.db.models.deletion
from django.db import migrations, models


def keep_one_setting_per_organization(apps, schema_editor):
    OrganizationSetting = apps.get_model("api", "OrganizationSetting")

    organization_ids = (
        OrganizationSetting.objects.values_list("organisation_id", flat=True)
        .distinct()
    )
    for organization_id in organization_ids:
        settings = OrganizationSetting.objects.filter(
            organisation_id=organization_id
        ).order_by("created_at", "id")
        settings.exclude(id=settings.first().id).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0005_alter_organization_email"),
    ]

    operations = [
        migrations.RunPython(
            keep_one_setting_per_organization,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name="organizationsetting",
            name="organisation",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="settings",
                to="api.organization",
            ),
        ),
    ]
