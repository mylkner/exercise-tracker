const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./Schemas/userData.js");
const Exercise = require("./Schemas/exercises.js");
const cors = require("cors");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const createUser = async (username) => {
    try {
        const userData = await User.create({
            username: username,
        });
        return userData;
    } catch (err) {
        console.log(err);
    }
};

const createExercise = async (description, duration, date, userId) => {
    try {
        const exerciseData = await Exercise.create({
            description: description,
            duration: duration,
            date: new Date().toDateString(),
        });

        await User.findByIdAndUpdate(userId, {
            $push: { exercises: exerciseData._id },
        });

        return exerciseData;
    } catch (err) {
        console.log(err);
    }
};

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

app.route("/api/users")
    .get(async (req, res) => {
        const userList = await User.find();
        res.json(
            userList.map((user) => {
                return {
                    username: user.username,
                    _id: user._id,
                };
            })
        );
    })
    .post(async (req, res) => {
        const user =
            (await User.findOne({ username: req.body.username })) ||
            (await createUser(req.body.username));

        res.json({
            username: user.username,
            _id: user._id,
        });
    });

app.post("/api/users/:_id/exercises", async (req, res) => {
    try {
        const user = await User.findById(req.params._id);
        const exercise = await createExercise(
            req.body.description,
            req.body.duration,
            req.body.date,
            user._id
        );

        res.json({
            username: user.username,
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date,
            _id: user._id,
        });
    } catch (err) {
        return res.json({
            error: "Make sure id is valid, the description and duration fields are also required. Duration must be a number.",
        });
    }
});

app.get("/api/users/:_id/logs", async (req, res) => {
    try {
        const user = await User.findById(req.params._id).populate("exercises");
        const log = user.exercises.map((ex) => {
            return {
                description: ex.description,
                duration: ex.duration,
                date: ex.date,
            };
        });

        res.json({
            username: user.username,
            count: log.length,
            _id: user._id,
            log: log,
        });
    } catch (error) {
        res.json({ error: "invalid id" });
    }
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
