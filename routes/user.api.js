const express = require("express");
const {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  getTasksOfUser,
} = require("../controllers/user.controllers");
const router = express.Router();

/**
 * @route GET api/user
 * @description Get a list of users
 * @access public
 * @allowedQueries: name
 */
router.get("/", getAllUsers);

/**
 * @route GET api/user/:id
 * @description Get user by id
 * @access public
 */
router.get("/:id", getUserById);

/**
 * @route POST api/user
 * @description Create a new user
 * @access public
 * @requiredBody: name
 */
router.post("/", createUser);

/**
 * @route DELETE api/user/:id
 * @description Soft delete a user by id
 * @access public
 */
router.delete("/:id", deleteUser);

/**
 * @route GET api/user/:id/tasks
 * @description Get all tasks of a user
 * @access public
 */

router.get("/:id/tasks", getTasksOfUser);

module.exports = router;
