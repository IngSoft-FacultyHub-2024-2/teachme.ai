# Installation instructions

**Go to your test directory.**
```
  Ex. cd D:\Downloads\test_teachme
```

**Remove the old installation (if already installed).**
```
  npm uninstall teachme-ai
```

**Install the new tarball (update the path to your workspace)**
```
  npm install ..\teachme-ai-1.0.0.tgz
```

**Copy the given .env file**
```
  cp  ..\.env .env
```

**Unzip the given inpuData folder to the working folder (test_teachme)**
```
Expand-Archive -Path "..\inputData.zip" -DestinationPath "."
```

**Copy the given  .env to the working folder (test_teachme) and change the KATA_INPUT_DATA_PATH to the inputData folder**
```
  KATA_INPUT_DATA_PATH=.\inputData
```

**Run the app**
```
  npx teachme
```
  