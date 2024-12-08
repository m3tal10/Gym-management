const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.find();
    res.status(200).json({
      success: true,
      data,
    });
  });
exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const data = await Model.findById(id);
    if (!data)
      return next(
        new AppError(`No ${Model.modelName} found with that ID.`, 404),
      );

    res.status(200).json({
      success: true,
      data,
    });
  });
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Model.findByIdAndDelete(id);
    res.status(204).json({
      success: true,
      message: `${Model.modelName} ${id} deleted successfully.`,
    });
  });
