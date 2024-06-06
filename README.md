# myFlix API

## Overview

The `myFlix` API is a backend service for a movie application. It allows users to access information about movies, genres, and directors, as well as manage their user profiles and favorite movies. This API is built using Node.js, Express, and MongoDB.

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

Install dependencies:

npm install

Set up environment variables:

Create a .env file in the root directory and add the following variables:
MONGODB_URI=your_mongodb_connection_string
PORT=your_port_number (default: 8080)

Run the application:
npm start

The server should now be running on the specified port.

API Endpoints

Movies
Get all movies

GET /movies
Requires JWT authentication
Get movie by title

GET /movies/title/:Title
Requires JWT authentication
Get movies by genre

GET /movies/genre/:Genre
Requires JWT authentication
Get movies by director

GET /movies/director/:Director
Requires JWT authentication
Users
Get user profile

GET /users/:Username
Requires JWT authentication
Register a new user

POST /users
Request body: { Username, Password, Email, Birthday }
Update user profile

PUT /users/:Username
Requires JWT authentication
Request body: { Username, Password, Email, Birthday }
Add a movie to user's favorites

POST /users/:Username/movies/:MovieID
Requires JWT authentication
Remove a movie from user's favorites

DELETE /users/:Username/movies/:MovieID
Requires JWT authentication
Delete user profile

DELETE /users/:Username
Requires JWT authentication
Deployment

Heroku
Log in to Heroku:

heroku login
Create a new Heroku app:

heroku create
Set up environment variables on Heroku:

heroku config:set MONGODB_URI=your_mongodb_connection_string
Deploy the app to Heroku:

git push heroku main
Open the app in your browser:

heroku open
License

This project is licensed under the MIT License.

Acknowledgments

Node.js
Express
MongoDB
Heroku
