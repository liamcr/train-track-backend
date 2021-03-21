const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    user: {
      type: mongoose.ObjectId,
      required: true,
    },
    workout: {
      type: mongoose.ObjectId,
      required: true,
    },
    comment: {
      type: String,
      required: true,
      minlength: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
