const express = require('express');
const router = express.Router();

const postsRouter = require('./posts');
const groupController = require('../controllers/groupController');


// GET request for list of all groups.
router.get('/', groupController.group_list);

// POST request for creating group.
router.post('/', groupController.create_group);

// PUT request to update group info.
router.put('/:groupId', groupController.update_group);

// DELETE request to delete group.
router.delete('/:groupId', groupController.delete_group);

// GET request for one group.
router.get('/:groupId', groupController.group_page);

//Use router for posts
router.use('/:groupId/posts', postsRouter);

module.exports = router;