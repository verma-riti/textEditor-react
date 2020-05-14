from rest_framework import serializers
from rest_framework.exceptions import APIException
from posts.models import Posts


class PostsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Posts
        fields = ['id', 'json_data', 'html_data', 'created_at']

