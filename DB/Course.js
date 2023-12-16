const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: String,
  imageLink: String,
  tutor: String,
  dateValue: String,
  description: String,
  lectureLevel: String,
  lectureBatch: String,
});

module.exports = mongoose.model("Course", courseSchema);
