
const mongoose = require("mongoose");
const Complaint = require("../models/complaint.model");
const Vendor = require("../models/vendor.model");

const createComplaint = async (req, res) => {
    try {
        const {
            subject,
            description
        } = req.body;

        const vendor = await Vendor.findOne({
            userId: req.user.userId
        });

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor profile not found."
            });
        }

        const complaint = await Complaint.create({
            vendorId: vendor._id,
            subject,
            description
        });

        res.status(201).json({
            message: "Complaint submitted successfully.",
            complaint
        });

    } catch (error) {
        console.error("Complaint creation error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getMyComplaints = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({
            userId: req.user.userId
        });

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor profile not found."
            });
        }

        const complaints = await Complaint.find({
            vendorId: vendor._id
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            message: "Complaints fetched successfully.",
            complaints
        });

    } catch (error) {
        console.error("Complaint fetch error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate({
                path: "vendorId",
                select: "businessName businessType phone address verificationStatus userId",
                populate: {
                    path: "userId",
                    select: "name email"
                }
            })
            .populate(
                "handledBy",
                "name email role"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            message: "Complaints fetched successfully.",
            complaints
        });

    } catch (error) {
        console.error(
            "Complaints fetch error:",
            error
        );

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const updateComplaintStatus = async (req, res) => {
    try {
        const { complaintId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(complaintId)) {
            return res.status(400).json({
                message: "Invalid complaint ID."
            });
        }

        const {
            status,
            resolution
        } = req.body;

        const allowedStatuses = [
            "in_progress",
            "resolved",
            "rejected"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid complaint status."
            });
        }

        const complaint = await Complaint.findById(
            complaintId
        );

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found."
            });
        }

        complaint.status = status;

        if (resolution) {
            complaint.resolution = resolution;
        }

        complaint.handledBy = req.user.userId;

        await complaint.save();

        res.status(200).json({
            message: "Complaint status updated successfully.",
            complaint
        });

    } catch (error) {
        console.error(
            "Complaint status update error:",
            error
        );

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    createComplaint,
    getMyComplaints,
    getAllComplaints,
    updateComplaintStatus
};

