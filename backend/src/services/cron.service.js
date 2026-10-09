const cron = require("node-cron");

const {
    expireReservations
} = require("./reservation.service");

const startCronJobs = () => {
    cron.schedule("* * * * *", async () => {
        await expireReservations();
    });

    console.log("Cron jobs started.");
};

module.exports = startCronJobs;