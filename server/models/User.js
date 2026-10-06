import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'recruiter', 'admin'],
      default: 'student',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    profile: {
      phone: String,
      department: String,
      graduationYear: Number,
      cgpa: Number,
      skills: [String],
      resumeUrl: String,
      resumeOriginalName: String,
      atsScore: {
        type: Number,
        default: 0,
      },
      resumeSuggestions: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate & hash email verification token
UserSchema.methods.getVerificationToken = function () {
  // Generate token
  const token = crypto.randomBytes(32).toString('hex');

  // Hash and set to verificationToken field
  this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');

  // Set expire to 24 hours from now
  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

  return token;
};

// Generate & hash reset password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const token = crypto.randomBytes(32).toString('hex');

  // Hash and set to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

  // Set expire to 1 hour from now
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return token;
};

const User = mongoose.model('User', UserSchema);
export default User;
