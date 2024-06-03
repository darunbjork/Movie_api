const express = require('express');
const morgan = require('morgan');
const app = express();

// Middleware
app.use(morgan('common')); // Log requests using Morgan
app.use(express.static('public')); // Serve static files from the 'public' directory

// Movies data
let topMovies = [
  { title: 'Inception', director: 'Christopher Nolan' },
  { title: 'Interstellar', director: 'Christopher Nolan' },
  { title: 'The Dark Knight', director: 'Christopher Nolan' },
  { title: 'Pulp Fiction', director: 'Quentin Tarantino' },
  { title: 'Fight Club', director: 'David Fincher' },
  { title: 'Forrest Gump', director: 'Robert Zemeckis' },
  { title: 'The Matrix', director: 'Lana Wachowski, Lilly Wachowski' },
  { title: 'The Lord of the Rings: The Fellowship of the Ring', director: 'Peter Jackson' },
  { title: 'The Shawshank Redemption', director: 'Frank Darabont' },
  { title: 'The Godfather', director: 'Francis Ford Coppola' }
];

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
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
