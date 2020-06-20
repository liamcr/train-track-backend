const router = require("express").Router();
const User = require("../models/user.model");

router.route("/register").post((req, res) => {
  let newUser = User({
    username: req.body.username,
  });

  newUser.password = newUser.generateHash(req.body.password);
  newUser
    .save()
    .then(() => res.json({ userId: newUser.id }))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/login").post((req, res) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (!user.validPassword(req.body.password)) {
      res.status(401).json("Error: Username or password does not match");
    } else {
      res.json({ userId: user.id });
    }
  });
});

router.route("/follow/:id").post((req, res) => {
  let currentUser = User.findById(req.body.currentUserId);
  let userToFollow = User.findById(req.params.id);

  currentUser.following.push(userToFollow.id);
  userToFollow.followers.push(currentUser.id);

  currentUser
    .save()
    .then(() =>
      userToFollow
        .save()
        .then(() => res.json("Followed!"))
        .catch((err) => res.status(400).json("Error: " + err))
    )
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
