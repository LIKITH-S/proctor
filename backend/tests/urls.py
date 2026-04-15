from django.urls import path
from .views import CandidateAuthView, TestDetailsView, SubmissionView, ProctorSnapshotView, ViolationView


urlpatterns = [
    path('auth/candidate/', CandidateAuthView.as_view(), name='candidate-auth'),
    path('tests/current/', TestDetailsView.as_view(), name='test-details'),
    path('tests/submit/', SubmissionView.as_view(), name='test-submit'),
    path('proctor/snapshot/', ProctorSnapshotView.as_view(), name='proctor-snapshot'),
    path('proctor/violation/', ViolationView.as_view(), name='proctor-violation'),
]


