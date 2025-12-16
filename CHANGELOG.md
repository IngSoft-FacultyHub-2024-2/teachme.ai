# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-12-16

### Added
- NPM binary package support - installable via `npm install -g teachme-ai`
- Global `teachme` command for easy CLI access
- Distributable tarball generation with `npm run package`
- GitHub Actions workflow for automated releases
- Comprehensive installation documentation in README

### Changed
- Entry point now includes shebang for direct execution
- package.json configured with bin, preferGlobal, and files fields
- README updated with Quick Start installation instructions

### Features
- Interactive AI-powered kata learning companion
- Real-time code extraction from conversations
- Automated code evaluation against rubrics
- Multi-stage kata support with JSON format
- Conversation mode with commands (/kata, /rubric, /evaluate, /new, /help, /exit)
- Docker support for containerized deployment
- Comprehensive test suite with 80% coverage threshold
- Environment-based configuration management

[Unreleased]: https://github.com/IngSoft-FacultyHub-2024-2/teachme.ai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/IngSoft-FacultyHub-2024-2/teachme.ai/releases/tag/v1.0.0
