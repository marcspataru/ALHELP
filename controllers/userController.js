const constants = require('../constants_utils.js');
const User = require('../models/User');
const Course = require('../models/Course');

module.exports.personal_tab_get = async (req, res) => {
	const user = req.session.user;
	if(user.indicators.arIndicator) {
		res.render(constants.PERSONAL_TAB_PAGE_NAME, { title: constants.PERSONAL_TAB_PAGE_TITLE, ilsResults: { arIndicator: user.indicators.arIndicator, siIndicator: user.indicators.siIndicator, vvIndicator: user.indicators.vvIndicator, sgIndicator: user.indicators.sgIndicator } });
	} else {
		res.render(constants.PERSONAL_TAB_PAGE_NAME, { title: constants.PERSONAL_TAB_PAGE_TITLE });
	}
}

module.exports.personal_tab_post = async (req, res) => {
	try {
		const user = req.session.user;
		let arIndex = 1;
		let ar1 = 0, ar2 = 0;
		let siIndex = 2;
		let si1 = 0, si2 = 0;
		let vvIndex = 3;
		let vv1 = 0, vv2 = 0;
		let sgIndex = 4;
		let sg1 = 0, sg2 = 0;
		let qNo = 0;
		while (qNo < 11) {
			if(req.body['q' + arIndex] == 'option' + arIndex + 'a') {
				ar1++;
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
		if(ar1 > ar2) {
			arIndicator = 'Active ' + (ar1 - ar2);
		} else if(ar1 < ar2) {
			arIndicator = 'Reflective ' + (ar2 - ar1);
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
		let doc = await User.findOneAndUpdate(filter, update);
		//console.log('found user with name: ', doc.name);/
		res.render(constants.PERSONAL_TAB_PAGE_NAME, { title: constants.PERSONAL_TAB_PAGE_TITLE, data: req.body, ilsResults: { arIndicator, siIndicator, vvIndicator, sgIndicator } });
	}
	catch(err) {
		res.render(constants.PERSONAL_TAB_PAGE_NAME, { title: constants.PERSONAL_TAB_PAGE_TITLE, data: req.body, error: err.message + ' Please try again.' });
	}
}

module.exports.courses_get = async (req, res) => {
	try {
		const error = req.session.error ? req.session.error : null;
		const user = req.session.user;
		if(!user.indicators.arIndicator) {
			res.render(constants.COURSES_PAGE_NAME, { title: constants.COURSES_PAGE_TITLE, error: error });
		} else {
			let coursesList = [];
			for(let i = 0; i < user.courses.length; i++) {
				const filter = { _id: user.courses[i].id };
				const doc = await Course.findOne(filter);
				let obj;
				if(doc.lessons.length <= user.courses[i].completion) {
					obj = {
						name: doc.name,
						completion: user.courses[i].completion,
						completed: true
					};
				} else {
					obj = {
						name: doc.name,
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