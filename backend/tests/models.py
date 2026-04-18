import uuid
from django.db import models

class Test(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.id})"

class AllowedCandidate(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="allowed_candidates")
    email = models.EmailField()
    has_started = models.BooleanField(default=False)
    start_time = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('test', 'email')

    def __str__(self):
        return f"{self.email} - {self.test.title}"

class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="questions")
    title = models.CharField(max_length=255)
    description = models.TextField(help_text="Markdown supported description of the problem")
    image = models.ImageField(upload_to='question_images/', null=True, blank=True, help_text="Optional diagram or image for the question")
    initial_code = models.TextField(default="def solution():\n    # Write your code here\n    pass")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} (Test: {self.test.title})"

class TestCase(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="test_cases")
    input_data = models.TextField(blank=True, help_text="Standard input for the code")
    expected_output = models.TextField(blank=True, help_text="Expected standard output")
    is_hidden = models.BooleanField(default=False, help_text="Visible to student vs hidden for grading")

    def __str__(self):
        type_str = "Hidden" if self.is_hidden else "Public"
        return f"{type_str} Case for {self.question.title}"

class Submission(models.Model):
    candidate = models.ForeignKey(AllowedCandidate, on_delete=models.CASCADE, related_name="submissions")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="submissions")
    code = models.TextField()
    score = models.IntegerField(default=0)
    passed_cases = models.IntegerField(default=0)
    total_cases = models.IntegerField(default=0)
    result_log = models.TextField(blank=True, help_text="Details of test case results or errors")
    is_final = models.BooleanField(default=False, help_text="True if this is the final submitted code")
    
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.candidate.email} - {self.question.title} ({self.score}%)"

class ProctorSnapshot(models.Model):
    candidate = models.ForeignKey(AllowedCandidate, on_delete=models.CASCADE, related_name="snapshots")
    image = models.ImageField(upload_to="proctor_frames/")
    cloud_url = models.URLField(blank=True, null=True, help_text="Permanent backup link on Cloudinary")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Snapshot - {self.candidate.email} at {self.timestamp.strftime('%H:%M:%S')}"

class Violation(models.Model):
    VIOLATION_TYPES = [
        ('TAB_SWITCH', 'Tab Switched'),
        ('FOCUS_LOST', 'Browser Lost Focus'),
        ('DEV_TOOLS', 'Developer Tools Opened (F12)'),
        ('RIGHT_CLICK', 'Right Click Attempted'),
        ('COPY_PASTE', 'Copy/Paste Attempted')
    ]
    candidate = models.ForeignKey(AllowedCandidate, on_delete=models.CASCADE, related_name="violations")
    violation_type = models.CharField(max_length=20, choices=VIOLATION_TYPES)
    details = models.TextField(blank=True, help_text="Additional context if needed")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_violation_type_display()} - {self.candidate.email}"
