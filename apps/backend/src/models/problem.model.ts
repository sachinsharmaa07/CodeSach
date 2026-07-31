import mongoose, { Schema, Document } from 'mongoose';

export interface IProblem extends Document {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  companies: string[];
  marks: number;
  constraints: string;
  examples: { input: string; output: string; explanation?: string }[];
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
  starterCode: Record<string, string>;
  solution: string;
  slug: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  acceptedSubmissions: number;
  totalSubmissions: number;
}

const problemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    companies: [{ type: String }],
    marks: { type: Number, required: true },
    constraints: { type: String },
    examples: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String },
      },
    ],
    testCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
      },
    ],
    starterCode: { type: Map, of: String },
    solution: { type: String },
    slug: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    acceptedSubmissions: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Problem = mongoose.model<IProblem>('Problem', problemSchema);
