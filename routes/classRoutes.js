const express = require('express');
const { authenticate, authorize } = require('../controllers/authController');
const {
  getClasses,
  createClass,
  getClass,
  updateClass,
  deleteClass,
  bookClass,
  getAvailableClasses,
  getAssignedClasses,
} = require('../controllers/classController');

const router = express.Router();

// for user operations on classes
router.use(authenticate);
router.route('/').get(getClasses);
router.route('/available').get(getAvailableClasses);
router
  .route('/trainer/assigned-classes')
  .get(authorize('trainer'), getAssignedClasses);
router.route('/:id').get(getClass);
router.route('/:id/book').patch(authorize('trainee'), bookClass);

// For admin operatins on classes
router.use(authorize('admin'));
router.route('/').post(createClass);
router.route('/:id').patch(updateClass).delete(deleteClass);
module.exports = router;
