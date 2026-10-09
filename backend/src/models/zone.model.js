const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                required: true
            },

            coordinates: {
                type: [Number],
                required: true
            }
        },

        capacity: {
            type: Number,
            required: true,
            min: 1
        },

        occupiedSpaces: {
            type: Number,
            default: 0,
            min: 0
        },

        allowedBusinessTypes: {
            type: [String],
            enum: [
                "food",
                "beverages",
                "fruits",
                "vegetables",
                "clothing",
                "electronics",
                "services",
                "other"
            ],
            default: []
        },

        status: {
            type: String,
            enum: ["active", "inactive", "maintenance"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

zoneSchema.index({ location: "2dsphere" });

const Zone = mongoose.model("Zone", zoneSchema);

module.exports = Zone;