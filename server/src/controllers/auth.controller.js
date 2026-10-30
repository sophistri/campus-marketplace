import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  generateVerificationToken,
} from '../services/auth.service.js';
import { sendVerificationEmail } from '../services/email.service.js';
import { toPublicUser } from '../utils/serializeUser.js';

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function signup(req, res) {
  const { email, password, name, campus } = req.body;

  const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || '')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean); // so it ignores any case of empty strings
  const domain = email.split('@')[1]?.toLowerCase();

  if (allowedDomains.length && !allowedDomains.includes(domain)) {
    return res.status(400).json({ error: 'Please sign up with your campus email address' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await hashPassword(password);
  const verificationToken = generateVerificationToken();

  const user = await User.create({
    email,
    passwordHash,
    name,
    campus,
    verificationToken,
    verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  await sendVerificationEmail(user.email, verificationToken);

  res.status(201).json({ message: 'Account created. Check your email to verify.' });
}

export async function verifyEmail(req, res) {
  const { token } = req.body;

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired verification link' });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.json({ message: 'Email verified. You can now log in.' });
}

export async function login(req, res) {
  // get the email and pass theyre logging in with
  const { email, password } = req.body;

  // validate it, return error and why if not

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ error: 'Please verify your email before logging in' });
  }

  if (user.isSuspended) {
    return res.status(403).json({ error: 'This account has been suspended. Contact support.' });
  }

  // email passed all checks so generate the access token

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  
  //save the refresh token to db  (will be cleared on logout or suspension)
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  //save the refresh token to a cookie
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS);

  // put the access token in the json bod ie react memory -- onlylasts 15 mins tho
  res.json({ accessToken, user: toPublicUser(user) });
}

export async function refresh(req, res) {

  // on each page refresh, gotta verify whether the refresh token is still valid -- usually expires after 7 days

  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  const user = await User.findById(payload.sub);

  if (!user || user.refreshTokenHash !== hashToken(token)) {
    return res.status(401).json({ error: 'Refresh token no longer valid' });
  }

  if (user.isSuspended){
    res.clearCookie('refreshToken', REFRESH_COOKIE_OPTS);;
    return res.status(403).json({ error: 'This account has been SUSPENDED. You know what you did, you meaner =(' })
  }

  // if you got till here then the refresh token does indeed exist so regen the access token and save that again

  const accessToken = generateAccessToken(user);

  res.json({ accessToken });
}

export async function logout(req, res) {

  // clear the refresh token from cookie and db on logout

  const token = req.cookies?.refreshToken;

  if (token) {
    try {
      const payload = jwt.decode(token);

      if (payload?.sub) {
        await User.findByIdAndUpdate(
          payload.sub,
          { $unset: { refreshTokenHash: 1 } }
        );
      }
    } catch {
      // ignore decode errors on logout
    }
  }

  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTS);

  res.json({ message: 'Logged out' });
}

export async function me(req, res) {

  // all this really does is get the user details of the currently logged in user

  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user: toPublicUser(user) });
}

export async function resendVerification(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = await User.findOne({ email });

  // don't reveal whether the account exists - same response either way
  if (!user || user.isVerified) {
    return res.json({
      message: 'If an unverified account exists for that email, a new link has been sent.',
    });
  }

  const verificationToken = generateVerificationToken();

  user.verificationToken = verificationToken;
  user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

  await user.save();

  await sendVerificationEmail(user.email, verificationToken);

  res.json({
    message: 'If an unverified account exists for that email, a new link has been sent.',
  });
}