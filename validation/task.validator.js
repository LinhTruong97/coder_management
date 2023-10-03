const { body } = require("express-validator");
const taskValidator = {};

taskValidator.validateCreateTask = [
  body("name")
    .not()
    .isEmpty()
    .withMessage("Name is required")
    .trim()
    .isString()
    .withMessage("Name must be a String"),
  body("description")
    .not()
    .isEmpty()
    .withMessage("Description is required")
    .trim()
    .isString()
    .withMessage("Description must be a String"),
];

taskValidator.validateUpdateTask = [
  body("name")
    .optional()
    .trim()
    .isString()
    .withMessage("Name must be a String"),
  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("Description must be a String"),
  body("status")
    .optional()
    .isIn(["pending", "working", "review", "done", "archive"])
    .withMessage("Invalid value for status"),
];

module.exports = taskValidator;
