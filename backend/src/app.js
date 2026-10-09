const cors = require("cors");
require("dotenv").config()
const express = require("express")
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const vendorRoutes = require("./routes/vendor.routes");
const officerRoutes = require("./routes/officer.routes");
const zoneRoutes = require("./routes/zone.routes");
const reservationRoutes = require("./routes/reservation.routes");
const complaintRoutes = require("./routes/complaint.routes");

const app = express()

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    credentials: true
}));

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/officers", officerRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/complaints", complaintRoutes);

module.exports = app

