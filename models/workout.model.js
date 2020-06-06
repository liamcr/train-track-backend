const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const exerciseSchema = new Schema(
  {
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
    sets: {
      type: [
        {
          value: {
            type: Number,
            required: true,
            min: 0,
            set: (val) => Math.floor(val),
          },
          unit: {
            type: String,
            enum: ["reps", "seconds", "minutes"],
            required: true,
          },
        },
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const workoutSchema = new Schema(
  {
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
    exercises: {
      type: [exerciseSchema],
      required: true,
      default: [],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

const Workout = mongoose.model("Workout", workoutSchema);

module.exports = Workout;
