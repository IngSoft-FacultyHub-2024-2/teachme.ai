# TeachMe.AI

Console-based TypeScript application with Docker support.

## Prerequisites

- Node.js 20+ (for local development)
- Docker and Docker Compose (for containerized deployment)

## Local Development

### Install Dependencies

```bash
npm install
```

### Run in Development Mode

```bash
npm run dev
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

#### Using Docker Compose (Recommended)

```bash
# Production mode
docker-compose up

# Run in background
docker-compose up -d

# Development mode (with hot reload)
docker-compose --profile dev up teachme-ai-dev

# Stop containers
docker-compose down

# Rebuild and start
docker-compose up --build
```

### Docker Images

- **Production**: Multi-stage build with optimized image size
- **Development**: Includes dev dependencies and supports hot reload

## Environment Variables

Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

See `.env.example` for available configuration options.

## Project Structure

```
src/
├── features/          # Feature modules (feature-by-package)
│   ├── learning/
│   ├── progress/
│   └── settings/
├── shared/            # Shared code
│   ├── ui/           # UI components
│   ├── types/        # TypeScript types
│   └── utils/        # Utility functions
└── index.ts          # Application entry point

tests/                # Test files (mirrors src structure)
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
