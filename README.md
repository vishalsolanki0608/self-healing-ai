# AI-Powered Self-Healing Developer Assistant

An automated developer assistant that detects runtime errors from application logs, analyzes the failure, uses Gemini AI to generate a code fix, safely applies the patch, validates the changed source, commits the change to Git, pushes a healing branch, and automatically creates a GitHub Pull Request.

This project was built as a take-home assignment demonstrating an end-to-end AI-assisted self-healing workflow.

---

## 1. Project Overview

The project contains two applications:

1. **Demo Backend Application**
   - A small Node.js/Express application.
   - Contains an intentional runtime bug for demonstration.
   - Uses Winston to write structured JSON logs.
   - Generates an error and stack trace when the faulty endpoint is called.

2. **AI Self-Healing Assistant**
   - Continuously monitors the demo backend log file.
   - Detects error-level log entries.
   - Analyzes the stack trace and identifies the application source file.
   - Sends the failure context to Gemini.
   - Receives a structured AI-generated code fix.
   - Prevents unsafe modifications outside the application source directory.
   - Applies the code patch.
   - Validates JavaScript syntax.
   - Creates a Git branch.
   - Commits and pushes the fix.
   - Creates a GitHub Pull Request automatically.

The assignment specifically asks for a complete workflow from error detection through GitHub Pull Request creation. This implementation demonstrates that workflow end to end.

---

## 2. Architecture

```text
                    ┌──────────────────────┐
                    │    Demo Backend      │
                    │   Node.js / Express  │
                    └──────────┬───────────┘
                               │
                               │ Runtime Error
                               ▼
                    ┌──────────────────────┐
                    │     Winston Log      │
                    │      app.log         │
                    └──────────┬───────────┘
                               │
                               │ File monitoring
                               ▼
                    ┌──────────────────────┐
                    │    Log Monitor       │
                    │      Chokidar        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Error Analyzer     │
                    │ Stack trace parsing  │
                    └──────────┬───────────┘
                               │
                               │ Error context
                               ▼
                    ┌──────────────────────┐
                    │      Gemini AI       │
                    │    Fix generation    │
                    └──────────┬───────────┘
                               │
                               │ Structured JSON
                               ▼
                    ┌──────────────────────┐
                    │    Code Patcher      │
                    │ Safety + exact patch │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Code Validator     │
                    │   Node syntax check  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Git Manager      │
                    │ Branch / Commit /    │
                    │ Push                 │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   GitHub Manager     │
                    │    Octokit / PR      │
                    └──────────┬───────────┘
                               │
                               ▼
                         GitHub Pull Request
```

---

## 3. End-to-End Workflow

The system follows this flow:

```text
Application starts
        ↓
Application throws runtime exception
        ↓
Winston writes structured error log
        ↓
Log Monitor detects new error entry
        ↓
Error Analyzer parses stack trace
        ↓
Application source file is identified
        ↓
Gemini generates structured fix
        ↓
Healing branch is created
        ↓
Patch safety checks are performed
        ↓
AI patch is applied
        ↓
Patched JavaScript is syntax validated
        ↓
Git diff is verified
        ↓
Git commit is created
        ↓
Healing branch is pushed
        ↓
GitHub Pull Request is created
```

---

## 4. Project Structure

```text
self-healing-ai/
│
├── demo-backend/
│   ├── src/
│   │   ├── app.js
│   │   └── logger.js
│   │
│   ├── logs/
│   │   └── app.log
│   │
│   └── package.json
│
├── self-healing-assistant/
│   ├── src/
│   │   ├── index.js
│   │   ├── log-monitor.js
│   │   ├── error-analyzer.js
│   │   ├── ai-fixer.js
│   │   ├── code-patcher.js
│   │   ├── code-validator.js
│   │   ├── git-manager.js
│   │   └── github-manager.js
│   │
│   ├── .env
│   └── package.json
│
├── .gitignore
└── README.md
```

### Main responsibilities

| File                         | Responsibility                                     |
| ---------------------------- | -------------------------------------------------- |
| `demo-backend/src/app.js`    | Demo API and intentional runtime failure           |
| `demo-backend/src/logger.js` | Structured application logging                     |
| `log-monitor.js`             | Watches the backend log file                       |
| `error-analyzer.js`          | Parses errors and identifies application source    |
| `ai-fixer.js`                | Sends failure context to Gemini and parses the fix |
| `code-patcher.js`            | Validates and applies AI-generated code changes    |
| `code-validator.js`          | Validates JavaScript syntax                        |
| `git-manager.js`             | Creates branches, commits and pushes changes       |
| `github-manager.js`          | Creates the GitHub Pull Request                    |
| `index.js`                   | Orchestrates the complete workflow                 |

---

## 5. Technologies Used

### Demo Backend

- Node.js
- Express
- Winston

### Self-Healing Assistant

- Node.js
- Chokidar
- Google Generative AI SDK
- Gemini
- Git CLI
- Octokit
- GitHub REST API
- dotenv

The assignment allows the implementation to choose its own language, framework, AI model, GitHub library and build tools.

---

## 6. Prerequisites

Install the following:

- Node.js
- npm
- Git
- A GitHub repository
- A Gemini API key
- A GitHub fine-grained Personal Access Token

The GitHub token must have access to the repository used by this project.

Required repository permissions:

```text
Contents        → Read and write
Pull requests   → Read and write
```

---

## 7. Installation

### Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd self-healing-ai
```

### Install Demo Backend dependencies

```bash
cd demo-backend
npm install
```

### Install Self-Healing Assistant dependencies

```bash
cd ../self-healing-assistant
npm install
```

If required, the main dependencies can be installed with:

```bash
npm install chokidar dotenv @google/generative-ai @octokit/rest
```

---

## 8. Environment Variables

Create:

```text
self-healing-assistant/.env
```

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=self-healing-ai
GITHUB_BASE_BRANCH=main
```

Do not commit `.env`.

The root `.gitignore` should contain:

```gitignore
node_modules/
.env
*.log
```

---

## 9. Running the Demo

The backend and assistant run as separate processes.

### Terminal 1 — Start Demo Backend

```bash
cd demo-backend
node src/app.js
```

The server starts on:

```text
http://localhost:3000
```

### Terminal 2 — Start Self-Healing Assistant

```bash
cd self-healing-assistant
node src/index.js
```

The assistant starts monitoring:

```text
demo-backend/logs/app.log
```

You should see:

```text
Watching log file: ...
👀 Log watcher is ready
```

---

## 10. Triggering the Intentional Error

The demo backend contains an intentionally faulty user route.

Call:

```text
GET /users/123
```

For example, open:

```text
http://localhost:3000/users/123
```

The backend generates a runtime error similar to:

```text
TypeError: Cannot read properties of null (reading 'name')
```

Winston writes the error and stack trace to `app.log`.

The assistant detects the new error automatically.

---

## 11. AI Fix Generation

The assistant sends relevant failure information to Gemini, including:

- Error type
- Error message
- HTTP method
- Request path
- Source file
- Error line
- Relevant source code
- Stack trace

Gemini is instructed to return a structured JSON response:

```json
{
  "cause": "string",
  "file": "absolute file path",
  "line": 25,
  "oldCode": "exact existing code",
  "newCode": "replacement code",
  "reason": "string"
}
```

This makes the AI output machine-readable and allows the rest of the workflow to validate the response before modifying source code.

---

## 12. Patch Safety

AI-generated code should never be blindly trusted.

The patcher validates:

- Required fields exist.
- The line number is an integer.
- `oldCode` and `newCode` are strings.
- The old and new code are not identical.
- The target file exists.
- The target file is inside `demo-backend/src`.
- `node_modules` cannot be modified.
- The exact old code exists in the target file.
- The old code occurs only once.

If the patch is ambiguous or unsafe, the system refuses to modify the file.

For example:

```text
AI suggests:
demo-backend/node_modules/router/...

Patch result:
Unsafe patch rejected
```

This safeguard was added after observing that an AI model can sometimes select a framework/dependency stack frame instead of the application's own source file.

---

## 13. Code Validation

After applying the patch, the assistant validates the changed JavaScript file using Node's syntax checker.

Conceptually:

```text
AI Patch
   ↓
Write source file
   ↓
node --check
   ↓
Valid → continue
Invalid → workflow fails
```

This prevents syntactically invalid JavaScript from being automatically committed.

---

## 14. Git Automation

After successful validation:

1. A new healing branch is created.

Example:

```text
auto-healing/fix-2026-09-01T19-30-59-959Z
```

2. The changed source is staged.
3. A Git commit is created.

Example:

```text
fix: automatically repair detected runtime error
```

4. The branch is pushed to the GitHub remote.

---

## 15. GitHub Pull Request Automation

After the branch is pushed, the GitHub manager uses Octokit to create a Pull Request against the configured base branch.

The generated PR includes:

- Error information
- Source file
- Error line
- Root cause
- AI-generated old code
- AI-generated new code
- Reason for the fix
- Validation status
- Git workflow status

Example workflow:

```text
Branch pushed
      ↓
GitHub API
      ↓
Create Pull Request
      ↓
PR URL returned
```

---

## 16. Example Successful Run

A successful run looks conceptually like:

```text
🚨 ERROR DETECTED!

========== ERROR ANALYSIS ==========
Error: TypeError
Source File: demo-backend/src/app.js
Error Line: 21
====================================

🤖 Sending error to Gemini...

========== AI FIX ==========
{
  "cause": "...",
  "file": ".../demo-backend/src/app.js",
  "line": 21,
  "oldCode": "user.name",
  "newCode": "user?.name",
  "reason": "..."
}
============================

🌿 Creating branch: auto-healing/fix-...

🛠️ Code patched successfully

🔍 Validating patched code...
✅ Syntax validation passed.

========== GIT DIFF ==========
...
==============================

💾 Creating Git commit...
✅ Git commit created.

🚀 Pushing branch...
✅ Branch pushed successfully.

🔗 Creating GitHub Pull Request...

🎉 Pull Request created successfully!
```

---

## 17. Design Decisions

### Structured logs

Winston is used instead of manually writing plain text files. Structured JSON logs make it easier for the assistant to parse fields such as:

- error
- stack
- path
- method
- timestamp

### File monitoring

Chokidar is used to monitor the application log. Polling is enabled because it provides reliable file change detection in the Windows development environment used for this project.

### Structured AI output

The AI is required to return JSON instead of free-form text. This reduces ambiguity between AI reasoning and executable patch instructions.

### Minimal patching

The patcher replaces the exact `oldCode` with `newCode` rather than rewriting the entire source file.

### Safety boundary

Only files inside:

```text
demo-backend/src
```

can be modified automatically.

This prevents accidental modification of dependencies or unrelated project files.

### GitHub PR instead of direct merge

The assistant creates a Pull Request rather than directly merging the AI-generated change. This preserves human review as the final gate before the fix reaches the main branch.

---

## 18. Error Handling

The workflow fails safely when:

- The log does not contain a stack trace.
- An application source file cannot be identified.
- The AI response is empty.
- The AI response is invalid JSON.
- Required AI fields are missing.
- The AI selects an unsafe file.
- The target file does not exist.
- The AI-provided old code cannot be found.
- The old code is ambiguous.
- Syntax validation fails.
- No Git diff is detected.
- Git commit/push fails.
- GitHub PR creation fails.

Errors are reported in the assistant process rather than silently ignored.

---

## 19. Assumptions

- The demo backend writes logs to `demo-backend/logs/app.log`.
- The monitored backend source is under `demo-backend/src`.
- Git is installed and available through the command line.
- The project is inside a Git repository with a configured `origin` remote.
- The GitHub token has sufficient permissions for the repository.
- The Gemini API key is configured through environment variables.
- The application is demonstrated in a local development environment.
- The current validator performs JavaScript syntax validation rather than a full application integration test.

---

## 20. Known Limitations / Future Improvements

This implementation focuses on demonstrating the complete assignment workflow.

For a larger production deployment, the following areas could be extended:

- Automatic rollback if validation fails after a patch.
- Unit and integration/smoke tests after applying a fix.
- Duplicate-error detection and cooldowns.
- Persistent healing job state.
- Distributed locking when multiple assistant instances run.
- Better source-context extraction for large applications.
- More sophisticated patch/diff validation.
- Human approval policies for high-risk changes.
- PR status/CI monitoring after PR creation.
- Observability and metrics for healing attempts.
- Retry and backoff policies for external AI/GitHub API failures.
- Support for multiple repositories or services.

---

## 21. Security Considerations

Secrets are supplied through environment variables rather than source code.

Never commit:

```text
.env
```

The GitHub token should be scoped only to the repository required by the assistant and should have the minimum permissions needed.

AI-generated changes are not merged directly into `main`; they are submitted as Pull Requests for review.

The patcher also enforces an application-source boundary to reduce the risk of modifying dependencies or unrelated files.

---

## 22. Demo Checklist

Before recording the demo video:

- [ ] Backend starts successfully.
- [ ] Assistant starts successfully.
- [ ] Log monitor reports ready.
- [ ] Intentional error can be triggered.
- [ ] Error appears in `app.log`.
- [ ] Assistant detects the error.
- [ ] AI generates a structured fix.
- [ ] Correct application source file is selected.
- [ ] Patch is applied.
- [ ] Syntax validation passes.
- [ ] Git diff is shown.
- [ ] Git commit is created.
- [ ] Healing branch is pushed.
- [ ] GitHub Pull Request is created.
- [ ] PR shows the expected source-code change.

---

## 23. Assignment Deliverables

The repository contains the two required applications:

- Demo Backend source code
- AI Self-Healing Assistant source code
- Project README
- GitHub Pull Request generated by the assistant

The complete workflow can be demonstrated in a short 5–10 minute recording.

---

## 24. Summary

The main goal of this project is to demonstrate an automated feedback loop:

```text
Production-style error log
        ↓
Detection
        ↓
Analysis
        ↓
AI-generated repair
        ↓
Safety validation
        ↓
Code modification
        ↓
Syntax validation
        ↓
Git commit
        ↓
Git push
        ↓
GitHub Pull Request
```

The system demonstrates how an AI coding assistant can be integrated into an automated software-engineering workflow while retaining safeguards around source selection, patching, validation, and code review.
