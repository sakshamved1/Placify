import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/User.js';
import Job from '../models/Job.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Initialize Gemini API
const geminiKey = process.env.GEMINI_API_KEY;
const isAIActive = !!geminiKey && geminiKey !== 'your_gemini_api_key';

let genAI = null;
if (isAIActive) {
  genAI = new GoogleGenerativeAI(geminiKey);
  console.log('Gemini AI Service successfully initialized on backend.');
} else {
  console.log('Gemini API key missing or placeholder. Running AI services in Mock Fallback Mode.');
}

// Helper to query Gemini with JSON constraint
const queryGeminiJSON = async (promptText) => {
  if (!isAIActive) {
    throw new Error('AI Service Offline');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(promptText);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini API Query Error:', err);
    throw err;
  }
};

// @desc    Analyze student profile & resume for ATS compliance
// @route   POST /api/ai/resume-feedback
// @access  Private (Student)
router.post('/resume-feedback', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const skills = user.profile?.skills || [];
    const department = user.profile?.department || 'Not specified';
    const cgpa = user.profile?.cgpa || 0;
    const resumeName = user.profile?.resumeOriginalName || 'None';

    const promptText = `
      You are a senior technical HR recruiter and ATS compliance system.
      Analyze this student profile:
      - Name: ${user.name}
      - Department: ${department}
      - CGPA: ${cgpa}/10
      - Skills: ${skills.join(', ')}
      - Resume File Name: ${resumeName}
      
      Generate a thorough career readiness evaluation and resume feedback.
      Your response MUST be a single, flat JSON object fitting this structure:
      {
        "atsScore": 82, // integer between 40 and 100
        "strengths": ["list 3 key strengths of this profile"],
        "weaknesses": ["list 2 key weaknesses or areas of improvement"],
        "suggestions": ["list 3 actionable changes they can make to get placed"],
        "formatCritique": "Provide a brief 2-sentence critique of their resume formatting and structure."
      }
    `;

    if (isAIActive) {
      const feedback = await queryGeminiJSON(promptText);
      // Save ATS score back to database atomically
      await User.findByIdAndUpdate(user._id, {
        $set: {
          'profile.atsScore': feedback.atsScore,
          'profile.resumeSuggestions': feedback.suggestions
        }
      });
      return res.json(feedback);
    } else {
      // Offline fallback mock data
      const mockScore = skills.length > 5 ? 85 : 65;
      const feedback = {
        atsScore: mockScore,
        strengths: [
          `Strong academic track record with a CGPA of ${cgpa}/10.`,
          `Practical skill validation in core stack: ${skills.slice(0, 3).join(', ') || 'General Development'}.`,
          `Clear candidate profile aligned with the ${department} department.`
        ],
        weaknesses: [
          skills.length < 5 ? 'Narrow framework distribution. Need to expand technology competencies.' : 'Lacks cloud infrastructure or CI/CD deployment validation.',
          'Missing professional portfolio links or concrete project links.'
        ],
        suggestions: [
          'Add a dedicated "Projects" section detailing your key builds.',
          'Deploy your active builds to platforms like Vercel or Render and link them.',
          'Integrate standard devtools like Git, SQL, and unit tests to your resume.'
        ],
        formatCritique: 'Resume structure is well-distributed. Ensure bullet points start with strong action verbs and font sizing remains uniform.'
      };
      await User.findByIdAndUpdate(user._id, {
        $set: {
          'profile.atsScore': feedback.atsScore,
          'profile.resumeSuggestions': feedback.suggestions
        }
      });
      return res.json(feedback);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Generate AI Match Score for Job comparison
// @route   POST /api/ai/job-match
// @access  Private (Student)
router.post('/job-match', protect, async (req, res) => {
  const { jobId } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const job = await Job.findById(jobId);

    if (!user || !job) {
      return res.status(404).json({ message: 'User or Job profile not found' });
    }

    const skills = user.profile?.skills || [];
    const promptText = `
      You are an AI hiring coordinator. Compare this candidate's skills against the job posting details.
      Candidate Skills: ${skills.join(', ')}
      Job Title: ${job.title}
      Company: ${job.company}
      Job Description: ${job.description}
      Job Skills Required: ${job.skills.join(', ')}
      
      Evaluate compatibility. Response MUST be a flat JSON object structured exactly like:
      {
        "matchScore": 87, // integer 0-100
        "strengths": ["list 2 reasons why the candidate is a strong fit for this role"],
        "gaps": ["list 2 missing skills or experience criteria"],
        "advice": "Give a 1-sentence tip on how to tailor the resume to improve matching."
      }
    `;

    if (isAIActive) {
      const matchResult = await queryGeminiJSON(promptText);
      return res.json(matchResult);
    } else {
      // Mock Match
      let matchCount = 0;
      job.skills.forEach(s => {
        if (skills.some(us => us.toLowerCase() === s.toLowerCase())) {
          matchCount++;
        }
      });
      const ratio = job.skills.length > 0 ? matchCount / job.skills.length : 0.5;
      const score = Math.round(50 + (ratio * 50));

      const matchResult = {
        matchScore: score,
        strengths: [
          `Candidate demonstrates competence in key stack items: ${skills.slice(0, 2).join(', ') || 'Core Stack'}.`,
          `Position location (${job.location}) and requirements are highly compatible.`
        ],
        gaps: [
          `Missing direct validation in some specified job skills: ${job.skills.filter(s => !skills.includes(s)).slice(0, 2).join(', ') || 'Advanced stack'}.`,
          'No industry internships or work experience verified in the profile.'
        ],
        advice: `Highlight your ${skills[0] || 'programming'} projects near the top of your resume and incorporate terms like '${job.skills[0] || 'REST API'}' directly.`
      };
      return res.json(matchResult);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Generate Tailored Practice Interview Questions
// @route   POST /api/ai/interview-prep
// @access  Private (Student)
router.post('/interview-prep', protect, async (req, res) => {
  const { jobId } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const job = await Job.findById(jobId);

    if (!user || !job) {
      return res.status(404).json({ message: 'User or Job profile not found' });
    }

    const skills = user.profile?.skills || [];
    const promptText = `
      You are an expert technical interviewer.
      Candidate Skills: ${skills.join(', ')}
      Job Opening: ${job.title} at ${job.company}
      Job Details: ${job.description}
      
      Generate 5 practice interview questions specifically tailored to this candidate and job.
      Provide both core technical questions (based on job stack) and situational/behavioral questions.
      Response MUST be a JSON object structured exactly like:
      {
        "questions": [
          {
            "question": "The question string",
            "intent": "Explain in 1 sentence why recruiters ask this question",
            "hint": "Brief tip on what topics to cover for a high score"
          }
        ]
      }
      Ensure "questions" array contains exactly 5 elements.
    `;

    if (isAIActive) {
      const prepData = await queryGeminiJSON(promptText);
      return res.json(prepData);
    } else {
      // Mock questions
      const prepData = {
        questions: [
          {
            question: `How would you utilize ${skills[0] || 'React'} to scale a front-end dashboard interface for a high-traffic system like ${job.company}?`,
            intent: 'To test your technical depth and ability to design performant UI components.',
            hint: 'Mention code-splitting, lazy loading, state caching, and DOM optimization hooks.'
          },
          {
            question: `Explain a challenging bug you encountered in a project. How did you diagnose and solve it?`,
            intent: 'To evaluate your debugging methodology, problem-solving skills, and resilience under pressure.',
            hint: 'Use the STAR method (Situation, Task, Action, Result) and focus on specific tools like logs, debuggers, or chrome devtools.'
          },
          {
            question: `The job description mentions ${job.skills[0] || 'REST APIs'}. How do you ensure secure endpoints in a full-stack Node backend?`,
            intent: 'To evaluate your engineering maturity regarding web security and database protection.',
            hint: 'Discuss JWT validation middlewares, password hashing, CORS configurations, and input sanitization.'
          },
          {
            question: `Why do you want to join ${job.company} as a ${job.title}, and how do your skills align with our mission?`,
            intent: 'To assess your company research, cultural compatibility, and long-term career interest.',
            hint: 'Mention the core features of the company (e.g. Stripe payment systems) and tie them to your own building experiences.'
          },
          {
            question: `How do you handle conflict or differing technical opinions when working in a development team?`,
            intent: 'To evaluate your communication, collaboration, and emotional intelligence.',
            hint: 'Emphasize listening, reviewing data/benchmarks objectively, and aligning on team objectives.'
          }
        ]
      };
      return res.json(prepData);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Generate Personalized Career Learning Roadmap
// @route   POST /api/ai/roadmap
// @access  Private (Student)
router.post('/roadmap', protect, async (req, res) => {
  const { targetRole } = req.body;

  if (!targetRole) {
    return res.status(400).json({ message: 'Target role is required' });
  }

  try {
    const user = await User.findById(req.user._id);
    const skills = user.profile?.skills || [];

    const promptText = `
      You are an AI career growth advisor.
      Student Current Skills: ${skills.join(', ')}
      Target Career Role: ${targetRole}
      
      Generate a customized learning plan containing exactly 4 milestones to help the student transition from their current skills to land this role.
      Response MUST be a JSON object structured exactly like:
      {
        "role": "${targetRole}",
        "milestones": [
          {
            "name": "Milestone name (e.g. Master Backend Databases)",
            "skills": ["Skill 1", "Skill 2"],
            "resources": ["Learning recommendation or free resource"],
            "duration": "e.g. 2 Weeks"
          }
        ]
      }
      Ensure the array has exactly 4 milestones.
    `;

    if (isAIActive) {
      const roadmapData = await queryGeminiJSON(promptText);
      return res.json(roadmapData);
    } else {
      // Mock Roadmap
      const roadmapData = {
        role: targetRole,
        milestones: [
          {
            name: `Phase 1: Validate Core Stack for ${targetRole}`,
            skills: ['Advanced JavaScript', 'REST Architecture', 'Git Workflows'],
            resources: ['MDN JavaScript Guides', 'The Odin Project Node.js Course'],
            duration: '2 Weeks'
          },
          {
            name: `Phase 2: Database Systems & Modeling`,
            skills: ['MongoDB Schema Design', 'SQL Queries', 'ORM Integration (Mongoose)'],
            resources: ['MongoDB University Basics', 'Prisma Schema Documentation'],
            duration: '3 Weeks'
          },
          {
            name: `Phase 3: Real-Time Services & Socket integration`,
            skills: ['WebSockets', 'Socket.io', 'State Synchronization'],
            resources: ['Socket.io Chat Tutorial', 'WebSockets MDN Documentation'],
            duration: '2 Weeks'
          },
          {
            name: `Phase 4: Capstone Portfolio Build & Deployment`,
            skills: ['CI/CD Pipelines', 'Cloud Deployment (Vercel/Render)', 'Performance Audit'],
            resources: ['GitHub Actions basics', 'Lighthouse web auditing tools'],
            duration: '3 Weeks'
          }
        ]
      };
      return res.json(roadmapData);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
