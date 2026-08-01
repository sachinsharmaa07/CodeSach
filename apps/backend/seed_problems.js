/**
 * seed_problems.js  – v2: function-body-only coding mode
 * Each problem has:
 *   starterCode[lang] – only the function the user edits  (shown in editor)
 *   harness[lang]     – full I/O wrapper with {{USER_CODE}} placeholder
 *                       (injected invisibly at run-time)
 *
 * Run: node seed_problems.js
 */
import mongoose from 'mongoose';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

const problemSchema = new mongoose.Schema({
  title:              { type: String, required: true, unique: true, trim: true },
  slug:               { type: String, required: true, unique: true, lowercase: true },
  description:        { type: String, required: true },
  difficulty:         { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  category:           { type: String, required: true },
  tags:               [String],
  companies:          [String],
  marks:              { type: Number, required: true, default: 10 },
  constraints:        { type: String, default: '' },
  examples:           [{ input: String, output: String, explanation: String }],
  testCases:          [{ input: String, expectedOutput: String, isHidden: { type: Boolean, default: false } }],
  starterCode:        { type: Map, of: String, default: {} },
  harness:            { type: Map, of: String, default: {} },
  solution:           { type: String, select: false, default: '' },
  totalSubmissions:   { type: Number, default: 0 },
  acceptedSubmissions:{ type: Number, default: 0 },
  createdBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive:           { type: Boolean, default: true },
}, { timestamps: true });

const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);
const User    = mongoose.models.User    || mongoose.model('User', new mongoose.Schema({ role: String }));

const slugify = s => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Using string concatenation (not template literals) to avoid escaping hell.
// The placeholder '{{USER_CODE}}' gets replaced at run-time by judge0.service.js
const PLACEHOLDER = '{{USER_CODE}}';

function jsHarness(parseBlock, callExpr, printExpr) {
  return PLACEHOLDER + '\n\n'
    + "const _lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\n"
    + parseBlock + '\n'
    + 'const _result = ' + callExpr + ';\n'
    + printExpr;
}

function pyHarness(parseBlock, callExpr, printExpr) {
  return PLACEHOLDER + '\n\n'
    + 'import sys as _sys\n'
    + "_data = _sys.stdin.read().strip().split('\\n')\n"
    + parseBlock + '\n'
    + '_result = ' + callExpr + '\n'
    + printExpr;
}

function cppHarness(parseBlock, callExpr, printExpr) {
  const headers = '#include <iostream>\n#include <vector>\n#include <map>\n#include <unordered_map>\n#include <string>\n#include <algorithm>\n#include <numeric>\nusing namespace std;\n\n';
  return headers
    + PLACEHOLDER + '\n\n'
    + 'int main() {\n'
    + '  ios_base::sync_with_stdio(false);\n'
    + '  cin.tie(NULL);\n'
    + parseBlock + '\n'
    + '  auto _result = ' + callExpr + ';\n'
    + printExpr + '\n'
    + '  return 0;\n'
    + '}';
}

function javaHarness(imports, parseBlock, callExpr, printExpr) {
  return 'import java.util.*;\nimport java.util.stream.*;\n'
    + (imports || '') + '\n\n'
    + 'public class Solution {\n\n'
    + PLACEHOLDER + '\n\n'
    + '  public static void main(String[] args) {\n'
    + '    Scanner sc = new Scanner(System.in);\n'
    + parseBlock + '\n'
    + '    System.out.println(' + callExpr + ');\n'
    + '  }\n'
    + '}';
}


// ─── Problems ────────────────────────────────────────────────────────────────
const problems = [

// ═══════════════════════════ EASY (20) ═══════════════════════════════════════

{
  title: 'Two Sum', difficulty: 'easy', category: 'Array',
  tags: ['array','hash-table'], companies: ['Google','Amazon','Facebook'], marks: 10,
  description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers that add up to \`target\`.

Exactly one solution exists. You may not use the same element twice.`,
  constraints: '2 ≤ nums.length ≤ 10^4\n-10^9 ≤ nums[i] ≤ 10^9\nExactly one solution exists.',
  examples: [
    { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0]+nums[1] = 2+7 = 9' },
    { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1]+nums[2] = 6' },
  ],
  testCases: [
    { input: '4\n2 7 11 15\n9',   expectedOutput: '0 1',  isHidden: false },
    { input: '3\n3 2 4\n6',       expectedOutput: '1 2',  isHidden: false },
    { input: '2\n3 3\n6',         expectedOutput: '0 1',  isHidden: true  },
    { input: '5\n1 5 3 7 2\n12',  expectedOutput: '1 3',  isHidden: true  },
  ],
  starterCode: {
    javascript: `function twoSum(nums, target) {
  // Return array of two indices [i, j] where nums[i] + nums[j] === target
  
}`,
    python: `def twoSum(nums, target):
    # Return list of two indices [i, j] where nums[i] + nums[j] == target
    pass`,
    cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    // Return array of two indices [i, j] where nums[i] + nums[j] == target
    
}`,
    java: `public int[] twoSum(int[] nums, int target) {
    // Return array of two indices [i, j] where nums[i] + nums[j] == target
    return new int[]{};
}`
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);\nconst target = parseInt(_lines[2]);`,
      'twoSum(nums, target)',
      'console.log(_result.join(" "));'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))\ntarget = int(_data[2])`,
      'twoSum(nums, target)',
      'print(" ".join(map(str, _result)))'
    ),
    cpp: cppHarness(
      `  int n; cin >> n;\n  vector<int> nums(n);\n  for(int i=0;i<n;i++) cin >> nums[i];\n  int target; cin >> target;`,
      'twoSum(nums, target)',
      '  for(int x : _result) cout << x << " ";\n  cout << endl;'
    ),
    java: javaHarness(
      '',
      `    int n = sc.nextInt();\n    int[] nums = new int[n];\n    for(int i=0;i<n;i++) nums[i]=sc.nextInt();\n    int target = sc.nextInt();\n    int[] res = new Solution().twoSum(nums, target);\n    StringBuilder sb = new StringBuilder();\n    if(res!=null){for(int x:res) sb.append(x).append(" ");}\n    System.out.println(sb.toString().trim());`,
      '',
      ''
    ),
  },
},

{
  title: 'Reverse String', difficulty: 'easy', category: 'String',
  tags: ['string','two-pointers'], companies: ['Microsoft'], marks: 10,
  description: `Given a string \`s\`, return the string **reversed**.`,
  constraints: '1 ≤ s.length ≤ 10^5',
  examples: [
    { input: 's = "hello"', output: '"olleh"', explanation: 'Reversed character by character' },
    { input: 's = "Hannah"', output: '"hannaH"', explanation: '' },
  ],
  testCases: [
    { input: 'hello',   expectedOutput: 'olleh',  isHidden: false },
    { input: 'Hannah',  expectedOutput: 'hannaH', isHidden: false },
    { input: 'a',       expectedOutput: 'a',      isHidden: true  },
    { input: 'abcdefg', expectedOutput: 'gfedcba',isHidden: true  },
  ],
  starterCode: {
    javascript: `function reverseString(s) {
  // Return the reversed string
  
}`,
    python: `def reverseString(s):
    # Return the reversed string
    pass`,
    cpp: `string reverseString(string s) {
    // Return the reversed string
    return "";
}`,
    java: `public String reverseString(String s) {
    // Return the reversed string
    return "";
}`
  },
  harness: {
    javascript: jsHarness('const s = _lines[0];', 'reverseString(s)', 'console.log(_result);'),
    python: pyHarness('s = _data[0]', 'reverseString(s)', 'print(_result)'),
    cpp: cppHarness('  string s;\n  getline(cin, s);', 'reverseString(s)', '  cout << _result << endl;'),
    java: javaHarness('', '    String s = sc.hasNextLine() ? sc.nextLine() : "";\n    String res = new Solution().reverseString(s);\n    System.out.println(res);', '', ''),
  },
},

{
  title: 'Palindrome Number', difficulty: 'easy', category: 'Math',
  tags: ['math'], companies: ['Amazon'], marks: 10,
  description: `Given an integer \`x\`, return \`true\` if it is a palindrome, \`false\` otherwise.

An integer is a palindrome when it reads the same backward as forward. Negative numbers are never palindromes.`,
  constraints: '-2^31 ≤ x ≤ 2^31 - 1',
  examples: [
    { input: 'x = 121', output: 'true', explanation: '121 reads as 121 from left to right and right to left.' },
    { input: 'x = -121', output: 'false', explanation: 'Negative numbers are not palindromes.' },
  ],
  testCases: [
    { input: '121',  expectedOutput: 'true',  isHidden: false },
    { input: '-121', expectedOutput: 'false', isHidden: false },
    { input: '10',   expectedOutput: 'false', isHidden: true  },
    { input: '1221', expectedOutput: 'true',  isHidden: true  },
  ],
  starterCode: {
    javascript: `function isPalindrome(x) {
  // Return true if x is a palindrome number, false otherwise
  
}`,
    python: `def isPalindrome(x):
    # Return True if x is a palindrome, False otherwise
    pass`,
  },
  harness: {
    javascript: jsHarness('const x = parseInt(_lines[0]);', 'isPalindrome(x)', 'console.log(_result ? "true" : "false");'),
    python: pyHarness('x = int(_data[0])', 'isPalindrome(x)', 'print("true" if _result else "false")'),
  },
},

{
  title: 'FizzBuzz', difficulty: 'easy', category: 'Math',
  tags: ['math','simulation'], companies: ['Adobe'], marks: 10,
  description: `Given an integer \`n\`, return an array of strings for each number from 1 to n:
- \`"FizzBuzz"\` if divisible by both 3 and 5
- \`"Fizz"\` if divisible by 3
- \`"Buzz"\` if divisible by 5
- The number itself as a string otherwise`,
  constraints: '1 ≤ n ≤ 10^4',
  examples: [
    { input: 'n = 5', output: '["1","2","Fizz","4","Buzz"]', explanation: '3→Fizz, 5→Buzz' },
  ],
  testCases: [
    { input: '5',  expectedOutput: '1\n2\nFizz\n4\nBuzz',             isHidden: false },
    { input: '3',  expectedOutput: '1\n2\nFizz',                       isHidden: false },
    { input: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', isHidden: true },
    { input: '1',  expectedOutput: '1',                                isHidden: true  },
  ],
  starterCode: {
    javascript: `function fizzBuzz(n) {
  // Return array of strings from 1 to n with FizzBuzz rules
  
}`,
    python: `def fizzBuzz(n):
    # Return list of strings from 1 to n with FizzBuzz rules
    pass`,
  },
  harness: {
    javascript: jsHarness('const n = parseInt(_lines[0]);', 'fizzBuzz(n)', 'console.log(_result.join("\\n"));'),
    python: pyHarness('n = int(_data[0])', 'fizzBuzz(n)', 'print("\\n".join(str(x) for x in _result))'),
  },
},

{
  title: 'Valid Parentheses', difficulty: 'easy', category: 'Stack',
  tags: ['string','stack'], companies: ['Google','Amazon'], marks: 10,
  description: `Given a string \`s\` containing only \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\`, \`']'\`, determine if the input string is **valid**.

A string is valid if:
1. Open brackets are closed by the same type of bracket.
2. Open brackets are closed in the correct order.
3. Every closing bracket has a matching open bracket.`,
  constraints: '1 ≤ s.length ≤ 10^4',
  examples: [
    { input: 's = "()"', output: 'true', explanation: 'Matched parentheses' },
    { input: 's = "()[]{}"', output: 'true', explanation: 'All matched' },
    { input: 's = "(]"', output: 'false', explanation: 'Mismatched bracket' },
  ],
  testCases: [
    { input: '()',      expectedOutput: 'true',  isHidden: false },
    { input: '()[]{',  expectedOutput: 'false', isHidden: false },
    { input: '([{}])', expectedOutput: 'true',  isHidden: true  },
    { input: '(]',     expectedOutput: 'false', isHidden: true  },
  ],
  starterCode: {
    javascript: `function isValid(s) {
  // Return true if brackets are valid, false otherwise
  
}`,
    python: `def isValid(s):
    # Return True if brackets are valid, False otherwise
    pass`,
  },
  harness: {
    javascript: jsHarness('const s = _lines[0];', 'isValid(s)', 'console.log(_result ? "true" : "false");'),
    python: pyHarness('s = _data[0]', 'isValid(s)', 'print("true" if _result else "false")'),
  },
},

{
  title: 'Maximum Subarray', difficulty: 'easy', category: 'Array',
  tags: ['array','dynamic-programming'], companies: ['Amazon','Google'], marks: 10,
  description: `Given an integer array \`nums\`, find the **subarray** with the largest sum and return its sum.`,
  constraints: '1 ≤ nums.length ≤ 10^5\n-10^4 ≤ nums[i] ≤ 10^4',
  examples: [
    { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '[4,-1,2,1] has the largest sum = 6' },
    { input: 'nums = [1]', output: '1', explanation: 'Single element' },
  ],
  testCases: [
    { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6',  isHidden: false },
    { input: '1\n1',                       expectedOutput: '1',  isHidden: false },
    { input: '5\n5 4 -1 7 8',             expectedOutput: '23', isHidden: true  },
    { input: '4\n-1 -2 -3 -4',            expectedOutput: '-1', isHidden: true  },
  ],
  starterCode: {
    javascript: `function maxSubArray(nums) {
  // Return the largest sum of any contiguous subarray
  
}`,
    python: `def maxSubArray(nums):
    # Return the largest sum of any contiguous subarray
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);`,
      'maxSubArray(nums)', 'console.log(_result);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))`,
      'maxSubArray(nums)', 'print(_result)'
    ),
  },
},

{
  title: 'Climbing Stairs', difficulty: 'easy', category: 'Dynamic Programming',
  tags: ['dynamic-programming','math'], companies: ['Amazon','Apple'], marks: 10,
  description: `You are climbing a staircase. It takes \`n\` steps to reach the top. Each time you can climb **1 or 2** steps.

In how many distinct ways can you climb to the top?`,
  constraints: '1 ≤ n ≤ 45',
  examples: [
    { input: 'n = 2', output: '2', explanation: '1+1, or 2' },
    { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' },
  ],
  testCases: [
    { input: '2',  expectedOutput: '2',         isHidden: false },
    { input: '3',  expectedOutput: '3',         isHidden: false },
    { input: '10', expectedOutput: '89',        isHidden: true  },
    { input: '45', expectedOutput: '1836311903',isHidden: true  },
  ],
  starterCode: {
    javascript: `function climbStairs(n) {
  // Return number of distinct ways to climb n stairs
  
}`,
    python: `def climbStairs(n):
    # Return number of distinct ways to climb n stairs
    pass`,
  },
  harness: {
    javascript: jsHarness('const n = parseInt(_lines[0]);', 'climbStairs(n)', 'console.log(_result);'),
    python: pyHarness('n = int(_data[0])', 'climbStairs(n)', 'print(_result)'),
  },
},

{
  title: 'Best Time to Buy and Sell Stock', difficulty: 'easy', category: 'Array',
  tags: ['array','dynamic-programming'], companies: ['Amazon','Facebook'], marks: 10,
  description: `Given an array \`prices\` where \`prices[i]\` is the stock price on day \`i\`, return the **maximum profit** you can achieve.

You may only buy once and sell once (buy before selling). Return 0 if no profit is possible.`,
  constraints: '1 ≤ prices.length ≤ 10^5\n0 ≤ prices[i] ≤ 10^4',
  examples: [
    { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy day 2 (1), sell day 5 (6). Profit = 5.' },
    { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'Prices only decrease.' },
  ],
  testCases: [
    { input: '6\n7 1 5 3 6 4', expectedOutput: '5', isHidden: false },
    { input: '5\n7 6 4 3 1',   expectedOutput: '0', isHidden: false },
    { input: '3\n1 2 3',       expectedOutput: '2', isHidden: true  },
    { input: '4\n3 1 4 2',     expectedOutput: '3', isHidden: true  },
  ],
  starterCode: {
    javascript: `function maxProfit(prices) {
  // Return maximum profit (0 if none)
  
}`,
    python: `def maxProfit(prices):
    # Return maximum profit (0 if none)
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst prices = _lines[1].split(' ').map(Number);`,
      'maxProfit(prices)', 'console.log(_result);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nprices = list(map(int, _data[1].split()))`,
      'maxProfit(prices)', 'print(_result)'
    ),
  },
},

{
  title: 'Missing Number', difficulty: 'easy', category: 'Array',
  tags: ['array','math','bit-manipulation'], companies: ['Microsoft'], marks: 10,
  description: `Given an array \`nums\` of \`n\` distinct integers in range \`[0, n]\`, return the **missing number**.`,
  constraints: 'n == nums.length\n1 ≤ n ≤ 10^4\n0 ≤ nums[i] ≤ n\nAll numbers are unique.',
  examples: [
    { input: 'nums = [3,0,1]', output: '2', explanation: 'Range [0,3], 2 is missing.' },
    { input: 'nums = [0,1]', output: '2', explanation: 'Range [0,2], 2 is missing.' },
  ],
  testCases: [
    { input: '3\n3 0 1',       expectedOutput: '2', isHidden: false },
    { input: '2\n0 1',         expectedOutput: '2', isHidden: false },
    { input: '9\n9 6 4 2 3 5 7 0 1', expectedOutput: '8', isHidden: true },
    { input: '1\n0',           expectedOutput: '1', isHidden: true  },
  ],
  starterCode: {
    javascript: `function missingNumber(nums) {
  // Return the missing number in range [0, n]
  
}`,
    python: `def missingNumber(nums):
    # Return the missing number in range [0, n]
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);`,
      'missingNumber(nums)', 'console.log(_result);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))`,
      'missingNumber(nums)', 'print(_result)'
    ),
  },
},

{
  title: 'Count Vowels in String', difficulty: 'easy', category: 'String',
  tags: ['string','counting'], companies: ['Infosys'], marks: 10,
  description: `Given a string \`s\`, return the count of vowels (a, e, i, o, u — both cases).`,
  constraints: '1 ≤ s.length ≤ 10^5',
  examples: [
    { input: 's = "Hello World"', output: '3', explanation: 'e, o, o are vowels' },
  ],
  testCases: [
    { input: 'Hello World',   expectedOutput: '3',  isHidden: false },
    { input: 'aeiouAEIOU',    expectedOutput: '10', isHidden: false },
    { input: 'bcdfg',         expectedOutput: '0',  isHidden: true  },
    { input: 'The quick brown fox', expectedOutput: '5', isHidden: true },
  ],
  starterCode: {
    javascript: `function countVowels(s) {
  // Return count of vowels (a,e,i,o,u both cases)
  
}`,
    python: `def countVowels(s):
    # Return count of vowels (a,e,i,o,u both cases)
    pass`,
  },
  harness: {
    javascript: jsHarness('const s = _lines[0];', 'countVowels(s)', 'console.log(_result);'),
    python: pyHarness('s = _data[0]', 'countVowels(s)', 'print(_result)'),
  },
},

{
  title: 'Find the Duplicate Number', difficulty: 'easy', category: 'Array',
  tags: ['array','hash-table'], companies: ['LinkedIn'], marks: 10,
  description: `Given an array \`nums\` of length \`n+1\` where each element is in \`[1, n]\`, find the **duplicate** number (exactly one is repeated).`,
  constraints: '1 ≤ n ≤ 10^5\nnums.length == n + 1\nExactly one duplicate.',
  examples: [
    { input: 'nums = [1,3,4,2,2]', output: '2', explanation: '2 appears twice.' },
  ],
  testCases: [
    { input: '5\n1 3 4 2 2', expectedOutput: '2', isHidden: false },
    { input: '5\n3 1 3 4 2', expectedOutput: '3', isHidden: false },
    { input: '3\n1 1 2',     expectedOutput: '1', isHidden: true  },
    { input: '7\n1 3 4 2 2 5 6', expectedOutput: '2', isHidden: true },
  ],
  starterCode: {
    javascript: `function findDuplicate(nums) {
  // Return the duplicate number
  
}`,
    python: `def findDuplicate(nums):
    # Return the duplicate number
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);`,
      'findDuplicate(nums)', 'console.log(_result);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))`,
      'findDuplicate(nums)', 'print(_result)'
    ),
  },
},

{
  title: 'Factorial of a Number', difficulty: 'easy', category: 'Math',
  tags: ['math','recursion'], companies: ['Wipro'], marks: 10,
  description: `Return the factorial of a non-negative integer \`n\`. Recall: 0! = 1.`,
  constraints: '0 ≤ n ≤ 20',
  examples: [
    { input: 'n = 5', output: '120', explanation: '5×4×3×2×1 = 120' },
    { input: 'n = 0', output: '1', explanation: '0! = 1 by definition' },
  ],
  testCases: [
    { input: '5',  expectedOutput: '120',        isHidden: false },
    { input: '0',  expectedOutput: '1',          isHidden: false },
    { input: '10', expectedOutput: '3628800',    isHidden: true  },
    { input: '20', expectedOutput: '2432902008176640000', isHidden: true },
  ],
  starterCode: {
    javascript: `function factorial(n) {
  // Return n! (0! = 1)
  
}`,
    python: `def factorial(n):
    # Return n! (0! = 1)
    pass`,
  },
  harness: {
    javascript: jsHarness('const n = parseInt(_lines[0]);', 'factorial(n)', 'console.log(_result);'),
    python: pyHarness('n = int(_data[0])', 'factorial(n)', 'print(_result)'),
  },
},

{
  title: 'Check Anagram', difficulty: 'easy', category: 'String',
  tags: ['hash-table','string','sorting'], companies: ['Amazon','Uber'], marks: 10,
  description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, \`false\` otherwise.`,
  constraints: '1 ≤ s.length, t.length ≤ 5×10^4\nLowercase English letters only.',
  examples: [
    { input: 's = "anagram", t = "nagaram"', output: 'true', explanation: 'Same characters, different order.' },
    { input: 's = "rat", t = "car"', output: 'false', explanation: 'Different characters.' },
  ],
  testCases: [
    { input: 'anagram\nnagaram', expectedOutput: 'true',  isHidden: false },
    { input: 'rat\ncar',         expectedOutput: 'false', isHidden: false },
    { input: 'listen\nsilent',   expectedOutput: 'true',  isHidden: true  },
    { input: 'hello\nworld',     expectedOutput: 'false', isHidden: true  },
  ],
  starterCode: {
    javascript: `function isAnagram(s, t) {
  // Return true if t is an anagram of s
  
}`,
    python: `def isAnagram(s, t):
    # Return True if t is an anagram of s
    pass`,
  },
  harness: {
    javascript: jsHarness('const s = _lines[0];\nconst t = _lines[1];', 'isAnagram(s, t)', 'console.log(_result ? "true" : "false");'),
    python: pyHarness('s = _data[0]\nt = _data[1]', 'isAnagram(s, t)', 'print("true" if _result else "false")'),
  },
},

{
  title: 'Power of Two', difficulty: 'easy', category: 'Math',
  tags: ['math','bit-manipulation'], companies: ['Google'], marks: 10,
  description: `Given an integer \`n\`, return \`true\` if it is a power of two, \`false\` otherwise.`,
  constraints: '-2^31 ≤ n ≤ 2^31 - 1',
  examples: [
    { input: 'n = 1', output: 'true', explanation: '2^0 = 1' },
    { input: 'n = 3', output: 'false', explanation: '3 is not a power of 2' },
  ],
  testCases: [
    { input: '1',  expectedOutput: 'true',  isHidden: false },
    { input: '16', expectedOutput: 'true',  isHidden: false },
    { input: '3',  expectedOutput: 'false', isHidden: true  },
    { input: '0',  expectedOutput: 'false', isHidden: true  },
  ],
  starterCode: {
    javascript: `function isPowerOfTwo(n) {
  // Return true if n is a power of 2
  
}`,
    python: `def isPowerOfTwo(n):
    # Return True if n is a power of 2
    pass`,
  },
  harness: {
    javascript: jsHarness('const n = parseInt(_lines[0]);', 'isPowerOfTwo(n)', 'console.log(_result ? "true" : "false");'),
    python: pyHarness('n = int(_data[0])', 'isPowerOfTwo(n)', 'print("true" if _result else "false")'),
  },
},

{
  title: 'First Unique Character in a String', difficulty: 'easy', category: 'String',
  tags: ['hash-table','string','counting'], companies: ['Amazon','Bloomberg'], marks: 10,
  description: `Given a string \`s\`, find the first non-repeating character and return its **index**. Return \`-1\` if none exists.`,
  constraints: '1 ≤ s.length ≤ 10^5\nLowercase English letters only.',
  examples: [
    { input: 's = "leetcode"', output: '0', explanation: '"l" appears only once at index 0.' },
    { input: 's = "aabb"', output: '-1', explanation: 'No unique character.' },
  ],
  testCases: [
    { input: 'leetcode',     expectedOutput: '0',  isHidden: false },
    { input: 'loveleetcode', expectedOutput: '2',  isHidden: false },
    { input: 'aabb',         expectedOutput: '-1', isHidden: true  },
    { input: 'abcabc',       expectedOutput: '-1', isHidden: true  },
  ],
  starterCode: {
    javascript: `function firstUniqChar(s) {
  // Return index of first non-repeating character, or -1
  
}`,
    python: `def firstUniqChar(s):
    # Return index of first non-repeating character, or -1
    pass`,
  },
  harness: {
    javascript: jsHarness('const s = _lines[0];', 'firstUniqChar(s)', 'console.log(_result);'),
    python: pyHarness('s = _data[0]', 'firstUniqChar(s)', 'print(_result)'),
  },
},

{
  title: 'Merge Sorted Arrays', difficulty: 'easy', category: 'Array',
  tags: ['array','two-pointers','sorting'], companies: ['Facebook','Google'], marks: 10,
  description: `Given two sorted integer arrays \`nums1\` and \`nums2\`, merge them into one sorted array and return it.`,
  constraints: '0 ≤ m, n ≤ 200\n-10^9 ≤ nums1[i], nums2[j] ≤ 10^9',
  examples: [
    { input: 'nums1 = [1,2,3], nums2 = [2,5,6]', output: '[1,2,2,3,5,6]', explanation: 'Merged and sorted.' },
  ],
  testCases: [
    { input: '3\n1 2 3\n3\n2 5 6',    expectedOutput: '1 2 2 3 5 6', isHidden: false },
    { input: '1\n1\n2\n2 3',          expectedOutput: '1 2 3',       isHidden: false },
    { input: '0\n\n3\n1 2 3',         expectedOutput: '1 2 3',       isHidden: true  },
    { input: '4\n1 3 5 7\n4\n2 4 6 8',expectedOutput: '1 2 3 4 5 6 7 8', isHidden: true },
  ],
  starterCode: {
    javascript: `function merge(nums1, nums2) {
  // Return merged sorted array
  
}`,
    python: `def merge(nums1, nums2):
    # Return merged sorted array
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _m = parseInt(_lines[0]);
const nums1 = _m > 0 ? _lines[1].split(' ').map(Number) : [];
const _n = parseInt(_lines[2]);
const nums2 = _n > 0 ? _lines[3].split(' ').map(Number) : [];`,
      'merge(nums1, nums2)',
      'console.log(_result.join(" "));'
    ),
    python: pyHarness(
      `_m = int(_data[0])
nums1 = list(map(int, _data[1].split())) if _m > 0 and _data[1].strip() else []
_n = int(_data[2])
nums2 = list(map(int, _data[3].split())) if _n > 0 else []`,
      'merge(nums1, nums2)',
      'print(" ".join(map(str, _result)))'
    ),
  },
},

{
  title: 'Count and Say', difficulty: 'easy', category: 'String',
  tags: ['string'], companies: ['Facebook'], marks: 10,
  description: `The **count-and-say** sequence: \`countAndSay(1) = "1"\`, and each next term is the run-length encoding of the previous. Return the \`n\`-th term.`,
  constraints: '1 ≤ n ≤ 30',
  examples: [
    { input: 'n = 1', output: '"1"', explanation: 'Base case' },
    { input: 'n = 4', output: '"1211"', explanation: '1→11→21→1211' },
  ],
  testCases: [
    { input: '1', expectedOutput: '1',          isHidden: false },
    { input: '4', expectedOutput: '1211',       isHidden: false },
    { input: '6', expectedOutput: '312211',     isHidden: true  },
    { input: '8', expectedOutput: '1113213211', isHidden: true  },
  ],
  starterCode: {
    javascript: `function countAndSay(n) {
  // Return the nth count-and-say string
  
}`,
    python: `def countAndSay(n):
    # Return the nth count-and-say string
    pass`,
  },
  harness: {
    javascript: jsHarness('const n = parseInt(_lines[0]);', 'countAndSay(n)', 'console.log(_result);'),
    python: pyHarness('n = int(_data[0])', 'countAndSay(n)', 'print(_result)'),
  },
},

{
  title: 'Remove Duplicates from Sorted Array', difficulty: 'easy', category: 'Array',
  tags: ['array','two-pointers'], companies: ['Microsoft'], marks: 10,
  description: `Given a sorted array \`nums\`, return an array of **unique** elements in sorted order.`,
  constraints: '1 ≤ nums.length ≤ 3×10^4\nSorted in non-decreasing order.',
  examples: [
    { input: 'nums = [1,1,2,2,3]', output: '[1,2,3]', explanation: 'Unique elements.' },
  ],
  testCases: [
    { input: '5\n1 1 2 2 3',         expectedOutput: '1 2 3',   isHidden: false },
    { input: '10\n0 0 1 1 1 2 2 3 3 4', expectedOutput: '0 1 2 3 4', isHidden: false },
    { input: '3\n1 1 1',             expectedOutput: '1',       isHidden: true  },
    { input: '1\n5',                 expectedOutput: '5',       isHidden: true  },
  ],
  starterCode: {
    javascript: `function removeDuplicates(nums) {
  // Return array with duplicates removed (sorted)
  
}`,
    python: `def removeDuplicates(nums):
    # Return list with duplicates removed (sorted)
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);`,
      'removeDuplicates(nums)', 'console.log(_result.join(" "));'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))`,
      'removeDuplicates(nums)', 'print(" ".join(map(str, _result)))'
    ),
  },
},

{
  title: 'Roman to Integer', difficulty: 'easy', category: 'Math',
  tags: ['hash-table','math','string'], companies: ['Amazon','Bloomberg'], marks: 10,
  description: `Convert a Roman numeral string to an integer. Symbols: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. If a smaller value precedes a larger one, subtract it (e.g. IV=4, IX=9).`,
  constraints: '1 ≤ s.length ≤ 15\nValid roman numeral in [1, 3999].',
  examples: [
    { input: 's = "III"', output: '3', explanation: 'I+I+I=3' },
    { input: 's = "MCMXCIV"', output: '1994', explanation: 'M+CM+XC+IV=1994' },
  ],
  testCases: [
    { input: 'III',     expectedOutput: '3',    isHidden: false },
    { input: 'LVIII',   expectedOutput: '58',   isHidden: false },
    { input: 'MCMXCIV', expectedOutput: '1994', isHidden: true  },
    { input: 'IX',      expectedOutput: '9',    isHidden: true  },
  ],
  starterCode: {
    javascript: `function romanToInt(s) {
  // Convert Roman numeral string to integer
  
}`,
    python: `def romanToInt(s):
    # Convert Roman numeral string to integer
    pass`,
  },
  harness: {
    javascript: jsHarness('const s = _lines[0];', 'romanToInt(s)', 'console.log(_result);'),
    python: pyHarness('s = _data[0]', 'romanToInt(s)', 'print(_result)'),
  },
},

{
  title: 'Sum of Digits', difficulty: 'easy', category: 'Math',
  tags: ['math'], companies: ['Infosys'], marks: 10,
  description: `Given a non-negative integer \`n\`, return the **sum of its digits**.`,
  constraints: '0 ≤ n ≤ 10^9',
  examples: [
    { input: 'n = 12345', output: '15', explanation: '1+2+3+4+5 = 15' },
  ],
  testCases: [
    { input: '12345',      expectedOutput: '15', isHidden: false },
    { input: '0',          expectedOutput: '0',  isHidden: false },
    { input: '999',        expectedOutput: '27', isHidden: true  },
    { input: '1000000000', expectedOutput: '1',  isHidden: true  },
  ],
  starterCode: {
    javascript: `function sumOfDigits(n) {
  // Return sum of all digits of n
  
}`,
    python: `def sumOfDigits(n):
    # Return sum of all digits of n
    pass`,
  },
  harness: {
    javascript: jsHarness('const n = parseInt(_lines[0]);', 'sumOfDigits(n)', 'console.log(_result);'),
    python: pyHarness('n = int(_data[0])', 'sumOfDigits(n)', 'print(_result)'),
  },
},

// ═══════════════════════════ MEDIUM (20) ═════════════════════════════════════

{
  title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', category: 'String',
  tags: ['hash-table','string','sliding-window'], companies: ['Amazon','Google','Facebook'], marks: 20,
  description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
  constraints: '0 ≤ s.length ≤ 5×10^4',
  examples: [
    { input: 's = "abcabcbb"', output: '3', explanation: '"abc" has length 3.' },
    { input: 's = "bbbbb"', output: '1', explanation: '"b".' },
  ],
  testCases: [
    { input: 'abcabcbb', expectedOutput: '3', isHidden: false },
    { input: 'bbbbb',    expectedOutput: '1', isHidden: false },
    { input: 'pwwkew',   expectedOutput: '3', isHidden: true  },
    { input: '',         expectedOutput: '0', isHidden: true  },
  ],
  starterCode: {
    javascript: `function lengthOfLongestSubstring(s) {
  // Return length of longest substring without repeating characters
  
}`,
    python: `def lengthOfLongestSubstring(s):
    # Return length of longest substring without repeating characters
    pass`,
  },
  harness: {
    javascript: jsHarness('const s = _lines[0] || "";', 'lengthOfLongestSubstring(s)', 'console.log(_result);'),
    python: pyHarness('s = _data[0] if _data[0] else ""', 'lengthOfLongestSubstring(s)', 'print(_result)'),
  },
},

{
  title: 'Longest Palindromic Substring', difficulty: 'medium', category: 'String',
  tags: ['string','dynamic-programming'], companies: ['Amazon','Microsoft'], marks: 20,
  description: `Given a string \`s\`, return the **longest palindromic substring**.`,
  constraints: '1 ≤ s.length ≤ 1000\nDigits and English letters.',
  examples: [
    { input: 's = "babad"', output: '"bab"', explanation: '"bab" is palindromic.' },
    { input: 's = "cbbd"', output: '"bb"', explanation: '"bb" is the longest.' },
  ],
  testCases: [
    { input: 'babad',   expectedOutput: 'bab',     isHidden: false },
    { input: 'cbbd',    expectedOutput: 'bb',      isHidden: false },
    { input: 'a',       expectedOutput: 'a',       isHidden: true  },
    { input: 'racecar', expectedOutput: 'racecar', isHidden: true  },
  ],
  starterCode: {
    javascript: `function longestPalindrome(s) {
  // Return the longest palindromic substring
  
}`,
    python: `def longestPalindrome(s):
    # Return the longest palindromic substring
    pass`,
  },
  harness: {
    javascript: jsHarness('const s = _lines[0];', 'longestPalindrome(s)', 'console.log(_result);'),
    python: pyHarness('s = _data[0]', 'longestPalindrome(s)', 'print(_result)'),
  },
},

{
  title: 'Container With Most Water', difficulty: 'medium', category: 'Array',
  tags: ['array','two-pointers','greedy'], companies: ['Amazon','Google','Facebook'], marks: 20,
  description: `Given an integer array \`height\`, find two lines that together with the x-axis form a container that holds the most water. Return the **maximum amount** of water.`,
  constraints: 'n == height.length\n2 ≤ n ≤ 10^5\n0 ≤ height[i] ≤ 10^4',
  examples: [
    { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'Lines at idx 1 and 8: min(8,7)×7 = 49' },
  ],
  testCases: [
    { input: '9\n1 8 6 2 5 4 8 3 7', expectedOutput: '49', isHidden: false },
    { input: '2\n1 1',               expectedOutput: '1',  isHidden: false },
    { input: '4\n4 3 2 1',           expectedOutput: '4',  isHidden: true  },
    { input: '3\n1 2 1',             expectedOutput: '2',  isHidden: true  },
  ],
  starterCode: {
    javascript: `function maxArea(height) {
  // Return the maximum water that can be contained
  
}`,
    python: `def maxArea(height):
    # Return the maximum water that can be contained
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst height = _lines[1].split(' ').map(Number);`,
      'maxArea(height)', 'console.log(_result);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nheight = list(map(int, _data[1].split()))`,
      'maxArea(height)', 'print(_result)'
    ),
  },
},

{
  title: '3Sum', difficulty: 'medium', category: 'Array',
  tags: ['array','two-pointers','sorting'], companies: ['Facebook','Amazon'], marks: 20,
  description: `Given an integer array \`nums\`, return all unique triplets \`[nums[i], nums[j], nums[k]]\` that sum to zero.

Return the count of unique triplets.`,
  constraints: '3 ≤ nums.length ≤ 3000\n-10^5 ≤ nums[i] ≤ 10^5',
  examples: [
    { input: 'nums = [-1,0,1,2,-1,-4]', output: '2', explanation: '[-1,-1,2] and [-1,0,1]' },
    { input: 'nums = [0,0,0]', output: '1', explanation: '[0,0,0]' },
  ],
  testCases: [
    { input: '6\n-1 0 1 2 -1 -4', expectedOutput: '2', isHidden: false },
    { input: '3\n0 0 0',          expectedOutput: '1', isHidden: false },
    { input: '3\n1 2 3',          expectedOutput: '0', isHidden: true  },
    { input: '5\n-2 0 1 1 2',     expectedOutput: '2', isHidden: true  },
  ],
  starterCode: {
    javascript: `function threeSum(nums) {
  // Return array of all unique triplets that sum to 0
  
}`,
    python: `def threeSum(nums):
    # Return list of all unique triplets that sum to 0
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);`,
      'threeSum(nums)',
      'console.log(_result.length);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))`,
      'threeSum(nums)', 'print(len(_result))'
    ),
  },
},

{
  title: 'Rotate Array', difficulty: 'medium', category: 'Array',
  tags: ['array','math','two-pointers'], companies: ['Microsoft'], marks: 20,
  description: `Given an integer array \`nums\`, rotate the array to the **right** by \`k\` steps.`,
  constraints: '1 ≤ nums.length ≤ 10^5\n0 ≤ k ≤ 10^5',
  examples: [
    { input: 'nums = [1,2,3,4,5,6,7], k = 3', output: '[5,6,7,1,2,3,4]', explanation: 'Rotated right 3 steps.' },
  ],
  testCases: [
    { input: '7\n1 2 3 4 5 6 7\n3', expectedOutput: '5 6 7 1 2 3 4', isHidden: false },
    { input: '3\n-1 -100 3\n2',     expectedOutput: '3 -1 -100',     isHidden: false },
    { input: '3\n1 2 3\n0',         expectedOutput: '1 2 3',         isHidden: true  },
    { input: '5\n1 2 3 4 5\n5',     expectedOutput: '1 2 3 4 5',    isHidden: true  },
  ],
  starterCode: {
    javascript: `function rotate(nums, k) {
  // Return nums rotated right by k steps
  
}`,
    python: `def rotate(nums, k):
    # Return nums rotated right by k steps
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);\nconst k = parseInt(_lines[2]);`,
      'rotate(nums, k)', 'console.log(_result.join(" "));'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))\nk = int(_data[2])`,
      'rotate(nums, k)', 'print(" ".join(map(str, _result)))'
    ),
  },
},

{
  title: 'Product of Array Except Self', difficulty: 'medium', category: 'Array',
  tags: ['array','prefix-sum'], companies: ['Amazon','Apple','Facebook'], marks: 20,
  description: `Given an integer array \`nums\`, return an array \`answer\` where \`answer[i]\` equals the product of all elements except \`nums[i]\`. Solve in O(n) without division.`,
  constraints: '2 ≤ nums.length ≤ 10^5\n-30 ≤ nums[i] ≤ 30',
  examples: [
    { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', explanation: 'Each element is product of all others.' },
  ],
  testCases: [
    { input: '4\n1 2 3 4',        expectedOutput: '24 12 8 6', isHidden: false },
    { input: '5\n-1 1 0 -3 3',   expectedOutput: '0 0 9 0 0', isHidden: false },
    { input: '2\n1 2',            expectedOutput: '2 1',       isHidden: true  },
    { input: '3\n2 3 5',          expectedOutput: '15 10 6',   isHidden: true  },
  ],
  starterCode: {
    javascript: `function productExceptSelf(nums) {
  // Return array where result[i] = product of all nums except nums[i]
  
}`,
    python: `def productExceptSelf(nums):
    # Return list where result[i] = product of all nums except nums[i]
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);`,
      'productExceptSelf(nums)', 'console.log(_result.join(" "));'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))`,
      'productExceptSelf(nums)', 'print(" ".join(map(str, _result)))'
    ),
  },
},

{
  title: 'Jump Game', difficulty: 'medium', category: 'Greedy',
  tags: ['array','dynamic-programming','greedy'], companies: ['Amazon','Microsoft'], marks: 20,
  description: `You start at the first index of array \`nums\`. Each element represents your max jump length. Return \`true\` if you can reach the last index.`,
  constraints: '1 ≤ nums.length ≤ 10^4\n0 ≤ nums[i] ≤ 10^5',
  examples: [
    { input: 'nums = [2,3,1,1,4]', output: 'true', explanation: 'Jump 1 then 3.' },
    { input: 'nums = [3,2,1,0,4]', output: 'false', explanation: 'Always stuck at index 3.' },
  ],
  testCases: [
    { input: '5\n2 3 1 1 4', expectedOutput: 'true',  isHidden: false },
    { input: '5\n3 2 1 0 4', expectedOutput: 'false', isHidden: false },
    { input: '1\n0',         expectedOutput: 'true',  isHidden: true  },
    { input: '3\n1 0 0',     expectedOutput: 'false', isHidden: true  },
  ],
  starterCode: {
    javascript: `function canJump(nums) {
  // Return true if you can reach the last index
  
}`,
    python: `def canJump(nums):
    # Return True if you can reach the last index
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);`,
      'canJump(nums)', 'console.log(_result ? "true" : "false");'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))`,
      'canJump(nums)', 'print("true" if _result else "false")'
    ),
  },
},

{
  title: 'Binary Search', difficulty: 'medium', category: 'Binary Search',
  tags: ['array','binary-search'], companies: ['Facebook','Amazon'], marks: 20,
  description: `Given a sorted (ascending) array \`nums\` and a \`target\`, return the **index** of target, or \`-1\` if not found. Must run in O(log n).`,
  constraints: '1 ≤ nums.length ≤ 10^4\nAll elements unique. Sorted ascending.',
  examples: [
    { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 is at index 4.' },
    { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 not found.' },
  ],
  testCases: [
    { input: '6\n-1 0 3 5 9 12\n9', expectedOutput: '4',  isHidden: false },
    { input: '6\n-1 0 3 5 9 12\n2', expectedOutput: '-1', isHidden: false },
    {
      input: '6\n-1 0 3 5 9 12\n9',
      harness: {
        javascript: jsHarness(
          `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);\nconst target = parseInt(_lines[2]);`,
          'twoSum(nums, target)',
          'console.log(_result.join(" "));'
        ),
        python: pyHarness(
          `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))\ntarget = int(_data[2])`,
          'twoSum(nums, target)',
          'print(" ".join(map(str, _result)))'
        ),
        cpp: cppHarness(
          `  int n; cin >> n;\n  vector<int> nums(n);\n  for(int i=0;i<n;i++) cin >> nums[i];\n  int target; cin >> target;`,
          'twoSum(nums, target)',
          '  for(int x : _result) cout << x << " ";\n  cout << endl;'
        ),
        java: javaHarness(
          '',
          `    int n = sc.nextInt();\n    int[] nums = new int[n];\n    for(int i=0;i<n;i++) nums[i]=sc.nextInt();\n    int target = sc.nextInt();\n    int[] res = new Solution().twoSum(nums, target);\n    StringBuilder sb = new StringBuilder();\n    for(int x:res) sb.append(x).append(" ");\n    System.out.println(sb.toString().trim());`,
          '',
          ''
        ),
      },
    },
    { input: '1\n5\n5',             expectedOutput: '0',  isHidden: true  },
    { input: '5\n1 3 5 7 9\n6',     expectedOutput: '-1', isHidden: true  },
  ],
  starterCode: {
    javascript: `function search(nums, target) {
  // Return index of target in sorted nums, or -1
  
}`,
    python: `def search(nums, target):
    # Return index of target in sorted nums, or -1
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);\nconst target = parseInt(_lines[2]);`,
      'search(nums, target)', 'console.log(_result);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))\ntarget = int(_data[2])`,
      'search(nums, target)', 'print(_result)'
    ),
  },
},

{
  title: 'Coin Change', difficulty: 'medium', category: 'Dynamic Programming',
  tags: ['array','dynamic-programming'], companies: ['Google','Amazon'], marks: 20,
  description: `Given coin denominations \`coins\` and an integer \`amount\`, return the **minimum number of coins** needed to make up that amount, or \`-1\` if impossible.`,
  constraints: '1 ≤ coins.length ≤ 12\n1 ≤ coins[i] ≤ 2^31-1\n0 ≤ amount ≤ 10^4',
  examples: [
    { input: 'coins = [1,5,11], amount = 15', output: '3', explanation: '5+5+5 = 3 coins.' },
    { input: 'coins = [2], amount = 3', output: '-1', explanation: 'Cannot make 3 with 2s.' },
  ],
  testCases: [
    { input: '3\n1 5 11\n15', expectedOutput: '3',  isHidden: false },
    { input: '1\n2\n3',       expectedOutput: '-1', isHidden: false },
    { input: '3\n1 2 5\n11',  expectedOutput: '3',  isHidden: true  },
    { input: '2\n2 5\n0',     expectedOutput: '0',  isHidden: true  },
  ],
  starterCode: {
    javascript: `function coinChange(coins, amount) {
  // Return minimum coins to make amount, or -1 if impossible
  
}`,
    python: `def coinChange(coins, amount):
    # Return minimum coins to make amount, or -1 if impossible
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst coins = _lines[1].split(' ').map(Number);\nconst amount = parseInt(_lines[2]);`,
      'coinChange(coins, amount)', 'console.log(_result);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\ncoins = list(map(int, _data[1].split()))\namount = int(_data[2])`,
      'coinChange(coins, amount)', 'print(_result)'
    ),
  },
},

{
  title: 'House Robber', difficulty: 'medium', category: 'Dynamic Programming',
  tags: ['array','dynamic-programming'], companies: ['Amazon','Airbnb'], marks: 20,
  description: `You are a robber. Adjacent houses have alarm systems. Given \`nums\` (money in each house), return the **maximum money** you can rob without robbing two adjacent houses.`,
  constraints: '1 ≤ nums.length ≤ 100\n0 ≤ nums[i] ≤ 400',
  examples: [
    { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 (1) + house 3 (3).' },
    { input: 'nums = [2,7,9,3,1]', output: '12', explanation: 'Rob 1+3+5 = 12.' },
  ],
  testCases: [
    { input: '4\n1 2 3 1',   expectedOutput: '4',  isHidden: false },
    { input: '5\n2 7 9 3 1', expectedOutput: '12', isHidden: false },
    { input: '1\n0',         expectedOutput: '0',  isHidden: true  },
    { input: '6\n2 1 1 2 2 1', expectedOutput: '6', isHidden: true },
  ],
  starterCode: {
    javascript: `function rob(nums) {
  // Return maximum money you can rob without robbing adjacent houses
  
}`,
    python: `def rob(nums):
    # Return maximum money you can rob without robbing adjacent houses
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);`,
      'rob(nums)', 'console.log(_result);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))`,
      'rob(nums)', 'print(_result)'
    ),
  },
},

{
  title: 'Unique Paths', difficulty: 'medium', category: 'Dynamic Programming',
  tags: ['math','dynamic-programming','combinatorics'], companies: ['Google','Amazon'], marks: 20,
  description: `A robot is at the top-left of an \`m × n\` grid. It can only move **down** or **right**. Return the number of unique paths to reach the bottom-right.`,
  constraints: '1 ≤ m, n ≤ 100',
  examples: [
    { input: 'm = 3, n = 7', output: '28', explanation: '28 unique paths.' },
    { input: 'm = 3, n = 2', output: '3', explanation: 'RRD, RDR, DRR' },
  ],
  testCases: [
    { input: '3 7',  expectedOutput: '28',   isHidden: false },
    { input: '3 2',  expectedOutput: '3',    isHidden: false },
    { input: '1 1',  expectedOutput: '1',    isHidden: true  },
    { input: '10 10',expectedOutput: '48620',isHidden: true  },
  ],
  starterCode: {
    javascript: `function uniquePaths(m, n) {
  // Return number of unique paths from top-left to bottom-right
  
}`,
    python: `def uniquePaths(m, n):
    # Return number of unique paths from top-left to bottom-right
    pass`,
  },
  harness: {
    javascript: jsHarness(
      'const [m, n] = _lines[0].split(" ").map(Number);',
      'uniquePaths(m, n)', 'console.log(_result);'
    ),
    python: pyHarness(
      'm, n = map(int, _data[0].split())',
      'uniquePaths(m, n)', 'print(_result)'
    ),
  },
},

{
  title: 'Sort Colors', difficulty: 'medium', category: 'Array',
  tags: ['array','two-pointers','sorting'], companies: ['Facebook','Microsoft'], marks: 20,
  description: `Given an array of 0s (red), 1s (white), and 2s (blue), sort them in-place so that same colors are adjacent. Return the sorted array.`,
  constraints: 'n == nums.length\n1 ≤ n ≤ 300\nnums[i] ∈ {0, 1, 2}',
  examples: [
    { input: 'nums = [2,0,2,1,1,0]', output: '[0,0,1,1,2,2]', explanation: 'Dutch flag sort.' },
  ],
  testCases: [
    { input: '6\n2 0 2 1 1 0', expectedOutput: '0 0 1 1 2 2', isHidden: false },
    { input: '5\n2 0 1 0 1',   expectedOutput: '0 0 1 1 2',   isHidden: false },
    { input: '3\n0 0 0',       expectedOutput: '0 0 0',       isHidden: true  },
    { input: '3\n2 1 0',       expectedOutput: '0 1 2',       isHidden: true  },
  ],
  starterCode: {
    javascript: `function sortColors(nums) {
  // Return nums sorted with 0s first, then 1s, then 2s
  
}`,
    python: `def sortColors(nums):
    # Return nums sorted with 0s first, then 1s, then 2s
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);`,
      'sortColors(nums)', 'console.log(_result.join(" "));'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))`,
      'sortColors(nums)', 'print(" ".join(map(str, _result)))'
    ),
  },
},

{
  title: 'Number of Islands', difficulty: 'medium', category: 'Graph',
  tags: ['array','depth-first-search','breadth-first-search','matrix'], companies: ['Amazon','Google','Facebook'], marks: 20,
  description: `Given a 2D grid of \`'1'\` (land) and \`'0'\` (water), count the number of **islands** (groups of connected \`'1'\`s horizontally or vertically).`,
  constraints: 'm == grid.length\nn == grid[i].length\n1 ≤ m, n ≤ 300',
  examples: [
    { input: 'grid with 1 island', output: '1', explanation: 'All 1s connected.' },
  ],
  testCases: [
    { input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', expectedOutput: '1', isHidden: false },
    { input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', expectedOutput: '3', isHidden: false },
    { input: '1 1\n1',                                            expectedOutput: '1', isHidden: true  },
    { input: '2 2\n0 0\n0 0',                                    expectedOutput: '0', isHidden: true  },
  ],
  starterCode: {
    javascript: `function numIslands(grid) {
  // Return the number of islands (connected groups of 1s)
  
}`,
    python: `def numIslands(grid):
    # Return the number of islands (connected groups of 1s)
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const [_m, _n] = _lines[0].split(' ').map(Number);
const grid = [];
for (let i = 1; i <= _m; i++) grid.push(_lines[i].split(' '));`,
      'numIslands(grid)', 'console.log(_result);'
    ),
    python: pyHarness(
      `_mn = list(map(int, _data[0].split()))
_m, _n = _mn[0], _mn[1]
grid = [_data[i+1].split() for i in range(_m)]`,
      'numIslands(grid)', 'print(_result)'
    ),
  },
},

{
  title: 'Subarray Sum Equals K', difficulty: 'medium', category: 'Array',
  tags: ['array','hash-table','prefix-sum'], companies: ['Facebook','Google'], marks: 20,
  description: `Given an array of integers \`nums\` and an integer \`k\`, return the **total number of subarrays** whose sum equals \`k\`.`,
  constraints: '1 ≤ nums.length ≤ 2×10^4\n-1000 ≤ nums[i] ≤ 1000\n-10^7 ≤ k ≤ 10^7',
  examples: [
    { input: 'nums = [1,1,1], k = 2', output: '2', explanation: '[1,1] starting at 0 and 1.' },
  ],
  testCases: [
    { input: '5\n1 1 1 1 1\n2', expectedOutput: '4', isHidden: false },
    { input: '4\n1 2 3 4\n3',   expectedOutput: '2', isHidden: false },
    { input: '1\n1\n0',         expectedOutput: '0', isHidden: true  },
    { input: '5\n-1 -1 1 1 0\n0', expectedOutput: '3', isHidden: true },
  ],
  starterCode: {
    javascript: `function subarraySum(nums, k) {
  // Return count of subarrays with sum equal to k
  
}`,
    python: `def subarraySum(nums, k):
    # Return count of subarrays with sum equal to k
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);\nconst k = parseInt(_lines[2]);`,
      'subarraySum(nums, k)', 'console.log(_result);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))\nk = int(_data[2])`,
      'subarraySum(nums, k)', 'print(_result)'
    ),
  },
},

{
  title: 'Find Peak Element', difficulty: 'medium', category: 'Binary Search',
  tags: ['array','binary-search'], companies: ['Google','Facebook'], marks: 20,
  description: `A **peak** element is strictly greater than its neighbors. Given \`nums\`, return the index of any peak element. Must run in O(log n).`,
  constraints: '1 ≤ nums.length ≤ 1000\nnums[i] != nums[i+1] for all valid i.',
  examples: [
    { input: 'nums = [1,2,3,1]', output: '2', explanation: 'nums[2]=3 is a peak.' },
  ],
  testCases: [
    { input: '5\n1 2 3 1 1', expectedOutput: '2', isHidden: false },
    { input: '1\n1',         expectedOutput: '0', isHidden: false },
    { input: '3\n3 2 1',     expectedOutput: '0', isHidden: true  },
    { input: '3\n1 2 3',     expectedOutput: '2', isHidden: true  },
  ],
  starterCode: {
    javascript: `function findPeakElement(nums) {
  // Return index of any peak element (greater than its neighbors)
  
}`,
    python: `def findPeakElement(nums):
    # Return index of any peak element (greater than its neighbors)
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst nums = _lines[1].split(' ').map(Number);`,
      'findPeakElement(nums)', 'console.log(_result);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nnums = list(map(int, _data[1].split()))`,
      'findPeakElement(nums)', 'print(_result)'
    ),
  },
},

{
  title: 'Group Anagrams', difficulty: 'medium', category: 'String',
  tags: ['hash-table','string','sorting'], companies: ['Amazon','Facebook'], marks: 20,
  description: `Given an array of strings \`strs\`, group the anagrams together. Return the **total number of groups**.`,
  constraints: '1 ≤ strs.length ≤ 10^4\n0 ≤ strs[i].length ≤ 100\nLowercase English letters.',
  examples: [
    { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '3', explanation: '3 anagram groups.' },
  ],
  testCases: [
    { input: '6\neat\ntea\ntan\nate\nnat\nbat', expectedOutput: '3', isHidden: false },
    { input: '3\nabc\nbca\nxyz',               expectedOutput: '2', isHidden: false },
    { input: '1\na',                            expectedOutput: '1', isHidden: true  },
    { input: '4\nab\nba\ncd\ndc',               expectedOutput: '2', isHidden: true  },
  ],
  starterCode: {
    javascript: `function groupAnagrams(strs) {
  // Return array of grouped anagrams
  
}`,
    python: `def groupAnagrams(strs):
    # Return list of grouped anagrams
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst strs = _lines.slice(1, 1 + _n);`,
      'groupAnagrams(strs)', 'console.log(_result.length);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nstrs = _data[1:1+_n]`,
      'groupAnagrams(strs)', 'print(len(_result))'
    ),
  },
},

{
  title: 'Spiral Matrix', difficulty: 'medium', category: 'Matrix',
  tags: ['array','matrix','simulation'], companies: ['Microsoft','Google'], marks: 20,
  description: `Given an \`m × n\` matrix, return all elements in **spiral order**.`,
  constraints: 'm == matrix.length\nn == matrix[i].length\n1 ≤ m, n ≤ 10\n-100 ≤ matrix[i][j] ≤ 100',
  examples: [
    { input: '3×3 matrix', output: '[1,2,3,6,9,8,7,4,5]', explanation: 'Spiral order.' },
  ],
  testCases: [
    { input: '3 3\n1 2 3\n4 5 6\n7 8 9',          expectedOutput: '1 2 3 6 9 8 7 4 5',          isHidden: false },
    { input: '3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12', expectedOutput: '1 2 3 4 8 12 11 10 9 5 6 7', isHidden: false },
    { input: '1 1\n1',                              expectedOutput: '1',                          isHidden: true  },
    { input: '2 2\n1 2\n3 4',                       expectedOutput: '1 2 4 3',                   isHidden: true  },
  ],
  starterCode: {
    javascript: `function spiralOrder(matrix) {
  // Return elements of matrix in spiral order
  
}`,
    python: `def spiralOrder(matrix):
    # Return elements of matrix in spiral order
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const [_m, _n] = _lines[0].split(' ').map(Number);
const matrix = [];
for (let i = 1; i <= _m; i++) matrix.push(_lines[i].split(' ').map(Number));`,
      'spiralOrder(matrix)', 'console.log(_result.join(" "));'
    ),
    python: pyHarness(
      `_mn = list(map(int, _data[0].split()))
_m, _n = _mn[0], _mn[1]
matrix = [list(map(int, _data[i+1].split())) for i in range(_m)]`,
      'spiralOrder(matrix)', 'print(" ".join(map(str, _result)))'
    ),
  },
},

// ═══════════════════════════ HARD (10) ═══════════════════════════════════════

{
  title: 'Trapping Rain Water', difficulty: 'hard', category: 'Array',
  tags: ['array','two-pointers','dynamic-programming','stack'], companies: ['Amazon','Google','Facebook','Apple'], marks: 30,
  description: `Given \`n\` non-negative integers representing an elevation map (width 1 each), compute how much water it can trap after raining.`,
  constraints: 'n == height.length\n1 ≤ n ≤ 2×10^4\n0 ≤ height[i] ≤ 10^5',
  examples: [
    { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: '6 units trapped.' },
    { input: 'height = [4,2,0,3,2,5]', output: '9', explanation: '9 units trapped.' },
  ],
  testCases: [
    { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6', isHidden: false },
    { input: '6\n4 2 0 3 2 5',              expectedOutput: '9', isHidden: false },
    { input: '1\n1',                         expectedOutput: '0', isHidden: true  },
    { input: '3\n3 0 3',                     expectedOutput: '3', isHidden: true  },
  ],
  starterCode: {
    javascript: `function trap(height) {
  // Return total units of water trapped
  
}`,
    python: `def trap(height):
    # Return total units of water trapped
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst height = _lines[1].split(' ').map(Number);`,
      'trap(height)', 'console.log(_result);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nheight = list(map(int, _data[1].split()))`,
      'trap(height)', 'print(_result)'
    ),
  },
},

{
  title: 'N-Queens', difficulty: 'hard', category: 'Backtracking',
  tags: ['array','backtracking'], companies: ['Amazon','Microsoft'], marks: 30,
  description: `The n-queens puzzle: place \`n\` queens on an \`n×n\` chessboard so no two attack each other. Return the **number of distinct solutions**.`,
  constraints: '1 ≤ n ≤ 9',
  examples: [
    { input: 'n = 4', output: '2', explanation: '2 distinct solutions.' },
    { input: 'n = 1', output: '1', explanation: 'Only one solution.' },
  ],
  testCases: [
    { input: '4', expectedOutput: '2',  isHidden: false },
    { input: '1', expectedOutput: '1',  isHidden: false },
    { input: '8', expectedOutput: '92', isHidden: true  },
    { input: '6', expectedOutput: '4',  isHidden: true  },
  ],
  starterCode: {
    javascript: `function totalNQueens(n) {
  // Return number of distinct n-queens solutions
  
}`,
    python: `def totalNQueens(n):
    # Return number of distinct n-queens solutions
    pass`,
  },
  harness: {
    javascript: jsHarness('const n = parseInt(_lines[0]);', 'totalNQueens(n)', 'console.log(_result);'),
    python: pyHarness('n = int(_data[0])', 'totalNQueens(n)', 'print(_result)'),
  },
},

{
  title: 'Median of Two Sorted Arrays', difficulty: 'hard', category: 'Binary Search',
  tags: ['array','binary-search','divide-and-conquer'], companies: ['Google','Amazon','Apple'], marks: 30,
  description: `Given two sorted arrays \`nums1\` and \`nums2\`, return the **median** of the combined sorted array. Must run in O(log(m+n)).`,
  constraints: '0 ≤ m, n ≤ 1000\n1 ≤ m + n ≤ 2000\n-10^6 ≤ nums[i] ≤ 10^6',
  examples: [
    { input: 'nums1=[1,3], nums2=[2]', output: '2.0', explanation: 'Merged [1,2,3], median=2.' },
    { input: 'nums1=[1,2], nums2=[3,4]', output: '2.5', explanation: 'Merged [1,2,3,4], median=2.5.' },
  ],
  testCases: [
    { input: '2\n1 3\n1\n2',   expectedOutput: '2.0', isHidden: false },
    { input: '2\n1 2\n2\n3 4', expectedOutput: '2.5', isHidden: false },
    { input: '0\n\n1\n1',      expectedOutput: '1.0', isHidden: true  },
    { input: '3\n1 2 3\n3\n4 5 6', expectedOutput: '3.5', isHidden: true },
  ],
  starterCode: {
    javascript: `function findMedianSortedArrays(nums1, nums2) {
  // Return median of two sorted arrays as a float (e.g. 2.0 or 2.5)
  
}`,
    python: `def findMedianSortedArrays(nums1, nums2):
    # Return median of two sorted arrays as float
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _m = parseInt(_lines[0]);
const nums1 = _m > 0 ? _lines[1].split(' ').map(Number) : [];
const _n = parseInt(_lines[2]);
const nums2 = _n > 0 ? _lines[3].split(' ').map(Number) : [];`,
      'findMedianSortedArrays(nums1, nums2)',
      'console.log(_result.toFixed(1));'
    ),
    python: pyHarness(
      `_m = int(_data[0])
nums1 = list(map(int, _data[1].split())) if _m > 0 and _data[1].strip() else []
_n = int(_data[2])
nums2 = list(map(int, _data[3].split())) if _n > 0 else []`,
      'findMedianSortedArrays(nums1, nums2)',
      'print(f"{_result:.1f}")'
    ),
  },
},

{
  title: 'Largest Rectangle in Histogram', difficulty: 'hard', category: 'Stack',
  tags: ['array','stack','monotonic-stack'], companies: ['Amazon','Google','Microsoft'], marks: 30,
  description: `Given an array of integers \`heights\` representing a histogram (each bar has width 1), return the area of the **largest rectangle** that can be formed.`,
  constraints: '1 ≤ heights.length ≤ 10^5\n0 ≤ heights[i] ≤ 10^4',
  examples: [
    { input: 'heights = [2,1,5,6,2,3]', output: '10', explanation: 'Rectangle of width 2, height 5.' },
    { input: 'heights = [2,4]', output: '4', explanation: 'Single bar of height 4.' },
  ],
  testCases: [
    { input: '6\n2 1 5 6 2 3', expectedOutput: '10', isHidden: false },
    { input: '2\n2 4',         expectedOutput: '4',  isHidden: false },
    { input: '1\n1',           expectedOutput: '1',  isHidden: true  },
    { input: '5\n2 3 4 5 6',   expectedOutput: '12', isHidden: true  },
  ],
  starterCode: {
    javascript: `function largestRectangleArea(heights) {
  // Return area of the largest rectangle in the histogram
  
}`,
    python: `def largestRectangleArea(heights):
    # Return area of the largest rectangle in the histogram
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst heights = _lines[1].split(' ').map(Number);`,
      'largestRectangleArea(heights)', 'console.log(_result);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\nheights = list(map(int, _data[1].split()))`,
      'largestRectangleArea(heights)', 'print(_result)'
    ),
  },
},

{
  title: 'Minimum Window Substring', difficulty: 'hard', category: 'String',
  tags: ['hash-table','string','sliding-window'], companies: ['Facebook','Amazon','Google'], marks: 30,
  description: `Given strings \`s\` and \`t\`, return the **minimum window substring** of \`s\` that contains every character in \`t\` (including duplicates). Return \`""\` if no such window exists.`,
  constraints: 'm == s.length\nn == t.length\n1 ≤ m, n ≤ 10^5',
  examples: [
    { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: 'BANC contains A, B, C.' },
    { input: 's = "a", t = "a"', output: '"a"', explanation: 'Whole string.' },
  ],
  testCases: [
    { input: 'ADOBECODEBANC\nABC', expectedOutput: 'BANC', isHidden: false },
    { input: 'a\na',              expectedOutput: 'a',    isHidden: false },
    { input: 'a\naa',             expectedOutput: '',     isHidden: true  },
    { input: 'cabwefgewcwaefgcf\ncae', expectedOutput: 'cwae', isHidden: true },
  ],
  starterCode: {
    javascript: `function minWindow(s, t) {
  // Return minimum window substring of s containing all chars of t
  
}`,
    python: `def minWindow(s, t):
    # Return minimum window substring of s containing all chars of t
    pass`,
  },
  harness: {
    javascript: jsHarness('const s = _lines[0];\nconst t = _lines[1];', 'minWindow(s, t)', 'console.log(_result);'),
    python: pyHarness('s = _data[0]\nt = _data[1]', 'minWindow(s, t)', 'print(_result)'),
  },
},

{
  title: 'Regular Expression Matching', difficulty: 'hard', category: 'Dynamic Programming',
  tags: ['string','dynamic-programming','recursion'], companies: ['Google','Facebook'], marks: 30,
  description: `Implement regex matching with \`'.'\` (matches any single char) and \`'*'\` (matches zero or more of the preceding element). The match must cover the **entire** input string.`,
  constraints: '1 ≤ s.length ≤ 20\n1 ≤ p.length ≤ 30\nLowercase English letters, \'.\', \'*\' only.',
  examples: [
    { input: 's = "aa", p = "a"', output: 'false', explanation: '"a" doesn\'t match entire "aa".' },
    { input: 's = "aa", p = "a*"', output: 'true', explanation: '"a*" means zero or more a\'s.' },
  ],
  testCases: [
    { input: 'aa\na',   expectedOutput: 'false', isHidden: false },
    { input: 'aa\na*',  expectedOutput: 'true',  isHidden: false },
    { input: 'ab\n.*',  expectedOutput: 'true',  isHidden: true  },
    { input: 'aab\nc*a*b', expectedOutput: 'true', isHidden: true },
  ],
  starterCode: {
    javascript: `function isMatch(s, p) {
  // Return true if s matches pattern p (supports . and *)
  
}`,
    python: `def isMatch(s, p):
    # Return True if s matches pattern p (supports . and *)
    pass`,
  },
  harness: {
    javascript: jsHarness('const s = _lines[0];\nconst p = _lines[1];', 'isMatch(s, p)', 'console.log(_result ? "true" : "false");'),
    python: pyHarness('s = _data[0]\np = _data[1]', 'isMatch(s, p)', 'print("true" if _result else "false")'),
  },
},

{
  title: 'Word Break II', difficulty: 'hard', category: 'Dynamic Programming',
  tags: ['hash-table','string','dynamic-programming','backtracking'], companies: ['Google','Amazon'], marks: 30,
  description: `Given string \`s\` and dictionary \`wordDict\`, return the number of valid sentence segmentations (each word from the dict, reuse allowed).`,
  constraints: '1 ≤ s.length ≤ 20\n1 ≤ wordDict.length ≤ 1000',
  examples: [
    { input: 's = "catsanddog", dict = [cat,cats,and,sand,dog]', output: '2', explanation: '"cat sand dog", "cats and dog"' },
  ],
  testCases: [
    { input: 'catsanddog\n3\ncat cats and sand dog', expectedOutput: '2', isHidden: false },
    { input: 'aaaa\n1\naaa',                         expectedOutput: '0', isHidden: false },
    { input: 'ab\n2\na b',                            expectedOutput: '1', isHidden: true  },
    { input: 'ab\n2\nab a',                           expectedOutput: '1', isHidden: true  },
  ],
  starterCode: {
    javascript: `function wordBreak(s, wordDict) {
  // Return number of valid segmentations of s using words from wordDict
  
}`,
    python: `def wordBreak(s, wordDict):
    # Return number of valid segmentations of s using words from wordDict
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const s = _lines[0];
const _wc = parseInt(_lines[1]);
const wordDict = _lines[2].split(' ');`,
      'wordBreak(s, wordDict)',
      'console.log(Array.isArray(_result) ? _result.length : _result);'
    ),
    python: pyHarness(
      `s = _data[0]
_wc = int(_data[1])
wordDict = _data[2].split()`,
      'wordBreak(s, wordDict)',
      'print(len(_result) if isinstance(_result, list) else _result)'
    ),
  },
},

{
  title: 'Maximum Points You Can Obtain from Cards', difficulty: 'hard', category: 'Array',
  tags: ['array','sliding-window','prefix-sum'], companies: ['Google','Uber'], marks: 30,
  description: `There are \`n\` cards. You can take \`k\` cards from the **beginning** or the **end**. Return the **maximum score** you can obtain.`,
  constraints: '1 ≤ cardPoints.length ≤ 10^5\n1 ≤ cardPoints[i] ≤ 10^4\n1 ≤ k ≤ cardPoints.length',
  examples: [
    { input: 'cardPoints = [1,2,3,4,5,6,1], k = 3', output: '12', explanation: 'Take [1,6,5] from right → 12.' },
  ],
  testCases: [
    { input: '7\n1 2 3 4 5 6 1\n3', expectedOutput: '12', isHidden: false },
    { input: '7\n2 2 2 2 2 2 2\n3', expectedOutput: '6',  isHidden: false },
    { input: '4\n1 79 80 1\n3',     expectedOutput: '161',isHidden: true  },
    { input: '3\n9 7 7\n3',         expectedOutput: '23', isHidden: true  },
  ],
  starterCode: {
    javascript: `function maxScore(cardPoints, k) {
  // Return maximum score taking exactly k cards from start or end
  
}`,
    python: `def maxScore(cardPoints, k):
    # Return maximum score taking exactly k cards from start or end
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _n = parseInt(_lines[0]);\nconst cardPoints = _lines[1].split(' ').map(Number);\nconst k = parseInt(_lines[2]);`,
      'maxScore(cardPoints, k)', 'console.log(_result);'
    ),
    python: pyHarness(
      `_n = int(_data[0])\ncardPoints = list(map(int, _data[1].split()))\nk = int(_data[2])`,
      'maxScore(cardPoints, k)', 'print(_result)'
    ),
  },
},

{
  title: 'Merge K Sorted Lists', difficulty: 'hard', category: 'Linked List',
  tags: ['linked-list','divide-and-conquer','heap','merge-sort'], companies: ['Amazon','Google','Facebook'], marks: 30,
  description: `You are given \`k\` sorted lists of integers. Merge them all into one sorted list and return it.`,
  constraints: 'k == lists.length\n0 ≤ k ≤ 10^4\nThe sum of list lengths ≤ 10^4.',
  examples: [
    { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: 'All merged and sorted.' },
  ],
  testCases: [
    { input: '3\n3 1 4 5\n3 1 3 4\n2 2 6', expectedOutput: '1 1 2 3 4 4 5 6', isHidden: false },
    { input: '0',                            expectedOutput: '',               isHidden: false },
    { input: '2\n2 1 2\n2 3 4',             expectedOutput: '1 2 3 4',        isHidden: true  },
    { input: '1\n3 5 10 40',                expectedOutput: '5 10 40',        isHidden: true  },
  ],
  starterCode: {
    javascript: `function mergeKLists(lists) {
  // lists is an array of sorted arrays. Return merged sorted array.
  
}`,
    python: `def mergeKLists(lists):
    # lists is a list of sorted lists. Return merged sorted list.
    pass`,
  },
  harness: {
    javascript: jsHarness(
      `const _k = parseInt(_lines[0]);
const lists = [];
for (let i = 1; i <= _k; i++) {
  const parts = _lines[i].split(' ');
  const len = parseInt(parts[0]);
  lists.push(parts.slice(1, 1 + len).map(Number));
}`,
      'mergeKLists(lists)',
      'console.log(_result.join(" "));'
    ),
    python: pyHarness(
      `_k = int(_data[0])
lists = []
for i in range(1, _k + 1):
    parts = _data[i].split()
    _len = int(parts[0])
    lists.append(list(map(int, parts[1:1+_len])))`,
      'mergeKLists(lists)',
      'print(" ".join(map(str, _result)))'
    ),
  },
},

];

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminUser = await User.findOne({ role: 'admin' }).lean();
    const anyUser = adminUser || await User.findOne().lean();
    if (!anyUser) { console.error('❌ No users found. Register first.'); process.exit(1); }
    console.log(`Using user: ${anyUser._id}`);

    await Problem.deleteMany({});
    console.log('🗑️  Cleared existing problems');

    let inserted = 0;
    for (const p of problems) {
      try {
        await Problem.create({
          title: p.title,
          slug: slugify(p.title),
          description: p.description,
          difficulty: p.difficulty,
          category: p.category,
          tags: p.tags || [],
          companies: p.companies || [],
          marks: p.marks,
          constraints: p.constraints || '',
          examples: p.examples || [],
          testCases: p.testCases || [],
          starterCode: new Map(Object.entries(p.starterCode || {})),
          harness: new Map(Object.entries(p.harness || {})),
          solution: '',
          createdBy: anyUser._id,
          isActive: true,
        });
        inserted++;
        console.log(`  ✓ [${p.difficulty.padEnd(6)}] ${p.title}`);
      } catch (err) {
        if (err.code === 11000) {
          console.log(`  ⚠  Duplicate skipped: ${p.title}`);
        } else {
          console.error(`  ✗ Failed: ${p.title} — ${err.message}`);
        }
      }
    }

    console.log(`\n🎉 Seeded ${inserted}/${problems.length} problems!`);
  } catch (err) {
    console.error('❌ Fatal:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
