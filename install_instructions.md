# Installation Instructions

## Quick Install

**Install tarball:**
```bash
npm install -g teachme-ai-1.0.0.tgz
```

**Add your OpenAI API key:**

Create a `.env` file in your working directory:

```bash
# Windows PowerShell
cp $(npm root -g)\teachme-ai\.env.example .env
# Edit .env and add: OPENAI_API_KEY=your_key_here
notepad .env
```

```bash
# macOS / Linux
cp $(npm root -g)/teachme-ai/.env.example .env
# Edit .env and add: OPENAI_API_KEY=your_key_here
nano .env
```

**Run:**
```bash
teachme
```

## Advanced: Custom Kata Files

**Create custom directory:**
```bash
mkdir my-katas
# Add your kata files to this directory
```

**Update .env:**
```bash
KATA_INPUT_DATA_PATH=./my-katas
```

**Run:**
```bash
teachme
```

## Troubleshooting

If you see "Cannot find kata files":
1. Verify tarball contents: `tar -tzf teachme-ai-1.0.0.tgz | grep inputData`
2. Check `.env` path or remove `KATA_INPUT_DATA_PATH` to use defaults
3. Ensure you have the OpenAI API key configured in `.env`
