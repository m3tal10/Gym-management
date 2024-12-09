

# Gym Management

## Project Overview
This is a gym management application.
In this application, there are two entities:
## 1. User:
The users can have 3 roles: Admin, Trainer, Trainee.
## 2. Class:
Admin can create a class and assign a trainer to the class and then trainees can enroll to the class if there are less than 10 trainees enrolled.

This application ensures proper security. Trainees can enroll in a class, trainers can view their assigned classes and the start and end times. Admins can create trainers, and classes and modify the existing entities.
## Relation Diagram
### Diagram 01:
![Blank diagram (9)](https://github.com/user-attachments/assets/3c9370d0-e496-4388-ac9b-dad07d88dcf5)
- This is a high-level relation diagram between the two entities User and Class.
- It is mandatory for a class to have at least one user. Such as a trainer. Or else, the class cannot exist.
- The class can contain multiple users and a single user can enroll(trainees)/get assigned(trainers) to multiple classes. So, it is a Many to Many relationship.

### Diagram 02:
![Blank diagram (8)](https://github.com/user-attachments/assets/933bda23-3559-43ee-b285-1182dd7de1af)

- This is a more detailed relation diagram based on each user's role. We can see three tables: admin, trainers, and trainees.
- A mandatory one-to-many relationship connects the trainer and the class. Because A class cannot exist without a trainer. So, a class must have a trainer to exist.
- A many-to-many relationship connects the trainee and the class. It is not mandatory for each of the entities to be connected. A class can have zero trainees, a trainee might not join any class.

## Technology Stack
- JavaScript
- ExpressJS
- Mongoose ODM
- MongoDB
- JWT

## Documentation 
Link: [API Documentation](https://documenter.getpostman.com/view/36963920/2sAYBd7oEX)


# NOSQL Database Schema
## User Schema
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
## Class Schema
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

# Testing instructions
### Admin Credentials
- email: `admin@gmail.com`
- password: `test1234`
### Trainer Credentials
- email: `trainer@gmail.com`
- password: `test1234`
### Trainee Credentials
- email: `trainee@gmail.com`
- password: `test1234`

### Test key features:
#### Creating Trainers:
1. Log in as an admin.
2. Create a POST request to the following link:
- `https://gym-management-red.vercel.app/api/v1/users/`
3. Add the following JSON in the request body:
  ```javascript
  {
	"name": "fay",
    "email":"trainer2@gmail.com",
    "password": "test1234",
    "passwordConfirm": "test1234"
  }
  ```
4. The response should contain the data of the new user created with the role of 'trainer' and a status code of 201.

#### Scheduling Classes
1. Log in as an admin.
2. Create a POST request to the following link:
- `https://gym-management-red.vercel.app/api/v1/classes`
3. Add the following JSON in the request body (Be sure to add the start time according to your current time or else there won't be any available classes):
  ```javascript
  {
    "trainer":"6755b46a8ee85dccae284d96",
    "name": "yo yo",
    "start":"2024-12-09T10:30:05.957Z"
  }
  ```
4. The response should contain the data of the newly scheduled class and a status code of 201.

#### Booking Classes
1. Log in as a trainee.
2. Create a GET request to the following link:
- `https://gym-management-red.vercel.app/api/v1/classes/available`
3. If there is a class then copy the id of the class. (If there is no class you should log in as an admin and create a class with the end time greater than the current time and enrolled less than 10.)
4. Create a PATCH request to the following link replacing the `:id` field with the id copied in the third step:
- `https://gym-management-red.vercel.app/api/v1/classes/:id/book`
5. The response should contain the data of the booked class where `trainees` field contains the currently logged-in trainee ID and a status code of 200.

# Instructions to Run Locally
### 01. Clone the repository:
`git clone https://github.com/m3tal10/Gym-management.git`

### 02. Navigate to the project directory:
`cd Gym-management`

### 03. Install dependencies:
`npm install`

### 04. Start the server:
You can use the following command to run the development server. The development server will show broader error messages with full details. (Makes it easier to debug)
- `npm start`

You can use the following command to run the production server. The production server will show brief error messages without specific details. (Makes it secure so that the client does not gets to know about the exact error details.)
- `npm run start:prod`

# Live Hosting Link
[https://gym-management-red.vercel.app/api/v1/](https://gym-management-red.vercel.app/api/v1/)
