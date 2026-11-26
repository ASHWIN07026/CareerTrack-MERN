import { body, param, query, validationResult } from 'express-validator';
import isISO8601 from 'validator/lib/isISO8601.js';
import { EMPLOYMENT_TYPES, STATUSES, WORK_MODES } from '../models/Application.js';

const optionalText = (field, max) =>
  body(field).optional({ values: 'null' }).isString().withMessage(`${field} must be text`).trim()
    .isLength({ max }).withMessage(`${field} must be at most ${max} characters`);

const optionalDate = (field) =>
  body(field)
    .optional()
    .custom((value) => value === null || value === '' || (typeof value === 'string' && isISO8601(value)))
    .withMessage(`${field} must be a valid date`)
    .customSanitizer((value) => (value ? new Date(value) : null));

const coreText = (field, label, required) => {
  const chain = required
    ? body(field).exists({ values: 'falsy' }).withMessage(`${label} is required`).bail()
    : body(field).optional();
  return chain
    .isString().withMessage(`${label} must be text`).bail()
    .trim().notEmpty().withMessage(`${label} is required`)
    .isLength({ max: 120 }).withMessage(`${label} must be at most 120 characters`);
};

const applicationFields = (requireCore) => [
  coreText('company', 'Company', requireCore),
  coreText('jobTitle', 'Job title', requireCore),
  body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  body('workMode').optional().isIn([...WORK_MODES, '']).withMessage(`Work mode must be one of: ${WORK_MODES.join(', ')}`),
  body('employmentType').optional().isIn([...EMPLOYMENT_TYPES, ''])
    .withMessage(`Employment type must be one of: ${EMPLOYMENT_TYPES.join(', ')}`),
  optionalText('location', 120),
  optionalText('salary', 60),
  optionalText('notes', 2000),
  body('jobUrl').optional({ values: 'falsy' }).isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Job URL must start with http:// or https://').isLength({ max: 500 }),
  optionalDate('applicationDate'),
  optionalDate('interviewDate'),
];

function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array({ onlyFirstError: true }).map((e) => ({ field: e.path, message: e.msg }));
  return res.status(400).json({ success: false, message: errors[0].message, errors });
}

export const validateId = [param('id').isMongoId().withMessage('Invalid application id'), handleValidation];
export const validateCreate = [...applicationFields(true), handleValidation];
export const validateUpdate = [...validateId.slice(0, 1), ...applicationFields(false), handleValidation];
export const validateList = [
  query('status').optional({ values: 'falsy' }).isIn(STATUSES).withMessage('Invalid status filter'),
  query('search').optional().isString().isLength({ max: 100 }).withMessage('Search is too long'),
  query('sort').optional().isIn(['newest', 'oldest', 'applicationDate', 'interviewDate', 'company'])
    .withMessage('Invalid sort option'),
  handleValidation,
];
