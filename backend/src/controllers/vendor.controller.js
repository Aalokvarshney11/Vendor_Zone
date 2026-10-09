const Vendor = require("../models/vendor.model");

const createVendorProfile = async (req, res) => {
    try {
        const {
            businessName,
            businessType,
            phone,
            address
        } = req.body;

        if (
            !businessName ||
            !businessType ||
            !phone ||
            !address
        ) {
            return res.status(400).json({
                message: "Business name, business type, phone and address are required."
            });
        }

        const allowedBusinessTypes = [
            "food",
            "beverages",
            "fruits",
            "vegetables",
            "clothing",
            "electronics",
            "services",
            "other"
        ];

        if (!allowedBusinessTypes.includes(businessType)) {
            return res.status(400).json({
                message: "Invalid business type."
            });
        }

        const existingProfile = await Vendor.findOne({
            userId: req.user.userId
        });

        if (existingProfile) {
            return res.status(409).json({
                message: "Vendor profile already exists."
            });
        }

        const vendor = await Vendor.create({
            userId: req.user.userId,
            businessName,
            businessType,
            phone,
            address
        });

        res.status(201).json({
            message: "Vendor profile created successfully.",
            vendor
        });

    } catch (error) {
        console.error("Vendor profile creation error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getVendorProfile = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({
            userId: req.user.userId
        }).populate("userId", "name email role");

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor profile not found."
            });
        }

        res.status(200).json({
            message: "Vendor profile fetched successfully.",
            vendor
        });

    } catch (error) {
        console.error("Vendor profile fetch error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const updateVendorProfile = async (req, res) => {
    try {
        const {
            businessName,
            businessType,
            phone,
            address
        } = req.body;

        const vendor = await Vendor.findOne({
            userId: req.user.userId
        });

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor profile not found."
            });
        }

        const allowedBusinessTypes = [
            "food",
            "beverages",
            "fruits",
            "vegetables",
            "clothing",
            "electronics",
            "services",
            "other"
        ];

        if (businessType && !allowedBusinessTypes.includes(businessType)) {
            return res.status(400).json({
                message: "Invalid business type."
            });
        }

        if (businessName) vendor.businessName = businessName;
        if (businessType) vendor.businessType = businessType;
        if (phone) vendor.phone = phone;
        if (address) vendor.address = address;

        await vendor.save();
        await vendor.populate("userId", "name email role");

        res.status(200).json({
            message: "Vendor profile updated successfully.",
            vendor
        });

    } catch (error) {
        console.error("Vendor profile update error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find()
            .populate(
                "userId",
                "name email role"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            message: "Vendors fetched successfully.",
            vendors
        });

    } catch (error) {
        console.error("Vendors fetch error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    createVendorProfile,
    getVendorProfile,
    updateVendorProfile,
    getAllVendors
};