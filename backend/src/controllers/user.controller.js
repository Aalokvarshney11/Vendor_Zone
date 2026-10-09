const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Vendor = require("../models/vendor.model");
const Zone = require("../models/zone.model");
const Reservation = require("../models/reservation.model");
const Complaint = require("../models/complaint.model");

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }
        res.status(200).json({
            message: "Authenticated user",
            user
        });
    } catch (error) {
        console.error("getCurrentUser error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            message: "Users fetched successfully.",
            users
        });

    } catch (error) {
        console.error("Users fetch error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const createUserByAdmin = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and temporary password are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long."
            });
        }

        const validRoles = ["vendor", "officer", "admin"];
        const userRole = validRoles.includes(role) ? role : "officer";

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(409).json({
                message: "A user with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: userRole
        });

        res.status(201).json({
            message: `${userRole === "officer" ? "Municipal Officer" : userRole === "admin" ? "Administrator" : "Vendor"} account created successfully.`,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.createdAt
            }
        });
    } catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID."
            });
        }

        const validRoles = ["vendor", "officer", "admin"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role specified."
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            message: "User role updated successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Update user role error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID."
            });
        }

        if (req.user.userId === userId) {
            return res.status(400).json({
                message: "You cannot delete your own admin account."
            });
        }

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        // Clean up associated vendor profile if any
        await Vendor.findOneAndDelete({ userId });

        res.status(200).json({
            message: "User deleted successfully."
        });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalVendors,
            totalZones,
            totalReservations,
            totalComplaints,
            pendingVendors,
            pendingReservations,
            activePermits,
            pendingComplaints
        ] = await Promise.all([
            User.countDocuments(),
            Vendor.countDocuments(),
            Zone.countDocuments(),
            Reservation.countDocuments(),
            Complaint.countDocuments(),
            Vendor.countDocuments({ verificationStatus: "pending" }),
            Reservation.countDocuments({ status: "pending" }),
            Reservation.countDocuments({ status: "approved" }),
            Complaint.countDocuments({ status: { $in: ["pending", "in_progress"] } })
        ]);

        res.status(200).json({
            message: "Admin statistics fetched successfully.",
            stats: {
                totalUsers,
                totalVendors,
                totalZones,
                totalReservations,
                totalComplaints,
                pendingVendors,
                pendingReservations,
                activePermits,
                pendingComplaints
            }
        });

    } catch (error) {
        console.error("Stats fetch error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    getCurrentUser,
    getAllUsers,
    createUserByAdmin,
    updateUserRole,
    deleteUser,
    getAdminStats
};