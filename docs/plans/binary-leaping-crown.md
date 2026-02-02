# Plan: Deploy TeachMe.AI as NPM Tarball with Basic API Key Protection

## Context
- **Distribution**: Internal team/organization only
- **API Key**: Bundled with package (users consume your OpenAI quota)
- **Security**: Basic obfuscation (prevent casual inspection)

## Current State Analysis
Based on codebase exploration:

- **Entry point**: `src/index.ts` loads `.env` file with `dotenv.config()`
- **API key location**: `.env` file with `OPENAI_API_KEY=sk-proj-...`
- **API key usage**: Used by 3 services (OpenAIConfig, KataEvaluatorConfig, CodeExtractorService)
- **Build output**: TypeScript compiles to `dist/` directory
- **No npm packaging configured yet**: No `files`, `bin`, or `.npmignore` in package.json

## Approach: Basic Obfuscation + Controlled Distribution

Since this is for internal use with basic obfuscation needs, the approach balances security with simplicity.

### Strategy
1. **Embed encrypted API key in compiled code** instead of plain .env file
2. **Use environment variable encryption** with a simple cipher
3. **Control tarball contents** via `.npmignore` and package.json `files` field
4. **Make it installable globally** as a CLI tool via npm

## Implementation Plan

### 1. Create API Key Encryption Module
**File**: `src/utils/keyManager.ts` (new file)

- Create encryption utility using Node's `crypto` module (AES-256-CBC)
- Use **environment-based cipher key** via `TEACHME_KEY_CIPHER` env var (32 bytes)
- Provide `encrypt(apiKey, cipherKey)` and `decrypt(encrypted, cipherKey)` functions
- Fail explicitly if cipher key is wrong size or missing
- Note: Cipher key is distributed separately from tarball for added security

### 2. Create Build-Time Key Embedder
**File**: `scripts/embedKey.ts` (new file)

- Verify `.env` file exists, error clearly if not
- Read `OPENAI_API_KEY` from `.env`
- Read `TEACHME_KEY_CIPHER` from environment (required)
- Create `dist/config/` directory if it doesn't exist
- Encrypt the API key with cipher key
- Write encrypted key + metadata to `dist/config/embedded-key.json`:
  ```json
  {
    "encrypted": "...",
    "timestamp": 1706414400,
    "checksum": "sha256-hash"
  }
  ```
- Exit with clear error if any step fails

### 3. Create Key Loader Function
**File**: `src/utils/keyLoader.ts` (new file)

Implements multi-fallback strategy:
1. Check if `OPENAI_API_KEY` already in environment (highest priority)
2. Try to load embedded key from `config/embedded-key.json` (relative to dist/)
3. Decrypt using `TEACHME_KEY_CIPHER` from environment
4. Validate checksum to detect corruption
5. Inject into `process.env.OPENAI_API_KEY` if successful
6. Return `{success: boolean, source: string, error?: string}`

**Path resolution**: Use relative path from compiled dist location:
```typescript
const keyPath = path.join(__dirname, 'config', 'embedded-key.json');
```

### 4. Modify dotenv Loading Logic
**File**: `src/index.ts` (modify)

Current behavior:
```typescript
if (fs.existsSync(dotEnvPath)) {
  dotenv.config({ path: dotEnvPath });
}
```

New behavior:
```typescript
// Try to load embedded key first (for production installs)
const keyResult = loadEmbeddedKey();

if (keyResult.success) {
  console.log(`API key loaded from ${keyResult.source}`);
} else {
  // Fall back to .env for development
  if (fs.existsSync(dotEnvPath)) {
    dotenv.config({ path: dotEnvPath });
    console.log('API key loaded from .env');
  } else if (fs.existsSync(githubEnvPath)) {
    dotenv.config({ path: githubEnvPath });
    console.log('API key loaded from .github/.env');
  } else {
    // Final fallback: check if already in environment
    if (!process.env.OPENAI_API_KEY) {
      console.error('FATAL: No API key found. Tried:');
      console.error('  1. Environment variable OPENAI_API_KEY');
      console.error('  2. Embedded key (requires TEACHME_KEY_CIPHER)');
      console.error('  3. .env file');
      if (keyResult.error) {
        console.error(`  Embedded key error: ${keyResult.error}`);
      }
      process.exit(1);
    }
  }
}
```

### 5. Create CLI Wrapper Script
**File**: `bin/cli.js` (new file)

Proper shebang handling:
```javascript
#!/usr/bin/env node
require('../dist/index.js');
```

Mark as executable: `chmod +x bin/cli.js`

### 6. Create Postinstall Verification Script
**File**: `scripts/verifyEmbeddedKey.js` (new file)

- Check if `dist/config/embedded-key.json` exists
- Validate JSON structure (has `encrypted`, `checksum` fields)
- Compute and verify checksum
- Print warning if verification fails
- **Note**: Does NOT fail install, just warns

### 7. Configure NPM Packaging
**File**: `package.json` (modify)

**Add/modify these fields**:
```json
{
  "name": "teachme-ai",
  "version": "1.0.0",
  "bin": {
    "teachme-ai": "./bin/cli.js"
  },
  "files": [
    "dist/",
    "bin/",
    "README.md",
    "!dist/**/*.map",
    "!dist/**/*.d.ts"
  ],
  "scripts": {
    "build": "tsc",
    "build:prod": "tsc --sourceMap false && npm run embed-key",
    "embed-key": "ts-node scripts/embedKey.ts",
    "prepack": "npm run build:prod",
    "prepublishOnly": "npm run build:prod",
    "postinstall": "node scripts/verifyEmbeddedKey.js || true",
    "pack:tarball": "npm pack"
  },
  "dependencies": {
    "chalk": "^5.6.2",
    "dotenv": "^17.2.3",
    "figlet": "^1.10.0",
    "inquirer": "^13.2.1",
    "openai": "^6.16.0",
    "ora": "^9.1.0"
  },
  "devDependencies": {
    "@types/figlet": "^1.7.0",
    "@types/inquirer": "^9.0.0",
    "@types/jest": "^30.0.0",
    "@types/node": "^25.1.0",
    "@typescript-eslint/eslint-plugin": "^8.54.0",
    "@typescript-eslint/parser": "^8.54.0",
    "eslint": "^8.57.1",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-prettier": "^5.1.0",
    "jest": "^30.2.0",
    "prettier": "^3.4.2",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.7.3"
  }
}
```

**Key changes**:
- `bin` points to wrapper script (proper shebang)
- `files` explicitly excludes source maps and .d.ts files
- `build:prod` disables source maps
- `prepack` and `prepublishOnly` ensure key is embedded
- `postinstall` verifies embedded key (non-fatal)
- Dependencies properly separated (runtime vs dev)

### 8. Update .gitignore
**File**: `.gitignore` (modify)

Add:
```
# Embedded API key (generated at build time)
dist/config/embedded-key.json

# Source maps (don't publish)
*.map
```

## Security Analysis

### What this protects against:
- ✅ **Casual file browsing** - No plain .env in tarball, API key is encrypted
- ✅ **Accidental git commits** - Tarball contains encrypted data only
- ✅ **Simple grep searches** - API key not in plaintext anywhere in package
- ✅ **Passive tarball inspection** - Requires both tarball AND cipher key to extract API key
- ✅ **Mass exploitation** - Different cipher key per deployment prevents reuse of attack
- ✅ **Source map leakage** - Excluded from distribution

### What this does NOT protect against:
- ❌ **Determined reverse engineering** - With both tarball and cipher key, decryption is possible
- ❌ **Runtime inspection** - Once running, `process.env.OPENAI_API_KEY` is visible via debugging
- ❌ **Memory dumps** - API key exists in plaintext in memory during execution
- ❌ **Malicious insiders** - Users with both tarball and cipher key have full access

### Security Level Achieved: **"Basic Obfuscation+"**

This approach exceeds basic obfuscation by:
1. **Separation of secrets**: Tarball and cipher key distributed separately
2. **Multi-layer protection**: Even with tarball, need cipher key to decrypt
3. **No hardcoded decryption key**: Cipher key must be provided at runtime

**For internal team distribution**, this provides reasonable protection against:
- Accidental exposure (tarball shared without cipher key)
- Casual inspection (encrypted payload not immediately useful)
- Automated scanning tools (no plaintext secrets in package)

### Why This is Better Than Hardcoded Cipher Key:

| Aspect | Hardcoded Key | Environment-Based Key |
|--------|---------------|----------------------|
| Tarball alone reveals API key | ✅ Yes (decrypt with code) | ❌ No (needs cipher key) |
| Can rotate without rebuilding | ❌ No | ✅ Yes (new cipher key) |
| Different key per deployment | ❌ No | ✅ Yes |
| Audit trail (who has key) | ❌ No | ✅ Via secure distribution |
| Revocation possible | ❌ No | ✅ Change cipher key |

### For True Security (Future Enhancement):
The only truly secure approach without a backend is to **not distribute your API key at all**:
- Users provide their own OpenAI API key
- App prompts for key on first run
- Store in `~/.teachme-ai/config.json`
- Each user pays their own quota

This current plan is optimal for **internal distribution with basic protection**.

## Files to Create/Modify

### New Files:
- `src/utils/keyManager.ts` - Encryption/decryption utilities (AES-256-CBC)
- `src/utils/keyLoader.ts` - Multi-fallback key loading with error handling
- `scripts/embedKey.ts` - Build-time script to embed encrypted key
- `scripts/verifyEmbeddedKey.js` - Postinstall verification script
- `bin/cli.js` - CLI wrapper with proper shebang
- `dist/config/embedded-key.json` - Generated at build time (gitignored)

### Modified Files:
- `src/index.ts` - Update dotenv loading with comprehensive fallback chain
- `package.json` - Add bin, files, dependencies separation, build scripts
- `.gitignore` - Add `dist/config/embedded-key.json` and `*.map`
- `tsconfig.json` - Consider disabling sourceMap for production builds (or exclude via files field)

## Distribution Workflow

### Step 1: Generate Cipher Key (One-Time)
```bash
# Generate a random 32-byte (64 hex characters) cipher key
openssl rand -hex 32

# Example output: a1b2c3d4e5f6...
# Save this in your password manager or secure location
# This key is used to encrypt/decrypt the embedded API key
```

### Step 2: Build Production Package
```bash
# Set the cipher key environment variable
export TEACHME_KEY_CIPHER="a1b2c3d4e5f6..."  # Your 64-char hex key

# Build and create tarball (prepack hook runs build:prod automatically)
npm pack

# This creates: teachme-ai-1.0.0.tgz
```

### Step 3: Distribute to Internal Team
Provide team members with:
1. **The tarball file**: `teachme-ai-1.0.0.tgz`
2. **The cipher key**: Via secure channel (password manager, encrypted message, etc.)
3. **Installation instructions** (see below)

### For End Users (Installing):

#### First-time Setup:
```bash
# 1. Install the tarball globally
npm install -g teachme-ai-1.0.0.tgz

# 2. Set the cipher key environment variable
export TEACHME_KEY_CIPHER="a1b2c3d4e5f6..."  # Provided by admin

# 3. Add to shell profile for persistence (~/.bashrc, ~/.zshrc, etc.)
echo 'export TEACHME_KEY_CIPHER="a1b2c3d4e5f6..."' >> ~/.bashrc

# 4. Run the application
teachme-ai
```

#### Alternative: One-Time Variable
```bash
# Run with cipher key inline (no persistence)
TEACHME_KEY_CIPHER="a1b2c3d4e5f6..." teachme-ai
```

## Verification Steps

### Phase 1: Build Verification

1. **Generate test cipher key**:
   ```bash
   export TEACHME_KEY_CIPHER=$(openssl rand -hex 32)
   echo "Cipher key: $TEACHME_KEY_CIPHER"  # Save this for testing
   ```

2. **Build production package**:
   ```bash
   npm run build:prod
   ```
   Should complete without errors and show "Embedded key created successfully"

3. **Verify embedded key file exists**:
   ```bash
   cat dist/config/embedded-key.json
   ```
   Should show JSON with `encrypted`, `timestamp`, and `checksum` fields

4. **Verify API key is NOT in plaintext**:
   ```bash
   grep -r "sk-proj" dist/  # Should find nothing
   ```

5. **Verify source maps excluded**:
   ```bash
   find dist/ -name "*.map"  # Should find nothing
   ```

### Phase 2: Package Verification

6. **Create tarball**:
   ```bash
   npm pack
   ```
   Creates `teachme-ai-1.0.0.tgz`

7. **Inspect tarball contents**:
   ```bash
   tar -tzf teachme-ai-1.0.0.tgz | head -20
   ```
   Should show:
   - `package/dist/` (compiled code)
   - `package/bin/cli.js` (CLI wrapper)
   - `package/README.md`

   Should NOT show:
   - `package/src/` (source code)
   - `package/.env` (environment file)
   - `package/tests/` (test files)

8. **Verify embedded key is in tarball**:
   ```bash
   tar -tzf teachme-ai-1.0.0.tgz | grep embedded-key
   ```
   Should output: `package/dist/config/embedded-key.json`

9. **Verify .env is NOT in tarball**:
   ```bash
   tar -tzf teachme-ai-1.0.0.tgz | grep -E '\.env$|\.env\.'
   ```
   Should find nothing (or only .env.example if included)

10. **Verify no source maps in tarball**:
    ```bash
    tar -tzf teachme-ai-1.0.0.tgz | grep '\.map$'
    ```
    Should find nothing

### Phase 3: Installation Verification

11. **Extract and inspect package**:
    ```bash
    mkdir /tmp/inspect-package && cd /tmp/inspect-package
    tar -xzf /path/to/teachme-ai-1.0.0.tgz
    ls -la package/
    ls -la package/dist/config/
    ```

12. **Test installation in clean environment**:
    ```bash
    mkdir /tmp/test-install && cd /tmp/test-install

    # Install without cipher key (should install but not run)
    npm install -g /path/to/teachme-ai-1.0.0.tgz
    ```

13. **Test run without cipher key** (should fail gracefully):
    ```bash
    teachme-ai
    ```
    Expected: Error message about missing TEACHME_KEY_CIPHER

14. **Test run with cipher key** (should work):
    ```bash
    export TEACHME_KEY_CIPHER="your-test-key-from-step-1"
    teachme-ai
    ```
    Expected: Application starts successfully

15. **Verify postinstall ran**:
    Check npm install output for verification message

### Phase 4: Security Verification

16. **Verify encrypted payload is not easily decryptable**:
    ```bash
    # Try to decrypt without cipher key
    node -e "console.log(require('/tmp/inspect-package/package/dist/config/embedded-key.json'))"
    ```
    Should show encrypted blob, not plaintext API key

17. **Verify no API key in grep search**:
    ```bash
    cd /tmp/inspect-package/package
    grep -r "sk-" .  # Search for OpenAI key pattern
    ```
    Should find nothing in plaintext

18. **Test cipher key rotation**:
    ```bash
    # Build with new cipher key
    export TEACHME_KEY_CIPHER=$(openssl rand -hex 32)
    npm run build:prod
    npm pack
    ```
    Should create new package with different encrypted payload

### Expected Results Summary:
- ✅ Build completes successfully with cipher key
- ✅ Embedded key file created in dist/config/
- ✅ Tarball contains only dist/, bin/, README
- ✅ No .env, src/, tests/, or *.map files in tarball
- ✅ Installation succeeds
- ✅ Postinstall verification runs
- ✅ Application fails without cipher key
- ✅ Application runs with cipher key
- ✅ No plaintext API key in tarball
- ✅ Can build with different cipher keys

## Implementation Details

### keyManager.ts - Core Encryption

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

export interface EncryptedPayload {
  encrypted: string;
  iv: string;
}

export function encrypt(text: string, cipherKey: string): EncryptedPayload {
  // Validate cipher key
  const keyBuffer = Buffer.from(cipherKey, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('Cipher key must be 32 bytes (64 hex characters)');
  }

  // Generate random IV
  const iv = crypto.randomBytes(IV_LENGTH);

  // Encrypt
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    iv: iv.toString('hex')
  };
}

export function decrypt(payload: EncryptedPayload, cipherKey: string): string {
  // Validate cipher key
  const keyBuffer = Buffer.from(cipherKey, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('Cipher key must be 32 bytes (64 hex characters)');
  }

  // Decrypt
  const iv = Buffer.from(payload.iv, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  let decrypted = decipher.update(payload.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function computeChecksum(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
```

### embedKey.ts - Build Script

```typescript
#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { encrypt, computeChecksum } from '../src/utils/keyManager';

function main() {
  console.log('Embedding encrypted API key...');

  // 1. Load .env file
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env file not found at', envPath);
    process.exit(1);
  }

  dotenv.config({ path: envPath });

  // 2. Get API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    console.error('ERROR: OPENAI_API_KEY not found or empty in .env');
    process.exit(1);
  }

  // 3. Get cipher key
  const cipherKey = process.env.TEACHME_KEY_CIPHER;
  if (!cipherKey || cipherKey.trim().length === 0) {
    console.error('ERROR: TEACHME_KEY_CIPHER environment variable not set');
    console.error('Generate one with: openssl rand -hex 32');
    process.exit(1);
  }

  // 4. Create output directory
  const configDir = path.join(__dirname, '..', 'dist', 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // 5. Encrypt API key
  try {
    const encrypted = encrypt(apiKey, cipherKey);
    const checksum = computeChecksum(encrypted.encrypted + encrypted.iv);

    const payload = {
      encrypted: encrypted.encrypted,
      iv: encrypted.iv,
      timestamp: Date.now(),
      checksum
    };

    // 6. Write to file
    const outputPath = path.join(configDir, 'embedded-key.json');
    fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

    console.log('✓ Encrypted API key embedded successfully');
    console.log('  Output:', outputPath);
    console.log('  Checksum:', checksum.substring(0, 16) + '...');

  } catch (error) {
    console.error('ERROR: Failed to encrypt API key:', error.message);
    process.exit(1);
  }
}

main();
```

### keyLoader.ts - Runtime Loading

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { decrypt, computeChecksum } from './keyManager';

export interface KeyLoadResult {
  success: boolean;
  source: string;
  error?: string;
}

export function loadEmbeddedKey(): KeyLoadResult {
  // Priority 1: Check if already in environment
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0) {
    return {
      success: true,
      source: 'environment variable'
    };
  }

  // Priority 2: Try embedded key
  try {
    // Path relative to dist/index.js -> dist/config/embedded-key.json
    const keyPath = path.join(__dirname, 'config', 'embedded-key.json');

    if (!fs.existsSync(keyPath)) {
      return {
        success: false,
        source: 'embedded',
        error: 'Embedded key file not found'
      };
    }

    // Read and parse
    const payload = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    // Validate structure
    if (!payload.encrypted || !payload.iv || !payload.checksum) {
      return {
        success: false,
        source: 'embedded',
        error: 'Embedded key file has invalid structure'
      };
    }

    // Verify checksum
    const expectedChecksum = computeChecksum(payload.encrypted + payload.iv);
    if (payload.checksum !== expectedChecksum) {
      return {
        success: false,
        source: 'embedded',
        error: 'Embedded key file is corrupted (checksum mismatch)'
      };
    }

    // Get cipher key from environment
    const cipherKey = process.env.TEACHME_KEY_CIPHER;
    if (!cipherKey || cipherKey.trim().length === 0) {
      return {
        success: false,
        source: 'embedded',
        error: 'TEACHME_KEY_CIPHER environment variable not set (required to decrypt)'
      };
    }

    // Decrypt
    const apiKey = decrypt({ encrypted: payload.encrypted, iv: payload.iv }, cipherKey);

    // Inject into environment
    process.env.OPENAI_API_KEY = apiKey;

    return {
      success: true,
      source: 'embedded key (decrypted)'
    };

  } catch (error) {
    return {
      success: false,
      source: 'embedded',
      error: error.message
    };
  }
}
```

### cli.js - Wrapper

```javascript
#!/usr/bin/env node
require('../dist/index.js');
```

### verifyEmbeddedKey.js - Postinstall

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function computeChecksum(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function main() {
  const keyPath = path.join(__dirname, '..', 'dist', 'config', 'embedded-key.json');

  if (!fs.existsSync(keyPath)) {
    console.warn('⚠ WARNING: Embedded API key file not found');
    console.warn('  Expected at:', keyPath);
    console.warn('  You may need to provide OPENAI_API_KEY environment variable');
    return;
  }

  try {
    const payload = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    if (!payload.encrypted || !payload.iv || !payload.checksum) {
      console.warn('⚠ WARNING: Embedded key file has invalid structure');
      return;
    }

    const expectedChecksum = computeChecksum(payload.encrypted + payload.iv);
    if (payload.checksum !== expectedChecksum) {
      console.warn('⚠ WARNING: Embedded key file checksum mismatch (may be corrupted)');
      return;
    }

    console.log('✓ Embedded API key verification passed');
    console.log('  Remember to set TEACHME_KEY_CIPHER environment variable');

  } catch (error) {
    console.warn('⚠ WARNING: Could not verify embedded key:', error.message);
  }
}

main();
```

## Alternative Considered: User-Provided Keys

If you decide later to require users to provide their own keys (more secure):
- Remove embedded key mechanism
- Create `teachme-ai init` command to prompt for API key
- Store user's key in `~/.teachme-ai/config`
- Benefits: No key distribution, users pay their own quota
- Downside: More setup friction for internal users

---

**Status**: Ready for implementation after approval
