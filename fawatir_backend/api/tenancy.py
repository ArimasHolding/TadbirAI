from . import models


def resolve_tenant_organization_id(request):
    """Return the authenticated user's selected, authorized organization id."""
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return None

    email = getattr(user, 'email', None)
    tenant_user = models.User.objects.filter(email=email).first() if email else None
    if not tenant_user or not tenant_user.is_active or not tenant_user.organisation_id:
        return None

    primary_id = str(tenant_user.organisation_id)
    requested_id = None
    if hasattr(request, 'headers'):
        requested_id = request.headers.get('x-organization-id')
    elif hasattr(request, 'META'):
        requested_id = request.META.get('HTTP_X_ORGANIZATION_ID')

    if requested_id:
        requested_id = str(requested_id)
        if requested_id == primary_id:
            return primary_id
        if models.Organization.objects.filter(
            id=requested_id,
            owner=tenant_user,
            is_active=True,
        ).exists():
            return requested_id

    return primary_id
