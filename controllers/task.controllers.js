const mongoose = require("mongoose");
const { sendResponse, AppError } = require("../helpers/utils.js");
const Task = require("../models/Task.js");
const { validationResult } = require("express-validator");
const User = require("../models/User.js");

const taskController = {};

//Create a task
taskController.createTask = async (req, res, next) => {
  try {
    //Catch error when validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        "400",
        errors.array().map((error) => error.msg),
        "Task Validation Error"
      );
    }
    const data = req.body;
    //Create task
    const newTask = await Task.create(data);
    //Send res
    sendResponse(res, 200, true, newTask, null, "Create Task Successfully");
  } catch (error) {
    next(error);
  }
};

//Get all tasks with query
taskController.getAllTasks = async (req, res, next) => {
  try {
    const allowedFilter = ["name", "status"];
    const allowedSortBy = ["createdAt", "updatedAt"];
    const allowedSortOrder = ["1", "-1"];

    let { page, limit, sortBy, sortOrder, ...filterQuery } = req.query;
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
    if (filterQuery.status) filters.status = filterQuery.status;
    filters.isDeleted = false;
    // Validate sortBy
    if (!sortBy) {
      sortBy = "createdAt";
    }
    if (!allowedSortBy.includes(sortBy)) {
      throw new AppError(
        400,
        "Bad Request",
        `Sort by ${sortBy} is not allowed`
      );
    }
    //Validate sortOrder
    if (!sortOrder) {
      sortOrder = "1";
    }
    if (!allowedSortOrder.includes(sortOrder)) {
      throw new AppError(
        400,
        "Bad Request",
        `Sort order ${sortOrder} is not allowed`
      );
    }

    const sort = { [sortBy]: sortOrder };
    //Get task
    const listTask = await Task.find(filters)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);
    //send res
    sendResponse(res, 200, true, listTask, null, "Get All Tasks Successfully");
  } catch (error) {
    next(error);
  }
};

//Get a single task by Id
taskController.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    //Validate TaskId
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(400, "Bad Request", "Wrong Id Type");
    }
    //Get task
    const task = await Task.findOne({ _id: id, isDeleted: false }).populate(
      "assignee"
    );
    //Check task exists
    if (!task) {
      throw new AppError(404, "Not found", "Task does not exist!");
    }
    //Send res
    sendResponse(res, 200, true, task, null, "Get Task by Id Successfully");
  } catch (error) {
    next(error);
  }
};

// Soft delete a task
taskController.deleteTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    //Validate TaskId
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(400, "Bad Request", "Wrong Id Type");
    }
    //get deleted task
    const deletedTask = await Task.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    //Check task exits
    if (!deletedTask) {
      throw new AppError(404, "Not found", "Task does not exist!");
    }
    //send res
    sendResponse(res, 200, true, deletedTask, null, "Delete Task Successfully");
  } catch (error) {
    next(error);
  }
};

//Assign task to user
taskController.assignTask = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;
    const { assignee: userId } = req.body;
    //Check taskId and userId type
    if (!mongoose.isValidObjectId(taskId)) {
      throw new AppError(400, "Bad Request", "Wrong taskId Type");
    }

    let updatedTask = await Task.findOne({ _id: taskId, isDeleted: false });
    //Check if task exists
    if (!updatedTask) {
      throw new AppError(404, "Not found", "Task does not exist!");
    }
    let currentUser = updatedTask.assignee;

    //Logic: if in body, userId null -> unassign user
    //else assign/reassign user with new userId in body

    if (userId) {
      //Assign or Reassign

      //Check userId type
      if (!mongoose.isValidObjectId(userId)) {
        throw new AppError(400, "Bad Request", "Wrong userId Type");
      }
      //Check if new user exists
      const newUser = await User.findOne({ _id: userId, isDeleted: false });
      if (!newUser) {
        throw new AppError(404, "Not found", "User does not exist!");
      }
      //If task already has user, remove task in current user
      if (currentUser) {
        await User.findByIdAndUpdate(currentUser, {
          $pull: { assignedTasks: taskId },
        });
      }
      //Add task to new user
      await User.findByIdAndUpdate(userId, {
        $addToSet: { assignedTasks: taskId },
      });
      //Update task with new user
      updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { assignee: userId },
        { new: true }
      ).populate("assignee");
      //send res
      sendResponse(
        res,
        200,
        true,
        updatedTask,
        null,
        "Assign Task Successfully"
      );
    } else {
      //Unassign
      if (currentUser) {
        await User.findByIdAndUpdate(currentUser, {
          $pull: { assignedTasks: taskId },
        });
      }
      //Update task with new assignee
      updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { assignee: null },
        { new: true }
      ).populate("assignee");

      sendResponse(
        res,
        200,
        true,
        updatedTask,
        null,
        "Unassign Task Successfully"
      );
    }
  } catch (error) {
    next(error);
  }
};

//Update a task
taskController.updateTask = async (req, res, next) => {
  try {
    //Catch error when validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        "400",
        errors.array().map((error) => error.msg),
        "Task Validation Error"
      );
    }
    const { id } = req.params;
    const {
      name: newName,
      description: newDescription,
      status: newStatus,
    } = req.body;
    //Validate TaskId
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(400, "Bad Request", "Wrong Id Type");
    }
    //Get updated task
    const updatedTask = await Task.findOne({ _id: id, isDeleted: false });
    if (updatedTask.length === 0) {
      throw new AppError(404, "Not found", "Task does not exist!");
    }
    if (!newName && !newDescription && !newStatus) {
      throw new AppError(400, "Bad Request", "Missing updated data");
    }

    let currentStatus = updatedTask.status;

    if (currentStatus === "done" && newStatus !== "archive") {
      throw new AppError(
        400,
        "Bad request",
        "Completed task can only be archived!"
      );
    }
    if (currentStatus === "archive" && newStatus !== "archive") {
      throw new AppError(400, "Bad request", "Task has already been archived!");
    }
    if (newStatus) {
      updatedTask.status = newStatus;
    }
    if (newName) {
      updatedTask.name = newName;
    }
    if (newDescription) {
      updatedTask.description = newDescription;
    }

    updatedTask.save();

    sendResponse(res, 200, true, updatedTask, null, "Update Task Successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = taskController;
