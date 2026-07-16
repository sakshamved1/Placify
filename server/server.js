import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import notificationRoutes from './routes/notifications.js';
import aiRoutes from './routes/ai.js';

// Models for Seeding
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach Socket.io to Request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Static files for Resume Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log('Socket.io: Client connected:', socket.id);

  // Users join rooms matching their MongoDB ID for direct notifications
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`Socket.io: User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('Socket.io: Client disconnected:', socket.id);
  });
});

// Seed Initial Database Data
const seedDB = async () => {
  try {
    const userCount = await User.countDocuments();
    let recruiterId;

    if (userCount === 0) {
      console.log('Database empty! Seeding default mock users...');

      // 1. Create Default Users (passwords hashed on pre-save)
      const student = await User.create({
        name: 'Saksham Sharma',
        email: 'student@placify.com',
        password: 'password123',
        role: 'student',
        profile: {
          phone: '+1 234 567 8900',
          department: 'Computer Science',
          graduationYear: 2027,
          cgpa: 9.2,
          skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'Tailwind CSS'],
        },
      });

      const recruiter = await User.create({
        name: 'Jane Doe',
        email: 'recruiter@placify.com',
        password: 'password123',
        role: 'recruiter',
      });

      const admin = await User.create({
        name: 'System Admin',
        email: 'admin@placify.com',
        password: 'password123',
        role: 'admin',
      });

      recruiterId = recruiter._id;
      console.log('Users seeded successfully.');
    } else {
      const recruiter = await User.findOne({ role: 'recruiter' });
      recruiterId = recruiter ? recruiter._id : null;
    }

    const jobCount = await Job.countDocuments();
    if (jobCount < 50 && recruiterId) {
      console.log('Fewer than 50 jobs found. Clearing mock listings and seeding live Indian IT jobs...');
      // Preserve jobs that have active applications to maintain database relationships
      const activeJobIds = await Application.distinct('job');
      await Job.deleteMany({ _id: { $nin: activeJobIds } });

      // 2. Fetch Live Indian IT Developer Jobs from Adzuna API
      const adzunaId = process.env.ADZUNA_APP_ID;
      const adzunaKey = process.env.ADZUNA_APP_KEY;
      
      const isAdzunaActive = !!adzunaId && adzunaId !== 'your_adzuna_app_id';
      console.log(isAdzunaActive ? 'Fetching live Indian IT jobs from Adzuna API...' : 'Adzuna credentials missing. Loading premium Indian IT placements fallback...');

      try {
        if (!isAdzunaActive) {
          throw new Error('Adzuna API credentials missing');
        }

        const response = await fetch(`https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${adzunaId}&app_key=${adzunaKey}&results_per_page=40&category=it-jobs&content-type=application/json`);
        const apiData = await response.json();
        
        if (apiData && apiData.results && apiData.results.length > 0) {
          const liveJobs = apiData.results.map(job => {
            const t = job.title.toLowerCase();
            const desc = job.description || '';
            
            // Extract skills from title and description
            const skillList = ['react', 'node.js', 'express', 'mongodb', 'javascript', 'typescript', 'python', 'java', 'sql', 'c++', 'aws', 'docker', 'html', 'css', 'django', 'fastapi', 'rest api'];
            const matchedSkills = skillList.filter(s => (t + ' ' + desc.toLowerCase()).includes(s));
            const skills = matchedSkills.length > 0 ? matchedSkills : ['Software Engineering', 'JavaScript'];

            // Map experience
            const isSenior = t.includes('senior') || t.includes('sr') || t.includes('lead') || t.includes('staff') || t.includes('principal');
            const isJunior = t.includes('junior') || t.includes('jr') || t.includes('associate') || t.includes('intern');
            const experience = isSenior ? 'Senior Level' : isJunior ? 'Entry Level' : 'Mid Level';

            // Format salary to LPA (Lakhs Per Annum) for India
            let salaryStr = '₹6 - ₹12 LPA';
            if (job.salary_min) {
              const minLPA = Math.round(job.salary_min / 100000);
              if (job.salary_max) {
                const maxLPA = Math.round(job.salary_max / 100000);
                salaryStr = `₹${minLPA} - ₹${maxLPA} LPA`;
              } else {
                salaryStr = `₹${minLPA} LPA+`;
              }
            }
            
            return {
              title: job.title,
              company: job.company?.display_name || 'Indian IT Enterprise',
              logo: 'external',
              description: job.description || 'Join our engineering team to build scalable software services.',
              requirements: [
                `Required Location: ${job.location?.display_name || 'India'}`,
                `Salary Package: ${salaryStr}`,
                `Experience Tier: ${experience}`
              ],
              skills: skills.slice(0, 5),
              salary: salaryStr,
              location: job.location?.display_name || 'India',
              type: job.contract_time === 'part_time' ? 'Part Time' : 'Full Time',
              remote: t.includes('remote') || desc.toLowerCase().includes('remote'),
              deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              experience,
              postedBy: recruiterId,
              externalUrl: job.redirect_url || '',
            };
          });

          await Job.create(liveJobs);
          console.log(`Successfully seeded ${liveJobs.length} live Indian IT jobs from Adzuna API.`);
        } else {
          throw new Error('No results returned from Adzuna');
        }
      } catch (err) {
        console.error('Adzuna API Sync skipped/failed. Falling back to default high-quality Indian IT placements:', err.message);
        await Job.create([
          {
            title: 'Frontend Engineer',
            company: 'Flipkart',
            logo: 'flipkart',
            description: 'Join the shopping experience team. You will build highly interactive, responsive web interfaces, optimize checkout flows, and scale web applications for millions of daily active users.',
            requirements: [
              '2+ years of experience with React, JavaScript, and Tailwind CSS.',
              'Familiarity with performance diagnostics, server-side rendering, and caching.',
              'Ability to translate product mockups into pixel-perfect modular components.'
            ],
            skills: ['React', 'JavaScript', 'Tailwind CSS', 'Redux', 'Web Performance'],
            salary: '₹18 - ₹24 LPA',
            location: 'Bengaluru, Karnataka',
            type: 'Full Time',
            remote: false,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            experience: 'Mid-Senior Level',
            postedBy: recruiterId,
          },
          {
            title: 'Backend Systems Engineer',
            company: 'Paytm',
            logo: 'paytm',
            description: 'Design and deploy secure payment gateway APIs. You will work on microservices architecture, scaling transactional databases, and maintaining real-time wallet balances.',
            requirements: [
              'Strong knowledge of Node.js/Java and relational/non-relational databases.',
              'Experience building high-throughput RESTful services and scaling message brokers.',
              'Understanding of API security, JWT token validation, and encryption.'
            ],
            skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'REST APIs'],
            salary: '₹14 - ₹20 LPA',
            location: 'Noida, UP',
            type: 'Full Time',
            remote: false,
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            experience: 'Senior Level',
            postedBy: recruiterId,
          },
          {
            title: 'Full Stack Web Developer',
            company: 'Zoho',
            logo: 'zoho',
            description: 'Help build the next generation of SaaS business applications. You will code interactive user dashboards and construct REST APIs to sync calendar databases.',
            requirements: [
              'Familiarity with full stack paradigms (React and Node/Java/Python).',
              'Strong problem-solving foundations and database query optimization.',
              'Comfortable working in a fast-paced collaborative environment.'
            ],
            skills: ['React', 'Node.js', 'PostgreSQL', 'JavaScript', 'HTML/CSS'],
            salary: '₹8 - ₹12 LPA',
            location: 'Chennai, TN',
            type: 'Full Time',
            remote: true,
            deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            experience: 'Entry Level',
            postedBy: recruiterId,
          },
          {
            title: 'Software Engineer II (Backend)',
            company: 'Swiggy',
            logo: 'swiggy',
            description: 'Work on our core delivery allocation backend. You will optimize geospatial matching algorithms, scale Redis state stores, and secure REST communication nodes.',
            requirements: [
              'Strong coding depth in Java, Go, or Node.js.',
              'Experience working with geospatial databases (PostGIS, Redis GEO) is a huge plus.',
              'Familiarity with distributed queues like Kafka or RabbitMQ.'
            ],
            skills: ['Java', 'Node.js', 'Redis', 'Kafka', 'SQL'],
            salary: '₹22 - ₹30 LPA',
            location: 'Hyderabad, TS',
            type: 'Full Time',
            remote: false,
            deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
            experience: 'Mid-Senior Level',
            postedBy: recruiterId,
          },
          {
            title: 'Mobile App Developer (React Native)',
            company: 'Zomato',
            logo: 'zomato',
            description: 'Architect mobile layouts for Zomatos customer ordering interface. Focus on fast rendering cycles, caching frameworks, and map location tracking modules.',
            requirements: [
              'Solid experience shipping production React Native or Flutter apps.',
              'Strong CSS layout foundations and animations.',
              'Understanding of iOS/Android native bridges.'
            ],
            skills: ['React Native', 'TypeScript', 'JavaScript', 'Redux', 'iOS/Android'],
            salary: '₹16 - ₹22 LPA',
            location: 'Gurugram, HR',
            type: 'Full Time',
            remote: false,
            deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
            experience: 'Mid-Senior Level',
            postedBy: recruiterId,
          },
          {
            title: 'DevOps & Infrastructure Engineer',
            company: 'Razorpay',
            logo: 'razorpay',
            description: 'Scale our cloud infrastructure nodes. Set up CI/CD actions, monitor container deployments, configure firewall rules, and maintain high availability metrics.',
            requirements: [
              'Experience managing cloud services on AWS or GCP.',
              'Proficiency with Docker, Kubernetes, and Terraform.',
              'Scripting capabilities in Python or Bash.'
            ],
            skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
            salary: '₹15 - ₹20 LPA',
            location: 'Pune, MH',
            type: 'Full Time',
            remote: true,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            experience: 'Mid-Senior Level',
            postedBy: recruiterId,
          },
          {
            title: 'Assistant System Engineer (Trainee)',
            company: 'TCS',
            logo: 'tcs',
            description: 'Begin your software developer career. Work across Java, SQL, and enterprise software engineering modules with structured corporate induction pathways.',
            requirements: [
              'B.E. / B.Tech / M.C.A. in Computer Science or related IT stream.',
              'Basic knowledge of software algorithms, loops, and OOP concepts.',
              'Strong logical analytical reasoning capabilities.'
            ],
            skills: ['Java', 'SQL', 'C++', 'Software Engineering', 'HTML/CSS'],
            salary: '₹4 - ₹7 LPA',
            location: 'Mumbai, MH',
            type: 'Full Time',
            remote: false,
            deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            experience: 'Entry Level',
            postedBy: recruiterId,
          },
          {
            title: 'Systems Engineer',
            company: 'Infosys',
            logo: 'infosys',
            description: 'Construct enterprise cloud services and configure database tables. Train across advanced full stack architectures under Infosys global education modules.',
            requirements: [
              'Undergraduate degree in CS, IT, or Electronics stream.',
              'Familiarity with programming paradigms (Python, Java, or C#).',
              'Strong communication and diagnostic skills.'
            ],
            skills: ['Python', 'Java', 'SQL', 'Git', 'HTML/CSS'],
            salary: '₹4 - ₹6 LPA',
            location: 'Pune, MH',
            type: 'Full Time',
            remote: false,
            deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            experience: 'Entry Level',
            postedBy: recruiterId,
          },
          {
            title: 'Project Engineer',
            company: 'Wipro',
            logo: 'wipro',
            description: 'Participate in client software builds and manage application testing nodes. Optimize code, verify databases, and document APIs.',
            requirements: [
              'Technical graduate degree (B.Tech / B.E. / B.Sc CS).',
              'Basic loops and database query writing competencies.',
              'Eagerness to adopt and learn new tools.'
            ],
            skills: ['JavaScript', 'Java', 'SQL', 'Software Testing', 'HTML/CSS'],
            salary: '₹4 - ₹6 LPA',
            location: 'Bengaluru, Karnataka',
            type: 'Full Time',
            remote: false,
            deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            experience: 'Entry Level',
            postedBy: recruiterId,
          },
          {
            title: 'Machine Learning Engineer',
            company: 'Ola',
            logo: 'ola',
            description: 'Build predictive routing models and allocate trip matching heuristics. Optimize neural networks, train classifiers, and integrate Python API layers.',
            requirements: [
              'Experience deploying machine learning algorithms in production.',
              'Deep comfort with Python, Pandas, PyTorch, or Scikit-learn.',
              'Familiarity with SQL data extraction.'
            ],
            skills: ['Python', 'PyTorch', 'Pandas', 'SQL', 'Machine Learning'],
            salary: '₹20 - ₹28 LPA',
            location: 'Bengaluru, Karnataka',
            type: 'Full Time',
            remote: false,
            deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
            experience: 'Senior Level',
            postedBy: recruiterId,
          },
          {
            title: 'Cloud Security Architect',
            company: 'Freshworks',
            logo: 'freshworks',
            description: 'Protect cloud hosting layers and secure SaaS user databases. Identify network gaps, audit IAM policies, and deploy SSL communication protocols.',
            requirements: [
              'Deep understanding of AWS/Azure cloud security principles.',
              'Familiarity with vulnerability scans, SSL, and OAuth protocol standards.',
              'Experience auditing full stack node servers.'
            ],
            skills: ['AWS', 'Cloud Security', 'OAuth', 'Linux', 'Network Security'],
            salary: '₹14 - ₹22 LPA',
            location: 'Chennai, TN',
            type: 'Full Time',
            remote: true,
            deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
            experience: 'Senior Level',
            postedBy: recruiterId,
          },
          {
            title: 'Lead Data Scientist',
            company: 'Cred',
            logo: 'cred',
            description: 'Train user risk modeling matrices and optimize rewards distribution. Work with real-time financial tracking indices and scale python pipeline layers.',
            requirements: [
              '4+ years of data science background.',
              'Expertise in Python, SQL, and data visualization tools (Tableau/Metabase).',
              'Experience with high-throughput credit analytics.'
            ],
            skills: ['Python', 'SQL', 'Data Science', 'Machine Learning', 'Metabase'],
            salary: '₹24 - ₹32 LPA',
            location: 'Bengaluru, Karnataka',
            type: 'Full Time',
            remote: false,
            deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
            experience: 'Senior Level',
            postedBy: recruiterId,
          }
        ]);
        console.log('Sample fallback Indian IT jobs seeded successfully.');
      }
    }

    // Clean up orphaned applications whose job reference no longer exists in the database
    const currentJobs = await Job.find({}, '_id');
    const validJobIds = currentJobs.map(j => j._id.toString());
    const dbApps = await Application.find({});
    let deletedCount = 0;
    for (const app of dbApps) {
      if (app.job && !validJobIds.includes(app.job.toString())) {
        await Application.findByIdAndDelete(app._id);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} legacy orphaned applications to keep database consistent.`);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Start Server
const PORT = process.env.PORT || 5000;
connectDB().then(async () => {
  // Only seed if MongoDB is successfully connected
  if (mongoose.connection.readyState === 1) {
    await seedDB();
  } else {
    console.warn('Database offline: Skipping seeding.');
  }
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
