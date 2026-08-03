const camelCase = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
};

const mapTypeCpp = (type) => {
  switch (type) {
    case 'integer':
      return 'int';
    case 'string':
      return 'string';
    case 'boolean':
      return 'bool';
    case 'integer array':
      return 'vector<int>';
    case 'string array':
      return 'vector<string>';
    default:
      return 'string';
  }
};

const mapTypeJava = (type) => {
  switch (type) {
    case 'integer':
      return 'int';
    case 'string':
      return 'String';
    case 'boolean':
      return 'boolean';
    case 'integer array':
      return 'int[]';
    case 'string array':
      return 'String[]';
    default:
      return 'String';
  }
};

const mapTypeC = (type) => {
  switch (type) {
    case 'integer':
      return 'int';
    case 'string':
      return 'char*';
    case 'boolean':
      return 'bool';
    case 'integer array':
      return 'int*';
    case 'string array':
      return 'char**';
    default:
      return 'char*';
  }
};

export const harnessGenerator = {
  generate(title, parameters, returnValue) {
    const fnName = camelCase(title);

    // Default fallback if parameters are not provided properly
    if (!parameters || parameters.length === 0) {
      parameters = [{ name: 'input', type: 'string' }];
      returnValue = { type: 'string' };
    }

    const starterCode = {
      javascript: this.generateStarterJs(fnName, parameters),
      java: this.generateStarterJava(fnName, parameters, returnValue.type),
      cpp: this.generateStarterCpp(fnName, parameters, returnValue.type),
      c: this.generateStarterC(fnName, parameters, returnValue.type),
    };

    const harness = {
      javascript: this.generateHarnessJs(fnName, parameters),
      java: this.generateHarnessJava(fnName, parameters, returnValue.type),
      cpp: this.generateHarnessCpp(fnName, parameters, returnValue.type),
      c: this.generateHarnessC(fnName, parameters, returnValue.type),
    };

    return { starterCode, harness };
  },

  // JavaScript
  generateStarterJs(fnName, params) {
    const args = params.map((p) => p.name).join(', ');
    return `function ${fnName}(${args}) {\n  // Write your code here\n  \n}`;
  },

  generateHarnessJs(fnName, params) {
    const parseArgs = params
      .map((p, i) => {
        return `  const ${p.name} = JSON.parse(input[${i}]);`;
      })
      .join('\n');
    const args = params.map((p) => p.name).join(', ');

    return `const fs = require('fs');
{{USER_CODE}}
try {
  const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
  if (input.length === 0 || input[0] === '') process.exit(0);
${parseArgs}
  const result = ${fnName}(${args});
  console.log(JSON.stringify(result));
} catch(e) {
  console.error(e);
}`;
  },

  // C++
  generateStarterCpp(fnName, params, retType) {
    const args = params.map((p) => `${mapTypeCpp(p.type)} ${p.name}`).join(', ');
    return `class Solution {
public:
    ${mapTypeCpp(retType)} ${fnName}(${args}) {
        // Write your code here
        
    }
};`;
  },

  generateHarnessCpp(_fnName, _params, _retType) {
    // For C++, writing a full JSON parser is too much for this script,
    // so we'll fallback to basic competitive programming cin/cout.
    // However, JS testcases will pass JSON arrays.
    // For now, let's keep it simple to ensure compilation works.
    return `#include <iostream>
#include <vector>
#include <string>
using namespace std;

{{USER_CODE}}

int main() {
    // Harness execution logic for C++ is simplified. 
    // Usually requires rapidjson or similar to parse input arrays perfectly from JS array formats.
    cout << "Execution harness for C++ not fully implemented for JSON inputs.\\n";
    return 0;
}`;
  },

  // Java
  generateStarterJava(fnName, params, retType) {
    const args = params.map((p) => `${mapTypeJava(p.type)} ${p.name}`).join(', ');
    return `class Solution {
    public ${mapTypeJava(retType)} ${fnName}(${args}) {
        // Write your code here
        
    }
}`;
  },

  generateHarnessJava(_fnName, _params, _retType) {
    return `import java.util.*;
{{USER_CODE}}
public class Main {
    public static void main(String[] args) {
        System.out.println("Execution harness for Java not fully implemented for JSON inputs.");
    }
}`;
  },

  // C
  generateStarterC(fnName, params, retType) {
    const args = params.map((p) => `${mapTypeC(p.type)} ${p.name}`).join(', ');
    return `#include <stdbool.h>
#include <stdlib.h>

${mapTypeC(retType)} ${fnName}(${args}) {
    // Write your code here
    
}`;
  },

  generateHarnessC(_fnName, _params, _retType) {
    return `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

{{USER_CODE}}

int main() {
    printf("Execution harness for C not fully implemented for JSON inputs.\\n");
    return 0;
}`;
  },
};
