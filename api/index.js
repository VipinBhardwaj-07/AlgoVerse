const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const Stripe = require('stripe');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// ---- Database connection ----
// Vercel serverless functions can be invoked many times; cache the connection
// so we don't reconnect on every request.
let isDbConnected = false;
async function connectDB() {
  if (isDbConnected) return;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is missing from environment variables.');
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    isDbConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}
connectDB();

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// System prompt defines Vera's persona and scope
const SYSTEM_PROMPT = `You are Vera, the AlgoVerse study companion chatbot.
You help users with DSA (Data Structures & Algorithms) concepts, coding problems,
study plans, and course guidance for the AlgoVerse platform.
Answer the user's actual question clearly and helpfully.
If asked about contact info, direct them to officialalgoverse@gmail.com.
If asked about courses or pricing, mention they can check the course plans on the site.
Keep answers concise and friendly.`;

async function getGroqReply(message) {
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is missing from environment variables.');
    return 'I can help with DSA concepts, coding problems, study plans, and course guidance. Tell me what you want to learn.';
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b', // available on standard Groq developer accounts
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', response.status, errText);
      return 'Sorry, I ran into an issue answering that. Please try again in a moment.';
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    return reply || 'I could not generate a response for that. Could you rephrase your question?';
  } catch (error) {
    console.error('Groq request failed:', error);
    return 'Sorry, something went wrong while contacting the AI service.';
  }
}

async function sendChatReply(req, res) {
  const { message } = req.body || {};
  if (!message || !String(message).trim()) {
    return res.json({ reply: 'How can I help you today?' });
  }
  const reply = await getGroqReply(message);
  return res.json({ reply });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'algoverse-chatbot' });
});

// ---- Auth helpers ----
function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: '30d' });
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    address: user.address || {},
    photoUrl: user.photoUrl || '',
    provider: user.provider,
  };
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated.' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'User not found.' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

// ---- Auth routes ----
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      provider: 'local',
    });
    const token = signToken(user);
    return res.json({ token, user: toPublicUser(user) });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Unable to create account right now.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = signToken(user);
    return res.json({ token, user: toPublicUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Unable to log in right now.' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  return res.json({ user: toPublicUser(req.user) });
});

app.put('/api/auth/profile', requireAuth, async (req, res) => {
  try {
    const { name, address, photoUrl } = req.body || {};
    if (typeof name === 'string' && name.trim()) req.user.name = name.trim();
    if (address && typeof address === 'object') {
      req.user.address = {
        line1: address.line1 || '',
        line2: address.line2 || '',
        city: address.city || '',
        state: address.state || '',
        zip: address.zip || '',
        country: address.country || '',
      };
    }
    if (typeof photoUrl === 'string') req.user.photoUrl = photoUrl;
    await req.user.save();
    return res.json({ user: toPublicUser(req.user) });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: 'Unable to update profile right now.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.post('/chat', sendChatReply);
app.post('/api/chat', sendChatReply);

app.post('/create-checkout-session', async (req, res) => {
  const { plan = 'Pro Version', amount = '$19 lifetime', email = '' } = req.body || {};

  if (!stripe) {
    return res.json({
      url: `/payment-success.html?status=success&plan=${encodeURIComponent(plan)}&email=${encodeURIComponent(email)}`,
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: plan },
          unit_amount: 1900,
        },
        quantity: 1,
      }],
      success_url: `${process.env.PUBLIC_URL || 'http://localhost:5000'}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PUBLIC_URL || 'http://localhost:5000'}/index.html`,
      customer_email: email || undefined,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: 'Unable to start checkout right now.' });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  return res.redirect(307, '/create-checkout-session');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AlgoVerse chatbot backend is running on port ${PORT}`);
});