/**
 * @fileOverview This is the main server file for the movie API.
 */

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

// Define the allowed origins
const allowedOrigins = [
  'http://localhost:8080',
  'http://testsite.com',
  'http://localhost:1234',
  'http://localhost:4200',
  'https://cinemahub22.netlify.app'
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

// Middleware
app.use(morgan('common')); // Log requests using Morgan
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(cors(corsOptions)); // Enable CORS using the configured options

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.error('Error connecting to the database', err);
  });

let auth = require('./auth')(app);

/**
 * @route GET /
 * @group Home - Operations about home
 * @returns {string} 200 - Welcome message
 */
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

/**
 * @route GET /movies
 * @group Movies - Operations about movies
 * @returns {Array.<Movie>} 200 - An array of movies
 * @security JWT
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const movies = await Movies.find();
    res.status(200).json(movies);
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /movies/title/:Title
 * @group Movies - Operations about movies
 * @param {string} Title.path.required - Movie title
 * @returns {Movie} 200 - A single movie object
 * @returns {Error} 404 - Movie not found
 * @security JWT
 */
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

/**
 * @route GET /movies/genre/:Genre
 * @group Movies - Operations about movies
 * @param {string} Genre.path.required - Genre name
 * @returns {Array.<Movie>} 200 - An array of movies
 * @returns {Error} 404 - No movies found for this genre
 * @security JWT
 */
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

/**
 * @route GET /movies/director/:Director
 * @group Movies - Operations about movies
 * @param {string} Director.path.required - Director name
 * @returns {Array.<Movie>} 200 - An array of movies
 * @returns {Error} 404 - No movies found for this director
 * @security JWT
 */
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

/**
 * @route GET /users/:Username
 * @group Users - Operations about users
 * @param {string} Username.path.required - Username
 * @returns {User} 200 - A single user object
 * @returns {Error} 403 - Permission denied
 * @returns {Error} 404 - User not found
 * @security JWT
 */
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

/**
 * @route POST /users
 * @group Users - Operations about users
 * @param {string} Username.body.required - Username
 * @param {string} Password.body.required - Password
 * @param {string} Email.body.required - Email
 * @param {string} Birthday.body - Birthday
 * @returns {User} 201 - A single user object
 * @returns {Error} 422 - Validation error
 * @returns {Error} 500 - Internal server error
 */
app.post('/users', [
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
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
          .then((user) => { res.status(201).json(user); })
          .catch((error) => { res.status(500).send('Error: ' + error); });
      }
    })
    .catch((error) => { res.status(500).send('Error: ' + error); });
});

/**
 * @route PUT /users/:Username
 * @group Users - Operations about users
 * @param {string} Username.path.required - Username
 * @param {string} Username.body.required - New username
 * @param {string} Password.body.required - New password
 * @param {string} Email.body.required - New email
 * @param {string} Birthday.body - New birthday
 * @returns {User} 200 - The updated user object
 * @returns {Error} 403 - Permission denied
 * @returns {Error} 422 - Validation error
 * @returns {Error} 500 - Internal server error
 * @security JWT
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), [
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }
  
  let hashedPassword = Users.hashPassword(req.body.Password);
  
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: hashedPassword,  // Ensure password is hashed
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }
  )
    .then((updatedUser) => { res.json(updatedUser); })
    .catch((err) => { res.status(500).send('Error: ' + err); });
});

/**
 * @route POST /users/:Username/movies/:MovieID
 * @group Users - Operations about users
 * @param {string} Username.path.required - Username
 * @param {string} MovieID.path.required - Movie ID
 * @returns {User} 200 - The updated user object
 * @returns {Error} 400 - Permission denied
 * @returns {Error} 404 - User not found
 * @security JWT
 */
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

/**
 * @route GET /users/:Username/movies
 * @group Users - Operations about users
 * @param {string} Username.path.required - Username
 * @returns {Array.<Movie>} 200 - An array of favorite movies
 * @returns {Error} 403 - Permission denied
 * @returns {Error} 404 - User not found
 * @security JWT
 */
app.get('/users/:Username/movies', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    if (req.user.Username !== req.params.Username) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const user = await Users.findOne({ Username: req.params.Username }).populate('FavoriteMovies');
    if (user) {
      res.status(200).json(user.FavoriteMovies);
    } else {
      res.status(404).json({ error: `${req.params.Username} not found` });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * @route DELETE /users/:Username/movies/:MovieID
 * @group Users - Operations about users
 * @param {string} Username.path.required - Username
 * @param {string} MovieID.path.required - Movie ID
 * @returns {User} 200 - The updated user object
 * @returns {Error} 400 - Permission denied
 * @returns {Error} 404 - User not found
 * @security JWT
 */
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

/**
 * @route DELETE /users/:Username
 * @group Users - Operations about users
 * @param {string} Username.path.required - Username
 * @returns {string} 200 - A message indicating that the user was deregistered
 * @returns {Error} 400 - Permission denied
 * @returns {Error} 404 - User not found
 * @security JWT
 */
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
