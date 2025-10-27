# Prompting skills evaluation criteria

## Level 1: Novice Prompter (0-3 points)

Vague requests: "Make FizzBuzz work" or "Fix this code"
No context: Doesn't explain the problem or requirements clearly
Single-shot attempts: Expects AI to solve everything in one prompt
No validation: Doesn't verify if AI understood the requirements

## Level 2: Basic Prompter (4-6 points)

Clear problem statement: Explains FizzBuzz rules accurately
Specific requests: "Write a function that prints numbers 1-100 with Fizz/Buzz rules"
Basic iteration: Can ask follow-up questions when code doesn't work
Simple validation: Tests basic cases (3, 5, 15)

## Level 3: Competent Prompter (7-8 points)

Structured requirements: Breaks down Stage 1 completely before moving to Stage 2
Quality constraints: Asks for "clean, readable code" or specific patterns
Effective debugging: Provides error messages and context when asking for fixes
Edge case awareness: Asks to verify specific test cases (like 15, 30, etc.)

## Level 4: Advanced Prompter (9-11 points)

Incremental development: Successfully guides AI through Stage 1 → Stage 2 transition
Code review skills: Asks for improvements, optimizations, or alternative approaches
Constraint specification: Requests specific patterns ("use string concatenation" vs "nested ifs")
Testing integration: Asks AI to generate test cases or validation logic

## Level 5: Expert Prompter (12-15 points)

Architectural guidance: Directs AI toward extensible, modular solutions
Best practices enforcement: Requests SOLID principles, clean code practices
Strategic prompting: Uses AI to explore multiple solution approaches
Meta-programming: Asks AI to explain trade-offs and guide design decisions
Comprehensive testing: Collaborates with AI to create thorough test suites

## Evaluation Criteria:

Clarity (30%): How clearly are requirements communicated?
Iteration Strategy (25%): How effectively do you guide the conversation?
Problem Decomposition (20%): How well do you break down complex requirements?
Quality Focus (15%): Do you emphasize code quality and best practices?
Validation (10%): How thoroughly do you test and verify results?

## Red Flags (Deduct points):

Asking AI to "just make it work" without explanation
Not providing feedback when AI misunderstands
Skipping Stage 1 validation before attempting Stage 2
Not testing edge cases mentioned in requirements