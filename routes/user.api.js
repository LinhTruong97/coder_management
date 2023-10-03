const express = require("express");
const {
  getAllUsers,
  getUserById,
  createUser,
  getTasksOfUser,
  deleteUserById,
} = require("../controllers/user.controllers");
const { validateCreateUser } = require("../validation/user.validator");
const router = express.Router();

/**
 * @route POST api/user
 * @description Create a new user
 * @access public
 * @requiredBody: name (String)
 * @optionalBody: role
 * @allowedRole: manager, employee (default)
 */
router.post("/", validateCreateUser, createUser);

/**
 * @route GET api/user
 * @description Get a list of users
 * @access public
 * @allowedQueries: name, role, page (default: 1), limit (default: 5)
 */
router.get("/", getAllUsers);

/**
 * @route GET api/user/:id
 * @description Get user by id
 * @access public
 * @requiredId: ObjectId
 */
router.get("/:id", getUserById);

/**
 * @route GET api/user/:id/tasks
 * @description Get all tasks of a user
 * @access public
 * @requiredId: ObjectId
 */

router.get("/:id/tasks", getTasksOfUser);

/**
 * @route DELETE api/user/:id
 * @description Soft delete a user by id
 * @access public
 * @requiredId: ObjectId
 */
router.delete("/:id", deleteUserById);

module.exports = router;
