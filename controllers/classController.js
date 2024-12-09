const Class = require('../models/classModel');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { getAll, getOne, deleteOne } = require('./handlerFactory');

// Functions to perform generic actions.
exports.getClasses = getAll(Class);
exports.getClass = getOne(Class);
exports.deleteClass = deleteOne(Class);

// Function to get available classes
exports.getAvailableClasses = catchAsync(async (req, res, next) => {
  const availableClasses = await Class.find({
    end: {
      $gte: Date.now(),
    },
    enrolled: {
      $lt: 10,
    },
  });
  res.status(200).json({
    success: true,
    data: {
      classes: availableClasses,
    },
  });
});

// Function to get assigned classes for trainers
exports.getAssignedClasses = catchAsync(async (req, res, next) => {
  const assignedClasses = await Class.find({
    trainer: req.user.id,
  });

  res.status(200).json({
    success: true,
    data: {
      classes: assignedClasses,
    },
  });
});

// Function to book a class
exports.bookClass = catchAsync(async (req, res, next) => {
  const { id: classId } = req.params;
  const { id: traineeId } = req.user;
  const bookedClass = await Class.findOne({
    _id: classId,
    end: { $gt: Date.now() },
  });
  if (!bookedClass) {
    return next(new AppError('The class is not available anymore.', 400));
  }
  bookedClass.trainees.push(traineeId);
  await bookedClass.save();
  res.status(201).json({
    success: true,
    message: 'Class booked successfully.',
    data: {
      bookedClass,
    },
  });
});

// Function to create a class (Not more than 5 classes can be created per day)
exports.createClass = catchAsync(async (req, res, next) => {
  const trainer = await User.findOne({
    _id: req.body.trainer,
    role: 'trainer',
  });

  if (!trainer) {
    return next(new AppError('No trainer found with the given ID.', 404));
  }
  const schedule = await Class.create({ ...req.body, trainer });
  res.status(201).json({
    success: true,
    message: 'Schedule created successfully.',
    data: {
      class: schedule,
    },
  });
});

// Function to update class information.(Only for admins)
exports.updateClass = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.start) {
    const date = new Date(req.body.start);
    req.body.end = date.setHours(date.getHours() + 2);
  }
  const updatedClass = await Class.findByIdAndUpdate(
    id,
    {
      ...req.body,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  if (!updatedClass) {
    return next(new AppError('No class found with the given ID.', 404));
  }
  res.status(200).json({
    success: true,
    data: {
      class: updatedClass,
    },
  });
});
