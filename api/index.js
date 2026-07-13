const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const Stripe = require('stripe');
const { Groq } = require('groq-sdk'); // Import the Groq SDK

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// Initialize Groq SDK with your .env variable
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.set('trust proxy', 1);

// Rate limiting configuration for API security
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

// MIDDLEWARES
app.use(cors({ origin: true }));
app.use(express.json());

// Serve static assets directly from the root layout folder
// Placed ABOVE the rate limiter so images/CSS don't trigger 429 errors!
app.use(express.static(path.join(__dirname, '..')));

// Real AI Chatbot Function with Groq Integration
async function sendChatReply(req, res) {
  const { message } = req.body || {};
  
  if (!message || !message.trim()) {
    return res.json({ reply: 'How can I help you today?' });
  }

  try {
    // Send the message securely to the Groq AI engine
    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: "You are Vera, the friendly and highly knowledgeable AlgoVerse study companion. You help users master Data Structures & Algorithms (DSA), clear coding roadmaps, solve competitive programming bugs, and guide them on course platform access. Keep answers direct, accurate, highly technical, and encouraging." 
        },
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile', // Stable, fast Groq model
    });

    const aiReply = completion.choices[0].message.content;
    return res.json({ reply: aiReply });

  } catch (error) {
    console.error('Groq AI API Error:', error);
    return res.status(500).json({ error: 'Vera AI engine failed to generate a response.' });
  }
}

// PUBLIC ROUTES
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'algoverse-chatbot' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// API ROUTES (Protected by the Rate Limiter)
app.post('/chat', limiter, sendChatReply);
app.post('/api/chat', limiter, sendChatReply);

app.post('/create-checkout-session', limiter, async (req, res) => {
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

app.post('/api/create-checkout-session', limiter, async (req, res) => {
  return res.redirect(307, '/create-checkout-session');
});

// CONDITIONAL STARTUP
// Runs standard server port listener ONLY when executing locally.
// Passes control smoothly to Vercel Serverless environment in production.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AlgoVerse chatbot backend is running on port ${PORT}`);
  });
}

module.exports = app;