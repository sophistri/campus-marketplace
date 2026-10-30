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

const router = Router();

// gotta validate each schemaaaa
// a verification email should validate the corresponing email and that email only
// makes sure tht empty null vals dont do anythiing

router.post('/signup', validate(signupSchema), signup);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/resend-verification', validate(resendVerificationSchema), resendVerification);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;
