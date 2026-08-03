import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 200 },
    totalScore: { type: Number, default: 0 },
    solvedProblems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
    dsaSheetProgress: [{ type: String }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastSolvedDate: { type: Date, default: null },
    },
    dailyActivity: [{ date: String, count: Number }],
  },
  { timestamps: true },
);

userSchema.index({ totalScore: -1 });
userSchema.index({ solvedProblems: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
