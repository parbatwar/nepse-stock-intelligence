from django.contrib import admin
from .models import DailyPrice, FloorsheetTransaction

admin.site.register(DailyPrice)
admin.site.register(FloorsheetTransaction)
