const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const postsRouter = require('./posts');
const friendsRouter = require('./friends');

/* GET users listing. */
router.get('/', userController.users_list_get);

// GET user profile
router.get('/:userId', userController.user_profile_get);

// Post route for friends operations (add - send request, accept - confirm request, reject - deny request, delete friend)
router.use('/:userId/friends', friendsRouter);

//Use router for posts
router.use('/:userId/posts', postsRouter);

// DELETE route fo deleting user
router.delete('/:userId', userController.delete_user);

module.exports = router;
