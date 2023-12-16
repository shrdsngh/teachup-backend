const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: String,
  username: String,
  password: String,
  email: String,
  contact: Number,
  role: Number,
  lecture_assigned: Boolean,
});

module.exports = mongoose.model("User", userSchema);
