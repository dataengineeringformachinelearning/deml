"""Client-supplied page_id must be re-validated against the product tenant."""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from django.http import JsonResponse

from forjd.client import ForjdResponse
from forjd.views import _require_owned_status_page


@pytest.mark.asyncio
async def test_require_owned_status_page_404_for_foreign_id() -> None:
  tenant_id = uuid4()
  owned_id = str(uuid4())
  foreign_id = str(uuid4())
  client = MagicMock()
  client.proxy = AsyncMock(
    return_value=ForjdResponse(
      status=200,
      body=json.dumps(
        {
          "pages": [
            {"id": owned_id, "slug": "customer-site", "title": "Customer"},
          ]
        }
      ).encode(),
      content_type="application/json",
    )
  )

  result = await _require_owned_status_page(
    client,
    page_id=foreign_id,
    tenant_id=tenant_id,
    request_id="test-request-1",
  )

  assert isinstance(result, JsonResponse)
  assert result.status_code == 404
  assert json.loads(result.content)["code"] == "status_page_not_owned"
  client.proxy.assert_awaited_once()


@pytest.mark.asyncio
async def test_require_owned_status_page_403_for_platform_slug() -> None:
  tenant_id = uuid4()
  page_id = str(uuid4())
  client = MagicMock()
  client.proxy = AsyncMock(
    return_value=ForjdResponse(
      status=200,
      body=json.dumps(
        {
          "pages": [
            {"id": page_id, "slug": "platform-status", "title": "Platform"},
          ]
        }
      ).encode(),
      content_type="application/json",
    )
  )

  result = await _require_owned_status_page(
    client,
    page_id=page_id,
    tenant_id=tenant_id,
    request_id="test-request-2",
  )

  assert isinstance(result, JsonResponse)
  assert result.status_code == 403
  assert json.loads(result.content)["code"] == "platform_status_immutable"


@pytest.mark.asyncio
async def test_require_owned_status_page_returns_page() -> None:
  tenant_id = uuid4()
  page_id = str(uuid4())
  client = MagicMock()
  client.proxy = AsyncMock(
    return_value=ForjdResponse(
      status=200,
      body=json.dumps(
        {
          "pages": [
            {"id": page_id, "slug": "acme-status", "title": "Acme"},
          ]
        }
      ).encode(),
      content_type="application/json",
    )
  )

  result = await _require_owned_status_page(
    client,
    page_id=page_id,
    tenant_id=tenant_id,
    request_id="test-request-3",
  )

  assert isinstance(result, dict)
  assert result["slug"] == "acme-status"
