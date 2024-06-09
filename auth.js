const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy
const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Your local passport file

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // This is the username you’re encoding in the JWT
    expiresIn: '7d', // This specifies that the token will expire in 7 days
    algorithm: 'HS256', // This is the algorithm used to “sign” or encode the values of the JWT
  });
};
/* POST login. */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    console.log('Login request received:', req.body);  // Log received data
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error) {
        return res.status(400).json({
          message: 'An error occurred during login',
          error: error.message,
        });
      }
      if (!user) {
        return res.status(400).json({
          message: 'Invalid username or password',
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          return res.status(500).json({ message: 'Login failed', error: error.message });
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
  
}  
