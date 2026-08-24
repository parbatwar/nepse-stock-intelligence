from django.contrib import admin
from .models import (
    NewsArticle,
    NewsCompanyTag,
    CategorizationCorrection,
)

admin.site.register(NewsArticle)
admin.site.register(NewsCompanyTag)
admin.site.register(CategorizationCorrection)
