const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    indicators: {
        arIndicator: String,
        siIndicator: String,
        vvIndicator: String,
        sgIndicator: String
    },
    courses: [{
        id: String,
        completion: Number
    }],
    performance: {
        type: Number
    }
});

userSchema.statics.login = async function(name, password) {
    const user = await this.findOne({ name });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('Incorrect Password');
    }
    throw Error('Incorrect Name');
};

const User = mongoose.model('user', userSchema);

module.exports = User;