const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const Stripe = require('stripe');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

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
