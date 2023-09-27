const { sendResponse, AppError } = require("../helpers/utils.js");
const User = require("../models/User.js");

const userController = {};

//Create a new user
userController.createUser = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0)
      throw new AppError(400, "Bad Request", "Create User Error");
    const created = await User.create(data);
    sendResponse(res, 200, true, created, null, "Create User Successfully");
  } catch (error) {
    next(error);
  }
};

//Get all users with filters
userController.getAllUsers = async (req, res, next) => {
  try {
    let filters = {};
    filters.isDeleted = false;
    const listUser = await User.find(filters);
    sendResponse(res, 200, true, listUser, null, "Get All Users Successfully");
  } catch (error) {
    next(error);
  }
};

//Get user by Id
userController.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(400, "Bad Request", "Wrong Id Type");
    }
    const user = await User.findOne({ _id: id, isDeleted: false });

    sendResponse(res, 200, true, user, null, "Get User by Id Successfully");
  } catch (error) {
    next(error);
  }
};

//Get all tasks of one user
userController.getTasksOfUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(400, "Bad Request", "Wrong Id Type");
    }
    const tasksList = await User.findOne(
      {
        _id: id,
        isDeleted: false,
      },
      { assignedTasks: 1 }
    ).populate("assignedTasks");
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
userController.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(400, "Bad Request", "Wrong Id Type");
    }
    const options = { new: true };
    const deletedUser = await User.findByIdAndUpdate(
      id,
      { isDeleted: true },
      options
    );
    sendResponse(res, 200, true, deletedUser, null, "Delete User Successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = userController;
