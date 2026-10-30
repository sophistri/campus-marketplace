import { Router } from 'express';
import {
  signup,
  verifyEmail,
  login,
  refresh,
  logout,
  me,
  resendVerification,
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { 
  signupSchema, 
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema
} from '../validators/auth.schema.js';

import rateLimit from 'express-rate-limit';

const router = Router();

const tooMany = { error: 'Too many attempts. Take a hint and stop it already' };

// Password guessing: only failed logins count, so people who sign in normally
// are never affected. Limits are per IP address.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: tooMany,
});

// Signup, resend and verify each send or burn a verification email,
// so every request counts, whether it succeeds or not.
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: tooMany,
});

// gotta validate each schemaaaa
// a verification email should validate the corresponing email and that email only
// makes sure tht empty null vals dont do anythiing

router.post('/signup', emailLimiter, validate(signupSchema), signup);
router.post('/verify-email', emailLimiter, validate(verifyEmailSchema), verifyEmail);
router.post('/resend-verification', emailLimiter, validate(resendVerificationSchema), resendVerification);
router.post('/login', loginLimiter, validate(loginSchema), login);

router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;
