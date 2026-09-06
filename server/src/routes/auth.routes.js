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
import { signupSchema, loginSchema } from '../validators/auth.schema.js';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;