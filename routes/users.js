const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const postRouter = require('./posts');

/* GET users listing. */
router.get('/', userController.users_list_get);

// GET user profile
router.get('/:userId', userController.user_profile_get);


//Use router for posts
router.use('/:userId/posts', postRouter);


module.exports = router;
