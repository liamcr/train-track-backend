const router = require("express").Router();
const User = require("../models/user.model");
const Workout = require("../models/workout.model");
const authenticateJWT = require("../middleware/authenticate");

router.route("/").get(authenticateJWT, (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;

  if (!Number.isInteger(limit) || !Number.isInteger(offset)) {
    res.status(400).json("Error: limit and offset params must be integers");
  }

  User.findById(req.user.userId)
    .then((currentUser) => {
      Workout.find({
        user: { $in: [...currentUser.following, req.user.userId] },
      })
        .then((workouts) => {
          let timeline = workouts
            .sort((a, b) => b.date - a.date)
            .slice(offset, offset + limit);

          res.json(timeline);
        })
        .catch((err) => {
          res
            .status(400)
            .json(`Error: Something went wrong finding workouts - ${err}`);
        });
    })
    .catch((err) => {
      res
        .status(404)
        .json(`Error: Could not find user with id ${req.user.userId}`);
    });
});

module.exports = router;
