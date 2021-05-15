const express = require('express');
const router = express.Router({mergeParams: true});

const friendController = require('../controllers/friendController');

//Get request for retrieving friends list of user
router.get('/', friendController.is_friend_or_same, friendController.show_friends);

// Post route for sending a friend request
router.post('/', [friendController.is_not_same_or_friend, friendController.request_exists], friendController.add_friend);

// Put route for accepting/rejecting a friend request
router.put('/', friendController.request_missing, friendController.handle_friend_request);

// Delete route for deleting a friend from current user's list of friends
router.delete('/', friendController.is_not_same_and_is_friend , friendController.delete_friend);

module.exports = router;