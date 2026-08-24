from django.http import JsonResponse


def health(request):
    return JsonResponse({"status": "healthy", "framework": "django-drf"})
