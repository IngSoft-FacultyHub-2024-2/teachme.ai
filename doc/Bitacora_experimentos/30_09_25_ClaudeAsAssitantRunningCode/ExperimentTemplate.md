#30_09_25_Claude

## Goal
- Check if by changing the prompt I can make the claude artifact to run the generated code
- check if it is a model issue

## What was done

- Again Claude (Sonnet 4.5) tried to code the app. I requested no to do it and it behaved like the assistant. 
- when I ask to solve the Kata withouy any further instructions it gave me the classic solution.
- It couldnt run it, it just simulated the run. Worst it tried to run python code as javascript
- I tried changing the model to sonnet 4 and at forst it tries to build an app, but after requesting to behave it started emulation
- Checked prompt and change a typo form "I want to behave as " to "I want you to behave as teaching a" and it worked as an assitant. 
- ** I asked if it is running the code and it does using repl. ** it tried python as it couldnt it used javascript


### Some conclusions:

- 

### Used prompts
[Prompt used first try](doc/Bitacora_experimentos/30_09_25_ClaudeAsAssitantRunningCode/UserPrompt_Spnet4.5.txt)
[Prompt used second try](doc/Bitacora_experimentos/30_09_25_ClaudeAsAssitantRunningCode/UserPrompt_Spnet4.txt)
[Prompt used third try](doc/Bitacora_experimentos/30_09_25_ClaudeAsAssitantRunningCode/UserPrompt_Spnet4.txt)

## Model

Claude Sonnet 4.5 (first try)
Claude Sonnet 4 (Second try)
Claude Sonnet 4.5 (Third try)
## Result

[Claude Sonnet 4.5] (https://claude.ai/share/7287ea5a-a4ca-4ec0-93b3-5ba22a333a05)
[Claude Sonnet 4]  (https://claude.ai/share/6d75dea8-976f-4cdf-8715-d3748853e591)
[Claude Sonnet 4.5 third try] (https://claude.ai/share/e7d5eade-67d6-42c9-a54e-9e85c0af86ff)

## Next steps
- 
