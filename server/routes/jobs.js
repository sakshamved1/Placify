import express from 'express';
import Job from '../models/Job.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, location, jobType, remote, minSalary, experience } = req.query;
    let query = {};

    // Text search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Job Type filter (Full Time, Part Time, Internship, Contract)
    if (jobType) {
      query.type = jobType;
    }

    // Remote filter
    if (remote !== undefined) {
      query.remote = remote === 'true';
    }

    // Experience filter
    if (experience) {
      query.experience = experience;
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Post a new job
// @route   POST /api/jobs
// @access  Private (Recruiter or Admin only)
router.post('/', protect, authorize('recruiter', 'admin'), async (req, res) => {
  const { title, company, description, requirements, skills, salary, location, type, remote, deadline, experience } = req.body;

  try {
    const job = await Job.create({
      title,
      company,
      description,
      requirements: requirements || [],
      skills: skills || [],
      salary,
      location,
      type: type || 'Full Time',
      remote: remote || false,
      deadline,
      experience: experience || 'Entry Level',
      postedBy: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter who posted it, or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership or admin role
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
