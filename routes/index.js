const { Router } = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const coursesController = require('../controllers/coursesController');
const { validateToken } = require('../utils.js');

const router = Router();

router.get('/', authController.login_get);
router.post('/', [
        check('name').isLength({ min: 1 }).withMessage('Please enter a name'),
        check('password').isLength({ min: 1 }).withMessage('Please enter a password'),
    ], authController.login_post);
router.get('/register', authController.register_get);
router.post('/register', [
        check('name').isLength({ min: 1 }).withMessage('Please enter a name'),
        check('password').isLength({ min: 1 }).withMessage('Please enter a password'),
        check('cpassword').isLength({ min: 1 }).withMessage('Please confirm password'),
        check('password').custom((value, { req }) => {
            if (value !== req.body.cpassword) {
                return false;
            } else {
                return true;
            }
        }).withMessage('Passwords do not match')
    ], authController.register_post);
router.get('/logout', authController.logout_get);
router.get('/learning-preferences', validateToken, userController.learning_preferences_get);
router.post('/learning-preferences', validateToken, userController.learning_preferences_post);
router.get('/courses', validateToken, userController.courses_get);
router.get('/courses/logic', validateToken, coursesController.logic_get);
router.post('/courses/logic', validateToken, coursesController.logic_post);

module.exports = router;