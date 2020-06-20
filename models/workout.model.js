const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workoutSchema = new Schema(
  {
    user: {
      type: mongoose.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: 256,
    },
    exerciseIds: {
      type: [mongoose.ObjectId],
      required: true,
      default: [],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    likes: {
      type: [mongoose.ObjectId],
      required: true,
      default: [],
    },
    comments: {
      type: [
        {
          userId: {
            type: mongoose.ObjectId,
            required: true,
          },
          comment: {
            type: String,
            required: true,
          },
          date: {
            type: Date,
            required: true,
            default: Date.now(),
          },
        },
      ],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Workout = mongoose.model("Workout", workoutSchema);

module.exports = Workout;
