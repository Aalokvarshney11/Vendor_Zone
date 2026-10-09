const express = require("express");

const complaintController = require("../controllers/complaint.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    requireRole("vendor"),
    complaintController.createComplaint
);

router.get(
    "/my",
    authMiddleware,
    requireRole("vendor"),
    complaintController.getMyComplaints
);

router.get(
    "/",
    authMiddleware,
    requireRole("officer"),
    complaintController.getAllComplaints
);

router.patch(
    "/:complaintId/status",
    authMiddleware,
    requireRole("officer"),
    complaintController.updateComplaintStatus
);

router.get(
    "/admin",
    authMiddleware,
    requireRole("admin"),
    complaintController.getAllComplaints
);

router.patch(
    "/admin/:complaintId/status",
    authMiddleware,
    requireRole("admin"),
    complaintController.updateComplaintStatus
);

module.exports = router;