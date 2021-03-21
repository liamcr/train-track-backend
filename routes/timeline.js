const router = require("express").Router();
const Workout = require("../models/workout.model");
const FollowRelation = require("../models/followRelation.model");
const authenticateJWT = require("../middleware/authenticate");

router.route("/").get(authenticateJWT, async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;

  if (!Number.isInteger(limit) || !Number.isInteger(offset)) {
    res.status(400).json("Error: limit and offset params must be integers");
  }

  const following = (
    await FollowRelation.find({ follower: req.user.userId }).exec()
  ).map((relation) => relation.followee);

  const likes = await LikeRelation.find({ user: req.user.userId }).exec();

  Workout.find({
    user: { $in: [...following, req.user.userId] },
  })
    .then((workouts) => {
      let timeline = workouts
        .sort((a, b) => b.date - a.date)
        .slice(offset, offset + limit)
        .map((workout) => ({
          ...workout._doc,
          liked:
            likes.findIndex(
              (likeRelation) => likeRelation.workout === workout._id
            ) !== -1,
        }));

      res.json(timeline);
    })
    .catch((err) => {
      res
        .status(400)
        .json(`Error: Something went wrong finding workouts - ${err}`);
    });
});

module.exports = router;
