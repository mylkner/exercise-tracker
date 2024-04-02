const mongoose = require("mongoose");

const exercise = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    date: Date,
});

module.exports = mongoose.model("Exercises", exercise);
