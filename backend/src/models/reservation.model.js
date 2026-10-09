const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true
        },

        zoneId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Zone",
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled", "expired"],
            default: "pending"
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

     permitId: {
    type: String,
    unique: true,
    sparse: true,
    default: null
}
    },
    {
        timestamps: true
    }
);

const Reservation = mongoose.model(
    "Reservation",
    reservationSchema
);

module.exports = Reservation;