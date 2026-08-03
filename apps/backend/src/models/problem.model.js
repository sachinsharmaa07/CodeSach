import mongoose, { Schema } from 'mongoose';

const problemSchema = new Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    category: { type: String, required: true },
    tags: [String],
    companies: [String],
    marks: { type: Number, required: true, default: 10 },
    constraints: { type: String, default: '' },
    examples: [{ input: String, output: String, explanation: String }],
    testCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
      },
    ],
    starterCode: { type: Map, of: String, default: {} }, // function body template shown to user
    harness: { type: Map, of: String, default: {} }, // full I/O wrapper; {{USER_CODE}} replaced at run-time
    parameters: [{ name: String, type: { type: String }, description: String }], // Schema for function arguments
    returnValue: { type: { type: String }, description: String }, // Schema for return value
    timeLimit: { type: Number, default: 2000 }, // Time limit in milliseconds
    memoryLimit: { type: Number, default: 256 }, // Memory limit in MB
    aiSolutions: { type: Map, of: String, default: {} }, // Brute force, better, optimal solutions
    solution: { type: String, select: false, default: '' },
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

problemSchema.index({ difficulty: 1, category: 1 });
problemSchema.index({ tags: 1 });

export const Problem = mongoose.model('Problem', problemSchema);
