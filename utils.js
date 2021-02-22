const jwt = require('jsonwebtoken');
const User = require('./models/User');
const maxAge = 60 * 60 * 24;
module.exports.maxAge = maxAge;

module.exports.validateToken = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        // verify makes sure that the token hasn't expired
        const result = await jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) {
                throw err;
            }
            else {
                let user = await User.findById(decoded.user);
                res.locals.name = user.name;
            }
        });
        next();
    } else {
        //res.status(401).send('Authentication error. Token required.');
        res.redirect('/');
    }
};

module.exports.jwtToUser = async (token) => {
    let user;
    const result = await jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if(err) {
            throw err;
        }
        else {
            user = await User.findById(decoded.user);
        }
    });
    return user;
};