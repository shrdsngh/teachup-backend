const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const jwtKey = "user";
const cors = require("cors");
const User = require("./DB/User");
const Course = require("./DB/Course");

require("dotenv").config();

// Default values
const app = express();
const PORT = process.env.PORT;
const url = process.env.URL;

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  next();
});

// Connecting to mongoDB
mongoose
  .connect(url)
  .then(() => console.log("connected"))
  .catch(() => console.log("failed"));

// API - Registration
app.post("/user/register", async (req, res) => {
  const { username, password, email, contact, role } = req.body;
  const userDetail = {
    username: username,
    password: password,
    email: email,
    contact: contact,
    role: role,
    lecture_assigned: false,
  };

  const email_exist = await User.findOne({ email: email });
  if (email_exist) {
    res.send({ message: "This Email is already in use !" });
  } else {
    const username_exist = await User.findOne({ username: username });
    if (username_exist) {
      res.send({ message: "This username is already taken !" });
    } else {
      User.create(userDetail).then((result, err) => {
        if (result) {
          res.send({ message: "User Created Successfully" });
        } else {
          res.status(500).send({ message: err.message });
        }
      });
    }
  }
});

// API - Login
app.post("/user/login", async (req, res) => {
  const { username, password } = req.body;
  const userDetail = await User.findOne({ username: username });
  if (userDetail) {
    if (password === userDetail.password) {
      jwt.sign({ userDetail }, jwtKey, { expiresIn: 60 * 60 }, (err, token) => {
        if (err) {
          res.send("some error");
        }
        res.send({ userDetail, auth: token });
      });
    } else {
      res.send({ error: "Invalid Password" });
    }
  } else {
    res.send({ error: "user does not exist" });
  }
});

// API - fetching instructors
app.get("/admin/fetchTeachers", async (req, res) => {
  const teacherData = await User.find({ role: 0 });
  res.send(teacherData);
});

// API - adding course
app.post("/admin/addCourse", async (req, res) => {
  const {
    courseName,
    imageLink,
    tutor,
    dateValue,
    description,
    lectureLevel,
    lectureBatch,
  } = req.body;

  const courseDetail = {
    courseName,
    imageLink,
    tutor,
    dateValue,
    description,
    lectureLevel,
    lectureBatch,
  };

  console.log("Check this", courseDetail);

  const alreadyAssignedTutor = await Course.findOne({
    tutor: tutor,
    dateValue: dateValue,
  });
  if (alreadyAssignedTutor) {
    res.send({
      message: `${tutor} is already taking a lecture on this date`,
    });
  } else {
    await User.updateOne(
      { username: tutor },
      { $set: { lecture_assigned: true } }
    );
    Course.create(courseDetail).then((result, err) => {
      if (result) {
        res.send({ message: "Course Added Successfully" });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
  }
});

// API - Fetching Assigned Course
app.post("/user/fetchCourse", async (req, res) => {
  const username = req.body.username;
  const fetchCourses = await Course.find({ tutor: username });
  if (fetchCourses) {
    res.send(fetchCourses);
  } else {
    console.log("NOTHING");
    res.send({ message: "No course assigned to this instructor " });
  }
});

// starting the Server
app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
