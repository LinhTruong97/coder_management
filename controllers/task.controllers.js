const { sendResponse, AppError } = require("../helpers/utils.js");
const Task = require("../models/Task.js");

const taskController = {};

//Create a task
taskController.createTask = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0)
      throw new AppError(400, "Bad Request", "Create Task Error");
    const created = await Task.create(data);
    sendResponse(res, 200, true, created, null, "Create Task Successfully");
  } catch (error) {
    next(error);
  }
};

//Get tasks with query

//Get a single task by Id
taskController.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(400, "Bad Request", "Wrong Id Type");
    }
    const task = await Task.findOne({ _id: id, isDeleted: false }).populate(
      "assignee"
    );

    sendResponse(res, 200, true, task, null, "Get Task by Id Successfully");
  } catch (error) {
    next(error);
  }
};

// Soft delete a task
taskController.deleteTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(400, "Bad Request", "Wrong Id Type");
    }
    const options = { new: true };
    const deletedTask = await User.findByIdAndUpdate(
      id,
      { isDeleted: true },
      options
    );
    sendResponse(
      res,
      200,
      true,
      { deletedTask },
      null,
      "Delete Task Successfully"
    );
  } catch (error) {
    next(error);
  }
};

//Assign task to user
taskController;
