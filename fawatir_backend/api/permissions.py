from rest_framework import permissions
from . import models

class HasRolePermission(permissions.BasePermission):
    """
    Global RBAC permission class.
    Evaluates access based on the user's role (system_name) and the target module (viewset).
    """

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False

        # Allow superusers to do anything
        if getattr(user, 'is_superuser', False):
            return True

        # Extract the user's role (system_name) from the database
        user_role = getattr(getattr(user, 'role', None), 'system_name', None) or getattr(user, 'role_name', '')
        if not user_role and hasattr(user, 'email'):
            tenant_user = models.User.objects.filter(email=user.email).first()
            if tenant_user and tenant_user.role:
                user_role = getattr(tenant_user.role, 'system_name', '') or getattr(tenant_user.role, 'display_name', '')
        
        user_role = str(user_role).lower().strip()

        # Determine if request is read-only
        is_read_only = request.method in permissions.SAFE_METHODS

        # Module categorizations based on ViewSet names
        view_name = view.__class__.__name__

        # 1. IAM & Core System (Admin only for mutations)
        iam_views = [
            'OrganizationViewSet', 'OrganizationSettingViewSet', 'RoleViewSet', 
            'UserViewSet', 'PermissionViewSet', 'RolePermissionViewSet', 
            'PdfTemplateViewSet', 'UserPreferenceViewSet'
        ]
        
        # 2. HR & Payroll (Restricted from Commercial)
        hr_views = [
            'EmployeeViewSet', 'PayrollViewSet', 'PayrollItemViewSet', 
            'EmployeeDocumentViewSet', 'LeaveRequestViewSet'
        ]
        
        # 3. Bank & Finance (Restricted from Commercial)
        bank_views = [
            'BankAccountViewSet', 'BankTransactionViewSet', 'BankReconciliationViewSet', 
            'ExpenseViewSet', 'TaxReportViewSet'
        ]

        # Role-based evaluation
        if user_role in ['admin', 'administrateur']:
            return True

        if user_role == 'lecteur':
            # Lecteur can ONLY do SAFE_METHODS
            return is_read_only

        if user_role == 'commercial':
            # Commercial cannot access HR or Bank modules AT ALL
            if view_name in hr_views or view_name in bank_views:
                return False
            # Commercial cannot mutate IAM
            if view_name in iam_views:
                return is_read_only
            # Commercial can mutate Sales, CRM, Inventory
            return True
            
        if user_role == 'comptable':
            # Comptable cannot mutate IAM
            if view_name in iam_views:
                return is_read_only
            # Comptable can mutate everything else (HR, Bank, Sales)
            return True

        # Default fallback: safe methods only
        return is_read_only
