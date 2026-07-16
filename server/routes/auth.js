import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

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

// @desc    Register a new user
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
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
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
