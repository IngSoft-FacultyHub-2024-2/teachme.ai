# 14_10_25_OpenAI - en adelante


## Goal
- Create an app that uses more than one model: one to generate code from prompts, another to evaluate the code quality, and maybe a third to evaluate the prompting quality.


## What was done

-A TypeScript app was created that receives the prompts and executes.

 - We are using the OpenAI Responses API with the reusable prompts feature, which lets us change the model and its parameters without changing the code.

- The prompt was modified to focus on code generation and not helping the student, only giving hints.

- The prompt was modified to generate Python code and show what it did. It uses tools by function calling. used openAI code interpreter


### Some conclusions:

- The assistant works much better.

- It cannot run code because it is in JavaScript and there is no integrated REPL for JS; there is one for Python, so I will change to that.


### Used prompts



## Model

GPT-5 - mini

## Result (Chat / Artifact / Gem / GPT)



## Next steps

