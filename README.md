# myFlix API

## Overview

The myFlix API is a backend service for a movie application. It allows users to access information about movies, genres, and directors, as well as manage their user profiles and favorite movies. This API is built using Node.js, Express, and MongoDB.

## Features

- User registration and authentication
- CRUD operations for user profiles
- Retrieve information about movies, genres, and directors
- Add and remove movies from a user's list of favorite movies
- Password hashing for secure authentication
- Data validation for request payloads
- CORS enabled for cross-origin requests

## Technologies

- Node.js
- Express
- MongoDB
- Mongoose
- Passport.js (JWT for authentication)
- bcrypt (for password hashing)
- express-validator (for data validation)
- CORS

## Setup

### Prerequisites

- Node.js
- MongoDB (local or Atlas)
- Git
- Heroku CLI (for deployment)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/example/movie_api.git
   cd movie_api

   ```

2. Install dependencies:
   npm install

3. Set up environment variables:
   Create a .env file in the root directory and add the following variables:

MONGODB_URI=your_mongodb_connection_string
PORT=your_port_number (default: 8080)

4. Run the application:
   npm start
   The server should now be running on the specified port.

API Endpoints

Movies
Get all movies

URL: /movies
Method: GET
Requires JWT authentication
Get movie by title

URL: /movies/title/:Title
Method: GET
Requires JWT authentication
Get movies by genre

URL: /movies/genre/:Genre
Method: GET
Requires JWT authentication
Get movies by director

URL: /movies/director/:Director
Method: GET
Requires JWT authentication
Users
Get user profile

URL: /users/:Username
Method: GET
Requires JWT authentication
Register a new user

URL: /users
Method: POST
Request body: { Username, Password, Email, Birthday }
Update user profile

URL: /users/:Username
Method: PUT
Requires JWT authentication
Request body: { Username, Password, Email, Birthday }
Add a movie to user's favorites

URL: /users/:Username/movies/:MovieID
Method: POST
Requires JWT authentication
Remove a movie from user's favorites

URL: /users/:Username/movies/:MovieID
Method: DELETE
Requires JWT authentication
Delete user profile

URL: /users/:Username
Method: DELETE
Requires JWT authentication

Documentation

The API documentation is generated using JSDoc. To view the documentation, open the out/index.html file in your browser.

Generating Documentation
To generate the documentation, run the following command:
jsdoc -c jsdoc.json

Deployment

Heroku

1. Log in to Heroku:
   heroku login

2. Create a new Heroku app:
   heroku create

3. Set up environment variables on Heroku:
   heroku config:set MONGODB_URI=your_mongodb_connection_string

4. Deploy the app to Heroku:
   git push heroku main or master

5. Open the app in your browser:
   heroku open

License

This project is licensed under the MIT License.

Acknowledgments

Node.js
Express
MongoDB
Heroku
