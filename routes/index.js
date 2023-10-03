const { sendResponse, AppError } = require("../helpers/utils.js");

var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("Welcome to CoderSchool!");
});

// USERS
const userAPI = require("./user.api");
router.use("/user", userAPI);

// TASKS
const taskAPI = require("./task.api");
router.use("/task", taskAPI);

module.exports = router;
