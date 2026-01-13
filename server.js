// server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db'); // Import mock DB

const app = express();
const PORT = process.env.PORT || 3000;
// ==========================================
// 1. SECURITY MIDDLEWARE
// ==========================================

// HELMET: Sets various HTTP headers to secure the app (e.g., X-XSS-Protection)
app.use(helmet()); 

// Custom Content Security Policy (CSP) to allow Tailwind CDN
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  })
);

// RATE LIMITING: Prevent brute-force attacks on login
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many login attempts, please try again later."
});

// GENERAL CONFIG
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// SESSION CONFIG (Using cookies)
app.use(session({
    secret: process.env.SESSION_SECRET, // Reads from .env
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly: true,
        secure: false, 
        maxAge: 3600000
    }
}));
// MIDDLEWARE: Check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/login');
};

// ==========================================
// 2. ROUTES
// ==========================================

// HOME: List Products
app.get('/', (req, res) => {
    // Join Products with Categories for display
    const productList = db.products.map(p => ({
        ...p,
        category: db.categories.find(c => c.id === p.categoryId).name
    }));
    res.render('index', { user: req.session.user, products: productList });
});

// LOGIN PAGE
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// LOGIN LOGIC
app.post('/login', authLimiter, async (req, res) => {
    const { username, password } = req.body;
    
    // Find user
    const user = db.users.find(u => u.username === username);
    
    // Security: Generic error message to avoid username enumeration
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.render('login', { error: 'Invalid credentials' });
    }

    // Create Session
    req.session.user = { id: user.id, username: user.username };
    res.redirect('/');
});

// LOGOUT
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// USER PROFILE (Protected)
app.get('/profile', isAuthenticated, (req, res) => {
    const fullUser = db.users.find(u => u.id === req.session.user.id);
    res.render('profile', { user: fullUser });
});

// PRODUCT DETAILS & COMMENTS
app.get('/product/:id', (req, res) => {
    const pid = parseInt(req.params.id);
    const product = db.products.find(p => p.id === pid);
    
    if (!product) return res.status(404).send('Product not found');

    const productComments = db.comments.filter(c => c.productId === pid);
    res.render('product', { user: req.session.user, product, comments: productComments });
});

// POST COMMENT (Protected + Sanitized)
app.post('/product/:id/comment', isAuthenticated, (req, res) => {
    const pid = parseInt(req.params.id);
    const { text } = req.body;

    // Basic Input Sanitization (In real app, use express-validator)
    const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    db.comments.push({
        id: db.comments.length + 1,
        productId: pid,
        username: req.session.user.username,
        text: sanitizedText,
        date: new Date().toLocaleDateString()
    });

    res.redirect(`/product/${pid}`);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});