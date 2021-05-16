const { body, validationResult } = require('express-validator');
const async = require('async');
const Group = require('../models/group');
const User = require('../models/user');
const Post = require('../models/post');


exports.users_list_get = function(req, res, next) {
    // Find all users, but omit password key
    User.find({}, function(err, users) {
        if (err) { return next(err)};

        //Send array of users
        res.json(users);
    })

};

exports.user_profile_get = function(req, res, next) {
    User.findById(req.params.userId, function(err, user) {
        if(err) { return next(err)};

        if(user === null) {
            res.json({
                message: 'User not found'
            });
        } else {
        //Send user without password
        res.json(user);
        };
    });
};

exports.delete_user = function (req, res, next) {
    req.user.remove();

    res.json({
        message: "User deleted"
    });
    return;
};