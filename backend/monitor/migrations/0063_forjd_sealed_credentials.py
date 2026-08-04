"""Sealed per-account FORJD credentials + widen secret_ref constraints.

Uses Django constraint operations (not raw ALTER DROP) so SQLite rebuilds the
CHECK constraint correctly. Postgres already applied via an earlier RunPython
revision remains compatible — this file change does not re-run there.
"""

from __future__ import annotations

import uuid

import django_migration_linter as linter
from django.db import migrations, models

_SECRET_REF_SAFE = models.Q(
  service_token_secret_ref__startswith="env:FORJD_SERVICE_TOKEN"  # pragma: allowlist secret
) | models.Q(
  service_token_secret_ref__startswith="sealed:"  # pragma: allowlist secret
)


class Migration(migrations.Migration):
  dependencies = [
    ("monitor", "0062_userprofile_subscription_active_default_false"),
  ]

  operations = [
    linter.IgnoreMigration(),
    migrations.CreateModel(
      name="ForjdServiceCredential",
      fields=[
        (
          "id",
          models.UUIDField(
            default=uuid.uuid4,
            editable=False,
            primary_key=True,
            serialize=False,
          ),
        ),
        ("deml_account_id", models.UUIDField(db_index=True)),
        ("forjd_tenant_id", models.UUIDField(db_index=True)),
        ("ciphertext", models.TextField()),
        ("encrypted_dek", models.TextField()),
        ("is_active", models.BooleanField(default=True)),
        ("created_at", models.DateTimeField(auto_now_add=True)),
        ("updated_at", models.DateTimeField(auto_now=True)),
      ],
      options={
        "db_table": "forjd_service_credentials",
      },
    ),
    migrations.AddIndex(
      model_name="forjdservicecredential",
      index=models.Index(
        fields=["deml_account_id", "-created_at"],
        name="forjd_svc_cred_acct_idx",
      ),
    ),
    migrations.RemoveConstraint(
      model_name="forjdtenantmapping",
      name="forjd_tenant_mapping_secret_ref_env_only",
    ),
    migrations.RemoveConstraint(
      model_name="forjdtenantassociation",
      name="forjd_tenant_assoc_secret_ref_env_only",
    ),
    migrations.AddConstraint(
      model_name="forjdtenantmapping",
      constraint=models.CheckConstraint(
        condition=_SECRET_REF_SAFE,
        name="forjd_tenant_mapping_secret_ref_safe",
      ),
    ),
    migrations.AddConstraint(
      model_name="forjdtenantassociation",
      constraint=models.CheckConstraint(
        condition=_SECRET_REF_SAFE,
        name="forjd_tenant_assoc_secret_ref_safe",
      ),
    ),
  ]
