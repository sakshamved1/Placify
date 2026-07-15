import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [String],
    skills: [String],
    salary: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Full Time', 'Part Time', 'Internship', 'Contract'],
      default: 'Full Time',
    },
    remote: {
      type: Boolean,
      default: false,
    },
    deadline: {
      type: Date,
    },
    experience: {
      type: String,
      default: 'Entry Level',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    externalUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model('Job', JobSchema);
export default Job;
