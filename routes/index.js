const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
	if (req.user) {
		res.render("home");
	} else {
		res.render("index", { title: "Clubhouse - your new favorite social network" });
	}
});

module.exports = router;
