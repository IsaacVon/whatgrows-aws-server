const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 50 },
  email: { type: String, required: true, unique: true, maxlength: 255 },
  password: { type: String, required: true, maxlength: 1024 },
  favorites: [
    {
      plantId: Number,
      common_name: String,
      notes: String,
      image: String,
      plantUrl: String,
    },
  ],
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, name: this.name }, config.get("jwtPrivateKey"));
  return token;
};

const User = mongoose.model("User", userSchema);

exports.User = User;
