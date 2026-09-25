from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.db import transaction
from . import models
from .permissions import HasRolePermission

DjangoUser = get_user_model()


def verify_user_password(raw_password, stored_hash):
    """
    Verifies passwords using Django's password hashers only.
    """
    if not stored_hash:
        return False
    
    # 1. Check Django format (pbkdf2_sha256$...)
    try:
        if check_password(raw_password, stored_hash):
            return True
    except Exception:
        pass

    return False


def get_or_create_django_auth_user(api_user):
    """Ensures a corresponding django.contrib.auth.models.User exists for SimpleJWT."""
    email = api_user.email
    django_user, created = DjangoUser.objects.get_or_create(
        email=email,
        defaults={
            'username': email,
            'first_name': api_user.first_name or '',
            'last_name': api_user.last_name or '',
            'is_active': api_user.is_active,
        }
    )
    # Sync is_staff status based on role
    is_admin = api_user.role and str(api_user.role.display_name).lower() in ['admin', 'administrateur']
    if is_admin and not django_user.is_staff:
        django_user.is_staff = True
        django_user.save(update_fields=['is_staff'])
    elif not is_admin and django_user.is_staff and not django_user.is_superuser:
        django_user.is_staff = False
        django_user.save(update_fields=['is_staff'])
        
    return django_user


class UnifiedLoginView(APIView):
    """
    Unified authentication endpoint:
    Accepts email and password, validates against api.models.User,
    and returns valid SimpleJWT access and refresh tokens along with user info.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {"error": "Veuillez fournir une adresse e-mail et un mot de passe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Search api.models.User
        api_user = models.User.objects.filter(email=email).first()

        # A Django auth account alone is not a tenant identity.  Do not create
        # a tenant user on login or attach it to an arbitrary first tenant.
        if not api_user:
            return Response(
                {"error": "Identifiants invalides ou utilisateur introuvable."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        else:
            # Validate password
            if not verify_user_password(password, api_user.password_hash):
                return Response(
                    {"error": "Mot de passe incorrect."},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        if not api_user.is_active:
            return Response(
                {"error": "Ce compte a été désactivé."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Sync Django auth user and issue JWT
        django_user = get_or_create_django_auth_user(api_user)
        refresh = RefreshToken.for_user(django_user)
        refresh['email'] = api_user.email
        refresh['organisation_id'] = str(api_user.organisation_id) if api_user.organisation_id else None

        role_name = api_user.role.display_name if api_user.role else "Administrateur"
        org_name = api_user.organisation.name if api_user.organisation else "Tadbir AI Enterprise"

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": str(api_user.id),
                "email": api_user.email,
                "first_name": api_user.first_name or "",
                "last_name": api_user.last_name or "",
                "nom": f"{api_user.first_name or ''} {api_user.last_name or ''}".strip() or api_user.email.split('@')[0],
                "role": role_name,
                "company": org_name,
                "organisation_id": str(api_user.organisation_id) if api_user.organisation_id else None,
                "email_verified": api_user.email_verified,
            }
        }, status=status.HTTP_200_OK)



class InviteUserView(APIView):
    """
    Invites a new tenant user. Creates them with INVITED status.
    """
    permission_classes = [permissions.IsAuthenticated, HasRolePermission]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        nom = request.data.get('nom', '').strip()
        role_name = request.data.get('role', 'Membre')

        if not email:
            return Response(
                {"error": "L'e-mail est obligatoire."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_email = getattr(request.user, 'email', None)
        tenant_user = models.User.objects.filter(email=user_email).first() if user_email else None
        
        if tenant_user and tenant_user.organisation:
            default_org = tenant_user.organisation
        else:
            default_org = models.Organization.objects.first()

        if models.User.objects.filter(email=email).exists():
            existing = models.User.objects.get(email=email)
            if default_org and existing.organisation_id != default_org.id:
                return Response(
                    {"error": "Cet utilisateur appartient déjà à une autre organisation."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {"error": "Un utilisateur avec cet e-mail existe déjà dans votre organisation."},
                status=status.HTTP_400_BAD_REQUEST
            )

        parts = nom.split(' ', 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''
        
        role = models.Role.objects.filter(display_name__iexact=role_name, organisation=default_org).first()
        if not role:
            role = models.Role.objects.create(
                organisation=default_org,
                display_name=role_name,
                system_name=role_name.lower()
            )

        api_user = models.User.objects.create(
            organisation=default_org,
            role=role,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password_hash="INVITED",
            is_active=False,
            email_verified=False,
        )

        return Response({
            "id": str(api_user.id),
            "email": api_user.email,
            "nom": f"{api_user.first_name or ''} {api_user.last_name or ''}".strip(),
            "role": api_user.role.display_name if api_user.role else "",
            "statut": "Invité"
        }, status=status.HTTP_201_CREATED)

class UnifiedRegisterView(APIView):
    """
    Registers a new tenant user and issues JWT.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        nom = request.data.get('nom', '').strip()
        role_name = request.data.get('role', 'Administrateur')

        if not email or not password:
            return Response(
                {"error": "Veuillez renseigner tous les champs obligatoires."},
                status=status.HTTP_400_BAD_REQUEST
            )

        parts = nom.split(' ', 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''

        existing_user = models.User.objects.filter(email=email).first()
        any_user_exists = models.User.objects.exists()

        if existing_user:
            if not existing_user.password_hash or existing_user.password_hash == "INVITED" or existing_user.password_hash == "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9":
                api_user = existing_user
                api_user.first_name = first_name
                api_user.last_name = last_name
                api_user.password_hash = make_password(password)
                api_user.is_active = True
                api_user.email_verified = True
                api_user.save()
            else:
                return Response(
                    {"error": "Un compte avec cette adresse e-mail existe déjà. Veuillez vous connecter."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            if any_user_exists:
                return Response(
                    {"error": "Accès refusé : Votre adresse e-mail n'a pas été invitée par l'administrateur."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            default_org = models.Organization.objects.first()
            role = models.Role.objects.filter(display_name__iexact=role_name).first()
            if not role:
                role = models.Role.objects.create(
                    organisation=default_org,
                    display_name=role_name,
                    system_name=role_name.lower()
                )

            hashed = make_password(password)
            api_user = models.User.objects.create(
                organisation=default_org,
                role=role,
                email=email,
                first_name=first_name,
                last_name=last_name,
                password_hash=hashed,
                is_active=True,
                email_verified=True,
            )

        django_user = get_or_create_django_auth_user(api_user)
        django_user.set_password(password)
        django_user.save()

        refresh = RefreshToken.for_user(django_user)
        refresh['email'] = api_user.email
        refresh['organisation_id'] = str(api_user.organisation_id) if api_user.organisation_id else None

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": str(api_user.id),
                "email": api_user.email,
                "nom": f"{api_user.first_name or ''} {api_user.last_name or ''}".strip(),
                "role": api_user.role.display_name if api_user.role else "",
                "company": api_user.organisation.name if api_user.organisation else "",
                "email_verified": api_user.email_verified,
            }
        }, status=status.HTTP_201_CREATED)

class UnifiedResetPasswordView(APIView):
    """
    Direct password resets are disabled until signed, expiring reset tokens exist.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        return Response(
            {"error": "La réinitialisation nécessite un jeton signé et temporaire.", "code": "PASSWORD_RESET_TOKEN_REQUIRED"},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )


class CheckUserView(APIView):
    """Compatibility endpoint backed only by the authoritative user table."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        email = request.query_params.get('email', '').strip().lower()
        if not email:
            return Response({'user': None}, status=status.HTTP_400_BAD_REQUEST)
        user = models.User.objects.filter(email=email).select_related('organisation').first()
        if not user:
            return Response({'user': None}, status=status.HTTP_404_NOT_FOUND)
        return Response({'user': {
            'id': str(user.id), 'email': user.email,
            'nom': f"{user.first_name or ''} {user.last_name or ''}".strip(),
            'company': user.organisation.name if user.organisation else None,
            'emailVerified': user.email_verified is True,
        }})


class RegistrationEligibilityView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        user = models.User.objects.filter(email=email).select_related('role').first()
        if not user:
            return Response({'allowed': False, 'reason': "Cette adresse n'a pas été invitée."})
        if user.password_hash and user.password_hash != 'INVITED':
            return Response({'allowed': False, 'reason': 'Ce compte est déjà activé.'})
        if not user.is_active and user.password_hash != 'INVITED':
            return Response({'allowed': False, 'reason': 'Ce compte est suspendu.'})
        return Response({
            'allowed': True,
            'role': user.role.display_name if user.role else 'Lecteur',
            'nom': f"{user.first_name or ''} {user.last_name or ''}".strip(),
            'statut': 'Invité',
        })


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        tenant_user = models.User.objects.filter(email=request.user.email).select_related('role', 'organisation').first()
        if not tenant_user:
            return Response({'error': 'Utilisateur non trouvé.'}, status=status.HTTP_404_NOT_FOUND)
        action = request.data.get('action')
        django_user = DjangoUser.objects.filter(email=tenant_user.email).first()

        if action == 'update_profile':
            new_email = str(request.data.get('email') or tenant_user.email).strip().lower()
            if models.User.objects.exclude(pk=tenant_user.pk).filter(email=new_email).exists():
                return Response({'error': 'Cette adresse e-mail est déjà utilisée.'}, status=status.HTTP_400_BAD_REQUEST)
            parts = str(request.data.get('nom') or '').strip().split(' ', 1)
            with transaction.atomic():
                old_email = tenant_user.email
                tenant_user.email = new_email
                tenant_user.first_name = parts[0] if parts else ''
                tenant_user.last_name = parts[1] if len(parts) > 1 else ''
                tenant_user.save(update_fields=['email', 'first_name', 'last_name', 'updated_at'])
                if django_user:
                    django_user.email = new_email
                    django_user.username = new_email
                    django_user.first_name = tenant_user.first_name or ''
                    django_user.last_name = tenant_user.last_name or ''
                    django_user.save()
            return Response({'success': True, 'user': {
                'id': str(tenant_user.id), 'email': tenant_user.email,
                'nom': f"{tenant_user.first_name or ''} {tenant_user.last_name or ''}".strip(),
                'role': tenant_user.role.display_name if tenant_user.role else 'Lecteur',
                'company': tenant_user.organisation.name,
                'emailVerified': tenant_user.email_verified is True,
            }})

        if action == 'update_password':
            current = request.data.get('currentPassword', '')
            new_password = request.data.get('newPassword', '')
            if len(new_password) < 6 or not check_password(current, tenant_user.password_hash or ''):
                return Response({'error': 'Mot de passe actuel incorrect ou nouveau mot de passe invalide.'}, status=status.HTTP_400_BAD_REQUEST)
            with transaction.atomic():
                tenant_user.password_hash = make_password(new_password)
                tenant_user.save(update_fields=['password_hash', 'updated_at'])
                if django_user:
                    django_user.set_password(new_password)
                    django_user.save(update_fields=['password'])
            return Response({'success': True, 'message': 'Mot de passe modifié avec succès.'})

        return Response({'error': 'Action non valide.'}, status=status.HTTP_400_BAD_REQUEST)

