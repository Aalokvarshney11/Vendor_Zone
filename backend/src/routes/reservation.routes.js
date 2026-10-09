const express = require("express");

const reservationController = require("../controllers/reservation.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    requireRole("vendor"),
    reservationController.createReservation
);

router.get(
    "/my",
    authMiddleware,
    requireRole("vendor"),
    reservationController.getMyReservations
);

router.get(
    "/admin",
    authMiddleware,
    requireRole("admin"),
    reservationController.getAllReservations
);

router.get(
    "/verify/:permitId",
    reservationController.verifyPermit
);

router.get(
    "/:reservationId/permit",
    authMiddleware,
    requireRole("vendor"),
    reservationController.getPermit
);

router.get(
    "/:reservationId",
    authMiddleware,
    requireRole("vendor"),
    reservationController.getReservationById
);

router.patch(
    "/:reservationId/cancel",
    authMiddleware,
    requireRole("vendor"),
    reservationController.cancelReservation
);

module.exports = router;