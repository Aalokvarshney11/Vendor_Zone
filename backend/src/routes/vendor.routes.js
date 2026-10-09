const express = require("express");

const vendorController = require("../controllers/vendor.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
    "/profile",
    authMiddleware,
    requireRole("vendor"),
    vendorController.createVendorProfile
);

router.get(
    "/profile",
    authMiddleware,
    requireRole("vendor"),
    vendorController.getVendorProfile
);

router.patch(
    "/profile",
    authMiddleware,
    requireRole("vendor"),
    vendorController.updateVendorProfile
);

router.put(
    "/profile",
    authMiddleware,
    requireRole("vendor"),
    vendorController.updateVendorProfile
);

router.get(
    "/",
    authMiddleware,
    requireRole("admin"),
    vendorController.getAllVendors
);

module.exports = router;