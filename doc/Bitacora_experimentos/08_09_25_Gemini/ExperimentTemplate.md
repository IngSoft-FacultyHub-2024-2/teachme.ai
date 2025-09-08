# Date
08-09-25
## Goal
Improve the prompt for generating the assistant (using Gemini)

Add files to upload the kata and promting evaluation separately in Markdown
Instruct independent evaluation (see if it can be done as two conversations)
Give feedback at the end of the Kata

## What was done

* New file structure
* Improve the assistant generation prompt
* Run the assistant directly as student
* Focus on pedagogical results

### Some conclusions:
the first assistant didn't handle multiple prompt itarations
the second try passed to the second stage, showing only feedback for the last prompt
summary in popup
find ways to save the results


## Used prompts
[](AssistantGenerationPrompt.md)

## Model
Gemini 2.5 Pro

## Result
Chat https://g.co/gemini/share/4c1292582561
Canvas https://g.co/gemini/share/a55060b5926b

## Pedagogical evaluation
Concise feedback is much better for the student
More challenging Kata
How to handle multiple promtps/code improvements + feedback for each itaration in the UI