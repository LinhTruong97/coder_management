const { body } = require("express-validator");

const userValidator = {};

userValidator.validateCreateUser = [
  body("name")
    .not()
    .isEmpty()
    .withMessage("Name is required")
    .trim()
    .isString()
    .withMessage("Name must be a String"),
  body("role")
    .optional()
    .isIn(["manager", "employee"])
    .withMessage("Invalid value for role"),
];

module.exports = userValidator;
