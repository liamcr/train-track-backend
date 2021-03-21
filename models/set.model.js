const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const setSchema = new Schema({
  exercise: {
    type: mongoose.ObjectId,
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    enum: ["reps", "seconds", "minutes"],
    required: true,
  },
  weight: {
    type: {
      value: {
        type: Number,
        required: true,
        min: 0,
      },
      unit: {
        type: String,
        enum: ["lbs", "kg"],
        required: true,
      },
    },
    required: false,
  },
});

const Set = mongoose.model("Set", setSchema);

module.exports = Set;
