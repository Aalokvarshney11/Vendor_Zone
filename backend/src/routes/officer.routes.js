const express = require("express");

const officerController = require("../controllers/officer.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

const router = express.Router();

router.get( "/vendors/pending", authMiddleware, requireRole("officer"), officerController.getPendingVendors );

router.patch(
    "/vendors/:vendorId/verify",
    authMiddleware,
    requireRole("officer"),
    officerController.verifyVendor
);

router.patch(
    "/vendors/:vendorId/reject",
    authMiddleware,
    requireRole("officer"),
    officerController.rejectVendor
);

router.get(
    "/reservations/pending",
    authMiddleware,
    requireRole("officer"),
    officerController.getPendingReservations
);

router.patch(
    "/reservations/:reservationId/approve",
    authMiddleware,
    requireRole("officer"),
    officerController.approveReservation
);
 
router.patch(
    "/reservations/:reservationId/reject",
    authMiddleware,
    requireRole("officer"),
    officerController.rejectReservation
);
module.exports = router;