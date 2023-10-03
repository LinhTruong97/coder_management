const express = require("express");
const {
  getAllTasks,
  createTask,
  getTaskById,
  deleteTaskById,
  assignTask,
  updateTask,
} = require("../controllers/task.controllers");
const {
  validateCreateTask,
  validateUpdateTask,
} = require("../validation/task.validator");
const router = express.Router();

/**
 * @route POST api/task
 * @description Create a new task
 * @access public
 * @requiredBody: name,description
 */
router.post("/", validateCreateTask, createTask);

/**
 * @route GET api/task
 * @description Get a list of tasks
 * @access public
 * @allowedQueries: name, status, page (default: 1), limit (default: 5)
 * @sort: default sort createdAt ascending
 */

router.get("/", getAllTasks);

/**
 * @route GET api/task/:id
 * @description Get task by id
 * @access public
 * @requiredId: ObjectId
 */
router.get("/:id", getTaskById);

/**
 * @route DELETE api/task/:id
 * @description Soft delete a task by id
 * @access public
 */
router.delete("/:id", deleteTaskById);

/**
 * @route POST api/task/:id
 * @description Assign task with new user by id
 * @access public
 * @requiredId: ObjectId
 */
router.post("/:id", assignTask);

/**
 * @route PUT api/task/:id
 * @description Update task
 * @access public
 * @requiredId: ObjectId
 * @allowedStatus: pending, working, review, done, archieve
 */
router.put("/:id", validateUpdateTask, updateTask);

module.exports = router;
