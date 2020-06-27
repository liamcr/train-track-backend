const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require("../models/user.model");

router.route("/register").post((req, res) => {
  let newUser = User({
    username: req.body.username,
  });

  newUser.password = newUser.generateHash(req.body.password);
  newUser
    .save()
    .then(() => {
      const accessToken = jwt.sign({ username: req.body.username });

      res.json({ accessToken: accessToken });
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/login").post((req, res) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (!user.validPassword(req.body.password)) {
      res.status(401).json("Error: Username or password does not match");
    } else {
      const accessToken = jwt.sign({ username: req.body.username });

      res.json({ accessToken: accessToken });
    }
  });
});

router.route("/follow/:id").post((req, res) => {
  User.findById(req.body.currentUserId)
    .then((currentUser) => {
      User.findById(req.params.id)
        .then((userToFollow) => {
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
        })
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
