require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const Movies = Models.Movie;
const Users = Models.User;

// Middleware
app.use(morgan('common')); // Log requests using Morgan
app.use(express.static('public')); // Serve static files from the 'public' directory

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.error('Error connecting to the database', err);
  });

// Routes
// Welcome message
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// Return a list of ALL movies to the user
app.get('/movies', async (req, res, next) => {
  try {
    const movies = await Movies.find();
    res.status(200).json(movies);
  } catch (err) {
    next(err);
  }
});

// Return data about a single movie by title
app.get('/movies/title/:Title', async (req, res, next) => {
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
app.get('/movies/genre/:Genre', async (req, res, next) => {
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
app.get('/movies/director/:Director', async (req, res, next) => {
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

// Allow new users to register
app.post('/users', async (req, res, next) => {
  try {
    const existingUser = await Users.findOne({ Username: req.body.Username });
    if (existingUser) {
      return res.status(400).json({ error: `${req.body.Username} already exists` });
    } else {
      const newUser = await Users.create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      });
      res.status(201).json(newUser);
    }
  } catch (err) {
    next(err);
  }
});

// Allow users to update their user info (username)
app.put('/users/:Username', async (req, res, next) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
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

// Allow users to add a movie to their list of favorites
app.post('/users/:Username/movies/:MovieID', async (req, res, next) => {
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

// Allow users to remove a movie from their list of favorites
app.delete('/users/:Username/movies/:MovieID', async (req, res, next) => {
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
app.delete('/users/:Username', async (req, res, next) => {
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
