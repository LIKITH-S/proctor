# RESEARCH.md — Phase 2: Coding Environment

## Goal
Build the Candidate Dashboard featuring a locked-down Monaco Editor, countdown timer, and Judge0 integration for live code execution and automated grading.

## 1. Technical Stack Selection
- **Frontend Editor**: `@monaco-editor/react` (Easiest to integrate with Vite/React).
- **Code Execution**: Hosted Judge0 API (RapidAPI or public instance).
- **Backend Storage**: Need new models to store Questions and TestCases, as well as Submissions.

## 2. Requirements Breakdown & Strategies

### REQ-03: Locked-down Monaco Editor
- **Block Copy-Paste**: Add `onCopy`, `onPaste`, `onCut` event listeners to the editor container that trigger `e.preventDefault()`.
- **Block Right-Click**: Add `onContextMenu={(e) => e.preventDefault()}` to the wrapper.
- **Block IntelliSense**: Pass `options={{ quickSuggestions: false, suggestOnTriggerCharacters: false, contextmenu: false }}` to the Monaco component.

### REQ-04 & REQ-05: Judge0 Execution & Auto-evaluation
- **Workflow**:
  1. Frontend sends "Run Code" request directly to Judge0 (to save backend bandwidth, or via Backend to protect API key). 
  2. *Decision*: To protect the Judge0 API key, the frontend will send the code to the Django backend. The backend will call Judge0, passing the `input` from test cases, and compare it with `expected_output`.
  3. The backend returns the results (Pass/Fail) to the frontend.

### REQ-11: Countdown Timer & Auto-submit
- Use React `useEffect` to manage a countdown based on the `end_time` fetched from the backend (or stored in localStorage).
- When timer hits 0, trigger the submission function automatically and redirect to a "Test Completed" page.

## 3. Data Models Needed

### Question
- `test`: ForeignKey(Test)
- `title`: String
- `description`: TextField

### TestCase
- `question`: ForeignKey(Question)
- `input_data`: TextField
- `expected_output`: TextField
- `is_hidden`: Boolean

### Submission
- `candidate`: ForeignKey(AllowedCandidate)
- `question`: ForeignKey(Question)
- `code`: TextField
- `score`: Integer
- `submitted_at`: DateTime
