from django.db import models


class CrawlRun(models.Model):
    class Status(models.TextChoices):
        RUNNING = "RUNNING", "Running"
        SUCCESS = "SUCCESS", "Success"
        PARTIAL_SUCCESS = "PARTIAL_SUCCESS", "Partial Success"
        FAILED = "FAILED", "Failed"

    crawl_type = models.CharField(max_length=50)

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.RUNNING,
    )

    started_at = models.DateTimeField(auto_now_add=True)

    finished_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    articles_found = models.PositiveIntegerField(default=0)
    records_created = models.PositiveIntegerField(default=0)

    error_message = models.TextField(blank=True)

    def __str__(self):
        return f"{self.crawl_type} - {self.status}"
