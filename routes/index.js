const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController");

/* GET home page. */
router.get("/feed", indexController.show_feed);

module.exports = router;
