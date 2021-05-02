const bcrypt = require('bcrypt'); // for password hashing
const jwt = require('jsonwebtoken'); // authentication cookies
const constants = require('../constants_utils.js'); // constants, utility file for better organisation
const { validationResult } = require('express-validator'); // express middleware for validation of input
const User = require('../models/User'); // required to communicate with the Users collection
const Course = require('../models/Course'); // required to communicate with the Courses collection

// the get request function for the login page, this will display the page
module.exports.login_get = (req, res) => {
	const title = req.session.title ? req.session.title : constants.LOGIN_PAGE_TITLE; // if a title of the session exists, the login page should inherit it
	const error = req.session.error ? req.session.error : null; // the title from above is related to this, since an error will be displayed if the session has one
	res.render(constants.LOGIN_PAGE_NAME, { title: title, error: error }); // the page is rendered with Pug.js (visit the views directory)
}

// the post request function for the login page, this will log the user in and redirect them to the learning preferences page
module.exports.login_post = async (req, res) => { 
	try { 
		const result = validationResult(req); // validation performed by the express-validator module
		if(!result.isEmpty()) { // an error should be thrown if the result is empty
			throw Error(result.errors[0].msg);
		}
		const { name, password } = req.body; // the name and password are extracted from the request body
		const user = await User.login(name, password); // the user is logged in with an asynchronous call
		const payload = { user: user._id }; // preparing the JWT cookie
		const options = { expiresIn: constants.MAX_AGE };
		const secret = process.env.JWT_SECRET;
		const token = jwt.sign(payload, secret, options);
		res.cookie(constants.JWT_COOKIE_NAME, token, { httpOnly: true, MAX_AGE: constants.MAX_AGE * 1000 }); // setting the cookie with 24hr expiry date
		req.session.error = null; // clear the error field in the session
		res.redirect(constants.LEARNING_PREFERENCES_URL); // redirect the user to the learning preferences page
	}
	catch(err) { // if there was an error, render the login page with a red error above it
		res.render(constants.LOGIN_PAGE_NAME, {
			title: constants.LOGIN_PAGE_TITLE,
			error: err,
			data: req.body
		});
	}
}

// a get request function to render the Registration page
module.exports.register_get = (req, res) => {
	res.render(constants.REGISTER_PAGE_NAME, { title: constants.REGISTER_PAGE_TITLE });
}

// a post request function to register a user to the system
module.exports.register_post = async (req, res) => {
	try {
		const result = validationResult(req);
		if(!result.isEmpty()) {
			throw Error(result.errors[0].msg);
		}
		const { name, password } = req.body;
		const hash = await bcrypt.hash(password, constants.SALT_ROUNDS);
		const courses = await Course.find({}); // each course must be initialised with a zero completion and ID
		let userCourses = new Array(courses.length);
		for(let i = 0; i < courses.length; i++) {
			const course = {
				id: courses[i]._id,
				completion: 0
			};
			userCourses.push(course);
		}
		const user = await User.create({ name: name, password: hash, courses: userCourses, performance: constants.DEFAULT_PERFORMANCE }); // the user is created
		const payload = { user: user._id };
		const options = { expiresIn: constants.MAX_AGE };
		const secret = process.env.JWT_SECRET;
		const token = jwt.sign(payload, secret, options);
		res.cookie(constants.JWT_COOKIE_NAME, token, { httpOnly: true, MAX_AGE: constants.MAX_AGE * 1000 });
		res.redirect(constants.LEARNING_PREFERENCES_URL); // the user is redirected to the Learning Preferences page
	}
	catch(err) {
		if(err.code === 11000) {
			err = new Error('Username already exists'); // specific MongoDB error for duplicate usernames
		}
		res.render(constants.REGISTER_PAGE_NAME, {
			title: constants.REGISTER_PAGE_TITLE,
			error: err,
			data: req.body
		});
	}
}

// get request function for logout which just makes the JSON Web Token expire immediately, resulting in the logging out of the user when coupled with a redirection to the login page
module.exports.logout_get = (req, res) => {
	res.cookie(constants.JWT_COOKIE_NAME, '', { MAX_AGE: 1 });
	res.redirect(constants.LOGIN_URL);
}