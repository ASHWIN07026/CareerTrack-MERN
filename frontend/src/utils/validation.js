export function validateApplication(values) {
  const errors = {};
  if (!values.company.trim()) errors.company = 'Company is required';
  else if (values.company.trim().length > 120) errors.company = 'Company must be at most 120 characters';
  if (!values.jobTitle.trim()) errors.jobTitle = 'Job title is required';
  else if (values.jobTitle.trim().length > 120) errors.jobTitle = 'Job title must be at most 120 characters';
  if (values.jobUrl.trim() && !/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(values.jobUrl.trim())) {
    errors.jobUrl = 'Enter a valid URL starting with http:// or https://';
  }
  if (values.salary.length > 60) errors.salary = 'Salary must be at most 60 characters';
  if (values.notes.length > 2000) errors.notes = 'Notes must be at most 2000 characters';
  if (values.status === 'Interview' && !values.interviewDate) errors.interviewDate = 'Add the interview date for Interview status';
  return errors;
}
