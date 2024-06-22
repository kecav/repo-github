const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware setup
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your front-end URL
  credentials: true // Enable credentials (cookies, authorization headers) for cross-origin requests
}));

app.use(session({
  secret: process.env.GITHUB_CLIENT_SECRET, // Replace with a long random string used to sign the session ID cookie
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport setup
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:4000/auth/github/callback'
}, (accessToken, refreshToken, profile, done) => {
  profile.accessToken = accessToken;
  return done(null, profile); // Serialize the entire profile object
}));

passport.serializeUser((user, done) => {
  done(null, user); // Serialize the entire user object
});

passport.deserializeUser((user, done) => {
  done(null, user); // Deserialize the entire user object
});

// Authentication routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('http://localhost:5173'); // Redirect to your front-end app
  }
);

// Check authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send('Not authenticated');
}

// API routes for authenticated users
app.get('/api/user', ensureAuthenticated, (req, res) => {
  res.json(req.user); // Send authenticated user's profile information
});

app.get('/api/repos', ensureAuthenticated, async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `token ${req.user.accessToken}` }
    });
    
    // Get contents for each repository
    const repos = await Promise.all(response.data.map(async repo => {
      const contentsResponse = await axios.get(`https://api.github.com/repos/${repo.full_name}/contents`, {
        headers: { Authorization: `token ${req.user.accessToken}` }
      });
      repo.contents = contentsResponse.data;
      return repo;
    }));
    
    res.json(repos);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Start server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
