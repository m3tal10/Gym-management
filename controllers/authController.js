const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Email = require('../utils/email');

const signJWTToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

const createSendToken = (user, status, res) => {
  const token = signJWTToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    sameSite: 'None',
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  //Remove password from the output
  user.password = undefined;

  res.status(status).json({
    success: true,
    data: {
      user,
    },
  });
};

const verifyJWT = async (token) => {
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  return decoded;
};

// Signup function
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({ ...req.body, role: 'trainee' });
  await new Email(newUser).sendWelcome();
  createSendToken(newUser, 201, res);
});

// Login function
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //If no email or password given, send an error
  if (!email || !password)
    return next(new AppError('Please provide both email and password.', 400));

  const user = await User.findOne({ email }).select('+password');
  let passVerified;
  if (user) {
    passVerified = await user.comparePasswords(password, user.password);
  }

  //If no user found or password is wrong, send an error
  if (!passVerified || !user)
    return next(new AppError('Incorrect email or password.', 401));

  //If everything is verified, Sign the token and send it to the user.
  createSendToken(user, 200, res);
});

// Log out the user
exports.logout = (req, res, next) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// Authenticate the user based on JWT.
exports.authenticate = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token)
    return next(new AppError('You are not logged in. Please log in.', 401));
  const { id, iat } = await verifyJWT(token);
  const user = await User.findById(id);

  if (!user)
    return next(
      new AppError(
        'The user no longer exist. Please sign up to create a new account.',
        400,
      ),
    );
  if (user.passwordChangedAfter(iat))
    return next(
      new AppError(
        'The user recently changed password. Please log in again.',
        401,
      ),
    );
  //Grant access to the protected route
  req.user = user;
  next();
});

// Authorization functionality for role based users
exports.authorize =
  (...roles) =>
  (req, res, next) => {
    const { role } = req.user;
    if (!roles.includes(role)) {
      const authorized = roles.join(' or ').trim();
      return next(
        new AppError(
          `Unauthorized access. You must be ${authorized[0] === 'a' ? 'an' : 'a'} ${authorized} to perform this action.`,
          403,
        ),
      );
    }

    next();
  };

// Change the currently logged in user's password
exports.changePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  const { currentPass, passNew, passConfirm } = req.body;
  if (!currentPass || !passNew || !passConfirm)
    return next(new AppError('Please fill all the fields to continue.', 400));
  const passVerified = await user.comparePasswords(currentPass, user.password);
  if (!passVerified)
    return next(
      new AppError(
        'Passwords do not match. Please provide the correct password.',
        401,
      ),
    );
  user.password = passNew;
  user.passwordConfirm = passConfirm;
  await user.save();
  createSendToken(user, 200, res);
});

//Forgot password functionality
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return next(
      new AppError(
        'No user found with provided credentials. Please check your email address.',
        404,
      ),
    );

  const resetToken = user.createResetToken();
  await user.save({
    validateBeforeSave: false,
  });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const text = `Please go to the following link to reset your password: ${resetUrl}`;
  await new Email(user, resetUrl).sendPasswordReset(text, 'Password Reset');

  res.status(200).json({
    success: true,
    message:
      'Link sent to the mail. Please check your inbox for further instructions.',
  });
});

// Reset password functionality
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;
  const { resetToken } = req.params;
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user)
    return next(
      new AppError('Token expired. Please try forgot password again.', 400),
    );

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
});
