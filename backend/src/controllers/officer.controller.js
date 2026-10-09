const mongoose = require("mongoose");
const Vendor = require("../models/vendor.model");
const Reservation = require("../models/reservation.model");
const Zone = require("../models/zone.model");
const crypto = require("crypto");


const getPendingVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find({
            verificationStatus: "pending"
        })
            .populate("userId", "name email role")
            .sort({ createdAt: 1 });

        res.status(200).json({
            message: "Pending vendors fetched successfully.",
            vendors
        });

    } catch (error) {
        console.error("Pending vendors fetch error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const verifyVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(vendorId)) {
            return res.status(400).json({
                message: "Invalid vendor ID."
            });
        }

        const vendor = await Vendor.findById(vendorId);

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found."
            });
        }

        vendor.verificationStatus = "verified";

        await vendor.save();
        await vendor.populate("userId", "name email role");

        res.status(200).json({
            message: "Vendor verified successfully.",
            vendor
        });

    } catch (error) {
        console.error("Vendor verification error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const rejectVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(vendorId)) {
            return res.status(400).json({
                message: "Invalid vendor ID."
            });
        }

        const vendor = await Vendor.findById(vendorId);

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found."
            });
        }

        vendor.verificationStatus = "rejected";

        await vendor.save();
        await vendor.populate("userId", "name email role");

        res.status(200).json({
            message: "Vendor verification rejected.",
            vendor
        });

    } catch (error) {
        console.error("Vendor rejection error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getPendingReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({
            status: "pending"
        })
            .populate(
                "vendorId",
                "businessName businessType phone address verificationStatus"
            )
            .populate(
                "zoneId",
                "name description location capacity occupiedSpaces allowedBusinessTypes"
            )
            .sort({ createdAt: 1 });

        res.status(200).json({
            message: "Pending reservations fetched successfully.",
            reservations
        });

    } catch (error) {
        console.error("Pending reservations fetch error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const approveReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({
                message: "Invalid reservation ID."
            });
        }

        const reservation = await Reservation.findById(
            reservationId
        );

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found."
            });
        }

        const vendor = await Vendor.findById(
            reservation.vendorId
        );

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found."
            });
        }

        if (vendor.verificationStatus !== "verified") {
            return res.status(400).json({
                message: "Vendor is no longer verified."
            });
        }

        if (reservation.status !== "pending") {
            return res.status(400).json({
                message: "Reservation has already been processed."
            });
        }

        const zone = await Zone.findById(
            reservation.zoneId
        );

        if (!zone) {
            return res.status(404).json({
                message: "Zone not found."
            });
        }

        if (zone.status !== "active") {
            return res.status(400).json({
                message: "Zone is not currently active."
            });
        }

        if (zone.occupiedSpaces >= zone.capacity) {
            return res.status(400).json({
                message: "Zone is already full."
            });
        }

        reservation.status = "approved";

        reservation.permitId = `VZ-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

        zone.occupiedSpaces += 1;

        await reservation.save();
        await zone.save();

        res.status(200).json({
            message: "Reservation approved successfully.",
            reservation,
            zone
        });

    } catch (error) {
        console.error("Reservation approval error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const rejectReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({
                message: "Invalid reservation ID."
            });
        }

        const reservation = await Reservation.findById(
            reservationId
        );

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found."
            });
        }

        if (reservation.status !== "pending") {
            return res.status(400).json({
                message: "Reservation has already been processed."
            });
        }

        reservation.status = "rejected";

        await reservation.save();

        res.status(200).json({
            message: "Reservation rejected successfully.",
            reservation
        });

    } catch (error) {
        console.error("Reservation rejection error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    getPendingVendors,
    verifyVendor,
    rejectVendor,
    getPendingReservations,
    approveReservation,
    rejectReservation
};