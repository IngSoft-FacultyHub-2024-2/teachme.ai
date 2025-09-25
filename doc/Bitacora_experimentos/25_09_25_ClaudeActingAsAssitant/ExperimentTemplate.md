# 25_09_25_Claude

## Goal
- check if by changing the promot to specifically asking Claude tio behave as an assitant and not to generate an application worked better. It did. 
- 

## What was done

- change the prompt to tell Claude artifact to act as an Assitant to avoid the generation of an app. it cahnge to the expected behaviour.
- when asked to "solve the kata" it did generate the code based on the kata description. Added an instruction to guardrail this situation.
- worked all the kata steps and tried to make the llm misbehave after adding new guarrains instrucions. It worked pretty well. 

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
https://claude.ai/share/8b21e3b3-0b9c-4cb0-a3c4-fa8cba9d5c7f


## Next steps
- try the same but requesting code execution