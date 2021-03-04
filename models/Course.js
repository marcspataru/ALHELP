const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
	name: String,
	lessons: [{
		lessonName: String,
		lessonShort: String,
		numberOfSections: Number,
		alternativeSections: [{
			path: String,
			indicators: {
				arIndicator: String,
				siIndicator: String,
				vvIndicator: String,
				sgIndicator: String
			},	
			section: Number
		}]
	}]
}, { collection: 'courses' });

const Course = mongoose.model('course', courseSchema);

module.exports = Course;