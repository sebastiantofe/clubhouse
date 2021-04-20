const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController');
const postController = require('../controllers/postController');




// GET request for creating a Group. NOTE This must come before routes that display groups (uses id).
router.get('/create', groupController.group_create_get);

// POST request for creating group.
router.post('/create', groupController.group_create_post);

// POST request for creating new post in group page
router.post('/:groupId/posts/create', postController.post_create);

// GET specific post from group
router.get('/:groupId/posts/:postId', postController.get_post_detail)


// GET request to delete group.
router.get('/:groupId/delete', groupController.group_delete_get);

// POST request to delete group.
router.post('/:groupId/delete', groupController.group_delete_post);

// GET request to update group.
router.get('/:groupId/update', groupController.group_update_get);

// POST request to update group.
router.post('/:groupId/update', groupController.group_update_post);

// GET request for one group.
router.get('/:groupId', groupController.group_page);

// GET request for list of all group items.
router.get('/', groupController.group_list);


module.exports = router;