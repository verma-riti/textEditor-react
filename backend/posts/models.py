# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.utils import timezone
from django.db import models
from jsonfield import JSONField


# Create your models here.
class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True

# Create your models here.
class Posts(TimeStampedModel):
	json_data = JSONField()
	html_data = models.TextField(blank=False, null=False)