const mongoose = require("mongoose");

const user = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    exercises: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercises",
        },
    ],
});

module.exports = mongoose.model("Users", user);
