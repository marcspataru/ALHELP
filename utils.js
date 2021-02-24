const jwt = require('jsonwebtoken');
const User = require('./models/User');
const constants = require('./constants_utils.js');

module.exports = {
	validateToken: async (req, res, next) => {
		try {
			const token = req.cookies.jwt;
			const decoded = await jwt.verify(token, process.env.JWT_SECRET);
			const user = await User.findById(decoded.user);
			res.locals.name = user.name;
			req.session.user = user;
			//console.log(req.session);
			next();
		}
		catch(err) {
			err = new Error('The cookie token is not valid. Please login and try again.');
			req.session.error = err.message;
			res.redirect(constants.LOGIN_URL);
		}
	},
	/*jwtToUser: async (token) => {
		try {
			let user;
			const decoded = await jwt.verify(token, process.env.JWT_SECRET);
			user = await User.findById(decoded.user);
			return user;
		}
		catch(err) {
			err = new Error('Cannot find a user with the cookie token. Please login and try again.');
			req.session.error = err.message;
			res.redirect(constants.LOGIN_URL);
		}
	},*/
};