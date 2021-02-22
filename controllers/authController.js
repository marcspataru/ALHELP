const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { maxAge, validateToken } = require('../utils');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Course = require('../models/Course');

const loginPageName = 'login';
const loginPageTitle = 'Login';
const personalTabUrl = '/personal-tab';

module.exports.login_get = (req, res) => {
		res.render(loginPageName, { title: 'Login' });
}

module.exports.login_post = async (req, res) => {
	try {
		const { name, password } = req.body;
		const user = await User.login(name, password);
		const payload = { user: user._id };
		const options = { expiresIn: maxAge };
		const secret = process.env.JWT_SECRET;
		const token = jwt.sign(payload, secret, options);
		res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
		res.redirect(personalTabUrl);
	}
	catch(err) {
		res.render(loginPageName, {
			title: loginPageTitle,
			errors: [err],
			data: req.body
		});
	}
}

module.exports.register_get = (req, res) => {
		res.render('register', { title: 'Register' });
}

module.exports.register_post = (req, res) => {
		const errors = validationResult(req);
		if(errors.isEmpty()) {
				const { name, password } = req.body;
				const saltRounds = 10;
				bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
						//req.body.password = hash;
						//const user = new UserModel(req.body);
						try {
							Course.find({}, async (err, courses) => {
								if(!err) {
									let i;
									let userCourses = new Array(courses.length);
									for(i = 0; i < courses.length; i++) {
										const course = {
											id: courses[i]._id,
											completion: 0
										}
										userCourses.push(course);
									}
									const user = await User.create({ name: name, password: hash, courses: userCourses, performance: 0.5});
									const payload = { user: user._id };
									const options = { expiresIn: maxAge };
									const secret = process.env.JWT_SECRET;
									const token = jwt.sign(payload, secret, options);
									res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
									res.redirect('/personal-tab');
								}
								else {
									console.log('Could not query Course');
								}
							});
						}
						catch (err) {
								res.render('register', {
										title: 'Register',
										errors: [err + 'bcrypthash'],
										data: req.body
								});
						}
						/*user.save()
								.then(() => {
										res.redirect('/');
								})
								.catch((err) => {
										console.log('Could not register user: ' + err);
										res.render('register', {
												title: 'Register',
												errors: ["The user already exists!"],
												data: req.body
										});
								});*/
				});
		}
		else {
				res.render('register', {
						title: 'Register',
						errorsV: errors.array(),
						data: req.body
				});
		}
}

module.exports.logout_get = (req, res) => {
		res.cookie('jwt', '', { maxAge: 1 });
		res.redirect('/');
}