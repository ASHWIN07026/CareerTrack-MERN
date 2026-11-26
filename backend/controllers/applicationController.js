import { matchedData } from 'express-validator';
import Application, { STATUSES } from '../models/Application.js';

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  applicationDate: { applicationDate: -1, createdAt: -1 },
  interviewDate: { interviewDate: 1, createdAt: -1 },
  company: { company: 1, createdAt: -1 },
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function notFoundError() {
  const err = new Error('Application not found');
  err.status = 404;
  return err;
}

export async function listApplications(req, res) {
  const { search = '', status = '', sort = 'newest' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const term = search.trim();
  if (term) {
    const pattern = new RegExp(escapeRegex(term), 'i');
    filter.$or = [{ company: pattern }, { jobTitle: pattern }];
  }
  const applications = await Application.find(filter).sort(SORTS[sort] || SORTS.newest).lean();
  res.json({ success: true, count: applications.length, data: applications });
}

export async function getApplication(req, res) {
  const application = await Application.findById(req.params.id).lean();
  if (!application) throw notFoundError();
  res.json({ success: true, data: application });
}

export async function createApplication(req, res) {
  const application = await Application.create(matchedData(req, { locations: ['body'] }));
  res.status(201).json({ success: true, data: application });
}

export async function updateApplication(req, res) {
  const updates = matchedData(req, { locations: ['body'] });
  const application = await Application.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!application) throw notFoundError();
  res.json({ success: true, data: application });
}

export async function deleteApplication(req, res) {
  const application = await Application.findByIdAndDelete(req.params.id);
  if (!application) throw notFoundError();
  res.json({ success: true, data: { _id: application._id } });
}

export async function getStats(req, res) {
  const now = new Date();
  const [statusCounts, upcomingInterviews, upcomingInterviewCount, total] = await Promise.all([
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Application.find({ interviewDate: { $gte: now } })
      .sort({ interviewDate: 1 })
      .limit(5)
      .select('company jobTitle interviewDate status')
      .lean(),
    Application.countDocuments({ interviewDate: { $gte: now } }),
    Application.countDocuments(),
  ]);
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const { _id, count } of statusCounts) {
    if (_id in byStatus) byStatus[_id] = count;
  }
  res.json({
    success: true,
    data: {
      total,
      byStatus,
      upcomingInterviewCount,
      upcomingInterviews,
    },
  });
}
