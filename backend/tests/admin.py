from django.contrib import admin
from django.conf import settings
from django.core.mail import send_mail
import time
from .models import Test, AllowedCandidate, Question, TestCase, Submission, ProctorSnapshot, Violation

class TestCaseInline(admin.TabularInline):
    model = TestCase
    extra = 1

@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ('title', 'id', 'start_time', 'end_time', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('title', 'id')

@admin.action(description="Send Invitation Emails")
def send_invites(modeladmin, request, queryset):
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    for candidate in queryset:
        magic_link = f"{frontend_url}/?test_id={candidate.test.id}&email={candidate.email}"
        send_mail(
            "Invitation to Coding Test",
            f"Hello,\n\nYou have been invited to a coding assessment.\n\nTest Title: {candidate.test.title}\nTest ID: {candidate.test.id}\n\nClick below to enter the test instantly:\n{magic_link}\n\nPlease complete the test within the given time.\n\nBest of luck!",
            None, # Will use DEFAULT_FROM_EMAIL
            [candidate.email],
            fail_silently=False,
        )
        time.sleep(0.5) # Rate limit safety for SMTP

@admin.register(AllowedCandidate)
class AllowedCandidateAdmin(admin.ModelAdmin):
    list_display = ('email', 'test', 'has_started')
    list_filter = ('test', 'has_started')
    search_fields = ('email',)
    actions = [send_invites]

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('title', 'test', 'created_at')
    inlines = [TestCaseInline]

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'question', 'score', 'is_final', 'submitted_at')
    search_fields = ('candidate__email', 'question__title')
    list_filter = ('is_final', 'submitted_at', 'question__test')
    readonly_fields = ('submitted_at',)

@admin.register(ProctorSnapshot)
class ProctorSnapshotAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'timestamp', 'cloudinary_backup')
    list_filter = ('candidate', 'timestamp')
    readonly_fields = ('timestamp', 'cloudinary_backup')

    def cloudinary_backup(self, obj):
        if obj.cloud_url:
            from django.utils.html import format_html
            return format_html('<a href="{}" target="_blank">View Permanent Backup</a>', obj.cloud_url)
        return "No backup available"
    
    cloudinary_backup.short_description = "Cloud Backup"

@admin.register(Violation)
class ViolationAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'violation_type', 'timestamp')
    list_filter = ('violation_type', 'candidate', 'timestamp')
    readonly_fields = ('timestamp',)

