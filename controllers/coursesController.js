const { jwtToUser } = require('../utils.js');
const Question = require('../models/Question');
const Course = require('../models/Course');
const User = require('../models/User.js');

const compare = (a, b) => {
	if(a.difficulty < b.difficulty) {
		return -1;
	} else {
		return 1;
	}
};

const displayPage = (name, req, res) => {
	Course.findOne({name: name}, function(err, course) {
		if(!err) {
			//console.log(course);
			if(req.cookies.jwt) {
				jwtToUser(req.cookies.jwt).then(user => {
					//console.log(course + user);
					//console.log(user.courses);
					let correspondingID = -1;
					for(ids in user.courses) {
						if(user.courses[ids].id == course._id) {
							correspondingID = ids;
						}
					}
					if(correspondingID == -1) {
						throw "Could not find a matching course ID. Sorry.";
					}
					const currentLesson = course.lessons[user.courses[correspondingID].completion];
					//console.log(user.courses);
					//console.log(user.courses[correspondingID].completion);
					Question.find({courseID: course._id, lessonID: user.courses[correspondingID].completion}, function(err, questions) {
						//console.log(questions);
						for(questionID in questions) {
							//console.log(questions[questionID]);
							//console.log(questions[questionID]["difficulty"]);
							questions[questionID].difficulty = Math.abs(user.performance - questions[questionID].difficulty);
						}
						questions.sort(compare);
						//console.log(questions);
						if(!err) {
							// only 2 questions (most close) - slice
							try {
								res.render(currentLesson.lessonShort, { title: currentLesson.lessonName, lesson: currentLesson.lessonName, docs: questions.slice(0, 2) });
							}
							catch (err) {
								res.redirect('/courses');
							}
						} else {
							throw err;
						}
					});
				});
			}
		} else {
			throw err;
		}
	});
};

module.exports.logic_get = (req, res) => {
	displayPage('Logic', req, res);
}

module.exports.logic_post = (req, res) => {
	const name = 'Logic';
	Course.findOne({name: name}, function(err, course) {
		//console.log(course);
	
		//res.send(req.body);
		const qWeights = req.body.qWeight;
		let i = -1;
		let score = 0;
		const quizWeight = 0.2;
		//console.log(qWeights);
		for (qID in req.body) {
			//console.log(qID);
			if(req.body.hasOwnProperty(qID) && qID !== 'qWeight') {
				//console.log(req.body[qID]);
				const ans = req.body[qID];
				if(ans === 'a1') {
					score += 1.0 * qWeights[i];
				} else if(ans === 'a2') {
					score += (0.5) * qWeights[i];
				} else if(ans === 'a3') {
					score -= 1.0 * qWeights[i];
				} else {
					throw "Invalid POST request.";
				}
			}
			else if(qID !== 'qWeight'){
				console.log('The question ID does not have a value');
			}
			i++;
		}
		if(req.cookies.jwt) {
			jwtToUser(req.cookies.jwt).then(user => {
				//console.log(score);
				user.performance = user.performance + score * quizWeight;
				let correspondingID = -1;
				for(ids in user.courses) {
					if(user.courses[ids].id == course._id) {
						correspondingID = ids;
					}
				}
				if(correspondingID == -1) {
					throw "Could not find a matching course ID. Sorry.";
				}
				user.courses[correspondingID].completion++;
				//console.log(user);
				User.findOneAndUpdate({'_id': user._id}, user, {upsert: true}, function(err, docs) {
					console.log('Updated');
					res.redirect('/courses/logic');
					//console.log(docs);
				});
			});
		}
	});
}