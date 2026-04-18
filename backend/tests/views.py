import jwt
import datetime
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Test, AllowedCandidate, Question, TestCase, Submission

from django.core.exceptions import ValidationError

class CandidateAuthView(APIView):
    def post(self, request):
        email = request.data.get('email')
        test_id = request.data.get('test_id')

        if not email or not test_id:
            return Response(
                {"error": "Email and Test ID are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            test = Test.objects.get(id=test_id, is_active=True)
        except (Test.DoesNotExist, ValueError, ValidationError):
            return Response(
                {"error": "Test not found or invalid Test ID format."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Time validation
        now = timezone.now()
        if now < test.start_time:
            return Response(
                {"error": f"Test has not started yet. Starts at {test.start_time}"},
                status=status.HTTP_403_FORBIDDEN
            )
        if now > test.end_time:
            return Response(
                {"error": "Test has already ended."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Candidate validation
        try:
            candidate = AllowedCandidate.objects.get(test=test, email=email)
        except AllowedCandidate.DoesNotExist:
            return Response(
                {"error": "You are not registered for this test."},
                status=status.HTTP_403_FORBIDDEN
            )

        if candidate.completed_at:
            return Response(
                {"error": "You have already submitted this test. Re-entry is not allowed."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Update candidate start time if first login
        if not candidate.has_started:
            candidate.has_started = True
            candidate.start_time = now
            candidate.save()

        candidate_end_time = candidate.start_time + datetime.timedelta(minutes=test.duration_minutes)
        actual_end_time = min(test.end_time, candidate_end_time)

        # Check if the candidate's personal time has already expired
        if now >= actual_end_time:
            return Response(
                {"error": "Your time for this test has already expired."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate JWT
        payload = {
            'email': email,
            'test_id': str(test_id),
            'exp': actual_end_time + datetime.timedelta(hours=1), # Leeway for submission
            'iat': now,
        }

        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

        return Response({
            "token": token,
            "test_title": test.title,
            "end_time": actual_end_time
        }, status=status.HTTP_200_OK)

from .authentication import CandidateJWTAuthentication

class TestDetailsView(APIView):
    authentication_classes = [CandidateJWTAuthentication]

    def get(self, request):
        candidate = request.user # This is actually the AllowedCandidate object from our auth class
        test = candidate.test

        # Verify test is still active/valid
        now = timezone.now()
        if now > test.end_time:
            return Response({"error": "Test has ended."}, status=status.HTTP_403_FORBIDDEN)

        # Get all questions for this test
        questions = test.questions.all()
        
        data = []
        for q in questions:
            # We only expose public test cases to the frontend
            public_cases = q.test_cases.filter(is_hidden=False).values('id', 'input_data', 'expected_output')
            
            data.append({
                "id": q.id,
                "title": q.title,
                "description": q.description,
                "image_url": request.build_absolute_uri(q.image.url) if q.image else None,
                "initial_code": q.initial_code,
                "public_test_cases": list(public_cases)
            })

        candidate_end_time = candidate.start_time + datetime.timedelta(minutes=test.duration_minutes)
        actual_end_time = min(test.end_time, candidate_end_time)

        return Response({
            "test_title": test.title,
            "end_time": actual_end_time,
            "questions": data
        })


from .services import execute_code

class SubmissionView(APIView):
    authentication_classes = [CandidateJWTAuthentication]
    throttle_scope = 'code_execution'

    def post(self, request):
        candidate = request.user
        question_id = request.data.get('question_id')
        code = request.data.get('code')
        is_final = request.data.get('is_final', False)

        try:
            question = Question.objects.get(id=question_id, test=candidate.test)
        except Question.DoesNotExist:
            return Response({"error": "Question not found."}, status=status.HTTP_404_NOT_FOUND)

        test_cases = question.test_cases.all()
        total_cases = test_cases.count()
        passed_count = 0
        results = []

        for tc in test_cases:
            try:
                res = execute_code(code, tc.input_data)
                
                # Handling null safety for expected_output
                expected = (tc.expected_output or "").strip()
                actual = (res.get('stdout') or "").strip()
                
                # If compile error or runtime error
                if res.get('status') != 'Accepted':
                    passed = False
                else:
                    passed = (expected == actual)
            except Exception as execution_err:
                print(f"CRITICAL ERROR during execution: {execution_err}")
                passed = False
                res = {"status": "Server Error", "stderr": str(execution_err)}
                expected = (tc.expected_output or "").strip()
                actual = "N/A"

            if passed:
                passed_count += 1
            
            # Only store full logs if it's a public test case
            results.append({
                "test_case_id": tc.id,
                "is_hidden": tc.is_hidden,
                "passed": passed,
                "status": res.get('status'),
                "input_data": tc.input_data if not tc.is_hidden else "[Hidden]",
                "expected_output": expected if not tc.is_hidden else "[Hidden]",
                "actual_output": actual if not tc.is_hidden else "[Hidden]",
                "error": res.get('stderr') or res.get('compile_output')
            })

        score = int((passed_count / total_cases) * 100) if total_cases > 0 else 0

        # Save submission
        submission = Submission.objects.create(
            candidate=candidate,
            question=question,
            code=code,
            score=score,
            passed_cases=passed_count,
            total_cases=total_cases,
            result_log=str(results),
            is_final=is_final
        )

        if is_final:
            candidate.completed_at = timezone.now()
            candidate.save()

        return Response({
            "score": score,
            "passed_count": passed_count,
            "total_count": total_cases,
            "results": results,
            "submission_id": submission.id
        })

import base64
from django.core.files.base import ContentFile
from .models import ProctorSnapshot, Violation

class ProctorSnapshotView(APIView):
    authentication_classes = [CandidateJWTAuthentication]

    def post(self, request):
        candidate = request.user
        image_data = request.data.get('image')

        if not image_data:
            return Response({"error": "No image data provided"}, status=status.HTTP_400_BAD_REQUEST)

        # image_data format from react-webcam is likely "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        try:
            format, imgstr = image_data.split(';base64,')
            ext = format.split('/')[-1]
            data = ContentFile(base64.b64decode(imgstr), name=f'snapshot_{candidate.id}_{datetime.datetime.now().timestamp()}.{ext}')
            
            snapshot = ProctorSnapshot.objects.create(
                candidate=candidate,
                image=data
            )

            # --- Manual Cloudinary Backup ---
            try:
                import cloudinary.uploader
                # We upload the same 'data' content file
                upload_result = cloudinary.uploader.upload(
                    snapshot.image.file,
                    folder="proctor_frames/",
                    public_id=f"snapshot_{candidate.id}_{int(datetime.datetime.now().timestamp())}"
                )
                snapshot.cloud_url = upload_result.get('secure_url')
                snapshot.save()
            except Exception as cloudinary_err:
                print(f"Cloudinary backup failed: {cloudinary_err}")
                # We don't return error here because the local save succeeded
            # --------------------------------
            
            return Response({"status": "Snapshot saved"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ViolationView(APIView):
    authentication_classes = [CandidateJWTAuthentication]

    def post(self, request):
        candidate = request.user
        violation_type = request.data.get('type')
        details = request.data.get('details', '')

        if not violation_type:
            return Response({"error": "Violation type is required"}, status=status.HTTP_400_BAD_REQUEST)

        Violation.objects.create(
            candidate=candidate,
            violation_type=violation_type,
            details=details
        )
        return Response({"status": "Violation logged"}, status=status.HTTP_201_CREATED)




