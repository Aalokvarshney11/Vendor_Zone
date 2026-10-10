const mongoose = require("mongoose");
const Reservation = require("../models/reservation.model");
const Vendor = require("../models/vendor.model");
const Zone = require("../models/zone.model");
const QRCode = require("qrcode");

const createReservation = async (req, res) => {
    try {
        const { zoneId, startDate, endDate } = req.body;

        if (!zoneId || !startDate || !endDate) {
            return res.status(400).json({
                message: "Zone ID, start date and end date are required."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(zoneId)) {
            return res.status(400).json({
                message: "Invalid zone ID."
            });
        }

        const vendor = await Vendor.findOne({
            userId: req.user.userId
        });

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor profile not found."
            });
        }

        if (vendor.verificationStatus !== "verified") {
            return res.status(403).json({
                message: "Vendor is not verified."
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (
            isNaN(start.getTime()) ||
            isNaN(end.getTime()) ||
            start >= end
        ) {
            return res.status(400).json({
                message: "Invalid reservation dates."
            });
        }

        const today = new Date();

        today.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);

        if (start < today) {
            return res.status(400).json({
                message: "Reservation cannot start in the past."
            });
        }

        const maxReservationDays = 365;

        const reservationDuration =
            (end - start) / (1000 * 60 * 60 * 24);

        if (reservationDuration > maxReservationDays) {
            return res.status(400).json({
                message: "Reservation cannot exceed 365 days."
            });
        }

        const zone = await Zone.findOne({
            _id: zoneId,
            status: "active"
        });

        if (!zone) {
            return res.status(404).json({
                message: "Zone not found."
            });
        }

        if (
            !zone.allowedBusinessTypes.includes(
                vendor.businessType
            )
        ) {
            return res.status(400).json({
                message: "This business type is not allowed in this zone."
            });
        }

        if (zone.occupiedSpaces >= zone.capacity) {
            return res.status(400).json({
                message: "This zone is currently full."
            });
        }

        const existingReservation = await Reservation.findOne({
            vendorId: vendor._id,
            status: {
                $in: ["pending", "approved"]
            }
        });

        if (existingReservation) {
            return res.status(409).json({
                message: "Vendor already has an active or pending reservation."
            });
        }

        const reservation = await Reservation.create({
            vendorId: vendor._id,
            zoneId: zone._id,
            startDate: start,
            endDate: end,
            status: "pending"
        });

        res.status(201).json({
            message: "Reservation request submitted successfully.",
            reservation
        });

    } catch (error) {
        console.error("Reservation creation error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getMyReservations = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({
            userId: req.user.userId
        });

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor profile not found."
            });
        }

        const reservations = await Reservation.find({
            vendorId: vendor._id
        })
            .populate("zoneId", "name description location")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Reservations fetched successfully.",
            reservations
        });

    } catch (error) {
        console.error("Reservation fetch error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getReservationById = async (req, res) => {
    try {
        const { reservationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({
                message: "Invalid reservation ID."
            });
        }

        const vendor = await Vendor.findOne({
            userId: req.user.userId
        });

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor profile not found."
            });
        }

        const reservation = await Reservation.findOne({
            _id: reservationId,
            vendorId: vendor._id
        })
            .populate(
                "zoneId",
                "name description location capacity occupiedSpaces allowedBusinessTypes status"
            );

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found."
            });
        }

        res.status(200).json({
            message: "Reservation fetched successfully.",
            reservation
        });

    } catch (error) {
        console.error("Reservation fetch error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getPermit = async (req, res) => {
    try {
        const { reservationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({
                message: "Invalid reservation ID."
            });
        }

        const vendor = await Vendor.findOne({
            userId: req.user.userId
        });

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor profile not found."
            });
        }

        const reservation = await Reservation.findOne({
            _id: reservationId,
            vendorId: vendor._id,
            status: "approved"
        })
            .populate(
                "zoneId",
                "name description location"
            );

        if (!reservation) {
            return res.status(404).json({
                message: "Approved reservation not found."
            });
        }

        const clientBase = process.env.CLIENT_URL || "http://localhost:3000";
        const verificationUrl = `${clientBase}/verify/${reservation.permitId}`;

        let qrCode = null;
        try {
            qrCode = await QRCode.toDataURL(verificationUrl);
        } catch (qrErr) {
            console.error("QR Code generation error:", qrErr);
        }

        res.status(200).json({
            message: "Digital permit fetched successfully.",
            permit: {
                permitId: reservation.permitId,
                businessName: vendor.businessName,
                businessType: vendor.businessType,
                zone: reservation.zoneId,
                startDate: reservation.startDate,
                endDate: reservation.endDate,
                status: reservation.status,
                qrCode
            }
        });

    } catch (error) {
        console.error("Permit fetch error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const verifyPermit = async (req, res) => {
    try {
        const { permitId } = req.params;

        const reservation = await Reservation.findOne({
            permitId
        })
            .populate(
                "vendorId",
                "businessName businessType phone verificationStatus"
            )
            .populate(
                "zoneId",
                "name description location"
            );

        if (!reservation) {
            return res.status(404).json({
                valid: false,
                message: "Permit not found."
            });
        }

        const now = new Date();

        if (reservation.status !== "approved") {
            return res.status(200).json({
                valid: false,
                message: "Permit is not currently valid.",
                permit: {
                    permitId: reservation.permitId,
                    status: reservation.status
                }
            });
        }

        if (now < reservation.startDate) {
            return res.status(200).json({
                valid: false,
                message: "Permit is not active yet.",
                permit: {
                    permitId: reservation.permitId,
                    status: reservation.status,
                    startDate: reservation.startDate,
                    endDate: reservation.endDate
                }
            });
        }

        if (now > reservation.endDate) {
            return res.status(200).json({
                valid: false,
                message: "Permit has expired.",
                permit: {
                    permitId: reservation.permitId,
                    status: reservation.status,
                    startDate: reservation.startDate,
                    endDate: reservation.endDate
                }
            });
        }

        res.status(200).json({
            valid: true,
            message: "Permit is valid.",
            permit: {
                permitId: reservation.permitId,
                businessName: reservation.vendorId.businessName,
                businessType: reservation.vendorId.businessType,
                zone: reservation.zoneId,
                startDate: reservation.startDate,
                endDate: reservation.endDate,
                status: reservation.status
            }
        });

    } catch (error) {
        console.error("Permit verification error:", error);

        res.status(500).json({
            valid: false,
            message: "Internal server error"
        });
    }
};

const cancelReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({
                message: "Invalid reservation ID."
            });
        }

        const vendor = await Vendor.findOne({
            userId: req.user.userId
        });

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor profile not found."
            });
        }

        const reservation = await Reservation.findOne({
            _id: reservationId,
            vendorId: vendor._id
        });

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found."
            });
        }

        if (
            reservation.status !== "pending" &&
            reservation.status !== "approved"
        ) {
            return res.status(400).json({
                message: "This reservation cannot be cancelled."
            });
        }

        if (reservation.status === "approved") {
            const zone = await Zone.findById(
                reservation.zoneId
            );

            if (zone && zone.occupiedSpaces > 0) {
                zone.occupiedSpaces -= 1;
                await zone.save();
            }
        }

        reservation.status = "cancelled";

        await reservation.save();

        res.status(200).json({
            message: "Reservation cancelled successfully.",
            reservation
        });

    } catch (error) {
        console.error("Reservation cancellation error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate({
                path: "vendorId",
                select: "businessName businessType phone verificationStatus userId",
                populate: {
                    path: "userId",
                    select: "name email"
                }
            })
            .populate(
                "zoneId",
                "name description capacity occupiedSpaces status"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            message: "All reservations fetched successfully.",
            reservations
        });

    } catch (error) {
        console.error(
            "Admin reservations fetch error:",
            error
        );

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    createReservation,
    getMyReservations,
    getReservationById,
    getPermit,
    verifyPermit,
    cancelReservation,
    getAllReservations
};

