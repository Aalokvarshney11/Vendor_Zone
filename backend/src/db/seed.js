require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("./db");
const User = require("../models/user.model");
const Vendor = require("../models/vendor.model");
const Zone = require("../models/zone.model");
const Reservation = require("../models/reservation.model");
const Complaint = require("../models/complaint.model");

async function seedData() {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding...");

    const hashedPassword = await bcrypt.hash("password123", 10);

    const users = [
      {
        name: "Ramesh Kumar (Vendor)",
        email: "vendor@vendorzone.org",
        password: hashedPassword,
        role: "vendor",
      },
      {
        name: "Officer Sunita Verma",
        email: "officer@vendorzone.org",
        password: hashedPassword,
        role: "officer",
      },
      {
        name: "Municipal Admin Sharma",
        email: "admin@vendorzone.org",
        password: hashedPassword,
        role: "admin",
      },
    ];

    const createdUsers = {};
    for (const u of users) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create(u);
        console.log(`Created user: ${u.email} (${u.role})`);
      } else {
        existing.role = u.role;
        existing.password = hashedPassword;
        await existing.save();
        console.log(`Updated user: ${u.email} (${u.role})`);
      }
      createdUsers[u.role] = existing;
    }

    const vendorUser = createdUsers["vendor"];
    let vendorProfile = await Vendor.findOne({ userId: vendorUser._id });
    if (!vendorProfile) {
      vendorProfile = await Vendor.create({
        userId: vendorUser._id,
        businessName: "Ramesh Fresh Fruit & Juice Stall",
        businessType: "fruits",
        phone: "+91 98765 43210",
        address: "Ward 12, Subhash Chowk Market, Central City",
        verificationStatus: "verified",
      });
      console.log("Created verified vendor profile for Ramesh Kumar.");
    } else {
      vendorProfile.verificationStatus = "verified";
      vendorProfile.businessType = "fruits";
      await vendorProfile.save();
      console.log("Updated vendor profile to verified status.");
    }

   
    const zonesData = [
      {
        name: "Central Promenade Food & Beverage Walk",
        description: "Official pedestrian market dedicated to evening street snacks, fresh beverages, and fast food stalls.",
        location: {
          type: "Point",
          coordinates: [77.2167, 28.6328], // Delhi coordinates: [lng, lat]
        },
        capacity: 25,
        occupiedSpaces: 0,
        allowedBusinessTypes: ["food", "beverages", "fruits"],
        status: "active",
      },
      {
        name: "Old City Heritage Craft & Garment Bazaar",
        description: "Designated historical zone for apparel, handloom garments, cultural handicrafts, and traditional accessories.",
        location: {
          type: "Point",
          coordinates: [77.2300, 28.6562],
        },
        capacity: 30,
        occupiedSpaces: 0,
        allowedBusinessTypes: ["clothing", "other", "services"],
        status: "active",
      },
      {
        name: "Subhash Chowk Fresh Produce Mandi",
        description: "Morning and evening wholesale and retail distribution zone for fresh farm vegetables and seasonal fruits.",
        location: {
          type: "Point",
          coordinates: [77.2090, 28.6139],
        },
        capacity: 20,
        occupiedSpaces: 0,
        allowedBusinessTypes: ["fruits", "vegetables"],
        status: "active",
      },
      {
        name: "Metro Station Tech & Mobile Kiosk Plaza",
        description: "High footfall transit corridor for electronics, gadget accessories, phone repairs, and utility services.",
        location: {
          type: "Point",
          coordinates: [77.2205, 28.6280],
        },
        capacity: 15,
        occupiedSpaces: 0,
        allowedBusinessTypes: ["electronics", "services", "other"],
        status: "active",
      },
    ];

    for (const z of zonesData) {
      const existingZone = await Zone.findOne({ name: z.name });
      if (!existingZone) {
        await Zone.create(z);
        console.log(`Created zone: ${z.name}`);
      } else {
        existingZone.capacity = z.capacity;
        existingZone.allowedBusinessTypes = z.allowedBusinessTypes;
        existingZone.status = z.status;
        await existingZone.save();
        console.log(`Updated zone: ${z.name}`);
      }
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedData();
