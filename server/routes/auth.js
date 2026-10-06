import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

const router = express.Router();

// Configure Cloudinary if credentials are provided in env
const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary successfully configured for resume uploads.');
} else {
  console.log('Cloudinary credentials missing or default. Falling back to local disk storage.');
}

// Configure Multer for File Uploads
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for PDF, DOCX, and Text files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.docx', '.txt', '.doc'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only resumes of types PDF, DOCX, DOC, or TXT are allowed'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_placify_jwt_key_9988', {
    expiresIn: '30d',
  });
};

// Helper to normalize Client URL without trailing slashes
const getClientUrl = () => {
  return (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
};

// @desc    Register a new user & send verification link
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address format (e.g. name@domain.com)' });
  }

  // Validate password strength
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }
  const hasNum = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(password);
  if (!hasNum || !hasSpecial) {
    return res.status(400).json({ message: 'Password must contain at least one number and one special character' });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
      }

      // If user signed up previously but never verified, update info and resend verification link
      existingUser.name = name || existingUser.name;
      existingUser.password = password; // Will be hashed by pre-save
      existingUser.role = role || existingUser.role;
      const verificationToken = existingUser.getVerificationToken();
      await existingUser.save();

      const clientUrl = getClientUrl();
      const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(existingUser.email)}`;

      // Send verification email in background without blocking response
      sendVerificationEmail({
        email: existingUser.email,
        name: existingUser.name,
        verificationUrl,
      }).catch((err) => {
        console.error('Background email dispatch failed:', err.message);
      });

      return res.status(200).json({
        message: 'A fresh verification link has been sent to your email. Please verify your account to continue.',
        email: existingUser.email,
        requiresVerification: true,
      });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      isVerified: false,
    });

    const verificationToken = user.getVerificationToken();
    await user.save();

    const clientUrl = getClientUrl();
    const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

    // Send verification email in background without blocking response
    sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationUrl,
    }).catch((err) => {
      console.error('Background email dispatch failed:', err.message);
    });

    res.status(201).json({
      message: 'Registration successful! We sent a verification link to your email. Please click the link to activate your account.',
      email: user.email,
      requiresVerification: true,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

// @desc    Verify email address using link token
// @route   GET /api/auth/verify-email or POST /api/auth/verify-email
// @access  Public
const handleVerifyEmail = async (req, res) => {
  const token = req.query.token || req.body.token;
  const email = req.query.email || req.body.email;

  if (!token || !email) {
    return res.status(400).json({ message: 'Missing verification token or email address.' });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase(),
      verificationToken: hashedToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      // Check if user is already verified
      const alreadyVerifiedUser = await User.findOne({ email: email.toLowerCase() });
      if (alreadyVerifiedUser && alreadyVerifiedUser.isVerified) {
        return res.status(200).json({
          _id: alreadyVerifiedUser._id,
          name: alreadyVerifiedUser.name,
          email: alreadyVerifiedUser.email,
          role: alreadyVerifiedUser.role,
          token: generateToken(alreadyVerifiedUser._id),
          message: 'Your email has already been verified. You are now logged in!',
        });
      }

      return res.status(400).json({
        message: 'Invalid or expired verification link. Please request a new verification link.',
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message: 'Email successfully verified! Welcome to Placify.',
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: error.message || 'Server error during email verification' });
  }
};

router.get('/verify-email', handleVerifyEmail);
router.post('/verify-email', handleVerifyEmail);

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide an email address' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This email is already verified. You can log in directly.' });
    }

    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    const clientUrl = getClientUrl();
    const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

    // Send in background without blocking response
    sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationUrl,
    }).catch((err) => {
      console.error('Background resend email failed:', err.message);
    });

    res.status(200).json({
      message: 'A fresh verification link has been sent to your email. Please check your inbox.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: error.message || 'Server error while sending verification email' });
  }
});

// @desc    Auth user & get token (Requires verified email)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check email verification
    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Your email has not been verified yet. Please check your inbox or click below to resend the link.',
        isUnverified: true,
        email: user.email,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Forgot Password - Send reset link to email
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide your email address' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const clientUrl = getClientUrl();
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // Send in background without blocking response
    sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl,
    }).catch((err) => {
      console.error('Background password reset email failed:', err.message);
    });

    res.status(200).json({
      message: 'Password reset link sent! Please check your email inbox.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message || 'Server error processing password reset' });
  }
});

// @desc    Reset Password using token from link
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password) {
    return res.status(400).json({ message: 'Please provide reset token, email, and new password.' });
  }

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }
  const hasNum = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(password);
  if (!hasNum || !hasSpecial) {
    return res.status(400).json({ message: 'Password must contain at least one number and one special character' });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired password reset link. Please request a new one.',
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    // Auto-verify if they reset via email link
    user.isVerified = true;

    await user.save();

    res.status(200).json({
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message || 'Server error resetting password' });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      if (req.body.password) {
        user.password = req.body.password;
      }

      if (user.role === 'student') {
        user.profile.phone = req.body.phone !== undefined ? req.body.phone : user.profile.phone;
        user.profile.department = req.body.department !== undefined ? req.body.department : user.profile.department;
        user.profile.graduationYear = req.body.graduationYear !== undefined ? req.body.graduationYear : user.profile.graduationYear;
        user.profile.cgpa = req.body.cgpa !== undefined ? req.body.cgpa : user.profile.cgpa;
        user.profile.skills = req.body.skills !== undefined ? req.body.skills : user.profile.skills;
      }

      const updatedUser = await user.save();
      const userRes = await User.findById(updatedUser._id).select('-password');
      res.json(userRes);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Upload resume & analyze ATS Score
// @route   POST /api/auth/upload-resume
// @access  Private
router.post('/upload-resume', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    // ATS SCANNER (Fully Functional Mock-Parser)
    // Read the uploaded file to check contents
    let fileContentString = '';
    try {
      const buffer = fs.readFileSync(filePath);
      // Clean buffer into string representation to scan for raw ASCII text
      fileContentString = buffer.toString('utf8').toLowerCase();
    } catch (e) {
      console.warn('Could not read file for keyword parsing:', e);
    }

    // Standard list of keywords to search
    const technicalKeywords = [
      'react', 'node', 'express', 'mongodb', 'mongoose', 'javascript', 'html', 'css', 
      'python', 'sql', 'java', 'git', 'github', 'typescript', 'aws', 'docker', 'kubernetes',
      'c++', 'c#', 'rest api', 'graphql', 'next.js', 'tailwind', 'bootstrap', 'redux'
    ];

    const projectKeywords = [
      'project', 'experience', 'education', 'skills', 'achievement', 'portfolio', 
      'certifications', 'internship', 'developed', 'implemented', 'designed', 'built'
    ];

    let foundKeywords = [];
    let score = 30; // base score for uploading a file

    // Check file content string and original name for keywords
    const searchString = (fileContentString + ' ' + originalName.toLowerCase());

    technicalKeywords.forEach(kw => {
      if (searchString.includes(kw)) {
        foundKeywords.push(kw);
        score += 2.5; // add score points for tech keywords
      }
    });

    projectKeywords.forEach(kw => {
      if (searchString.includes(kw)) {
        score += 2; // add score points for formatting keywords
      }
    });

    // Constrain score between 40 and 100
    score = Math.min(100, Math.max(40, Math.round(score)));

    // Generate smart suggestions based on missing key items
    let suggestions = [];
    if (!searchString.includes('project')) {
      suggestions.push('Add a dedicated "Projects" section detailing your key builds.');
    }
    if (!searchString.includes('experience') && !searchString.includes('internship')) {
      suggestions.push('Include professional or academic experiences/internships to show practical application.');
    }
    if (foundKeywords.length < 5) {
      suggestions.push('List more technical skills. Include standard terms like Git, SQL, or specific languages.');
    }
    if (!searchString.includes('portfolio') && !searchString.includes('github')) {
      suggestions.push('Include links to your GitHub profile or personal portfolio website.');
    }
    if (!searchString.includes('certification') && !searchString.includes('achievement')) {
      suggestions.push('Add an Achievements/Certifications section to stand out.');
    }

    if (suggestions.length === 0) {
      suggestions.push('Resume looks excellent! Keep it updated with your latest projects.');
    }

    // Save details to student user profile
    let finalResumeUrl = `/uploads/${path.basename(filePath)}`;

    if (useCloudinary) {
      try {
        console.log('Uploading file to Cloudinary...');
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: 'placify_resumes',
          resource_type: 'raw',
        });
        finalResumeUrl = uploadResult.secure_url;
        console.log('Cloudinary Upload Success:', finalResumeUrl);

        // Delete temporary local file
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Cloudinary upload error, falling back to local storage:', err.message);
        finalResumeUrl = `/uploads/${path.basename(filePath)}`;
      }
    } else {
      finalResumeUrl = `/uploads/${path.basename(filePath)}`;
    }

    user.profile.resumeUrl = finalResumeUrl;
    user.profile.resumeOriginalName = originalName;
    user.profile.atsScore = score;
    user.profile.resumeSuggestions = suggestions;

    await user.save();

    res.json({
      message: 'Resume uploaded and analyzed successfully',
      resumeUrl: user.profile.resumeUrl,
      resumeOriginalName: user.profile.resumeOriginalName,
      atsScore: user.profile.atsScore,
      resumeSuggestions: user.profile.resumeSuggestions,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Private (Admin only)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
