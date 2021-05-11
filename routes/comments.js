const express = require('express');
const router = express.Router({mergeParams: true});

const commentController = require('../controllers/commentController');

// POST request for creating new comment
router.post('/create', commentController.comment_create);


// Edit comment
router.put('/:commentId', commentController.edit_comment);

// Delete comment
router.delete('/:commentId', commentController.delete_comment);

// Like/unlike comment
router.put('/:commentId/like', commentController.like_comment);

module.exports = router;
