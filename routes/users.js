const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require("../models/user.model");
const authenticateJWT = require("../middleware/authenticate");
const Workout = require("../models/workout.model");
const Exercise = require("../models/exercise.model");
const AWS = require("aws-sdk");
const FollowRelation = require("../models/followRelation.model");

const ID = process.env.AWSAccessKeyId;
const SECRET = process.env.AWSSecretKey;

const BUCKET_NAME = "train-track-images";

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});

router.route("/").get(authenticateJWT, (req, res) => {
  User.findById(req.user.userId)
    .select("-password")
    .then((user) => res.json(user))
    .catch((err) =>
      res.status(404).json(`Cannot find user with id ${req.user.userId}`)
    );
});

router.route("/:id").get(authenticateJWT, (req, res) => {
  User.findById(req.params.id)
    .select("-password")
    .then((user) => {
      let response = {
        ...user._doc,
        isFollowing: user.followers.includes(req.user.userId),
      };

      res.json(response);
    })
    .catch((err) =>
      res.status(404).json(`Cannot find user with id ${req.params.id}`)
    );
});

router.route("/register").post((req, res) => {
  let newUser = User({
    username: req.body.username,
  });

  newUser.password = newUser.generateHash(req.body.password);
  newUser
    .save()
    .then(() => {
      const accessToken = jwt.sign(
        { userId: newUser.id },
        process.env.TOKEN_SECRET,
        { expiresIn: "2h" }
      );

      res.json({ accessToken: accessToken });
    })
    .catch((err) =>
      res
        .status(409)
        .json(`Error: Username "${newUser.username}" is already taken`)
    );
});

router.route("/login").post((req, res) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err || user === null || !user.validPassword(req.body.password)) {
      res.status(401).json("Error: Username or password does not match");
    } else {
      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.TOKEN_SECRET,
        { expiresIn: "2h" }
      );

      res.json({ accessToken: accessToken });
    }
  }).catch((err) => res.status(400).json(`Error: ${err}`));
});

router.route("/update").post(authenticateJWT, (req, res) => {
  User.findById(req.user.userId)
    .then((currentUser) => {
      currentUser.username = req.body.username;

      currentUser
        .save()
        .then(() => {
          res.json("User Updated");
        })
        .catch((err) => {
          res.status(400).json("Error: Display name is already taken");
        });
    })
    .catch((err) =>
      res
        .status(404)
        .json(`Error: Could not find user with id ${req.params.id}`)
    );
});

router.route("/follow/:id").post(authenticateJWT, async (req, res) => {
  if (req.params.id === req.user.userId) {
    return res.status(400).json("Error: User cannot follow themselves");
  }

  const existingRelation = await FollowRelation.findOne({
    follower: req.user.userId,
    followee: req.params.id,
  }).exec();

  if (existingRelation !== null) {
    return res
      .status(400)
      .json("Error: User is already following the other user");
  }

  const newFollowRelation = FollowRelation({
    follower: req.user.userId,
    followee: req.params.id,
  });

  try {
    await newFollowRelation.save();

    res.json("User successfully followed");
  } catch (err) {
    return res.status(500).json("Error: " + err);
  }
});

router.route("/unfollow/:id").post(authenticateJWT, async (req, res) => {
  try {
    await FollowRelation.findOneAndDelete({
      follower: req.user.userId,
      followee: req.params.id,
    });

    res.json("User successfully unfollowed");
  } catch (err) {
    return res.status(500).json("Error: " + err);
  }
});

module.exports = router;
