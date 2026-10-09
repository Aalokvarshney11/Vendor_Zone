const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "pending",
                "in_progress",
                "resolved",
                "rejected"
            ],
            default: "pending"
        },

        resolution: {
            type: String,
            trim: true,
            default: null
        },

        handledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Complaint = mongoose.model(
    "Complaint",
    complaintSchema
);

module.exports = Complaint;

