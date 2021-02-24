const Question = require('../models/Question');
const Course = require('../models/Course');
const User = require('../models/User.js');
const constants = require('../constants_utils.js');

const compare = (a, b) => {
	if(a.difficulty < b.difficulty) {
		return -1;
	} else {
		return 1;
	}
};

const displayPage = async (name, req, res) => {
	try {
		const user = req.session.user;
		const course = await Course.findOne({name: name});
		let correspondingID = -1;
		for(ids in user.courses) {
			if(user.courses[ids].id == course._id) {
				correspondingID = ids;
			}
		}
		if(correspondingID == -1) {
			throw Error("Could not find a matching course ID. Sorry.");
		}
		const currentLesson = course.lessons[user.courses[correspondingID].completion];
		const questions = await Question.find({courseID: course._id, lessonID: user.courses[correspondingID].completion});
		for(questionID in questions) {
			questions[questionID].difficulty = Math.abs(user.performance - questions[questionID].difficulty);
		}
		questions.sort(compare);
		// only 2 questions (most close) - slice
		res.render(currentLesson.lessonShort, { title: currentLesson.lessonName, lesson: currentLesson.lessonName, docs: questions.slice(0, 2) });
	}
	catch(err) {
		req.session.error = err.message;
		res.redirect(constants.COURSES_PAGE_URL);
	}
};

module.exports.logic_get = (req, res) => {
	displayPage(constants.LOGIC_PAGE_NAME, req, res);
}

module.exports.logic_post = async (req, res) => {
	try {
		const course = await Course.findOne({name: constants.LOGIC_PAGE_NAME});
		const qWeights = req.body.qWeight;
		let i = -1;
		let score = 0;
		const quizWeight = 0.2;
		for (qID in req.body) {
			if(req.body.hasOwnProperty(qID) && qID !== 'qWeight') {
				const ans = req.body[qID];
				if(ans === 'a1') {
					score += 1.0 * qWeights[i];
				} else if(ans === 'a2') {
					score += (0.5) * qWeights[i];
				} else if(ans === 'a3') {
					score -= 1.0 * qWeights[i];
				} else {
					throw Error("Invalid POST request.");
				}
			}
			else if(qID !== 'qWeight'){
				console.log('The question ID does not have a value');
			}
			i++;
		}
		const user = req.session.user;
		user.performance = user.performance + score * quizWeight;
		let correspondingID = -1;
		for(ids in user.courses) {
			if(user.courses[ids].id == course._id) {
				correspondingID = ids;
			}
		}
		if(correspondingID == -1) {
			throw Error("Could not find a matching course ID. Sorry.");
		}
		user.courses[correspondingID].completion++;
		const docs = await User.findOneAndUpdate({ '_id': user._id }, user, { upsert: true }, (err, doc) => {
			
			if(!err) {
				if(user.courses[correspondingID].completion === course.lessons.length) {
					res.redirect(constants.COURSES_PAGE_URL);
				} else {
					res.redirect(constants.COURSES_PAGE_URL + constants.LOGIC_PAGE_URL);
				}
			} else {
				user.courses[correspondingID].completion--;
			}
		});
	}
	catch(err) {
		req.session.error = err.message;
		res.redirect(constants.COURSES_PAGE_URL);
	}
}