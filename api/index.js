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

function getReply(message) {
  const text = String(message || '').toLowerCase().trim();

  if (!text) {
    return 'How can I help you today?';
  }

  if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
    return "Hello! I'm Vera, your AlgoVerse study companion. Ask me about DSA, coding practice, or course access.";
  }

  if (text.includes('dsa') || text.includes('array') || text.includes('linked list') || text.includes('graph') || text.includes('tree') || text.includes('dynamic programming') || text.includes('dp')) {
    return 'I can help explain DSA topics step by step. Tell me the topic like arrays, trees, graphs, or dynamic programming and I will guide you.';
  }

  if (text.includes('payment') || text.includes('buy') || text.includes('course') || text.includes('plan')) {
    return 'You can explore the course plans on the site. I can also help you choose the best option for beginners, interview prep, or advanced practice.';
  }

  if (text.includes('contact') || text.includes('email')) {
    return 'You can reach the AlgoVerse team at officialalgoverse@gmail.com.';
  }

  if (text.includes('thank')) {
    return 'You are welcome! I am here whenever you want to learn.';
  }

  return 'I can help with DSA concepts, coding problems, study plans, and course guidance. Tell me what you want to learn.';
}

function sendChatReply(req, res) {
  const { message } = req.body || {};
  const reply = getReply(message);
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
