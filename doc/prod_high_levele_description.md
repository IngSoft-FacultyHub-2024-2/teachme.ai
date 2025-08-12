# Teacheme assistant characteristics #

I want to create a AI tutor for helping a student to practice something he needs to learn.

I want to base the practicing assistant on the concept of martial art katas applied to practice software development based on prompting an llm. So students can practice **prompt engineering** through kata-like sequences.

Some basic elements to consider

**Structure:**

*   **Kata sequences** = progressive prompting challenges
*   **Forms** = specific prompt patterns/techniques to master
*   **Repetition** = practicing the same prompt types until fluent

**Core Components:**

*   **Challenge library** - curated prompting exercises by difficulty
*   **Template patterns** - example prompt structures to learn
*   **Response evaluation** - AI judges if student's prompt achieved the goal
*   **Progress tracking** - mastery of different prompt types

**Implementation:**

*   Student gets a task (e.g., "Get the AI to write a specific type of function")
*   They craft their prompt
*   System evaluates both the prompt quality AND the AI's response
*   Feedback on improvement areas

The assistant should follow these basic steps

1-      will receive a kata description and evaluation criteria,

2-      accept a student prompt and perform the task the student request in the prompt

3-      check the results against the evaluation criteria and give feedback to the student

4-      allow the student to improve the result by writing a new prompt. During this step the student should be allowed to ask the assistant questions about how to improve his prompt bur the assistant should never give direct solutions.

5-      The cycle continues step 3 or until the students achieve the goal