const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    qText: {
        type: String,
        required: true
    },
    qAnswer: {
        type: String
    },
    courseID: {
        type: String,
        min: 0
    },
    lessonID: Number,
    sectionID: [Number],
    qWeight: Number,
    difficulty: Number
}, { collection: 'questions' });

const Question = mongoose.model('question', questionSchema);

module.exports = Question;