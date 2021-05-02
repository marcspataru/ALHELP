const Question = require('../models/Question'); // required for the use of Questions collection
const Course = require('../models/Course'); // required for the use of Courses collection
const User = require('../models/User.js'); // required for the use of Users collection
const constants = require('../constants_utils.js'); // utility file with constants

// sorting function for the quiz questions based on difficulties
const compare = (a, b) => {
	if(a.difficulty < b.difficulty) {
		return -1;
	} else {
		return 1;
	}
};

// function used to render each lesson from the Logic course
const displayPage = async (name, req, res) => {
	try {
		const user = req.session.user; // the user is usually stored in the session in these cases
		const course = await Course.findOne({name: name});
		let correspondingID = -1; // initialised this way for error handling purposes
		for(ids in user.courses) {
			if(user.courses[ids].id == course._id) {
				correspondingID = ids; // searching the course based on the name of the course provided as parameter (e.g. LOGIC_NAME constant)
			}
		}
		if(correspondingID == -1) {
			throw Error("Could not find a matching course ID. Sorry.");
		}
		const currentLesson = course.lessons[user.courses[correspondingID].completion]; // get the current lesson from all three lessons based on user completion of the course
		// query the questions collection based on courseID and user completion (lesson index)
		const questions = await Question.find({courseID: course._id, lessonID: user.courses[correspondingID].completion});
		for(questionID in questions) {
			questions[questionID].difficulty = Math.abs(user.performance - questions[questionID].difficulty); // calculate the closeness to the users performance
		}
		questions.sort(compare); // sort the closeness array
		// only 2 questions (most close) - slice
		res.render(name.toLowerCase() + '/' + currentLesson.lessonShort + '/' + currentLesson.lessonShort, { lessonShort: currentLesson.lessonShort, numberOfSections: currentLesson.numberOfSections, title: currentLesson.lessonName, lesson: currentLesson.lessonName, docs: questions.slice(0, 2) });
	}
	catch(err) {
		req.session.error = err.message;
		res.redirect(constants.COURSES_PAGE_URL);
	}
};

// closeness function - content adaptivity
const closeness = (indicators1, indicators2) => {
	let sum = 0;
	// Regex matching
	// we think about the closeness of each variants of a dimension as an axis with one end being Active and the other one being Reflective
	// in addition, we add these closeness factors to determine how well the adaptive section is to a user. The bigger the sum, the worse the
	// section is for the user
	const ar1 = indicators1.arIndicator.match(/^(Active |Reflective )(\d|\d\d)$/);
	const ar2 = indicators2.arIndicator.match(/^(Active |Reflective )(\d|\d\d)$/);
	const si1 = indicators1.siIndicator.match(/^(Sensing |Intuitive )(\d|\d\d)$/);
	const si2 = indicators2.siIndicator.match(/^(Sensing |Intuitive )(\d|\d\d)$/);
	const vv1 = indicators1.vvIndicator.match(/^(Visual |Verbal )(\d|\d\d)$/);
	const vv2 = indicators2.vvIndicator.match(/^(Visual |Verbal )(\d|\d\d)$/);
	const sg1 = indicators1.sgIndicator.match(/^(Sequential |Global )(\d|\d\d)$/);
	const sg2 = indicators2.sgIndicator.match(/^(Sequential |Global )(\d|\d\d)$/);
	if(ar1 && ar2 && si1 && si2 && vv1 && vv2 && sg1 && sg2) {
		if(ar1[1] !== ar2[1])
			sum += +ar1[2] + +ar2[2]; 
		else
			sum += Math.abs(ar1[2] - ar2[2]);
		if(si1[1] !== si2[1])
			sum += +si1[2] + +si2[2];
		else
			sum += Math.abs(si1[2] - si2[2]);
		if(vv1[1] !== vv2[1])
			sum += +vv1[2] + +vv2[2];
		else
			sum += Math.abs(vv1[2] - vv2[2]);
		if(sg1[1] !== sg2[1])
			sum += +sg1[2] + +sg2[2];
		else
			sum += Math.abs(sg1[2] - sg2[2]);
	} else {
		throw Error('One or more indicators did not match.') // incorrect request
	}
	return sum;
};

// get request function for the logic page. This includes all lessons and quizzes
module.exports.logic_get = (req, res) => {
	displayPage(constants.LOGIC_PAGE_NAME, req, res); 
}

// quiz submission function (POST request)
module.exports.logic_post = async (req, res) => {
	try {
		const user = req.session.user;
		let questions = JSON.parse(req.body.questions); // the questions can be found in a JSON object attached to the request body
		const course = await Course.findOne({name: constants.LOGIC_PAGE_NAME});
		let sectionPaths = []; // will contain a path (not used in final implementation), the closeness and indicators of an adaptive section
		let lessonName = ''; // will contain the lesson name
		for(obj in course.lessons) { // iterate through all lessons
			if(course.lessons[obj].lessonShort === req.body.lessonShort) { // found the lesson, need to get alternative sections
				lessonName = course.lessons[obj].lessonName; // update lesson name variable
				for(let i = 0; i < course.lessons[obj].numberOfSections; i++) { // initialise sectionPaths array
					const defaultAltSec = {
						closeness: 9999,
						path: ''
					};
					sectionPaths.push(defaultAltSec);
				}
				for(index in course.lessons[obj].alternativeSections) { // figure out the closest alternative sections for the user
					const altSec = course.lessons[obj].alternativeSections[index]; // stores the object representing an alternative section
					const closenessValue = closeness(user.indicators, altSec.indicators); // closeness between user indicators and alternative section indicators
					if(closenessValue < sectionPaths[altSec.section].closeness) { // update the sectionPaths array
						sectionPaths[altSec.section].path = altSec.path;
						sectionPaths[altSec.section].closeness = closenessValue;
						sectionPaths[altSec.section].indicators = altSec.indicators;
					}
				}
				break;
			}
		}
		let freqArr = new Array(); // we only need to present alternative sections for sections that relate to the question that the user got wrong
		// we use the frequency array to track what sections are actually relevant
		for(let i = 0; i < course.lessons[obj].numberOfSections; i++) {
			const obj = {
				path: '',
				indicators: null
			};
			freqArr.push(obj);
		}
		const qWeights = req.body.qWeight; // all question weights (always 0.5 in current implementation but if more questions are added the value should update automatically)
		let qIndex = 0; // iterate through all questions 
		let score = 0; // keep track of the score
		const quizWeight = 0.2; // constant quiz weight
		for (qID in req.body) { // assessment adaptivity algorithm
			if(req.body.hasOwnProperty(qID) && qID !== 'qWeight' && qID !== 'lessonShort' && qID !== 'questions') {
				const ans = req.body[qID];
				let revise = false;
				if(ans === 'a1') {
					score += 1.0 * qWeights[qIndex]; // first answer
				} else if(ans === 'a2') {
					score += (0.5) * qWeights[qIndex]; // second answer
					revise = true; // the question should be marked for revision
				} else if(ans === 'a3') {
					score -= 1.0 * qWeights[qIndex]; // third answer
					revise = true; // the question should be marked for revision
				} else {
					throw Error("Invalid POST request.");
				}
				if(revise === true) { // mark it in the frequency array
					for(section in questions[qIndex].sectionID) {
						freqArr[section].path = sectionPaths[section].path;
						freqArr[section].indicators = sectionPaths[section].indicators;
					}
				}
				qIndex++;
			}
			else if(qID !== 'qWeight' && qID !== 'lessonShort' && qID !== 'questions'){
				console.log('The question ID does not have a value');
			}
		}
		user.performance = user.performance + score * quizWeight; // update the user performance
		if(user.performance < 0) {
			user.performance = 0.01; // problem with MongoDB and how it dynamically changes types (0 would be converted to int)
		}
		if(user.performance > 1) {
			user.performance = 0.99; // problem with MongoDB and how it dynamically changes types (1 would be converted to int)
		}
		let correspondingID = -1;
		for(ids in user.courses) {
			if(user.courses[ids].id == course._id) {
				correspondingID = ids;
			}
		}
		if(correspondingID == -1) {
			throw Error("Could not find a matching course ID. Sorry.");
		}
		user.courses[correspondingID].completion++; // update the user completion object locally
		const docs = await User.findOneAndUpdate({ '_id': user._id }, user, { upsert: true }, (err, doc) => { // update the user collection
			if(!err) {
				let shouldRevise = false;
				for(let i = 0; i < course.lessons[obj].numberOfSections; i++) {
					if(freqArr[i].path) { // if the section is marked
						shouldRevise = true;
					}
				}
				let redir = '#'; // if there is no need for revision, automatically redirect the user to the same page (results in a GET request)
				if(user.courses[correspondingID].completion === course.lessons.length) {
					redir = constants.COURSES_PAGE_URL; // if the user finished the course, redirect them to the Courses page
				} else {
					redir = constants.COURSES_PAGE_URL + constants.LOGIC_PAGE_URL; // else, redirect them to the next lesson
				}
				if(shouldRevise === true) {
					// if there was at least one section which needed revision, render the revision view
					res.render(constants.LOGIC_PAGE_URL_NAME + '/revise.pug', { title: 'Revision', freqArr: freqArr, lessonName: lessonName, redir: redir, userIndicators: user.indicators });
				} else {
					// else, redirect to either courses page or next lesson
					res.redirect(redir);
				}
			} else {
				user.courses[correspondingID].completion--; // in case of error, revert completion
			}
		});
	}
	catch(err) {
		req.session.error = err.message;
		res.redirect(constants.COURSES_PAGE_URL);
	}
}