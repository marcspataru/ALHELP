const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
	name: String,
	lessons: [{
		lessonName: String,
		lessonShort: String
	}]
}, { collection: 'courses' });

const Course = mongoose.model('course', courseSchema);

module.exports = Course;