const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const { getOne, getAll, deleteOne } = require('./handlerFactory');

// For '/' route
exports.getUsers = getAll(User);
exports.getUser = getOne(User);
exports.deleteUser = deleteOne(User);

// Create a trainer
exports.createTrainer = catchAsync(async (req, res, next) => {
  const data = req.body;
  const trainer = await User.create({ ...data, role: 'trainer' });
  trainer.password = undefined;
  trainer.passwordModifiedAt = undefined;

  res.status(201).json({
    success: true,
    message: 'Trainer created successfully.',
    data: trainer,
  });
});

//updating the current user
exports.updateMe = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).json({
    success: true,
    message: 'User updated successfully.',
    data: {
      user,
    },
  });
});

// Admin can only update the user credentials without passwords.
exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  delete data.password;
  delete data.passwordConfirm;
  const updatedUser = await User.findByIdAndUpdate(id, data, {
    runValidators: true,
    new: true,
  });
  res.status(200).json({
    success: true,
    message: `User ${updatedUser.id} updated successfully.`,
    data: {
      user: updatedUser,
    },
  });
});
