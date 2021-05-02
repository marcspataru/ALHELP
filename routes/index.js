// this file separates the routes logic from the actual controller
const { Router } = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const coursesController = require('../controllers/coursesController');
const { validateToken } = require('../utils.js'); // function for validating JWT used as middleware (route protection)

const router = Router();

router.get('/', authController.login_get); // login route
router.post('/', [
        check('name').isLength({ min: 1 }).withMessage('Please enter a name'), // validation middleware
        check('password').isLength({ min: 1 }).withMessage('Please enter a password'), // validation middleware
    ], authController.login_post); // login route
router.get('/register', authController.register_get); // register route
router.post('/register', [
        check('name').isLength({ min: 1 }).withMessage('Please enter a name'), // validation middleware
        check('password').isLength({ min: 1 }).withMessage('Please enter a password'), // validation middleware
        check('cpassword').isLength({ min: 1 }).withMessage('Please confirm password'), // validation middleware
        check('password').custom((value, { req }) => { // validation middleware, checks if password is equal to confirm password
            if (value !== req.body.cpassword) {
                return false;
            } else {
                return true;
            }
        }).withMessage('Passwords do not match')
    ], authController.register_post); // register route
router.get('/logout', authController.logout_get); // logout route
router.get('/learning-preferences', validateToken, userController.learning_preferences_get); // learning preferences route with validate token middleware
router.post('/learning-preferences', validateToken, userController.learning_preferences_post); // learning preferences route with validate token middleware
router.get('/courses', validateToken, userController.courses_get); // courses route with validate token middleware
router.get('/courses/logic', validateToken, coursesController.logic_get); // logic route with validate token middleware
router.post('/courses/logic', validateToken, coursesController.logic_post); // logic route with validate token middleware

module.exports = router;