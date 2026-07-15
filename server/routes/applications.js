import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Student only)
router.post('/', protect, authorize('student'), async (req, res) => {
  const { jobId, notes } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Verify student has a resume uploaded
    const student = await User.findById(req.user._id);
    if (!student.profile.resumeUrl) {
      return res.status(400).json({ message: 'Please upload a resume before applying' });
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({
      job: jobId,
      student: req.user._id,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: jobId,
      student: req.user._id,
      resumeUrl: student.profile.resumeUrl,
      resumeOriginalName: student.profile.resumeOriginalName,
      notes: notes || '',
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get applications based on role
// @route   GET /api/applications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      // Students see their own applications
      const apps = await Application.find({ student: req.user._id })
        .populate('job')
        .sort({ createdAt: -1 });
      return res.json(apps);
    }

    if (req.user.role === 'recruiter') {
      // Recruiters see applications for jobs they posted
      const jobs = await Job.find({ postedBy: req.user._id });
      const jobIds = jobs.map(job => job._id);

      const apps = await Application.find({ job: { $in: jobIds } })
        .populate('job')
        .populate('student', 'name email profile')
        .sort({ createdAt: -1 });
      return res.json(apps);
    }

    if (req.user.role === 'admin') {
      // Admins see everything
      const apps = await Application.find()
        .populate('job')
        .populate('student', 'name email profile')
        .sort({ createdAt: -1 });
      return res.json(apps);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update application status (Shortlisted, Interview, Selected)
// @route   PUT /api/applications/:id
// @access  Private (Recruiter or Admin)
router.put('/:id', protect, authorize('recruiter', 'admin'), async (req, res) => {
  const { status, notes } = req.body;

  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('student', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify ownership for recruiters
    if (req.user.role === 'recruiter' && application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update candidate status for this job' });
    }

    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;

    const updatedApp = await application.save();

    // Create a real-time & database notification for the student
    const notifTitle = `Application Update: ${application.job.company}`;
    const notifContent = `Your application for ${application.job.title} has been updated to "${status}".`;
    
    const notification = await Notification.create({
      user: application.student._id,
      title: notifTitle,
      content: notifContent,
      type: status === 'Selected' ? 'success' : status === 'Interview' ? 'info' : 'warning',
    });

    // Real-Time Emit via Socket.io
    if (req.io) {
      // Emit to a specific room for the student user
      req.io.to(application.student._id.toString()).emit('notification', {
        _id: notification._id,
        title: notifTitle,
        content: notifContent,
        type: notification.type,
        read: false,
        createdAt: notification.createdAt,
        applicationId: application._id,
      });
      console.log(`Socket.io: Emitted notification to user room ${application.student._id}`);
    }

    res.json(updatedApp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
