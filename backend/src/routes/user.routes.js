const express = require("express");

const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

const router = express.Router();

router.get("/me", authMiddleware, userController.getCurrentUser);
router.get("/vendor-test", authMiddleware, requireRole("vendor"), userController.getCurrentUser
);
router.get(
    "/stats",
    authMiddleware,
    requireRole("admin"),
    userController.getAdminStats
);

router.get(
    "/",
    authMiddleware,
    requireRole("admin"),
    userController.getAllUsers
);

router.post(
    "/",
    authMiddleware,
    requireRole("admin"),
    userController.createUserByAdmin
);

router.patch(
    "/:userId/role",
    authMiddleware,
    requireRole("admin"),
    userController.updateUserRole
);

router.delete(
    "/:userId",
    authMiddleware,
    requireRole("admin"),
    userController.deleteUser
);

module.exports = router;