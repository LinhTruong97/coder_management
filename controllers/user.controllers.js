const mongoose = require("mongoose");
const { sendResponse, AppError } = require("../helpers/utils.js");
const User = require("../models/User.js");
const { validationResult } = require("express-validator");

const userController = {};

//Create a new user
userController.createUser = async (req, res, next) => {
  try {
    //Catch error when validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        "400",
        errors.array().map((error) => error.msg),
        "User Validation Error"
      );
    }
    const data = req.body;
    //Create user
    const newUser = await User.create(data);
    //Send response
    sendResponse(res, 200, true, newUser, null, "Create User Successfully");
  } catch (error) {
    next(error);
  }
};

//Get all users with query
userController.getAllUsers = async (req, res, next) => {
  try {
    const allowedFilter = ["name", "role"];
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    //Validate allowed query key
    Object.keys(filterQuery).forEach((key) => {
      if (!allowedFilter.includes(key)) {
        throw new AppError(400, "Bad Request", `Query ${key} is not allowed`);
      }
    });
    //Create filters
    let filters = {};
    if (filterQuery.name) filters.name = filterQuery.name;
    if (filterQuery.role) filters.role = filterQuery.role;
    filters.isDeleted = false;
    //Get user's list
    const listUser = await User.find(filters)
      .skip((page - 1) * limit)
      .limit(limit);
    //send res
    sendResponse(res, 200, true, listUser, null, "Get All Users Successfully");
  } catch (error) {
    next(error);
  }
};

//Get user by Id
userController.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    //Validate UserId
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(400, "Bad Request", "Wrong Id Type");
    }
    //Get user
    const user = await User.findOne({ _id: id, isDeleted: false });
    //Validate if user exists
    if (!user) {
      throw new AppError(404, "Not found", "User does not exist!");
    }
    //send res
    sendResponse(res, 200, true, user, null, "Get User by Id Successfully");
  } catch (error) {
    next(error);
  }
};

//Get all tasks of one user
userController.getTasksOfUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    //Validate UserId
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(400, "Bad Request", "Wrong Id Type");
    }
    //get tasks list
    const tasksList = await User.findOne(
      {
        _id: id,
        isDeleted: false,
      },
      { assignedTasks: 1 }
    ).populate("assignedTasks");
    //Validate if user exists
    if (!tasksList) {
      throw new AppError(404, "Not found", "User does not exist!");
    }
    //send res
    sendResponse(
      res,
      200,
      true,
      tasksList,
      null,
      "Get Tasks of User Successfully"
    );
  } catch (error) {
    next(error);
  }
};

//Delete user
userController.deleteUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    //Validate UserId
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(400, "Bad Request", "Wrong Id Type");
    }
    //Get deleted user
    const deletedUser = await User.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    //Validate if user exists
    if (!deletedUser) {
      throw new AppError(404, "Not found", "User does not exist!");
    }
    //send response
    sendResponse(res, 200, true, deletedUser, null, "Delete User Successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = userController;
