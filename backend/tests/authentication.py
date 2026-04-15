import jwt
from django.conf import settings
from rest_framework import authentication, exceptions
from .models import AllowedCandidate, Test

class CandidateJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        try:
            # Expecting "Bearer <token>"
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except (IndexError, jwt.ExpiredSignatureError, jwt.DecodeError):
            raise exceptions.AuthenticationFailed('Invalid or expired token')

        email = payload.get('email')
        test_id = payload.get('test_id')

        try:
            candidate = AllowedCandidate.objects.get(email=email, test_id=test_id)
            # We return a tuple of (user, auth)
            # Since Candidates aren't Django Users, we return the candidate object
            # and handle permissions in the view.
            return (candidate, token)
        except AllowedCandidate.DoesNotExist:
            raise exceptions.AuthenticationFailed('Candidate not found')
