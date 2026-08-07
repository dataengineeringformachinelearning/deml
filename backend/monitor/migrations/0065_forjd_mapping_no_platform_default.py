"""Stop defaulting product tenant mappings to the platform credential."""

from django.db import migrations, models


class Migration(migrations.Migration):
  dependencies = [
    ("monitor", "0064_analytics_provider_integration"),
  ]

  operations = [
    migrations.AlterField(
      model_name="forjdtenantmapping",
      name="service_token_secret_ref",
      field=models.CharField(default="", max_length=255),
    ),
  ]
