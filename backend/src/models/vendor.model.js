const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        businessName: {
            type: String,
            required: true,
            trim: true
        },

        businessType: {
            type: String,
            required: true,
            enum: [
                "food",
                "beverages",
                "fruits",
                "vegetables",
                "clothing",
                "electronics",
                "services",
                "other"
            ]
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;