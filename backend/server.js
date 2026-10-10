const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = require("./src/app");

const dns = require("dns")
dns.setServers(["1.1.1.1", "8.8.8.8"])

const connectDB = require("./src/db/db")
const startCronJobs = require("./src/services/cron.service");

connectDB();
startCronJobs();

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Backend server is running on http://localhost:${PORT}`);
})