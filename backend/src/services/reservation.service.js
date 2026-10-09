const Reservation = require("../models/reservation.model");
const Zone = require("../models/zone.model");

const expireReservations = async () => {
    try {
        const now = new Date();

        const expiredReservations = await Reservation.find({
            status: "approved",
            endDate: { $lte: now }
        });

        for (const reservation of expiredReservations) {
            const zone = await Zone.findById(
                reservation.zoneId
            );

            if (zone && zone.occupiedSpaces > 0) {
                zone.occupiedSpaces -= 1;
                await zone.save();
            }

            reservation.status = "expired";

            await reservation.save();
        }

        if (expiredReservations.length > 0) {
            console.log(
                `${expiredReservations.length} reservation(s) expired.`
            );
        }

    } catch (error) {
        console.error(
            "Reservation expiration error:",
            error
        );
    }
};

module.exports = {
    expireReservations
};