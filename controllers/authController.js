const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const constants = require('../constants_utils.js');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Course = require('../models/Course');

module.exports.login_get = (req, res) => {
	const title = req.session.title ? req.session.title : constants.LOGIN_PAGE_TITLE;
	const error = req.session.error ? req.session.error : null;
	res.render(constants.LOGIN_PAGE_NAME, { title: title, error: error });
}

module.exports.login_post = async (req, res) => {
	try {
		const result = validationResult(req);
		if(!result.isEmpty()) {
			throw Error(result.errors[0].msg);
		}
		const { name, password } = req.body;
		const user = await User.login(name, password);
		const payload = { user: user._id };
		const options = { expiresIn: constants.MAX_AGE };
		const secret = process.env.JWT_SECRET;
		const token = jwt.sign(payload, secret, options);
		res.cookie(constants.JWT_COOKIE_NAME, token, { httpOnly: true, MAX_AGE: constants.MAX_AGE * 1000 });
		req.session.error = null;
		res.redirect(constants.PERSONAL_TAB_URL);
	}
	catch(err) {
		res.render(constants.LOGIN_PAGE_NAME, {
			title: constants.LOGIN_PAGE_TITLE,
			error: err,
			data: req.body
		});
	}
}

module.exports.register_get = (req, res) => {
	res.render(constants.REGISTER_PAGE_NAME, { title: constants.REGISTER_PAGE_TITLE });
}

module.exports.register_post = async (req, res) => {
	try {
		const result = validationResult(req);
		if(!result.isEmpty()) {
			throw Error(result.errors[0].msg);
		}
		const { name, password } = req.body;
		const hash = await bcrypt.hash(password, constants.SALT_ROUNDS);
		const courses = await Course.find({});
		let userCourses = new Array(courses.length);
		for(let i = 0; i < courses.length; i++) {
			const course = {
				id: courses[i]._id,
				completion: 0
			};
			userCourses.push(course);
		}
		const user = await User.create({ name: name, password: hash, courses: userCourses, performance: constants.DEFAULT_PERFORMANCE });
		const payload = { user: user._id };
		const options = { expiresIn: constants.MAX_AGE };
		const secret = process.env.JWT_SECRET;
		const token = jwt.sign(payload, secret, options);
		res.cookie(constants.JWT_COOKIE_NAME, token, { httpOnly: true, MAX_AGE: constants.MAX_AGE * 1000 });
		res.redirect(constants.PERSONAL_TAB_URL);
	}
	catch(err) {
		if(err.code === 11000) {
			err = new Error('Username already exists');
		}
		res.render(constants.REGISTER_PAGE_NAME, {
			title: constants.REGISTER_PAGE_TITLE,
			error: err,
			data: req.body
		});
	}
}

module.exports.logout_get = (req, res) => {
	res.cookie(constants.JWT_COOKIE_NAME, '', { MAX_AGE: 1 });
	res.redirect(constants.LOGIN_URL);
}