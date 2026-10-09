const Zone = require("../models/zone.model");

const createZone = async (req, res) => {
    try {
        const {
            name,
            description,
            location,
            capacity,
            allowedBusinessTypes
        } = req.body;

        if (
            !name ||
            !location ||
            capacity === undefined ||
            !allowedBusinessTypes
        ) {
            return res.status(400).json({
                message: "Name, location, capacity and allowed business types are required."
            });
        }

        if (
            location.type !== "Point" ||
            !Array.isArray(location.coordinates) ||
            location.coordinates.length !== 2
        ) {
            return res.status(400).json({
                message: "Location must be a GeoJSON Point with [longitude, latitude]."
            });
        }

        const [
            longitude,
            latitude
        ] = location.coordinates;

        if (
            typeof longitude !== "number" ||
            typeof latitude !== "number" ||
            longitude < -180 ||
            longitude > 180 ||
            latitude < -90 ||
            latitude > 90
        ) {
            return res.status(400).json({
                message: "Invalid longitude or latitude."
            });
        }

        if (
            typeof capacity !== "number" ||
            capacity < 1
        ) {
            return res.status(400).json({
                message: "Capacity must be a number greater than 0."
            });
        }

        const validBusinessTypes = [
            "food",
            "beverages",
            "fruits",
            "vegetables",
            "clothing",
            "electronics",
            "services",
            "other"
        ];

        const invalidBusinessTypes =
            allowedBusinessTypes.some(
                (businessType) =>
                    !validBusinessTypes.includes(
                        businessType
                    )
            );

        if (invalidBusinessTypes) {
            return res.status(400).json({
                message: "Invalid business type provided."
            });
        }

        const existingZone = await Zone.findOne({
            "location.coordinates": {
                $all: [longitude, latitude]
            },
            status: {
                $ne: "inactive"
            }
        });

        if (existingZone) {
            return res.status(409).json({
                message: "A zone already exists at this location."
            });
        }

        const zone = await Zone.create({
            name,
            description,
            location,
            capacity,
            allowedBusinessTypes
        });

        res.status(201).json({
            message: "Zone created successfully.",
            zone
        });

    } catch (error) {
        console.error("Zone creation error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getAllZones = async (req, res) => {
    try {
        const zones = await Zone.find({
            status: "active"
        });

        res.status(200).json({
            message: "Zones fetched successfully.",
            zones
        });

    } catch (error) {
        console.error("Zone fetch error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getZoneById = async (req, res) => {
    try {
        const { zoneId } = req.params;

        const zone = await Zone.findOne({
            _id: zoneId,
            status: "active"
        });

        if (!zone) {
            return res.status(404).json({
                message: "Zone not found."
            });
        }

        res.status(200).json({
            message: "Zone fetched successfully.",
            zone
        });

    } catch (error) {
        console.error("Zone fetch error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getAllZonesForAdmin = async (req, res) => {
    try {
        const zones = await Zone.find()
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            message: "All zones fetched successfully.",
            zones
        });

    } catch (error) {
        console.error("Admin zones fetch error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getAllZonesForOfficer = async (req, res) => {
    try {
        const zones = await Zone.find()
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            message: "All zones fetched successfully.",
            zones
        });

    } catch (error) {
        console.error("Officer zones fetch error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const updateZone = async (req, res) => {
    try {
        const { zoneId } = req.params;

        const {
            name,
            description,
            location,
            capacity,
            allowedBusinessTypes
        } = req.body;

        if (
            !name ||
            !location ||
            capacity === undefined ||
            !allowedBusinessTypes
        ) {
            return res.status(400).json({
                message:
                    "Name, location, capacity and allowed business types are required."
            });
        }

        if (
            location.type !== "Point" ||
            !Array.isArray(location.coordinates) ||
            location.coordinates.length !== 2
        ) {
            return res.status(400).json({
                message:
                    "Location must be a GeoJSON Point with [longitude, latitude]."
            });
        }

        const [longitude, latitude] =
            location.coordinates;

        if (
            typeof longitude !== "number" ||
            typeof latitude !== "number" ||
            longitude < -180 ||
            longitude > 180 ||
            latitude < -90 ||
            latitude > 90
        ) {
            return res.status(400).json({
                message:
                    "Invalid longitude or latitude."
            });
        }

        if (
            typeof capacity !== "number" ||
            capacity < 1
        ) {
            return res.status(400).json({
                message:
                    "Capacity must be a number greater than 0."
            });
        }

        const validBusinessTypes = [
            "food",
            "beverages",
            "fruits",
            "vegetables",
            "clothing",
            "electronics",
            "services",
            "other"
        ];

        const invalidBusinessTypes =
            allowedBusinessTypes.some(
                (businessType) =>
                    !validBusinessTypes.includes(
                        businessType
                    )
            );

        if (invalidBusinessTypes) {
            return res.status(400).json({
                message:
                    "Invalid business type provided."
            });
        }

        const zone = await Zone.findById(zoneId);

        if (!zone) {
            return res.status(404).json({
                message: "Zone not found."
            });
        }


        if (capacity < zone.occupiedSpaces) {
            return res.status(400).json({
                message:
                    "Capacity cannot be less than occupied spaces."
            });
        }

        const existingZone = await Zone.findOne({
            _id: { $ne: zoneId },
            "location.coordinates": {
                $all: [longitude, latitude]
            },
            status: {
                $ne: "inactive"
            }
        });

        if (existingZone) {
            return res.status(409).json({
                message:
                    "Another zone already exists at this location."
            });
        }

        zone.name = name;
        zone.description = description;
        zone.location = location;
        zone.capacity = capacity;
        zone.allowedBusinessTypes =
            allowedBusinessTypes;

        await zone.save();

        res.status(200).json({
            message: "Zone updated successfully.",
            zone
        });

    } catch (error) {
        console.error(
            "Zone update error:",
            error
        );

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


const updateZoneStatus = async (req, res) => {
    try {
        const { zoneId } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = [
            "active",
            "inactive",
            "maintenance"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message:
                    "Invalid zone status."
            });
        }

        const zone = await Zone.findById(zoneId);

        if (!zone) {
            return res.status(404).json({
                message: "Zone not found."
            });
        }

        zone.status = status;

        await zone.save();

        res.status(200).json({
            message:
                "Zone status updated successfully.",
            zone
        });

    } catch (error) {
        console.error(
            "Zone status update error:",
            error
        );

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


module.exports = {
    createZone,
    getAllZones,
    getZoneById,
    getAllZonesForAdmin,
    getAllZonesForOfficer,
    updateZone,
    updateZoneStatus
};


