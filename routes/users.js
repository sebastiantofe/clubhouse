const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');

/* GET users listing. */
router.get('/', userController.users_list_get);

// GET user profile
router.get('/:userId', userController.user_profile_get);

// POST request for creating new post in user profile
router.post('/:userId/posts/create', postController.post_create);

// GET specific post from user
router.get('/:userId/posts/:postId', postController.get_post_detail);



module.exports = router;
