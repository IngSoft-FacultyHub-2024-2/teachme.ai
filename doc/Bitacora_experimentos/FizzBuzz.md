# Kata Name: FizzBuzz

## Stage 1

### Problem:

Write a program that prints the numbers from 1 to 100. But for multiples of three print “Fizz” instead of the number and for the multiples of five print “Buzz”. For numbers which are multiples of both three and five print “FizzBuzz “.

Sample output:

1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
16
17
Fizz
19
Buzz
... etc up to 100

## Stage 2

### Problem:

new requirements:
A number is fizz if it is divisible by 3 or if it has a 3 in it
A number is buzz if it is divisible by 5 or if it has a 5 in it

For example :
53 should return FizzBuzz (contains 5 and 3)
35 should return FizzBuzzBuzz (contains 3 and 5 and is divisible by 5)

## Code Evaluation Criteria:
Level 1: Beginner (0-3 points)

Incomplete basic functionality: Fails to correctly implement basic FizzBuzz rules
Confused logic: Incorrect or missing conditional structure
Syntax errors: Code that doesn't execute

Level 2: Basic (4-6 points)

Stage 1 functional: Correctly implements basic rules (divisible by 3, 5, and 15)
Code works: Produces expected output for numbers 1-100
Simple structure: Uses basic if/else, possibly with logic repetition

Level 3: Competent (7-8 points)

Stage 1 optimized: Clean code without unnecessary repetition
Good structure: Well-organized conditionals (checks 15 first, or uses concatenation)
Readable code: Clear variable names, consistent formatting

Level 4: Advanced (9-11 points)

Stage 2 implemented: Correctly handles new rules (contains digits 3 and 5)
Complex logic: Properly combines divisibility and digit detection
Edge cases handled: 35, 53, etc. produce correct output

Level 5: Expert (12-15 points)

Extensible code: Easy to add new rules
Separate functions: Modularized logic (detect digits, check divisibility)
SOLID principles: Code follows good design practices
Tests included: Test cases to validate functionality

Evaluation Criteria:

Correctness (40%): Does it produce expected output?
Readability (25%): Is the code easy to understand?
Structure (20%): Is it well organized?
Extensibility (15%): How easy is it to modify/extend?

## Prompting skill evaluation criteria ##
Level 1: Novice Prompter (0-3 points)

Vague requests: "Make FizzBuzz work" or "Fix this code"
No context: Doesn't explain the problem or requirements clearly
Single-shot attempts: Expects AI to solve everything in one prompt
No validation: Doesn't verify if AI understood the requirements

Level 2: Basic Prompter (4-6 points)

Clear problem statement: Explains FizzBuzz rules accurately
Specific requests: "Write a function that prints numbers 1-100 with Fizz/Buzz rules"
Basic iteration: Can ask follow-up questions when code doesn't work
Simple validation: Tests basic cases (3, 5, 15)

Level 3: Competent Prompter (7-8 points)

Structured requirements: Breaks down Stage 1 completely before moving to Stage 2
Quality constraints: Asks for "clean, readable code" or specific patterns
Effective debugging: Provides error messages and context when asking for fixes
Edge case awareness: Asks to verify specific test cases (like 15, 30, etc.)

Level 4: Advanced Prompter (9-11 points)

Incremental development: Successfully guides AI through Stage 1 → Stage 2 transition
Code review skills: Asks for improvements, optimizations, or alternative approaches
Constraint specification: Requests specific patterns ("use string concatenation" vs "nested ifs")
Testing integration: Asks AI to generate test cases or validation logic

Level 5: Expert Prompter (12-15 points)

Architectural guidance: Directs AI toward extensible, modular solutions
Best practices enforcement: Requests SOLID principles, clean code practices
Strategic prompting: Uses AI to explore multiple solution approaches
Meta-programming: Asks AI to explain trade-offs and guide design decisions
Comprehensive testing: Collaborates with AI to create thorough test suites

Evaluation Criteria:

Clarity (30%): How clearly are requirements communicated?
Iteration Strategy (25%): How effectively do you guide the conversation?
Problem Decomposition (20%): How well do you break down complex requirements?
Quality Focus (15%): Do you emphasize code quality and best practices?
Validation (10%): How thoroughly do you test and verify results?

Red Flags (Deduct points):

Asking AI to "just make it work" without explanation
Not providing feedback when AI misunderstands
Skipping Stage 1 validation before attempting Stage 2
Not testing edge cases mentioned in requirements