# Kata Name: FizzBuzz

## Stage 1

### Problem:

Write a program that prints the numbers from 1 to 100 separated by spaces. But for multiples of two print "Chan" instead of the number and for the multiples of three print "Pun". For numbers which are multiples of both two and three print "ChanPun".

Sample output:
1 Chan Pun Chan 5 ChanPun 7 Chan Pun Chan 11 ChanPun 13 Chan Pun Chan 17 ... etc up to 100

## Stage 2

### Problem:

new requirements:
A number is Chan if it is divisible by 2 or if it has a 2 in it
A number is Pun if it is divisible by 3 or if it has a 3 in it

For example :
23 should return ChanPun (contains 2 and 3)
32 should return ChanChanPun (contains 2 and 3 and is divisible by 2)

## Code Quality Evaluation Criteria:
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
