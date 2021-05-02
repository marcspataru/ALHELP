const jwt = require('jsonwebtoken');
const User = require('./models/User');
const constants = require('./constants_utils.js');

module.exports = {
	validateToken: async (req, res, next) => { // validate JWT token to proect routes
		try {
			const token = req.cookies.jwt; // using the jwt cookie
			const decoded = await jwt.verify(token, process.env.JWT_SECRET); // decode it using the .env secret
			const user = await User.findById(decoded.user); // find the user with the decoded information
			res.locals.name = user.name; // set the username in the locals (easy access for things such as the text Logout "user")
			req.session.user = user; // store the user in a sepearate session cookie
			next(); // call the next middleware
		}
		catch(err) {
			err = new Error('The cookie token is not valid. Please login and try again.');
			req.session.error = err.message; // store the error in the session to display it on another page
			res.redirect(constants.LOGIN_URL); // redirect to login page in case JWT cannot be verified
		}
	}
};