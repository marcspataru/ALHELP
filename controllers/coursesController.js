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
		res.render(name.toLowerCase() + '/' + currentLesson.lessonShort + '/' + currentLesson.lessonShort, { lessonShort: currentLesson.lessonShort, numberOfSections: currentLesson.numberOfSections, title: currentLesson.lessonName, lesson: currentLesson.lessonName, docs: questions.slice(0, 2) });
	}
	catch(err) {
		req.session.error = err.message;
		res.redirect(constants.COURSES_PAGE_URL);
	}
};

const closeness = (indicators1, indicators2) => {
	let sum = 0;
	const ar1 = indicators1.arIndicator.match(/^(Active |Reflective )(\d|\d\d)$/);
	const ar2 = indicators2.arIndicator.match(/^(Active |Reflective )(\d|\d\d)$/);
	const si1 = indicators1.siIndicator.match(/^(Sensing |Intuitive )(\d|\d\d)$/);
	const si2 = indicators2.siIndicator.match(/^(Sensing |Intuitive )(\d|\d\d)$/);
	const vv1 = indicators1.vvIndicator.match(/^(Visual |Verbal )(\d|\d\d)$/);
	const vv2 = indicators2.vvIndicator.match(/^(Visual |Verbal )(\d|\d\d)$/);
	const sg1 = indicators1.sgIndicator.match(/^(Sequential |Global )(\d|\d\d)$/);
	const sg2 = indicators2.sgIndicator.match(/^(Sequential |Global )(\d|\d\d)$/);
	if(ar1 && ar2 && si1 && si2 && vv1 && vv2 && sg1 && sg2) {
		sum += Math.abs(ar1[2] - ar2[2]);
		sum += Math.abs(si1[2] - si2[2]);
		sum += Math.abs(vv1[2] - vv2[2]);
		sum += Math.abs(sg1[2] - sg2[2]);
		if(ar1[1] !== ar2[1]) 
			sum += 11;
		if(si1[1] !== si2[1])
			sum += 11;
		if(vv1[1] !== vv2[1])
			sum += 11;
		if(sg1[1] !== sg2[1])
			sum += 11;
	} else {
		/*
		console.log(ar1);
		console.log(ar2);
		console.log(si1);
		console.log(si2);
		console.log(vv1);
		console.log(vv2);
		console.log(sg1);
		console.log(sg2);
		*/
		throw Error('One or more indicators did not match.')
	}
	//console.log('sum: ' + sum);
	return sum;
};

module.exports.logic_get = (req, res) => {
	displayPage(constants.LOGIC_PAGE_NAME, req, res); 
}

module.exports.logic_post = async (req, res) => {
	try {
		const user = req.session.user;
		let questions = JSON.parse(req.body.questions);
		//console.log(questions);
		const course = await Course.findOne({name: constants.LOGIC_PAGE_NAME});
		let sectionPaths = [];
		let lessonName = '';
		for(obj in course.lessons) {
			//console.log(course.lessons[obj].lessonShort);
			if(course.lessons[obj].lessonShort === req.body.lessonShort) { // found the lesson, need to get alternative sections
				lessonName = course.lessons[obj].lessonName;
				for(let i = 0; i < course.lessons[obj].numberOfSections; i++) {
					const defaultAltSec = {
						closeness: 9999,
						path: ''
					};
					sectionPaths.push(defaultAltSec);
				}
				for(index in course.lessons[obj].alternativeSections) { // figure out the closest alternative sections for the user
					//console.log(course.lessons[obj].alternativeSections[index]);
					const altSec = course.lessons[obj].alternativeSections[index];
					const closenessValue = closeness(user.indicators, altSec.indicators);
					if(closenessValue < sectionPaths[altSec.section].closeness) {
						sectionPaths[altSec.section].path = altSec.path;
						sectionPaths[altSec.section].closeness = closenessValue;
						sectionPaths[altSec.section].indicators = altSec.indicators;
					}
				}
				break;
			}
		}
		let freqArr = new Array();
		for(let i = 0; i < course.lessons[obj].numberOfSections; i++) {
			const obj = {
				path: '',
				indicators: null
			};
			freqArr.push(obj);
			//console.log('sectionPaths[' + i + ']= ');
			//console.log(sectionPaths[i]);
		}
		const qWeights = req.body.qWeight;
		let qIndex = 0;
		let score = 0;
		const quizWeight = 0.2;
		for (qID in req.body) {
			if(req.body.hasOwnProperty(qID) && qID !== 'qWeight' && qID !== 'lessonShort' && qID !== 'questions') {
				const ans = req.body[qID];
				let revise = false;
				if(ans === 'a1') {
					score += 1.0 * qWeights[qIndex];
				} else if(ans === 'a2') {
					score += (0.5) * qWeights[qIndex];
					revise = true;
				} else if(ans === 'a3') {
					score -= 1.0 * qWeights[qIndex];
					revise = true;
				} else {
					throw Error("Invalid POST request.");
				}
				if(revise === true) {
					for(section in questions[qIndex].sectionID) {
						freqArr[section].path = sectionPaths[section].path;
						freqArr[section].indicators = sectionPaths[section].indicators;
					}
					//console.log('The sections which need to be revised are: ' + questions[qIndex].sectionID);
				}
				qIndex++;
			}
			else if(qID !== 'qWeight' && qID !== 'lessonShort' && qID !== 'questions'){
				console.log('The question ID does not have a value');
			}
		}
		user.performance = user.performance + score * quizWeight;
		if(user.performance < 0) {
			user.performance = 0;
		}
		if(user.performance > 1) {
			user.performance = 1;
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
		user.courses[correspondingID].completion++;
		const docs = await User.findOneAndUpdate({ '_id': user._id }, user, { upsert: true }, (err, doc) => {
			if(!err) {
				let shouldRevise = false;
				for(let i = 0; i < course.lessons[obj].numberOfSections; i++) {
					if(freqArr[i].path) {
						//console.log('freqArr[' + i + ']');
						shouldRevise = true;
					}
				}
				let redir = '#';
				if(user.courses[correspondingID].completion === course.lessons.length) {
					redir = constants.COURSES_PAGE_URL;
				} else {
					redir = constants.COURSES_PAGE_URL + constants.LOGIC_PAGE_URL;
				}
				if(shouldRevise === true) {
					//console.log(freqArr);
					res.render(constants.LOGIC_PAGE_URL_NAME + '/revise.pug', { title: 'Revision', freqArr: freqArr, lessonName: lessonName, redir: redir, userIndicators: user.indicators });
				} else {
					res.redirect(redir);
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