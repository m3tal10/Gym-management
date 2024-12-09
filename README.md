This is a gym management application.
In this application there are two entities:
# 1. User:
# 2. Class:

Sure, here is a template for your README file based on the provided instructions:

# Gym Management

## Project Overview
<!-- Brief description of the system -->

## Relation Diagram
![Blank diagram (9)](https://github.com/user-attachments/assets/3c9370d0-e496-4388-ac9b-dad07d88dcf5)



## Technology Stack
- JavaScript

## Documentation 
Link: `https://documenter.getpostman.com/view/36963920/2sAYBd7oEX`


# Database Schema
## User Model
```javascript
{
    name: {
      type: String,
      required: [true, 'A user must have a name.'],
    },
    email: {
      type: String,
      required: [true, 'A user must have an email.'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password cannot be empty.'],
      select: false,
      minlength: [8, 'Password must be at least 8 characters long.'],
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password.'],
      validate: {
        validator: function (value) {
          return this.password === value;
        },
        message: 'Confirm password must be the same as password.',
      },
    },
    role: {
      type: String,
      enum: ['trainee', 'trainer', 'admin'],
      default: 'trainee',
    },
    passwordModifiedAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  }
```
## Class Model
```javascript
{
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
}
```

# Admin Credentials
- email: `admin@gmail.com`
- password: `test1234`


# Instructions to Run Locally
## Clone the repository:
`git clone https://github.com/m3tal10/Gym-management.git`

## Navigate to the project directory:
`cd Gym-management`

## Install dependencies:
`npm install`

## Start the server:
`npm start`


# Live Hosting Link

