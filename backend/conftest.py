from typing import Any
from unittest.mock import patch

import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import Client, override_settings

User = get_user_model()


@pytest.fixture(autouse=True)
def disable_ssl_redirect_in_tests() -> Any:
  """Prevent SECURE_SSL_REDIRECT from leaking between tests and breaking API assertions."""
  with override_settings(SECURE_SSL_REDIRECT=False, DEBUG=True):
    yield


@pytest.fixture(autouse=True, scope="session")
def setup_test_db() -> None:
  settings.DATABASES = {
    "default": {
      "ENGINE": "django.db.backends.sqlite3",
      "NAME": ":memory:",
    }
  }


@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db: Any) -> None:
  pass


# --- UC-AUTH-002: mock Firebase tokens need a live browser session ---
@pytest.fixture(autouse=True)
def ensure_mock_firebase_browser_session() -> Any:
  """Auto-register ``X-DEML-Session-Id`` for ``Bearer mock-token-*`` requests.

  Production middleware requires a registered browser session on non-auth paths.
  Adapter tests focus on FORJD/tenant contracts; they use DEBUG mock tokens and
  historically omitted the session header. This fixture keeps that public API
  surface while remaining compliant with UC-AUTH-002.

  Opt out: pass ``HTTP_X_DEML_SESSION_ID`` explicitly (including empty string).
  """
  original_request = Client.request

  def request_with_mock_session(self: Client, **kwargs: Any) -> Any:
    defaults = getattr(self, "defaults", {}) or {}
    auth = str(kwargs.get("HTTP_AUTHORIZATION") or defaults.get("HTTP_AUTHORIZATION") or "")
    session_explicit = "HTTP_X_DEML_SESSION_ID" in kwargs or "HTTP_X_DEML_SESSION_ID" in defaults
    if auth.startswith("Bearer mock-token-") and not session_explicit:
      token = auth.split(" ", 1)[1]
      parts = token.split("-")
      uid = parts[2] if len(parts) > 2 else "mock_user"
      email = parts[3] if len(parts) > 3 else f"{uid}@example.com"
      from account.lifecycle import ensure_user_from_firebase
      from utils.session_registry import register_session

      user, _profile, _created = ensure_user_from_firebase(
        {"uid": uid, "email": email, "name": uid.capitalize()}
      )
      session_id = f"test-sess-{uid}"
      register_session(session_id, uid, int(user.id), user_agent="pytest", ip="127.0.0.1")
      kwargs["HTTP_X_DEML_SESSION_ID"] = session_id
    return original_request(self, **kwargs)

  Client.request = request_with_mock_session  # type: ignore[method-assign]
  yield
  Client.request = original_request  # type: ignore[method-assign]


@pytest.fixture
def test_user(db: Any) -> User:
  return User.objects.create_user(
    username="testuser",
    password="password123",  # pragma: allowlist secret
    email="test@example.com",
  )


@pytest.fixture
def mock_verify_token() -> Any:
  with patch("firebase_admin.auth.verify_id_token") as mock:
    mock.return_value = {"uid": "testuser", "email": "test@example.com", "name": "testuser"}
    yield mock


@pytest.fixture
def authenticated_client(client: Client, test_user: User, mock_verify_token: Any) -> Any:
  """Firebase-authenticated client with a registered browser session (UC-AUTH-002)."""
  from utils.session_registry import register_session

  session_id = f"test-sess-auth-{test_user.id}"
  register_session(
    session_id,
    "testuser",
    int(test_user.id),
    user_agent="pytest",
    ip="127.0.0.1",
  )
  original_request = client.request

  def new_request(*args: Any, **kwargs: Any) -> Any:
    kwargs.setdefault("HTTP_AUTHORIZATION", "Bearer valid-token")
    kwargs.setdefault("HTTP_X_DEML_SESSION_ID", session_id)
    return original_request(*args, **kwargs)

  client.request = new_request
  yield client
  client.request = original_request
