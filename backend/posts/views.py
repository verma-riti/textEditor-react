# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json
from datetime import datetime
from posts.models import Posts
from posts.serializers import PostsSerializer
from rest_framework import status
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.core.exceptions import ObjectDoesNotExist

# Create your views here.
@api_view(["GET"])
def get_posts(request):
	post_id = request.query_params.get('post_id', None)
	print('post id =', post_id)
	if post_id:
		posts = Posts.objects.filter(id=post_id)
	else:
		posts = Posts.objects.all()
	serializer = PostsSerializer(posts, many=True)
	return JsonResponse({'posts': serializer.data}, safe=False, status=status.HTTP_200_OK)


@api_view(["POST"])
def add_post(request):
	print(request.body)
	data = json.loads(request.body)
	try:
		post = Posts.objects.create(
			json_data = data['json_data'],
			html_data = data['html_data']
		)
		serializer = PostsSerializer(post)
		print(serializer)
		return JsonResponse({'data': serializer.data}, safe=False, status=status.HTTP_201_CREATED)
	except ObjectDoesNotExist as e:
		return JsonResponse({'error': str(e)}, safe=False, status=status.HTTP_404_NOT_FOUND)
	except Exception:
		return JsonResponse({'error': 'Something went wrong'}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["PUT"])
def update_post(request, post_id):
	print('post id =', post_id)
	data = request.data
	print('data =', data)
	try:
		data_post = Posts.objects.get(id=post_id)
		data_post.json_data = data.get('json_data')
		data_post.html_data = data.get('html_data')
		data_post.save()

		posts = Posts.objects.all()
		serializer = PostsSerializer(posts, many=True)
		return JsonResponse({'data': serializer.data}, safe=False, status=status.HTTP_200_OK)
	except ObjectDoesNotExist as e:
		return JsonResponse({'error': str(e)}, safe=False, status=status.HTTP_404_NOT_FOUND)
	except Exception:
		return JsonResponse({'error': 'Something went wrong'}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



