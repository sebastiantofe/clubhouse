const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController');



// GET request for creating a Group. NOTE This must come before routes that display groups (uses id).
router.get('/create', groupController.group_create_get);

// POST request for creating group.
router.post('/create', groupController.group_create_post);

// GET request to delete group.
router.get('/:id/delete', groupController.group_delete_get);

// POST request to delete group.
router.post('/:id/delete', groupController.group_delete_post);

// GET request to update group.
router.get('/:id/update', groupController.group_update_get);

// POST request to update group.
router.post('/:id/update', groupController.group_update_post);

// GET request for one group.
router.get('/:id', groupController.group_page);

// GET request for list of all group items.
router.get('/', groupController.group_list);


module.exports = router;