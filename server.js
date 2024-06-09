require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');
const passport = require('passport');
const cors = require('cors');
const { check, validationResult } = require('express-validator');
require('./passport'); // local passport file
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const Movies = Models.Movie;
const Users = Models.User;

// Middleware
app.use(morgan('common')); // Log requests using Morgan
app.use(express.static('public')); // Serve static files from the 'public' directory


// Define the allowed origins
const allowedOrigins = [
  'http://localhost:8080',
  'http://testsite.com',
  'http://localhost:1234',
  'https://silverscreenhub.netlify.app',
  'http://localhost:4200'
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

// Enable CORS using the configured options
app.use(cors(corsOptions));


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.error('Error connecting to the database', err);
  });


// Auth route
let auth = require('./auth')(app);

// Routes
// Welcome message
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// Return a list of ALL movies to the user
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const movies = await Movies.find();
    res.status(200).json(movies);
  } catch (err) {
    next(err);
  }
});

// Return data about a single movie by title
app.get('/movies/title/:Title', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.Title });
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(404).json({ error: 'Movie not found' });
    }
  } catch (err) {
    next(err);
  }
});

// Return data about movies by genre
app.get('/movies/genre/:Genre', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const movies = await Movies.find({ 'Genre.Name': req.params.Genre });
    if (movies.length > 0) {
      res.status(200).json(movies);
    } else {
      res.status(404).json({ error: 'No movies found for this genre' });
    }
  } catch (err) {
    next(err);
  }
});

// Return data about movies by director
app.get('/movies/director/:Director', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const movies = await Movies.find({ 'Director.Name': req.params.Director });
    if (movies.length > 0) {
      res.status(200).json(movies);
    } else {
      res.status(404).json({ error: 'No movies found for this director' });
    }
  } catch (err) {
    next(err);
  }
});

// Fetch user profile details
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    // Ensure the user can only access their own profile
    if (req.user.Username !== req.params.Username) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const user = await Users.findOne({ Username: req.params.Username });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: `${req.params.Username} not found` });
    }
  } catch (err) {
    next(err);
  }
});

// Allow new users to register
app.post('/users', [
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
          .then((user) => { res.status(201).json(user) })
          .catch((error) => { res.status(500).send('Error: ' + error); });
      }
    })
    .catch((error) => { res.status(500).send('Error: ' + error); });
});

// Allow users to update their user info (username)
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), [
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: Users.hashPassword(req.body.Password),
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }
  )
    .then((updatedUser) => { res.json(updatedUser); })
    .catch((err) => { res.status(500).send('Error: ' + err); });
});

// Allow users to add a movie to their list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
    );
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ error: `${req.params.Username} not found` });
    }
  } catch (err) {
    next(err);
  }
});


app.get('/users/:Username/movies', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    console.log(`Incoming request for /users/${req.params.Username}/movies`);
    if (req.user.Username !== req.params.Username) {
      console.log('Permission denied');
      return res.status(403).json({ error: 'Permission denied' });
    }

    const user = await Users.findOne({ Username: req.params.Username }).populate('FavoriteMovies');
    if (user) {
      console.log(`User found: ${user.Username}`);
      res.status(200).json(user.FavoriteMovies);
    } else {
      console.log(`User ${req.params.Username} not found`);
      res.status(404).json({ error: `${req.params.Username} not found` });
    }
  } catch (err) {
    console.error('Error:', err);
    next(err);
  }
});




// Allow users to remove a movie from their list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
    );
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ error: `${req.params.Username} not found` });
    }
  } catch (err) {
    next(err);
  }
});

// Allow existing users to deregister
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }
  try {
    const user = await Users.findOneAndDelete({ Username: req.params.Username });
    if (!user) {
      res.status(404).json({ error: `${req.params.Username} not found` });
    } else {
      res.status(200).json({ message: `${req.params.Username} was deleted.` });
    }
  } catch (err) {
    next(err);
  }
});

// Simulated error route
app.get('/error', (req, res) => {
  throw new Error('This is a simulated error.');
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: `Validation Error: ${err.message}` });
  } else if (err.name === 'MongoError') {
    res.status(500).json({ error: `Database Error: ${err.message}` });
  } else if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  } else {
    res.status(500).json({ error: 'Something broke!' });
  }
});

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}.`);
});
