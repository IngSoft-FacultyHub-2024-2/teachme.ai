# TeachMe.AI

Console-based TypeScript application with Docker support.

## Prerequisites

- Node.js 20+ (for local development)
- Docker and Docker Compose (for containerized deployment)

## Quick Start (Executable Package)

### Install from GitHub Release

```bash
# Download the latest release from GitHub
# https://github.com/IngSoft-FacultyHub-2024-2/teachme.ai/releases

# Install the downloaded tarball
npm install -g ./teachme-ai-1.0.0.tgz

# Run from anywhere
teachme
```

### Install Globally from npm (Future)

```bash
# Once published to npm
npm install -g teachme-ai

# Run from anywhere
teachme
```

### Use with npx (No Installation Required)

```bash
# Run directly without installation (once published to npm)
npx teachme-ai
```

### Build Package for Distribution

```bash
# Build and create package tarball
npm run package

# This creates: teachme-ai-1.0.0.tgz
# Share this file or upload to GitHub releases
```

## Local Development

### Run locally (Windows PowerShell)

Prerequisites: Node.js 20+ and a configured `.env` file. Copy the example and edit values first:

```powershell
# from project root (PowerShell)
Copy-Item .env.example .env -Force
# edit .env with your favorite editor (or set env vars in the shell)
notepad .env
```

Install dependencies once:

```powershell
npm install
```

Run in development mode (hot reload using the project npm script):

```powershell
npm run dev
```

Run the app directly with ts-node (no build step):

```powershell
npx ts-node src/index.ts
```

Build and run the compiled JS (production-like):

```powershell
npm run build
node dist/index.js
```

Quick run with an ad-hoc environment value (PowerShell):

```powershell
# $env:OPENAI_API_KEY = 'sk-...'
npx ts-node src/index.ts
```

### Run locally (macOS / Linux — bash or zsh)

Prerequisites: Node.js 20+ and a configured `.env` file. Copy the example and edit values first:

```bash
# from project root (bash/zsh)
cp .env.example .env
# edit .env with your favorite editor
open -a TextEdit .env  # macOS example (or use nano, vim)
```

Install dependencies once:

```bash
npm install
```

Run in development mode (hot reload using the project npm script):

```bash
npm run dev
```

Run the app directly with ts-node (no build step):

```bash
npx ts-node src/index.ts
```

Build and run the compiled JS (production-like):

```bash
npm run build
node dist/index.js
```

Quick run with an ad-hoc environment value (bash/zsh):

```bash
# export OPENAI_API_KEY="sk-..."
npx ts-node src/index.ts
```

### Available Scripts

- `npm run dev` - Run in development mode with ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled application
- `npm run package` - Build and create distributable package tarball
- `npm run lint` - Check code quality with ESLint
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run type-check` - Type-check without emitting files

## Docker Deployment

### Build and Run with Docker

#### Production Mode

```bash
# Build the Docker image
docker build -t teachme-ai:latest .

# Run the container (interactive mode)
docker run -it --rm teachme-ai:latest

# Run with environment variables
docker run -it --rm --env-file .env teachme-ai:latest
```

#### Using Docker Compose

**For Interactive Applications (Recommended):**

```bash
# Build the image
docker-compose build

# Run interactively (allows user input)
docker-compose run --rm teachme-ai

# Stop containers
docker-compose down
```

**For Background Services:**

```bash
# Run in background (not suitable for interactive input)
docker-compose up -d

# Development mode (with hot reload)
docker-compose --profile dev up teachme-ai-dev

# Stop containers
docker-compose down

# Rebuild and start
docker-compose up --build
```

**Important:** Since this is an interactive console application, use `docker-compose run --rm teachme-ai` or `docker run -it --rm --env-file .env teachme-ai:latest` to properly attach stdin/stdout for user input.

### Docker Images

- **Production**: Multi-stage build with optimized image size
- **Development**: Includes dev dependencies and supports hot reload

## Environment Variables

Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

See `.env.example` for available configuration options.

### Kata File Configuration

The application uses environment variables to configure kata instruction and evaluation rubric files:

- `KATA_INPUT_DATA_PATH` - Directory containing kata files (default: `./src/inputData`)
- `KATA_DEFAULT_INSTRUCTION_FILE` - Default kata instruction file (default: `kata-instructions.json`)
- `KATA_DEFAULT_RUBRIC_FILE` - Default evaluation rubric file (default: `kata_evaluation_rubric.json`)

These files are preloaded on application startup for instant access.

## Features

### File Preloading on Startup

The application automatically preloads kata instruction and evaluation rubric files on startup:

- **Kata Instructions** - Preloaded from configured file (default: `kata-instructions.json`)
- **Evaluation Rubric** - Preloaded from configured file (default: `kata_evaluation_rubric.json`)

Files are loaded once at startup and cached in memory for instant access throughout the session.

### Main Menu Options

1. **View Kata Instruction** - Display the preloaded kata instructions
2. **View Evaluation Rubric** - Display the preloaded evaluation rubric
3. **Start KataSolverService Conversation** - Interactive AI conversation for solving katas
4. **Exit** - Exit the application

### KataSolverService Conversation

Interactive AI-powered conversation mode for working through kata problems:

Interactive AI-powered conversation mode for working through kata problems.

**Main Menu Options (before entering conversation):**
- `View Kata Instruction` – Display the preloaded kata instructions.
- `View Evaluation Rubric` – Display the preloaded evaluation rubric.
- `Start KataSolverService Conversation` – Enter interactive conversation mode with the assistant.
- `Exit` – Quit the application.

**Conversation Mode — Available Commands:**
- `/kata`     : Display the currently preloaded kata instructions while in a conversation.
- `/rubric`   : Display the currently preloaded evaluation rubric while in a conversation.
- `/evaluate` : Extract the most-recent message's code from the conversation and evaluate it using the loaded rubric.
- `/new`      : Start a new conversation (clears conversation state but preserves loaded kata & rubric).
- `/help`     : Show the list of available in-conversation commands.
- `/exit`     : End the conversation and return to the main menu.

Notes and behaviour:
- When you select `Start KataSolverService Conversation`, you can either type a regular prompt (sent to the assistant), or enter any command above (commands must begin with `/`).
- The `/evaluate` command extracts code from the last user or assistant message, displays the extracted code, asks for confirmation, then runs the evaluation using the configured rubric file.
- If a command starts with `/` but is not recognized, the app will print an error and suggest using `/help`.

**Features in Conversation Mode:**
- Conversational AI assistance for solving kata problems.
- Real-time code extraction from conversation history.
- Automated code evaluation against rubric criteria.
- Score tracking across multiple evaluation attempts (each `/evaluate` increments an attempt counter).
- Interactive prompts for confirmations and feedback during evaluation.

### Kata Instruction Format

Kata instructions support JSON format with multiple stages:

```json
{
  "name": "Kata Name",
  "stages": [
    {
      "stageNumber": 1,
      "title": "Stage Title",
      "problem": "Problem description",
      "sampleOutput": "Expected output",
      "requirements": ["Requirement 1", "Requirement 2"]
    }
  ],
  "evaluationCriteria": [
    {
      "levelId": "Level 1",
      "description": "Criteria description"
    }
  ]
}
```

### Evaluation Rubric Format

Evaluation rubrics support structured JSON format with categories and scoring levels:

```json
{
  "rubric": {
    "title": "Rubric Title",
    "total_max_score": 100,
    "categories": [
      {
        "name": "Category Name",
        "max_score": 30,
        "levels": [
          {
            "level": 1,
            "name": "Level Name",
            "score_range": { "min": 0, "max": 10 },
            "criteria": [
              {
                "description": "Criterion description",
                "score_range": { "min": 0, "max": 5 }
              }
            ]
          }
        ]
      }
    ],
    "overall_classification": [
      {
        "name": "Classification Name",
        "score_range": { "min": 0, "max": 50 }
      }
    ]
  }
}
```

## Project Structure

```
src/
├── features/                           # Feature modules (feature-by-package)
│   ├── kata-instruction/              # Kata instruction loader
│   │   ├── domain/                    # Domain models (KataInstruction, KataEvaluationRubric)
│   │   ├── services/                  # Business logic (FileReader, JsonParser, RubricService)
│   │   └── KataInstructionFeature.ts
│   ├── kata-solver/                   # AI conversation solver
│   │   ├── domain/                    # Conversation, Message models
│   │   ├── services/                  # OpenAI integration
│   │   └── KataSolverFacade.ts
│   ├── code-extractor/                # Code extraction from conversation
│   │   ├── domain/                    # ExtractedCode model
│   │   └── services/                  # Extraction logic
│   └── kata-evaluator/                # Code evaluation against rubric
│       ├── domain/                    # KataEvaluation model
│       └── services/                  # Evaluation logic
├── services/                          # Application-wide services
│   └── KataFileConfig.ts              # Environment-based file configuration
├── shared/                            # Shared code
│   ├── types/                         # TypeScript types (Result, etc.)
│   └── utils/                         # Utility functions
├── ui/                                # UI components
│   ├── KataInstructionUI.ts          # Kata/Rubric display
│   └── KataSolverConversationUI.ts   # Conversation interface
├── inputData/                         # Kata instruction and rubric files
│   ├── kata-instructions.json
│   └── kata_evaluation_rubric.json
└── index.ts                           # Application entry point

tests/                                 # Test files (mirrors src structure)
├── features/
│   ├── kata-instruction/
│   ├── kata-solver/
│   ├── code-extractor/
│   └── kata-evaluator/
└── services/
    └── KataFileConfig.test.ts
```

## Code Quality

This project follows TypeScript best practices with:

- **Strict TypeScript** configuration
- **ESLint** for code quality
- **Prettier** for code formatting
- **Jest** for testing
- **TDD** (Test-Driven Development) approach

See `claude.md` for detailed coding guidelines.

## Creating Releases

### Quick Release Guide

```bash
# 1. Update version
npm version minor  # or major/patch

# 2. Update CHANGELOG.md

# 3. Commit and tag
git add package.json CHANGELOG.md
git commit -m "chore: bump version to vX.Y.Z"
git tag -a vX.Y.Z -m "Release vX.Y.Z"

# 4. Push
git push origin main
git push origin vX.Y.Z

# 5. Build package
npm run package

# 6. Create GitHub release
# Go to: https://github.com/IngSoft-FacultyHub-2024-2/teachme.ai/releases
# Click "Draft a new release" and upload the tarball
```

For detailed release instructions, see [docs/RELEASE.md](docs/RELEASE.md).

### Automated Releases

Push a tag to automatically create a release:

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

The GitHub Actions workflow will build, test, and create the release automatically.

## License

ISC
