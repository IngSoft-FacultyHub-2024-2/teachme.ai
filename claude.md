## Environment Configuration

- **Use Environment Variables for Configuration**: All configuration that can be done using environment variables MUST be done that way. Never hardcode configuration values.
- **Required Environment Variables**: Use `.env` files (gitignored) to store environment-specific configuration.
- **Provide `.env.example`**: Always provide a `.env.example` file as a template showing required environment variables (without actual secrets).
- **Configuration Priority**:
  1. Environment variables (highest priority)
  2. `.env` file
  3. Default values (if safe to have defaults)
- **Examples of what should be environment variables**:
  - API keys and tokens (GitHub token, etc.)
  - API endpoints and URLs
  - Database connection strings
  - Feature flags
  - Service timeouts and retry limits
  - Any value that differs between environments (dev/staging/prod)

## Testing and Commits

- **Test-Driven Development (TDD)**: Follow classic Chicago-style TDD for all new classes and functionality:
  1. **Red**: Write a failing test first that defines the desired behavior
  2. **Green**: Write the minimal code needed to make the test pass
  3. **Refactor**: Improve the code while keeping tests green
  - Write tests before implementation code
  - Focus on state verification (not interaction testing)
  - Tests should verify the output/state of the system under test
- **Unit Tests Required**: Every class must have comprehensive unit tests. Test files should be created in the `tests/` directory mirroring the source structure.
- **Run Tests Before Committing**: Always run unit tests before committing. Ensure all tests pass before creating commits.
- **Test Coverage**: Aim for comprehensive test coverage including:
  - Happy path scenarios
  - Edge cases and boundary conditions
  - Error handling and exceptions
  - Input validation

## TypeScript Best Practices

### Type Safety & Sistema de Tipos
- **Strict Mode**: Always enable `strict: true` in `tsconfig.json`
- **Avoid `any`**: Never use `any`, prefer `unknown` when type is uncertain
- **Type Inference**: Rely on type inference when possible
- **Explicit Annotations**: Annotate function parameters and return types when helpful
- **Interfaces vs Types**: Prefer `interface` over `type` for object types
- **Utility Types**: Use utility types (`Partial`, `Pick`, `Omit`, `Record`, `Required`)
- **Optional Parameters**: Use `?` for optional parameters/fields
- **No `@ts-ignore`**: Avoid `@ts-ignore`, resolve type issues properly

### Naming Conventions
- **Variables/Functions/Methods**: Use `lowerCamelCase`
- **Classes/Interfaces/Types**: Use `UpperCamelCase`
- **Global Constants**: Use `CONSTANT_CASE`
- **Descriptive Names**: Always use clear and meaningful names

### Functions
- **Function Declarations**: Prefer function declarations for named functions
- **Arrow Functions**: Use for nested functions and callbacks
- **Return Types**: Specify explicit return types when helpful

### Classes
- **readonly**: Use for properties that don't change
- **Parameter Properties**: Prefer for constructor initialization
- **Visibility Modifiers**: Use `private`, `protected`, `public`
- **No Prototype Manipulation**: Avoid direct prototype manipulation

### Imports and Exports
- **Named Exports**: Always prefer named exports
- **Avoid Default Exports**: Do not use default exports
- **Relative Imports**: Prefer relative imports
- **ESM Modules**: Use ECMAScript Modules (ESM) as standard

### Variables and Constants
- **const and let**: Use `const` and `let`, never `var`
- **const by default**: Prefer `const` unless reassignment is needed

### Comparisons and Operators
- **Strict Equality**: Always use `===` and `!==`
- **Avoid ASI**: Don't rely on automatic semicolon insertion

### Error Handling
- **new Error()**: Always use when throwing exceptions
- **Error Instances Only**: Only throw `Error` instances
- **Meaningful Messages**: Add descriptive error messages
- **Focused try-catch**: Keep try-catch blocks focused

### Documentation
- **JSDoc**: Use for documentation comments
- **Markdown**: Write comments in Markdown
- **Appropriate Tags**: Use appropriate JSDoc tags
- **Meaningful Descriptions**: Provide useful descriptions

### Code Quality Tools
- **ESLint**: Integrate ESLint with TypeScript
- **Prettier**: Use Prettier for consistent formatting
- **Pre-commit Hooks**: Run linting and tests before commits

### Performance
- **Map and Set**: Use instead of objects as dictionaries
- **Avoid Complex Type Assertions**: Be cautious with type assertions
- **No Built-in Modifications**: Don't modify built-in objects

### File Encoding
- **UTF-8**: Always use UTF-8 encoding
