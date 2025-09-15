# 15_09_25_Claude

## Goal

The goal is to prototype improve the artifact to read the kata description and code evaluation criteria from one file and the prompting evalaution criteria from other file (md format))

## What was done

- for this experiment I worked taking the same files used on doc/Bitacora_experimentos/08_09_25_Gemini
- started a new artifact, to preserve the previous version.
- improved the system prompt to instruct the llm
  * to read the kata and prompt rubric files.
  * to follow the student prompt instructions as they are given by the prompt
  * I had to change the prompt to avoid the llm to generate a solution for the specific kata
  * I had to start it over because the generated code had a bug and it did not worked as expected
- I just realized that what we are now doing is mixing in the prompt two different concerns:
  * the assistant behavior (system prompt)
  * the instructions to generate a better assistant. 

### Some conclusions:

- I have to change the system prompt to use KataInstructions.md because using a file name implying the kata made the llm to code a solution for the specific kata.
- I could not make the program to generate the code for the kata after giving several prompts. couldn't make it work after 12th iterations. I requested chatGPT to evaluate the generated code and the conclusion was that the code execution it is simulated [chatGPT] (https://chatgpt.com/share/68c87e43-a588-800d-b4a1-005369981b22)
- I think we are mixing two different concerns in the same prompt:
  * the assistant behavior (system prompt)
  * the instructions to generate the assistant artifact.
  maybe we should separate the system prompt that it is what we need for the prototype.


### Used prompts
[Prompt used](https://claude.ai/share/0aca61c9-aab3-4e27-98c5-75364e851422)

## Model

Claude Sonnet 4

## Result
https://claude.ai/public/artifacts/df0129b2-3514-4bd5-9ccf-3708d3e671f4

## Next steps
- try the same with Claude Opus 4.1