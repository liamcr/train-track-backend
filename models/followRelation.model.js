const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const followRelationSchema = new Schema({
  follower: {
    type: mongoose.ObjectId,
    required: true,
  },
  followee: {
    type: mongoose.ObjectId,
    required: true,
  },
});

const FollowRelation = mongoose.model("FollowRelation", followRelationSchema);

module.exports = FollowRelation;
