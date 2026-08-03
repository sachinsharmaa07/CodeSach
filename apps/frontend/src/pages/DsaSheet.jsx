import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Target,
  BarChart2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';

const DSA_DATA = [
  {
    topic: 'Arrays & Hashing',
    problems: [
      'Contains Duplicate',
      'Valid Anagram',
      'Two Sum',
      'Group Anagrams',
      'Top K Frequent Elements',
      'Encode and Decode Strings',
      'Product of Array Except Self',
      'Valid Sudoku',
      'Longest Consecutive Sequence',
    ],
  },
  {
    topic: 'Two Pointers',
    problems: [
      'Valid Palindrome',
      'Two Sum II – Input Array Is Sorted',
      '3Sum',
      'Container With Most Water',
      'Trapping Rain Water',
    ],
  },
  {
    topic: 'Sliding Window',
    problems: [
      'Best Time to Buy And Sell Stock',
      'Longest Substring Without Repeating Characters',
      'Longest Repeating Character Replacement',
      'Permutation In String',
      'Minimum Window Substring',
      'Sliding Window Maximum',
    ],
  },
  {
    topic: 'Stack',
    problems: [
      'Valid Parentheses',
      'Min Stack',
      'Evaluate Reverse Polish Notation',
      'Daily Temperatures',
      'Car Fleet',
      'Largest Rectangle In Histogram',
    ],
  },
  {
    topic: 'Binary Search',
    problems: [
      'Binary Search',
      'Search a 2D Matrix',
      'Koko Eating Bananas',
      'Find Minimum In Rotated Sorted Array',
      'Search In Rotated Sorted Array',
      'Time Based Key Value Store',
      'Median of Two Sorted Arrays',
    ],
  },
  {
    topic: 'Linked List',
    problems: [
      'Reverse Linked List',
      'Merge Two Sorted Lists',
      'Linked List Cycle',
      'Reorder List',
      'Remove Nth Node From End of List',
      'Copy List With Random Pointer',
      'Add Two Numbers',
      'Find The Duplicate Number',
      'LRU Cache',
      'Merge K Sorted Lists',
      'Reverse Nodes In K Group',
    ],
  },
  {
    topic: 'Trees',
    problems: [
      'Invert Binary Tree',
      'Maximum Depth of Binary Tree',
      'Diameter of Binary Tree',
      'Balanced Binary Tree',
      'Same Tree',
      'Subtree of Another Tree',
      'Lowest Common Ancestor of a Binary Search Tree',
      'Binary Tree Level Order Traversal',
      'Binary Tree Right Side View',
      'Count Good Nodes In Binary Tree',
      'Validate Binary Search Tree',
      'Kth Smallest Element In a BST',
      'Construct Binary Tree From Preorder And Inorder Traversal',
      'Binary Tree Maximum Path Sum',
      'Serialize And Deserialize Binary Tree',
    ],
  },
  {
    topic: 'Heap / Priority Queue',
    problems: [
      'Kth Largest Element In a Stream',
      'Last Stone Weight',
      'K Closest Points to Origin',
      'Kth Largest Element In An Array',
      'Task Scheduler',
      'Design Twitter',
      'Find Median From Data Stream',
    ],
  },
  {
    topic: 'Backtracking',
    problems: [
      'Subsets',
      'Combination Sum',
      'Combination Sum II',
      'Permutations',
      'Subsets II',
      'Generate Parentheses',
      'Word Search',
      'Palindrome Partitioning',
      'Letter Combinations of a Phone Number',
      'N Queens',
    ],
  },
  {
    topic: 'Tries',
    problems: [
      'Implement Trie (Prefix Tree)',
      'Design Add And Search Words Data Structure',
      'Word Search II',
    ],
  },
  {
    topic: 'Graphs',
    problems: [
      'Number of Islands',
      'Max Area of Island',
      'Clone Graph',
      'Walls And Gates',
      'Rotting Oranges',
      'Pacific Atlantic Water Flow',
      'Surrounded Regions',
      'Course Schedule',
      'Course Schedule II',
      'Graph Valid Tree',
      'Number of Connected Components In An Undirected Graph',
      'Redundant Connection',
      'Word Ladder',
    ],
  },
  {
    topic: 'Advanced Graphs',
    problems: [
      'Network Delay Time',
      'Reconstruct Itinerary',
      'Min Cost to Connect All Points',
      'Swim In Rising Water',
      'Alien Dictionary',
      'Cheapest Flights Within K Stops',
    ],
  },
  {
    topic: '1-D Dynamic Programming',
    problems: [
      'Climbing Stairs',
      'Min Cost Climbing Stairs',
      'House Robber',
      'House Robber II',
      'Longest Palindromic Substring',
      'Palindromic Substrings',
      'Decode Ways',
      'Coin Change',
      'Maximum Product Subarray',
      'Word Break',
      'Longest Increasing Subsequence',
      'Partition Equal Subset Sum',
    ],
  },
  {
    topic: '2-D Dynamic Programming',
    problems: [
      'Unique Paths',
      'Longest Common Subsequence',
      'Best Time to Buy And Sell Stock With Cooldown',
      'Coin Change II',
      'Target Sum',
      'Interleaving String',
      'Longest Increasing Path In a Matrix',
      'Distinct Subsequences',
      'Edit Distance',
      'Burst Balloons',
      'Regular Expression Matching',
    ],
  },
  {
    topic: 'Greedy',
    problems: [
      'Maximum Subarray',
      'Jump Game',
      'Jump Game II',
      'Gas Station',
      'Hand of Straights',
      'Merge Triplets to Form Target Triplet',
      'Partition Labels',
      'Valid Parenthesis String',
    ],
  },
  {
    topic: 'Intervals',
    problems: [
      'Insert Interval',
      'Merge Intervals',
      'Non Overlapping Intervals',
      'Meeting Rooms',
      'Meeting Rooms II',
      'Minimum Interval to Include Each Query',
    ],
  },
  {
    topic: 'Math & Geometry',
    problems: [
      'Rotate Image',
      'Spiral Matrix',
      'Set Matrix Zeroes',
      'Happy Number',
      'Plus One',
      'Pow(x, n)',
      'Multiply Strings',
      'Detect Squares',
    ],
  },
  {
    topic: 'Bit Manipulation',
    problems: [
      'Single Number',
      'Number of 1 Bits',
      'Counting Bits',
      'Reverse Bits',
      'Missing Number',
      'Sum of Two Integers',
      'Reverse Integer',
    ],
  },
];

// Helper to generate a slug from the title
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const DsaSheet = () => {
  const { user } = useAuthStore();
  const [completed, setCompleted] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState(new Set([DSA_DATA[0].topic]));

  useEffect(() => {
    if (user) {
      api
        .get('/users/progress')
        .then((res) => {
          setCompleted(new Set(res.data.data.progress));
        })
        .catch((err) => console.error('Failed to load progress', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const toggleProblem = async (problemTitle) => {
    if (!user) {
      alert('Please login to track progress!');
      return;
    }
    const slug = slugify(problemTitle);
    setToggling(slug);

    // Optimistic UI update
    const newCompleted = new Set(completed);
    if (newCompleted.has(slug)) newCompleted.delete(slug);
    else newCompleted.add(slug);
    setCompleted(newCompleted);

    try {
      await api.post('/users/progress/toggle', { problemId: slug });
    } catch (err) {
      console.error(err);
      // Revert on failure
      const reverted = new Set(newCompleted);
      if (reverted.has(slug)) reverted.delete(slug);
      else reverted.add(slug);
      setCompleted(reverted);
    } finally {
      setToggling(null);
    }
  };

  const toggleTopic = (topic) => {
    const next = new Set(expandedTopics);
    if (next.has(topic)) next.delete(topic);
    else next.add(topic);
    setExpandedTopics(next);
  };

  // Overall progress calculation
  const totalProblems = DSA_DATA.reduce((acc, curr) => acc + curr.problems.length, 0);
  const totalCompleted = completed.size;
  const progressPercent = Math.round((totalCompleted / totalProblems) * 100) || 0;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header section */}
      <div className="mb-10 text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-2 shadow-lg shadow-violet-500/20">
          <Target className="text-white" size={32} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          MAANG 250
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
          The ultimate DSA sheet to crack top tech interviews.
        </p>

        {/* Global Progress */}
        <div
          className="mt-8 max-w-xl mx-auto p-5 rounded-2xl border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-violet-400" />
              <span className="font-semibold text-sm">Overall Progress</span>
            </div>
            <span className="text-sm font-bold text-violet-400">
              {totalCompleted} / {totalProblems} ({progressPercent}%)
            </span>
          </div>
          <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {DSA_DATA.map((section, idx) => {
          const sectionTotal = section.problems.length;
          const sectionCompleted = section.problems.filter((p) => completed.has(slugify(p))).length;
          const isExpanded = expandedTopics.has(section.topic);

          return (
            <div
              key={idx}
              className="rounded-2xl border overflow-hidden transition-all duration-200"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              {/* Topic Header */}
              <button
                onClick={() => toggleTopic(section.topic)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                  <div className="text-left">
                    <h2 className="font-semibold text-lg">{section.topic}</h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {sectionCompleted} / {sectionTotal} solved
                    </p>
                  </div>
                </div>

                {/* Mini progress circle */}
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-800"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-violet-500 transition-all duration-1000"
                      strokeWidth="3"
                      strokeDasharray={`${(sectionCompleted / sectionTotal) * 100}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold">
                    {Math.round((sectionCompleted / sectionTotal) * 100)}%
                  </span>
                </div>
              </button>

              {/* Problems List */}
              {isExpanded && (
                <div className="border-t divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {section.problems.map((problemTitle, pIdx) => {
                    const slug = slugify(problemTitle);
                    const isDone = completed.has(slug);
                    const isToggling = toggling === slug;

                    return (
                      <div
                        key={pIdx}
                        className="flex items-center p-4 hover:bg-white/5 transition-colors group"
                      >
                        <button
                          onClick={() => toggleProblem(problemTitle)}
                          disabled={isToggling}
                          className="mr-4 text-gray-500 hover:text-violet-400 transition-colors disabled:opacity-50"
                        >
                          {isToggling ? (
                            <Loader2 className="animate-spin" size={22} />
                          ) : isDone ? (
                            <CheckCircle2 className="text-emerald-500" size={22} />
                          ) : (
                            <Circle size={22} />
                          )}
                        </button>
                        <div className="flex-1">
                          <Link
                            to={`/problems/${slug}`}
                            className="font-medium text-sm hover:text-violet-400 transition-colors"
                          >
                            {problemTitle}
                          </Link>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/problems/${slug}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600/20 text-violet-300 hover:bg-violet-600/30"
                          >
                            Solve
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DsaSheet;
