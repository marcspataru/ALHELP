const constants = require('../constants_utils.js'); // utility file for constants
const User = require('../models/User'); // required for the Users collection
const Course = require('../models/Course'); // required for the Courses collection

// GET request for learning preferences page
module.exports.learning_preferences_get = async (req, res) => {
	const user = req.session.user; // needed to check if the user has already completed the ILS
	if(user.indicators.arIndicator) { // if they did, show them their results
		res.render(constants.LEARNING_PREFERENCES_PAGE_NAME, { title: constants.LEARNING_PREFERENCES_PAGE_TITLE, ilsResults: { arIndicator: user.indicators.arIndicator, siIndicator: user.indicators.siIndicator, vvIndicator: user.indicators.vvIndicator, sgIndicator: user.indicators.sgIndicator } });
	} else { // else, render the normal page 
		res.render(constants.LEARNING_PREFERENCES_PAGE_NAME, { title: constants.LEARNING_PREFERENCES_PAGE_TITLE });
	}
}

// POST request - submission of quiz answers
module.exports.learning_preferences_post = async (req, res) => {
	try {
		const user = req.session.user; // needed for the user ID
		let arIndex = 1;
		let ar1 = 0, ar2 = 0;
		let siIndex = 2;
		let si1 = 0, si2 = 0;
		let vvIndex = 3;
		let vv1 = 0, vv2 = 0;
		let sgIndex = 4;
		let sg1 = 0, sg2 = 0;
		let qNo = 0;
		while (qNo < 11) { // iterate from 0 to 10 (inclusive), and analyse four question answers at a time
			if(req.body['q' + arIndex] == 'option' + arIndex + 'a') { // option1a is the value of a JSON field from the request body
				ar1++; // increment the active indicator (similarly to the scoring sheet from the report)
			} else if(req.body['q' + arIndex] == 'option' + arIndex + 'b') {
				ar2++;
			}
			if(req.body['q' + siIndex] == 'option' + siIndex + 'a') {
				si1++;
			} else if(req.body['q' + siIndex] == 'option' + siIndex + 'b') {
				si2++;
			}
			if(req.body['q' + vvIndex] == 'option' + vvIndex + 'a') {
				vv1++;
			} else if(req.body['q' + vvIndex] == 'option' + vvIndex + 'b') {
				vv2++;
			}
			if(req.body['q' + sgIndex] == 'option' + sgIndex + 'a') {
				sg1++;
			} else if(req.body['q' + sgIndex] == 'option' + sgIndex + 'b') {
				sg2++;
			}
			arIndex += 4;
			siIndex += 4;
			vvIndex += 4;
			sgIndex += 4;
			qNo++;
		}

		let arIndicator, siIndicator, vvIndicator, sgIndicator;
		if(ar1 > ar2) { // according to the scoring sheet, whichever variant of the indicator is greater, that is the chosen variant
			arIndicator = 'Active ' + (ar1 - ar2); // if the first indicator is greater, it means that this dimension is Active
		} else if(ar1 < ar2) {
			arIndicator = 'Reflective ' + (ar2 - ar1); // else, the dimension is Reflective
		} else {
			throw Error('There was something wrong while calculating the Active/Reflective indicator.');
		}
		if(si1 > si2) {
			siIndicator = 'Sensing ' + (si1 - si2);
		} else if(si1 < si2) {
			siIndicator = 'Intuitive ' + (si2 - si1);
		} else {
			throw Error('There was something wrong while calculating the Sensing/Intuitive indicator.');
		}
		if(vv1 > vv2) {
			vvIndicator = 'Visual ' + (vv1 - vv2);
		} else if(vv1 < vv2) {
			vvIndicator = 'Verbal ' + (vv2 - vv1);
		} else {
			throw Error('There was something wrong while calculating the Visual/Verbal indicator.');
		}
		if(sg1 > sg2) {
			sgIndicator = 'Sequential ' + (sg1 - sg2);
		} else if(sg1 < sg2) {
			sgIndicator = 'Global ' + (sg2 - sg1);
		} else {
			throw Error('There was something wrong while calculating the Sequential/Global indicator.');
		}
		const filter = { _id: user._id };
		const update = { indicators: {
			arIndicator: arIndicator,
			siIndicator: siIndicator,
			vvIndicator: vvIndicator,
			sgIndicator: sgIndicator
		}};
		let doc = await User.findOneAndUpdate(filter, update); // the Users collection is updated accordingly
		res.render(constants.LEARNING_PREFERENCES_PAGE_NAME, { title: constants.LEARNING_PREFERENCES_PAGE_TITLE, data: req.body, ilsResults: { arIndicator, siIndicator, vvIndicator, sgIndicator } });
	}
	catch(err) {
		res.render(constants.LEARNING_PREFERENCES_PAGE_NAME, { title: constants.LEARNING_PREFERENCES_PAGE_TITLE, data: req.body, error: err.message + ' Please try again.' });
	}
}

// GET request method for the Courses page
module.exports.courses_get = async (req, res) => {
	try {
		const error = req.session.error ? req.session.error : null; // display an error on the top of the page if other pages updated the session cookie with an error
		const user = req.session.user; // get the user from the session cookie
		if(!user.indicators.arIndicator) {
			res.render(constants.COURSES_PAGE_NAME, { title: constants.COURSES_PAGE_TITLE, error: error }); // if the user did not complete the ILS, display an error
		} else {
			let coursesList = []; // will contain the courses as objects
			for(let i = 0; i < user.courses.length; i++) { // search for each course
				const filter = { _id: user.courses[i].id };
				const doc = await Course.findOne(filter);
				let obj;
				if(doc.lessons.length <= user.courses[i].completion) { // if the course is completed, mark it as such and pass it to the front-end
					obj = {
						name: doc.name,
						numberOfLessons: doc.lessons.length,
						completion: user.courses[i].completion,
						completed: true
					};
				} else { // else, mark it as incomplete
					obj = {
						name: doc.name,
						numberOfLessons: doc.lessons.length,
						completion: user.courses[i].completion,
						completed: false
					};
				}
				coursesList.push(obj);
			}
			res.render(constants.COURSES_PAGE_NAME, { title: constants.COURSES_PAGE_TITLE, courses: coursesList, error: error });
		}
	}
	catch(err) {
		res.render(constants.COURSES_PAGE_NAME, { title: constants.COURSES_PAGE_TITLE, error: err.message + ' Please try again later.' });
	}
}