const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const classSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A class must have a name.'],
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A class must have a trainer.'],
  },
  trainees: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    validate: [
      {
        validator: function (trainees) {
          return trainees.length <= 10;
        },
        message: 'A class cannot have more than 10 trainees.',
      },
      {
        validator: function (trainees) {
          const traineesWithoutDuplicates = new Set(
            trainees.map((trainee) => String(trainee)),
          );
          return traineesWithoutDuplicates.size === trainees.length;
        },
        message: 'Trainee is already enrolled to this class. ',
      },
    ],
  },
  enrolled: {
    type: Number,
    min: [0, 'A class cannot have less than 0 trainees.'],
    max: [10, 'A class cannot have more than 10 trainees.'],
  },
  start: {
    type: Date,
    required: [true, 'A class must have a start time.'],
  },
  end: {
    type: Date,
  },
});

classSchema.pre('save', function (next) {
  if (!this.isModified('trainees')) return next();
  this.enrolled = this.trainees.length;
  next();
});
classSchema.pre('save', function (next) {
  if (!this.isModified('start') && !this.isNew) return next();
  const date = new Date(this.start);
  this.end = date.setHours(date.getHours() + 2);
  next();
});

classSchema.pre('save', async function (next) {
  if (!this.start || !this.isNew) return next();
  const startOfDay = new Date(this.start);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(this.start);
  endOfDay.setHours(23, 59, 59, 99);

  const dayClassCount = await this.constructor.countDocuments({
    start: {
      $gt: startOfDay,
      $lte: endOfDay,
    },
  });

  if (!(dayClassCount < 5)) {
    return next(new AppError('Can not add more than 5 classes per day.', 400));
  }
  next();
});

classSchema.pre('findOne', function (next) {
  this.populate([
    {
      path: 'trainees',
      select: '-__v',
    },
    {
      path: 'trainer',
      select: '-__v',
    },
  ]);
  next();
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
