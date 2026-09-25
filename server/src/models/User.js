import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  avatarUrl: String,
  campus: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isSuspended: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  refreshTokenHash: String, // store a hash of the current valid refresh token
}, { timestamps: true });

export default mongoose.model('User', userSchema);