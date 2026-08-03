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

  generateHarnessCpp(fnName, params, retType) {
    let parseArgs = '';
    params.forEach((p, i) => {
      if (p.type === 'integer') {
        parseArgs += `    int ${p.name} = stoi(lines[${i}]);\n`;
      } else if (p.type === 'string') {
        parseArgs += `    string ${p.name} = lines[${i}];\n    if(${p.name}.size() >= 2 && ${p.name}.front() == '"' && ${p.name}.back() == '"') { ${p.name} = ${p.name}.substr(1, ${p.name}.size() - 2); }\n`;
      } else if (p.type === 'boolean') {
        parseArgs += `    bool ${p.name} = (lines[${i}] == "true" || lines[${i}] == "1");\n`;
      } else if (p.type === 'integer array') {
        parseArgs += `    vector<int> ${p.name};\n    {\n        string s = lines[${i}];\n        int curr = 0; bool inNum = false; bool neg = false;\n        for(char c : s) {\n            if(c == '-' && !inNum) { neg = true; inNum = true; curr = 0; }\n            else if(isdigit(c)) { curr = curr * 10 + (c - '0'); inNum = true; }\n            else if(inNum) { ${p.name}.push_back(neg ? -curr : curr); inNum = false; neg = false; curr = 0; }\n        }\n        if(inNum) ${p.name}.push_back(neg ? -curr : curr);\n    }\n`;
      } else if (p.type === 'string array') {
        parseArgs += `    vector<string> ${p.name};\n    {\n        string s = lines[${i}];\n        string curr = ""; bool inStr = false;\n        for(char c : s) {\n            if(c == '"') {\n                if(inStr) { ${p.name}.push_back(curr); inStr = false; }\n                else { inStr = true; curr = ""; }\n            } else if(inStr) {\n                curr += c;\n            }\n        }\n    }\n`;
      } else {
        parseArgs += `    string ${p.name} = lines[${i}];\n`;
      }
    });

    const args = params.map((p) => p.name).join(', ');
    let outputLogic;
    if (retType === 'integer array') {
      outputLogic = `    cout << "[";\n    for(size_t i=0; i<result.size(); ++i) {\n        cout << result[i] << (i+1 == result.size() ? "" : ",");\n    }\n    cout << "]";\n`;
    } else if (retType === 'string array') {
      outputLogic = `    cout << "[";\n    for(size_t i=0; i<result.size(); ++i) {\n        cout << "\\"" << result[i] << "\\"" << (i+1 == result.size() ? "" : ",");\n    }\n    cout << "]";\n`;
    } else if (retType === 'boolean') {
      outputLogic = `    cout << (result ? "true" : "false");\n`;
    } else if (retType === 'string') {
      outputLogic = `    cout << "\\"" << result << "\\"";\n`;
    } else {
      outputLogic = `    cout << result;\n`;
    }

    return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

{{USER_CODE}}

int main() {
    vector<string> lines;
    string line;
    while(getline(cin, line)) {
        if(!line.empty()) lines.push_back(line);
    }
    if(lines.empty()) return 0;
${parseArgs}
    Solution sol;
    auto result = sol.${fnName}(${args});
${outputLogic}
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

  generateHarnessJava(fnName, params, retType) {
    let parseArgs = '';
    params.forEach((p, i) => {
      if (p.type === 'integer') {
        parseArgs += `        int ${p.name} = Integer.parseInt(lines.get(${i}).trim());\n`;
      } else if (p.type === 'string') {
        parseArgs += `        String ${p.name} = lines.get(${i}).trim();\n        if(${p.name}.length() >= 2 && ${p.name}.startsWith("\\"") && ${p.name}.endsWith("\\"")) { ${p.name} = ${p.name}.substring(1, ${p.name}.length() - 1); }\n`;
      } else if (p.type === 'boolean') {
        parseArgs += `        boolean ${p.name} = Boolean.parseBoolean(lines.get(${i}).trim());\n`;
      } else if (p.type === 'integer array') {
        parseArgs += `        String s_${p.name} = lines.get(${i}).trim();\n        if(s_${p.name}.length() <= 2) { s_${p.name} = ""; } else { s_${p.name} = s_${p.name}.substring(1, s_${p.name}.length() - 1); }\n        String[] parts_${p.name} = s_${p.name}.split(",");\n        java.util.List<Integer> list_${p.name} = new java.util.ArrayList<>();\n        for(String p_str : parts_${p.name}) {\n            p_str = p_str.trim();\n            if(!p_str.isEmpty()) list_${p.name}.add(Integer.parseInt(p_str));\n        }\n        int[] ${p.name} = new int[list_${p.name}.size()];\n        for(int j=0; j<${p.name}.length; j++) ${p.name}[j] = list_${p.name}.get(j);\n`;
      } else if (p.type === 'string array') {
        parseArgs += `        String s_${p.name} = lines.get(${i}).trim();\n        java.util.List<String> list_${p.name} = new java.util.ArrayList<>();\n        boolean inStr_${p.name} = false;\n        StringBuilder curr_${p.name} = new StringBuilder();\n        for(char c : s_${p.name}.toCharArray()) {\n            if(c == '"') {\n                if(inStr_${p.name}) { list_${p.name}.add(curr_${p.name}.toString()); inStr_${p.name} = false; }\n                else { inStr_${p.name} = true; curr_${p.name} = new StringBuilder(); }\n            } else if(inStr_${p.name}) {\n                curr_${p.name}.append(c);\n            }\n        }\n        String[] ${p.name} = list_${p.name}.toArray(new String[0]);\n`;
      } else {
        parseArgs += `        String ${p.name} = lines.get(${i});\n`;
      }
    });

    const args = params.map((p) => p.name).join(', ');
    let outputLogic;
    if (retType === 'integer array') {
      outputLogic = `        System.out.print(java.util.Arrays.toString(result).replaceAll(" ", ""));\n`;
    } else if (retType === 'string array') {
      outputLogic = `        System.out.print("[");\n        for(int i=0; i<result.length; i++) {\n            System.out.print("\\"" + result[i] + "\\"");\n            if(i < result.length - 1) System.out.print(",");\n        }\n        System.out.print("]");\n`;
    } else if (retType === 'string') {
      outputLogic = `        System.out.print("\\"" + result + "\\"");\n`;
    } else {
      outputLogic = `        System.out.print(result);\n`;
    }

    return `import java.util.*;
{{USER_CODE}}
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        List<String> lines = new ArrayList<>();
        while(scanner.hasNextLine()) {
            String line = scanner.nextLine().trim();
            if(!line.isEmpty()) lines.add(line);
        }
        if(lines.isEmpty()) return;
${parseArgs}
        Solution sol = new Solution();
        var result = sol.${fnName}(${args});
${outputLogic}
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

  generateHarnessC(fnName, params, retType) {
    let parseArgs = '';
    params.forEach((p, i) => {
      if (p.type === 'integer') {
        parseArgs += `    int ${p.name} = atoi(lines[${i}]);\n`;
      } else if (p.type === 'string') {
        parseArgs += `    char* ${p.name} = lines[${i}];\n    int len_${p.name} = strlen(${p.name});\n    if(len_${p.name} >= 2 && ${p.name}[0] == '"' && ${p.name}[len_${p.name}-1] == '"') { ${p.name}[len_${p.name}-1] = '\\0'; ${p.name}++; }\n`;
      } else if (p.type === 'boolean') {
        parseArgs += `    bool ${p.name} = (strcmp(lines[${i}], "true") == 0 || strcmp(lines[${i}], "1") == 0);\n`;
      } else if (p.type === 'integer array') {
        parseArgs += `    char* s_${p.name} = lines[${i}];\n    int count_${p.name} = 0;\n    for(int j=0; s_${p.name}[j]; j++) if(s_${p.name}[j] == ',') count_${p.name}++;\n    if(strlen(s_${p.name}) > 2) count_${p.name}++;\n    int* ${p.name} = (int*)malloc(sizeof(int) * count_${p.name});\n    int idx_${p.name} = 0;\n    char* tok_${p.name} = strtok(s_${p.name} + 1, ",]");\n    while(tok_${p.name}) {\n        ${p.name}[idx_${p.name}++] = atoi(tok_${p.name});\n        tok_${p.name} = strtok(NULL, ",]");\n    }\n`;
      } else {
        parseArgs += `    char* ${p.name} = lines[${i}];\n`;
      }
    });

    const args = params.map((p) => p.name).join(', ');
    let outputLogic;
    if (retType === 'integer array' || retType === 'string array') {
      outputLogic = `    printf("C arrays return size unknown.\\n");\n`;
    } else if (retType === 'boolean') {
      outputLogic = `    printf("%s", result ? "true" : "false");\n`;
    } else if (retType === 'string') {
      outputLogic = `    printf("\\"%s\\"", result);\n`;
    } else {
      outputLogic = `    printf("%d", result);\n`;
    }

    return `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

{{USER_CODE}}

int main() {
    char lines[10][10000];
    int line_count = 0;
    while(fgets(lines[line_count], sizeof(lines[0]), stdin)) {
        lines[line_count][strcspn(lines[line_count], "\\r\\n")] = 0;
        if(strlen(lines[line_count]) > 0) line_count++;
    }
    if(line_count == 0) return 0;
${parseArgs}
    ${mapTypeC(retType)} result = ${fnName}(${args});
${outputLogic}
    return 0;
}`;
  },
};
