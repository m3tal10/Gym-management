const express = require('express');

const {
  getUsers,
  updateUser,
  getUser,
  deleteUser,
  updateMe,
  createTrainer,
} = require('../controllers/userController');
const {
  signup,
  login,
  authenticate,
  authorize,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
} = require('../controllers/authController');

const router = express.Router();

//for authentication
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:resetToken').patch(resetPassword);

//For current user operation on their account informations
router.use(authenticate);
router.route('/me').patch(authenticate, updateMe);
router.route('/changePassword').patch(authenticate, changePassword);

//For admin operations on user
router.use(authorize('admin'));
router.route('/').get(getUsers).post(authenticate, createTrainer);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
