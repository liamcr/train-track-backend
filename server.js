const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true });

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

const exercisesRouter = require("./routes/exercises");
const workoutsRouter = require("./routes/workouts");
const usersRouter = require("./routes/users");
const timelineRouter = require("./routes/timeline");
const searchRouter = require("./routes/search");

app.use("/workouts", workoutsRouter);
app.use("/exercises", exercisesRouter);
app.use("/users", usersRouter);
app.use("/timeline", timelineRouter);
app.use("/search", searchRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
