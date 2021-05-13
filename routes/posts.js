const express = require('express');
const router = express.Router({mergeParams: true});
const commentsRouter = require('./comments');
const postController = require('../controllers/postController');

// POST request for creating new post
router.post('/', postController.post_create);

// GET specific post
router.get('/:postId', postController.get_post_detail);

// Edit post
router.put('/:postId', postController.edit_post);

// Delete post
router.delete('/:postId', postController.delete_post);

// Like/unlike post
router.put('/:postId/like', postController.like_post);


router.use('/:postId/comments', commentsRouter);

module.exports = router;