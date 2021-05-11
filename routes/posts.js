const express = require('express');
const router = express.Router({mergeParams: true});

const postController = require('../controllers/postController');

// POST request for creating new post
router.post('/create', postController.post_create);

// GET specific post
router.get('/:postId', postController.get_post_detail);



module.exports = router;