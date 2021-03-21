const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likeRelationSchema = new Schema({
  user: {
    type: mongoose.ObjectId,
    required: true,
  },
  workout: {
    type: mongoose.ObjectId,
    required: true,
  },
});

const LikeRelation = mongoose.model("LikeRelation", likeRelationSchema);

module.exports = LikeRelation;
