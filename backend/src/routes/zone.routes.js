const express = require("express");

const zoneController = require("../controllers/zone.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    requireRole("officer"),
    zoneController.createZone
);

router.get(
    "/",
    authMiddleware,
    requireRole("vendor"),
    zoneController.getAllZones
);

router.get(
    "/admin",
    authMiddleware,
    requireRole("admin"),
    zoneController.getAllZonesForAdmin
);

router.get(
    "/officer",
    authMiddleware,
    requireRole("officer"),
    zoneController.getAllZonesForOfficer
);

router.patch(
    "/:zoneId/status",
    authMiddleware,
    requireRole("officer"),
    zoneController.updateZoneStatus
);

router.patch(
    "/:zoneId",
    authMiddleware,
    requireRole("officer"),
    zoneController.updateZone
);

router.get(
    "/:zoneId",
    authMiddleware,
    requireRole("vendor"),
    zoneController.getZoneById
);

module.exports = router;