import mongoose, { Schema } from 'mongoose';

const submissionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    languageId: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'wrong_answer', 'time_limit', 'runtime_error', 'compile_error'], default: 'pending' },
    runtime: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    marksAwarded: { type: Number, default: 0 },
    testResults: [{ passed: Boolean, input: String, expected: String, actual: String, runtime: Number }],
  },
  { timestamps: true },
);

submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ user: 1, createdAt: -1 });

export const Submission = mongoose.model('Submission', submissionSchema);