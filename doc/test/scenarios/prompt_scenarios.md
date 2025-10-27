## Scenario Level 1: Novice Prompter

Vague requests: "Make FizzBuzz work" or "Fix this code"
No context: Doesn't explain the problem or requirements clearly
Single-shot attempts: Expects AI to solve everything in one prompt
No validation: Doesn't verify if AI understood the requirements

Solve the Kata
Code FizzBuzz
Fix this code

## Scenario Level 2: Basic Prompter

Clear problem statement: Explains FizzBuzz rules accurately
Specific requests: "Write a function that prints numbers 1-100 with Fizz/Buzz rules"
Basic iteration: Can ask follow-up questions when code doesn't work
Simple validation: Tests basic cases (3, 5, 15)

Write a function that prints numbers 1-100 with Fizz/Buzz rules
Test the function

## Scenario Level 3: Competent Prompter

Structured requirements: Breaks down Stage 1 completely before moving to Stage 2
Quality constraints: Asks for "clean, readable code" or specific patterns
Effective debugging: Provides error messages and context when asking for fixes
Edge case awareness: Asks to verify specific test cases (like 15, 30, etc.)

Generate a function that prints the numbers from 1 to 100. But for multiples of three print "Fizz" instead of the number and for the multiples of five print "Buzz". For numbers which are multiples of both three and five print "FizzBuzz".
Run the code and generate test cases
Verify specific test cases (like 15, 30, etc.)

## Scenario Level 4: Advanced Prompter

Incremental development: Successfully guides AI through Stage 1 → Stage 2 transition
Code review skills: Asks for improvements, optimizations, or alternative approaches
Constraint specification: Requests specific patterns ("use string concatenation" vs "nested ifs")
Testing integration: Asks AI to generate test cases or validation logic

Generate a function that prints the numbers from 1 to 100. But for multiples of three print "Fizz" instead of the number and for the multiples of five print "Buzz". For numbers which are multiples of both three and five print "FizzBuzz".
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
Run the code and generate test cases
Verify specific cases (like 15, 30, etc.)

## Level 5: Expert Prompter

Architectural guidance: Directs AI toward extensible, modular solutions
Best practices enforcement: Requests SOLID principles, clean code practices
Strategic prompting: Uses AI to explore multiple solution approaches
Meta-programming: Asks AI to explain trade-offs and guide design decisions
Comprehensive testing: Collaborates with AI to create thorough test suites

Generate a function that prints the numbers from 1 to 100. But for multiples of three print "Fizz" instead of the number and for the multiples of five print "Buzz". For numbers which are multiples of both three and five print "FizzBuzz".
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
Run the code and generate test cases
Verify specific cases (like 15, 30, etc.)
Verify boundary cases, verify negative and out of range cases
Use Clean Code and good coding practices for Javascript
Don't repeat code
Analyse the code and explain how the solution uses good coding practices

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