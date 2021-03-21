const router = require("express").Router();
const Workout = require("../models/workout.model");
const Exercise = require("../models/exercise.model");
const Comment = require("../models/comment.model");
const LikeRelation = require("../models/likeRelation.model");
const authenticateJWT = require("../middleware/authenticate");

router.route("/:id").get(authenticateJWT, (req, res) => {
  Workout.findById(req.params.id)
    .then(async (workout) => {
      const liked = await LikeRelation.findOne({
        user: req.user.userId,
        workout: workout._id,
      }).exec();

      res.json({
        ...workout._doc,
        liked: liked !== null,
      });
    })
    .catch((err) => res.status(404).json("Error: " + err));
});

router.route("/user/:id").get(authenticateJWT, (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;

  if (!Number.isInteger(limit) || !Number.isInteger(offset)) {
    res.status(400).json("Error: limit and offset params must be integers");
  }

  Workout.find({ user: req.params.id })
    .then(async (workouts) => {
      const likes = await LikeRelation.find({ user: req.user.userId }).exec();

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
    .catch((err) => res.status(404).json("Error: " + err));
});

router.route("/add").post(authenticateJWT, (req, res) => {
  const userId = req.user.userId;
  const name = req.body.name;
  const description = req.body.description;
  const date = req.body.date;

  const newWorkout = new Workout({
    user: userId,
    name: name,
    description: description,
    date: date,
  });

  newWorkout
    .save()
    .then(() => res.json({ workout: newWorkout }))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/update/:id").put(authenticateJWT, (req, res) => {
  Workout.findById(req.params.id)
    .then((workout) => {
      if (workout.user.toString() !== req.user.userId) {
        return res.sendStatus(403);
      }

      if (req.body.name) workout.name = req.body.name;
      if (req.body.description) workout.description = req.body.description;
      if (req.body.date) workout.date = req.body.date;

      workout
        .save()
        .then(() => res.json("Workout updated!"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(404).json("Error: " + err));
});

router.route("/:id").delete(authenticateJWT, async (req, res) => {
  if ((await Workout.findById(req.params.id).exec()) === null) {
    res.status(404).json("Could not find workout");
    return;
  }

  try {
    await Exercise.deleteMany({
      workout: req.params.id,
    }).exec();
  } catch (err) {
    res.status(500).json("Error: " + err);
    return;
  }

  console.log(`Deleted exercises`);

  try {
    await LikeRelation.deleteMany({
      workout: req.params.id,
    }).exec();
  } catch (err) {
    res.status(500).json("Error: " + err);
    return;
  }

  console.log(`Deleted likes`);

  try {
    await Comment.deleteMany({
      workout: req.params.id,
    }).exec();
  } catch (err) {
    res.status(500).json("Error: " + err);
    return;
  }

  console.log(`Deleted comments`);

  try {
    await Workout.findByIdAndDelete(req.params.id).exec();
  } catch (err) {
    return res.status(500).json("Error: " + err);
  }

  console.log(`Deleted workout`);

  res.json("Successfully deleted workout");
});

router.route("/comment/:id").post(authenticateJWT, async (req, res) => {
  if (!req.body.comment || req.body.comment.length === 0) {
    return res.status(400).json("Error: Comment must exist and be non-blank");
  }

  const newComment = Comment({
    comment: req.body.comment,
    user: req.user.userId,
    workout: req.params.id,
  });

  try {
    await newComment.save();

    res.json("Comment posted");
  } catch (err) {
    return res.status(500).json("Error: " + err);
  }
});

router.route("/like/:id").post(authenticateJWT, async (req, res) => {
  const existingRelation = await LikeRelation.findOne({
    user: req.user.userId,
    workout: req.params.id,
  }).exec();

  if (existingRelation !== null) {
    return res.status(400).json("Error: Post is already liked");
  }

  const newLikeRelation = LikeRelation({
    user: req.user.userId,
    workout: req.params.id,
  });

  try {
    await newLikeRelation.save();

    // Note: The response message "post liked" is used in the frontend logic
    // so be careful when changing this
    res.json("Post liked!");
  } catch (err) {
    return res.status(500).json("Error: " + err);
  }
});

router.route("/unlike/:id").post(authenticateJWT, async (req, res) => {
  try {
    await LikeRelation.findOneAndDelete({
      user: req.user.userId,
      workout: req.params.id,
    });

    // Note: The response message "post unliked" is used in the frontend logic
    // so be careful when changing this
    res.json("Post unliked!");
  } catch (err) {
    return res.status(500).json("Error: " + err);
  }
});

module.exports = router;
