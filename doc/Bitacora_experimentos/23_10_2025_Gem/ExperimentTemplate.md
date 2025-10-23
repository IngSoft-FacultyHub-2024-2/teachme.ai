# 07_10_25_OpenAI

## Goal
- Check if a GPT that behaves as the Teaching Assitant can be created and shared


## What was done

- I optimized the prompt for GPT5 using [optimizer](https://platform.openai.com/)
- First try, it suggested to me the prompt to solve the kata. Optimized to developer prompt to emphasize the LLM not to do it. 
- After another optimization round, in the second prompt, I asked it to solve the Kata, and it did it straight away without further prompting.
- GPT % is untamable; there's no way to stop it from writing the solution!
- Third attempt to set guardrails with the optimizer.
- After four optimizations, it started behaving better. The key was instructing it to act like a teacher.

- When the assistant gives feedback, if I ask it to solve the problem to fix the given observations, it solves the kata right away without further prompting. 
- Added a few shot examples of prompts that the LLM should not answer; **the result was a greatly improved behavior!** 
- After trying more examples of user cheating the assistant and adding examples and rules the LLM should check, I hit the 8000 character barrier for a prompt of the GPT (not of the LLM). I could have used an instruction file, but I asked the prompt optimizer to optimize for size.
- The behavior improved a lot, but the LLM always finds a way to brake the rules. Needs more prompt refinement.



### Some conclusions:

- The use of examples of things the LLM should **not do** improved a lot; it prevented it from giving solutions, suggesting prompts, and made it more strict with the user.

- Just like with coding agents, the generated code is not good — it has mistakes and generated code it wasn’t asked to. It’s important to keep in mind that we’re not building an assistant that forces the LLM to do what the user wants; we’re building a tool to help students improve their prompting technique. I think the problem lies in the fact that by always using the same context, the LLM’s own responses and the user’s prompts clutter the context, diverting the LLM from its purpose. Added to this is the fact that the LLM "needs" to invent.

- This version of GPT is quite good as a low-fidelity prototype.


### Used prompts
[chat after adding few shot prompting](https://chatgpt.com/share/68e567a6-3e28-800d-a208-be3a0ab56725)

[last chat with improved prompt](https://chatgpt.com/share/68e567a6-3e28-800d-a208-be3a0ab56725)

## Model

GPT-5

## Result (Chat / Artifact / Gem / GPT)

[GPT](https://chatgpt.com/g/g-68e54d4c9da88191accfdb9c8add775e-teachme-ai)

## Next steps
- The next steps would be to test with another LLM as a judge while we try out the idea with students (see Martín’s proposal from today).
