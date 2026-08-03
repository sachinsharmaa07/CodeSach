import mongoose from 'mongoose';
import { Problem } from './models/problem.model.js';
import { User } from './models/user.model.js';
import { env } from './config/env.js';
import { harnessGenerator } from './services/harnessGenerator.service.js';

const MONGODB_URI = env.MONGODB_URI || 'mongodb://mongodb:27017/codesach';

const rawData = `
Arrays & Hashing
Concatenation of Array
Contains Duplicate
Valid Anagram
Two Sum
Longest Common Prefix
Group Anagrams
Remove Element
Majority Element
Design HashSet
Design HashMap
Sort an Array
Sort Colors
Top K Frequent Elements
Encode and Decode Strings
Range Sum Query 2D Immutable
Product of Array Except Self
Valid Sudoku
Longest Consecutive Sequence
Best Time to Buy And Sell Stock II
Majority Element II
Subarray Sum Equals K
First Missing Positive
Two Pointers
Reverse String
Valid Palindrome
Valid Palindrome II
Merge Strings Alternately
Merge Sorted Array
Remove Duplicates From Sorted Array
Two Sum II Input Array Is Sorted
3Sum
4Sum
Rotate Array
Container With Most Water
Boats to Save People
Trapping Rain Water
Sliding Window
Contains Duplicate II
Best Time to Buy And Sell Stock
Longest Substring Without Repeating Characters
Longest Repeating Character Replacement
Permutation In String
Minimum Size Subarray Sum
Find K Closest Elements
Minimum Window Substring
Sliding Window Maximum
Stack
Baseball Game
Valid Parentheses
Implement Stack Using Queues
Implement Queue using Stacks
Min Stack
Evaluate Reverse Polish Notation
Asteroid Collision
Daily Temperatures
Online Stock Span
Car Fleet
Simplify Path
Decode String
Maximum Frequency Stack
Largest Rectangle In Histogram
Binary Search
Binary Search
Search Insert Position
Guess Number Higher Or Lower
Sqrt(x)
Search a 2D Matrix
Koko Eating Bananas
Capacity to Ship Packages Within D Days
Find Minimum In Rotated Sorted Array
Search In Rotated Sorted Array
Search In Rotated Sorted Array II
Time Based Key Value Store
Split Array Largest Sum
Median of Two Sorted Arrays
Find in Mountain Array
Linked List
Reverse Linked List
Merge Two Sorted Lists
Linked List Cycle
Reorder List
Remove Nth Node From End of List
Copy List With Random Pointer
Add Two Numbers
Find The Duplicate Number
Reverse Linked List II
Design Circular Queue
LRU Cache
LFU Cache
Merge K Sorted Lists
Reverse Nodes In K Group
Trees
Binary Tree Inorder Traversal
Binary Tree Preorder Traversal
Binary Tree Postorder Traversal
Invert Binary Tree
Maximum Depth of Binary Tree
Diameter of Binary Tree
Balanced Binary Tree
Same Tree
Subtree of Another Tree
Lowest Common Ancestor of a Binary Search Tree
Insert into a Binary Search Tree
Delete Node in a BST
Binary Tree Level Order Traversal
Binary Tree Right Side View
Construct Quad Tree
Count Good Nodes In Binary Tree
Validate Binary Search Tree
Kth Smallest Element In a Bst
Construct Binary Tree From Preorder And Inorder Traversal
House Robber III
Delete Leaves With a Given Value
Binary Tree Maximum Path Sum
Serialize And Deserialize Binary Tree
Heap / Priority Queue
Kth Largest Element In a Stream
Last Stone Weight
K Closest Points to Origin
Kth Largest Element In An Array
Task Scheduler
Design Twitter
Single Threaded CPU
Reorganize String
Longest Happy String
Car Pooling
Find Median From Data Stream
IPO
Backtracking
Sum of All Subsets XOR Total
Subsets
Combination Sum
Combination Sum II
Combinations
Permutations
Subsets II
Permutations II
Generate Parentheses
Word Search
Palindrome Partitioning
Letter Combinations of a Phone Number
Matchsticks to Square
Partition to K Equal Sum Subsets
N Queens
N Queens II
Word Break II
Tries
Implement Trie Prefix Tree
Design Add And Search Words Data Structure
Extra Characters in a String
Word Search II
Graphs
Island Perimeter
Verifying An Alien Dictionary
Find the Town Judge
Number of Islands
Max Area of Island
Clone Graph
Walls And Gates
Rotting Oranges
Pacific Atlantic Water Flow
Surrounded Regions
Open The Lock
Course Schedule
Course Schedule II
Graph Valid Tree
Course Schedule IV
Number of Connected Components In An Undirected Graph
Redundant Connection
Accounts Merge
Evaluate Division
Minimum Height Trees
Word Ladder
Advanced Graphs
Path with Minimum Effort
Network Delay Time
Reconstruct Itinerary
Min Cost to Connect All Points
Swim In Rising Water
Alien Dictionary
Cheapest Flights Within K Stops
Find Critical and Pseudo Critical Edges in Minimum Spanning Tree
Build a Matrix With Conditions
Greatest Common Divisor Traversal
1-D Dynamic Programming
Climbing Stairs
Min Cost Climbing Stairs
N-th Tribonacci Number
House Robber
House Robber II
Longest Palindromic Substring
Palindromic Substrings
Decode Ways
Coin Change
Maximum Product Subarray
Word Break
Longest Increasing Subsequence
Partition Equal Subset Sum
Combination Sum IV
Perfect Squares
Integer Break
Stone Game III
2-D Dynamic Programming
Unique Paths
Unique Paths II
Minimum Path Sum
Longest Common Subsequence
Last Stone Weight II
Best Time to Buy And Sell Stock With Cooldown
Coin Change II
Target Sum
Interleaving String
Stone Game
Stone Game II
Longest Increasing Path In a Matrix
Distinct Subsequences
Edit Distance
Burst Balloons
Regular Expression Matching
Greedy
Lemonade Change
Maximum Subarray
Maximum Sum Circular Subarray
Longest Turbulent Subarray
Jump Game
Jump Game II
Jump Game VII
Gas Station
Hand of Straights
Dota2 Senate
Merge Triplets to Form Target Triplet
Partition Labels
Valid Parenthesis String
Candy
Intervals
Insert Interval
Merge Intervals
Non Overlapping Intervals
Meeting Rooms
Meeting Rooms II
Meeting Rooms III
Minimum Interval to Include Each Query
Math & Geometry
Excel Sheet Column Title
Greatest Common Divisor of Strings
Insert Greatest Common Divisors in Linked List
Transpose Matrix
Rotate Image
Spiral Matrix
Set Matrix Zeroes
Happy Number
Plus One
Roman to Integer
Pow(x, n)
Multiply Strings
Detect Squares
Bit Manipulation
Single Number
Number of 1 Bits
Counting Bits
Add Binary
Reverse Bits
Missing Number
Sum of Two Integers
Reverse Integer
Bitwise AND of Numbers Range
Minimum Array End
`;

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.info('Connected to MongoDB');

    let admin = await User.findOne(); // just get any user
    if (!admin) {
      console.info('No users found in db! Run this after registering at least 1 user.');
      process.exit(1);
    }

    const lines = rawData
      .trim()
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l);

    let currentCategory = '';
    const problems = [];

    const categories = new Set([
      'Arrays & Hashing',
      'Two Pointers',
      'Sliding Window',
      'Stack',
      'Binary Search',
      'Linked List',
      'Trees',
      'Heap / Priority Queue',
      'Backtracking',
      'Tries',
      'Graphs',
      'Advanced Graphs',
      '1-D Dynamic Programming',
      '2-D Dynamic Programming',
      'Greedy',
      'Intervals',
      'Math & Geometry',
      'Bit Manipulation',
    ]);

    for (const line of lines) {
      if (categories.has(line)) {
        currentCategory = line;
        continue;
      }

      const title = line;
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      let params = [{ name: 'input', type: 'string', description: 'Standard string input' }];
      let retVal = { type: 'string', description: 'Standard string output' };
      let tc = [
        {
          input: '"test_input"',
          expectedOutput: '"test_output"',
          isHidden: false,
        },
      ];

      if (title === 'Two Sum') {
        params = [
          { name: 'nums', type: 'integer array', description: 'Input array containing integers' },
          { name: 'target', type: 'integer', description: 'Target sum' },
        ];
        retVal = { type: 'integer array', description: 'Indices of the two numbers' };
        tc = [
          { input: '[2,7,11,15]\\n9', expectedOutput: '[0,1]', isHidden: false },
          { input: '[3,2,4]\\n6', expectedOutput: '[1,2]', isHidden: false },
          { input: '[3,3]\\n6', expectedOutput: '[0,1]', isHidden: true },
        ];
      } else if (title === 'Reverse String') {
        params = [{ name: 's', type: 'string array', description: 'Array of characters' }];
        retVal = { type: 'string array', description: 'Reversed array of characters' };
        tc = [
          {
            input: '["h","e","l","l","o"]',
            expectedOutput: '["o","l","l","e","h"]',
            isHidden: false,
          },
          {
            input: '["H","a","n","n","a","h"]',
            expectedOutput: '["h","a","n","n","a","H"]',
            isHidden: true,
          },
        ];
      }

      const { starterCode, harness } = harnessGenerator.generate(title, params, retVal);

      problems.push({
        title,
        slug,
        description: `This is a placeholder description for **${title}**. Implement the solution in the editor below.`,
        difficulty: 'medium',
        category: currentCategory,
        tags: [currentCategory],
        marks: 10,
        testCases: tc,
        parameters: params,
        returnValue: retVal,
        aiSolutions: {
          bruteForce: 'Brute force solution explanation will go here.',
          better: 'Better solution explanation will go here.',
          optimal: 'Optimal solution explanation will go here.',
        },
        starterCode,
        harness,
        createdBy: admin._id,
      });
    }

    console.info(`Clearing existing problems from DB...`);
    await Problem.deleteMany({});
    console.info(`Clearing existing submissions from DB...`);
    const { Submission } = await import('./models/submission.model.js');
    await Submission.deleteMany({});

    console.info(`Inserting ${problems.length} problems...`);

    for (const p of problems) {
      try {
        await Problem.updateOne({ slug: p.slug }, { $set: p }, { upsert: true });
      } catch (e) {
        console.error('Error inserting', p.title, e.message);
      }
    }

    console.info('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
