import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  user: mongoose.Types.ObjectId;
  problem: mongoose.Types.ObjectId;
  code: string;
  language: string;
  languageId: number;
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'compile_error';
  runtime: number;
  marksAwarded: number;
  testResults: {
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    runtime: number;
  }[];
}

const submissionSchema = new Schema<ISubmission>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    languageId: { type: Number, required: true },
    status: {
      type: String,
      enum: ['accepted', 'wrong_answer', 'runtime_error', 'compile_error'],
      required: true,
    },
    runtime: { type: Number, required: true },
    marksAwarded: { type: Number, default: 0 },
    testResults: [
      {
        passed: { type: Boolean, required: true },
        input: { type: String, required: true },
        expected: { type: String, required: true },
        actual: { type: String, required: true },
        runtime: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);
