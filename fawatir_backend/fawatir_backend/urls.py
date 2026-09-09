"""
URL configuration for fawatir_backend project.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from django.views.generic import RedirectView
from ai.views import import_test_page, scanner_test_page, ai_hub_page

urlpatterns = [
    path('', RedirectView.as_view(url='/api/docs/', permanent=False), name='index'),
    path('admin/', admin.site.urls),
    # Core API endpoints routed from the 'api' app
    path('api/', include('api.urls')),
    
    # OpenAPI Schema generator endpoint
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    
    # Swagger UI documentation endpoint
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # AI Endpoints
    path('api/ai/', include('ai.urls')),  # OCR extraction + cash-flow forecasting
    path('scanner/', scanner_test_page),  # phone/PC test UI for the OCR pipeline
    path('import/', import_test_page),  # test UI for the Excel import feature
    path('ai-hub/', ai_hub_page),  # unified testing hub for AI models
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
