# rosee
## Description
A MFM parser implementation with PEG.js (In developing)  

## Installation
```
npm i rosee
```

## Usage
TypeScript:  
```ts
import * as mfm from 'rosee';

// parse a MFM text
const result = mfm.parse('good morning ***everynyan!***');

// parse a MFM plain text
const plainResult = mfm.parsePlain('I like the hot soup :soup:​');
```

## Usage (Repository)
### 1. Clone
```
git clone https://github.com/marihachi/rosee.git
```

### 2. Install packages
```
cd rosee
npm i
```

### 3. Build
```
npm run build
```

### Use the interactive CLI parser
```
npm run parse
```

## License
This software is released under the [MIT License](LICENSE).  
