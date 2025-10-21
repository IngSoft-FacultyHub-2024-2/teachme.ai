# TeachMe.AI

Console-based TypeScript application with Docker support.

## Prerequisites

- Node.js 20+ (for local development)
- Docker and Docker Compose (for containerized deployment)

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

## Features

### Kata Instruction Loader

Load and view coding kata instructions from markdown files. The application automatically detects kata instruction files in the `src/inputData/` directory.

**How to use:**
1. Run the application (`npm run dev`)
2. Select "Load Kata Instructions" from the main menu
3. Choose a kata from the available list
4. View formatted instructions including:
   - Problem description for each stage
   - Sample outputs
   - Evaluation criteria

**Adding new katas:**
Place markdown files with "KataInstructions" in the filename into `src/inputData/`. The file should follow this structure:

```markdown
# Kata Name: YourKataName

## Stage 1

### Problem:
Description of the problem

Sample output:
Expected output example

## Stage 2

### Problem:
Additional requirements

## Code Quality Evaluation Criteria:
Level 1: Beginner (0-3 points)
Description

Level 2: Advanced (4-6 points)
Description
```

## Project Structure

```
src/
├── features/                    # Feature modules (feature-by-package)
│   └── kata-instruction/       # Kata instruction loader
│       ├── domain/             # Domain models
│       ├── services/           # Business logic
│       └── KataInstructionFeature.ts
├── shared/                     # Shared code
│   ├── types/                  # TypeScript types (Result, etc.)
│   └── utils/                  # Utility functions
├── ui/                         # UI components
│   └── KataInstructionUI.ts
├── inputData/                  # Kata instruction files
│   └── KataInstructions.md
└── index.ts                    # Application entry point

tests/                          # Test files (mirrors src structure)
├── features/
│   └── kata-instruction/
│       ├── domain/
│       └── services/
```

## Code Quality

This project follows TypeScript best practices with:

- **Strict TypeScript** configuration
- **ESLint** for code quality
- **Prettier** for code formatting
- **Jest** for testing
- **TDD** (Test-Driven Development) approach

See `claude.md` for detailed coding guidelines.

## License

ISC
