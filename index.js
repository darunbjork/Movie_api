const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();

// Middleware
app.use(morgan('common')); // Log requests using Morgan
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(bodyParser.json()); // Parse JSON bodies

// Movies data
let movies = [
  {
    id: 1,
    title: 'Inception',
    description: 'A mind-bending thriller',
    genre: 'Sci-Fi',
    director: 'Christopher Nolan',
    imageUrl: '',
    featured: true
  },
  {
    id: 2,
    title: 'The Dark Knight',
    description: 'Batman fights Joker',
    genre: 'Action',
    director: 'Christopher Nolan',
    imageUrl: '',
    featured: true
  },
  {
    id: 3,
    title: 'Interstellar',
    description: 'A journey through space and time',
    genre: 'Sci-Fi',
    director: 'Christopher Nolan',
    imageUrl: '',
    featured: true
  },
  {
    id: 4,
    title: 'Pulp Fiction',
    description: 'A series of interconnected stories',
    genre: 'Crime',
    director: 'Quentin Tarantino',
    imageUrl: '',
    featured: true
  },
  {
    id: 5,
    title: 'Fight Club',
    description: 'An underground fight club becomes a way to release frustration',
    genre: 'Drama',
    director: 'David Fincher',
    imageUrl: '',
    featured: true
  },
  {
    id: 6,
    title: 'Forrest Gump',
    description: 'The story of a man with a low IQ who achieves great things in life',
    genre: 'Drama',
    director: 'Robert Zemeckis',
    imageUrl: '',
    featured: true
  },
  {
    id: 7,
    title: 'The Matrix',
    description: 'A computer hacker learns about the true nature of his reality',
    genre: 'Sci-Fi',
    director: 'Lana Wachowski, Lilly Wachowski',
    imageUrl: '',
    featured: true
  },
  {
    id: 8,
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    description: 'A hobbit and his friends set out to destroy a powerful ring',
    genre: 'Fantasy',
    director: 'Peter Jackson',
    imageUrl: '',
    featured: true
  },
  {
    id: 9,
    title: 'The Shawshank Redemption',
    description: 'Two imprisoned men bond over a number of years',
    genre: 'Drama',
    director: 'Frank Darabont',
    imageUrl: '',
    featured: true
  },
  {
    id: 10,
    title: 'The Godfather',
    description: 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son',
    genre: 'Crime',
    director: 'Francis Ford Coppola',
    imageUrl: '',
    featured: true
  }
];

let users = [
  {
    Username: 'testuser',
    Password: 'password123',
    Email: 'testuser@example.com',
    Birthday: '1980-01-01',
    FavoriteMovies: []
  },
  // Add more users as needed
];

// Routes

// Welcome message
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
  res.json(movies);
});

// Return data about a single movie by title
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find(m => m.title.toLowerCase() === title.toLowerCase());
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send('Movie not found.');
  }
});

// Return data about a genre by name/title
app.get('/genres/:name', (req, res) => {
  const { name } = req.params;
  const genreMovies = movies.filter(m => m.genre.toLowerCase() === name.toLowerCase());
  if (genreMovies.length > 0) {
    res.json({ name: name, description: `${name} is a genre that includes ${genreMovies.length} movies.` });
  } else {
    res.status(404).send('Genre not found.');
  }
});

// Return data about a director by name
app.get('/directors/:name', (req, res) => {
  const { name } = req.params;
  const directorMovies = movies.filter(m => m.director.toLowerCase().includes(name.toLowerCase()));
  if (directorMovies.length > 0) {
    res.json({ name: name, bio: `${name} has directed ${directorMovies.length} movies.`, birthYear: 1970, deathYear: null });
  } else {
    res.status(404).send('Director not found.');
  }
});

// Allow new users to register
app.post('/users', (req, res) => {
  const { Username, Password, Email, Birthday } = req.body;
  const newUser = {
    Username,
    Password,
    Email,
    Birthday,
    FavoriteMovies: []
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Allow users to update their user info (username)
app.put('/users/:username', (req, res) => {
  const { username } = req.params;
  const { Username, Password, Email, Birthday } = req.body;
  const user = users.find(u => u.Username === username);
  if (user) {
    user.Username = Username || user.Username;
    user.Password = Password || user.Password;
    user.Email = Email || user.Email;
    user.Birthday = Birthday || user.Birthday;
    res.status(200).json(user);
  } else {
    res.status(404).send('User not found.');
  }
});

// Allow users to add a movie to their list of favorites
app.post('/users/:username/movies/:movieID', (req, res) => {
  const { username, movieID } = req.params;
  const user = users.find(u => u.Username === username);
  const movie = movies.find(m => m.id === parseInt(movieID));
  if (user && movie) {
    user.FavoriteMovies.push(movieID);
    res.status(200).send(`Movie with ID ${movieID} was added to user ${username}'s favorite list.`);
  } else {
    res.status(404).send('User or movie not found.');
  }
});

// Allow users to remove a movie from their list of favorites
app.delete('/users/:username/movies/:movieID', (req, res) => {
  const { username, movieID } = req.params;
  const user = users.find(u => u.Username === username);
  if (user) {
    user.FavoriteMovies = user.FavoriteMovies.filter(id => id !== movieID);
    res.status(200).send(`Movie with ID ${movieID} was removed from user ${username}'s favorite list.`);
  } else {
    res.status(404).send('User not found.');
  }
});

// Allow existing users to deregister
app.delete('/users/:username', (req, res) => {
  const { username } = req.params;
  users = users.filter(u => u.Username !== username);
  res.status(200).send(`User ${username} was deregistered.`);
});

// Simulated error route
app.get('/error', (req, res) => {
  throw new Error('This is a simulated error.');
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Listen for requests
const port = 8080;
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}.`);
});
