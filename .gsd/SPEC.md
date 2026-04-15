# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
A robust, high-stability proctored coding platform designed for daily coding tests. It balances security and development speed by using pure browser-based behavioral monitoring combined with periodic webcam snapshots and an easy-to-use manual administrative review process.

## Goals
1. **Seamless Coding Experience**: Integrated LeetCode-style environment using React and a restricted Monaco Editor.
2. **Reliable Proctoring**: Real-time detection of tab-switching, window blur, and fullscreen violations without complex backend AI streaming.
3. **Evidence-Based Integrity**: Automated webcam snapshots (every 5–10s) and violation-triggered captures stored for manual admin review.
4. **Low Barrier Access**: Email-based validation system for candidates (no OTP) to ensure zero login friction.
5. **High Operational Efficiency**: Managed code execution via Hosted Judge0 to eliminate infrastructure maintenance.

## Non-Goals (Out of Scope)
- **Hard System Enforcement**: Blocking OS-level switching or multi-monitor setups (technically impossible via browser).
- **Automated Cheating Decisions**: The system flags behavior and stores snapshots; it does not automatically disqualify students.
- **Real-time Video Streaming**: To save bandwidth and complexity, video is not streamed live; only periodic images are captured.
- **OTP Authentication**: Bypassed in favor of a simpler Email Match System to avoid delivery delays.

## Users
- **Admins** (Instructors/Testers): Create tests, questions, and test cases; manage allowed candidate lists; review proctoring snapshots and violations via Django Admin.
- **Candidates** (Students): Log in via email, solve coding problems in a timed, monitored environment, and submit for auto-evaluation.

## Constraints
- **Subdirectory Isolation**: Project must be built in `e:\Test\proctor-platform/`.
- **Browser APIs**: Proctoring must rely strictly on `navigator.mediaDevices`, `visibilitychange`, `blur`, and `fullscreenchange`.
- **Storage Management**: Images are stored locally on the backend for manual review and subsequent manual deletion. No automated cleanup/cron jobs required for the MVP.
- **Hardware**: Basic laptop webcam and stable internet (images are resized to 320x240 to minimize bandwidth).

## Success Criteria
- [ ] Admin can create a test and add exactly 30 candidates by email.
- [ ] Candidates can enter only if their email is in the allowed list and the current time is within the test window.
- [ ] Tab switching or exiting fullscreen results in a flagged violation in the logs.
- [ ] Webcam snapshots are captured every 10 seconds and visible in the Django Admin for that specific candidate/test.
- [ ] Code is successfully evaluated against hidden test cases using the Hosted Judge0 API.
