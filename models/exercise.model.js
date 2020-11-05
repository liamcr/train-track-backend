const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const exerciseSchema = new Schema(
    {
        user: {
            type: mongoose.ObjectId,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 32,
        },
        description: {
            type: String,
            required: false,
            trim: true,
            maxlength: 256,
        },
        sets: {
            type: [
                {
                    value: {
                        type: Number,
                        required: true,
                        min: 0,
                        set: (val) => Math.floor(val),
                    },
                    unit: {
                        type: String,
                        enum: ["reps", "seconds", "minutes"],
                        required: true,
                    },
                    weight: {
                        type: {
                            value: {
                                type: Number,
                                required: true,
                                min: 0,
                            },
                            unit: {
                                type: String,
                                enum: ["lbs", "kg"],
                                required: true,
                            },
                        },
                        required: false,
                    },
                },
            ],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
