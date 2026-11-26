import mongoose from 'mongoose';

export const STATUSES = ['Saved', 'Applied', 'Interview', 'Offer', 'Selected', 'Rejected'];
export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'Temporary'];
export const WORK_MODES = ['On-site', 'Remote', 'Hybrid'];

const applicationSchema = new mongoose.Schema(
  {
    company: { type: String, required: [true, 'Company is required'], trim: true, maxlength: 120 },
    jobTitle: { type: String, required: [true, 'Job title is required'], trim: true, maxlength: 120 },
    status: { type: String, enum: STATUSES, default: 'Saved' },
    location: { type: String, trim: true, maxlength: 120, default: '' },
    workMode: { type: String, enum: [...WORK_MODES, ''], default: '' },
    employmentType: { type: String, enum: [...EMPLOYMENT_TYPES, ''], default: '' },
    salary: { type: String, trim: true, maxlength: 60, default: '' },
    jobUrl: { type: String, trim: true, maxlength: 500, default: '' },
    applicationDate: { type: Date, default: null },
    interviewDate: { type: Date, default: null },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  { timestamps: true },
);

applicationSchema.index({ company: 'text', jobTitle: 'text' });
applicationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Application', applicationSchema);
