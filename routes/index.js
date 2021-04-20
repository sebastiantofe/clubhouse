const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController");

/* GET home page. */
router.get("/", function (req, res, next) {
	if (req.user) {
		// indexController.show_feed_get
		res.render('home');
	} else {
		res.render("index", { title: "Clubhouse - your new favorite social network" });

	};
});

module.exports = router;
