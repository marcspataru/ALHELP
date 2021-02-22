const { jwtToUser } = require('../utils.js');
const User = require('../models/User');
const Course = require('../models/Course');

module.exports.personal_tab_get = (req, res) => {
    //res.status(200).json({personalTab: "ok"});
    if(req.cookies.jwt) {
        jwtToUser(req.cookies.jwt).then(user => {
            if(user.indicators.arIndicator) {
                res.render('personal-tab', { title: 'Personal Tab', ilsResults: {arIndicator: user.indicators.arIndicator, siIndicator: user.indicators.siIndicator, vvIndicator: user.indicators.vvIndicator, sgIndicator: user.indicators.sgIndicator} });
            }
            else {
                // no test was taken yet, but user has an account
                res.render('personal-tab', { title: 'Personal Tab' });
            }
        });
    } else {
        // we dont have a jwt in the cookie
        res.render('personal-tab', { title: 'Personal Tab' });
    }
}
module.exports.personal_tab_post = (req, res) => {
    //res.status(200).json(req.body);
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
    /*console.log('ar1:', ar1);
    console.log('ar2:', ar2);
    console.log('si1:', si1);
    console.log('si2:', ar2);
    console.log('vv1:', vv1);
    console.log('vv2:', vv2);
    console.log('sg1:', sg1);
    console.log('sg2:', sg2);*/

    let arIndicator, siIndicator, vvIndicator, sgIndicator;
    if(ar1 > ar2) {
        arIndicator = 'Active ' + (ar1 - ar2);
    } else if(ar1 < ar2) {
        arIndicator = 'Reflective ' + (ar2 - ar1);
    } else {
        res.status(400).send('There was something wrong while calculating the Active/Reflective indicator. Please try again later.');
    }
    if(si1 > si2) {
        siIndicator = 'Sensing ' + (si1 - si2);
    } else if(si1 < si2) {
        siIndicator = 'Intuitive ' + (si2 - si1);
    } else {
        res.status(400).send('There was something wrong while calculating the Sensing/Intuitive indicator. Please try again later.');
    }
    if(vv1 > vv2) {
        vvIndicator = 'Visual ' + (vv1 - vv2);
    } else if(vv1 < vv2) {
        vvIndicator = 'Verbal ' + (vv2 - vv1);
    } else {
        res.status(400).send('There was something wrong while calculating the Visual/Verbal indicator. Please try again later.');
    }
    if(sg1 > sg2) {
        sgIndicator = 'Sequential ' + (sg1 - sg2);
    } else if(sg1 < sg2) {
        sgIndicator = 'Global ' + (sg2 - sg1);
    } else {
        res.status(400).send('There was something wrong while calculating the Sequential/Global indicator. Please try again later.');
    }

    console.log('res.cookies.jwt: ', req.cookies.jwt);
    jwtToUser(req.cookies.jwt).then(async user => {
        //console.log('userController ', user);
        const filter = { _id: user._id };
        const update = { indicators: {
            arIndicator: arIndicator,
            siIndicator: siIndicator,
            vvIndicator: vvIndicator,
            sgIndicator: sgIndicator
        }};
        let doc = await User.findOneAndUpdate(filter, update);
        //console.log('found user with name: ', doc.name);
    });

    res.render('personal-tab', { title: 'Personal Tab', data: req.body, ilsResults: {arIndicator, siIndicator, vvIndicator, sgIndicator} });
}

module.exports.courses_get = (req, res) => {
    if(req.cookies.jwt) {
        jwtToUser(req.cookies.jwt).then(async user => {
            //console.log(user.courses);
            let coursesList = [];
            for(let i = 0; i < user.courses.length; i++) {
                //console.log(user.courses[i].id);
                const filter = { _id: user.courses[i].id };
                const docs = await Course.findOne(filter, (err, doc) => {
                    let obj;
                    //console.log(doc.lessons.length);
                    //console.log(user.courses[i].completion);
                    if(doc.lessons.length == user.courses[i].completion) {
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
                });
            }
            res.render('courses', { title: 'Courses', courses: coursesList });
        });
    } else {
        res.render('courses', { title: 'Courses' });
    }
}