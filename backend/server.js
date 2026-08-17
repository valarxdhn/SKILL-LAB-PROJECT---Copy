const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// SUPABASE CONNECTION
// =====================================================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// HELPERS
// =====================================================

// Convert Supabase station row (snake_case) to the
// same camelCase structure your existing frontend expects.
function formatStation(row) {
    return {
        id: row.id,
        name: row.name,
        location: row.location,
        address: row.address,
        chargingType: row.charging_type,
        availability: row.availability,
        availableSlots: row.available_slots,
        totalSlots: row.total_slots,
        operatingHours: row.operating_hours,
        contact: row.contact,
        power: row.power,
        price: row.price
    };
}

// Convert Supabase booking row to the same structure
// used by your existing frontend.
function formatBooking(row) {
    return {
        id: row.id,
        userName: row.user_name,
        userEmail: row.user_email,
        stationId: row.station_id,
        stationName: row.station_name,
        date: row.date,
        time: row.time,
        vehicleModel: row.vehicle_model,
        vehicleNumber: row.vehicle_number,
        status: row.status,
        createdAt: row.created_at
    };
}

// =====================================================
// HOME / HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
    res.json({
        message: "EV Charging Station Finder API is running!",
        status: "success"
    });
});

// =====================================================
// STATION APIs
// =====================================================

// GET ALL STATIONS
app.get("/api/stations", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("stations")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            console.error("GET stations error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch charging stations",
                error: error.message
            });
        }

        const stations = data.map(formatStation);

        res.status(200).json({
            success: true,
            count: stations.length,
            data: stations
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching stations"
        });
    }
});

// GET SINGLE STATION
app.get("/api/stations/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid station ID"
            });
        }

        const { data, error } = await supabase
            .from("stations")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                message: "Charging station not found"
            });
        }

        res.status(200).json({
            success: true,
            data: formatStation(data)
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching station"
        });
    }
});

// CREATE STATION
app.post("/api/stations", async (req, res) => {
    try {
        const {
            name,
            location,
            address,
            chargingType,
            availability,
            availableSlots,
            totalSlots,
            operatingHours,
            contact,
            power,
            price
        } = req.body;

        if (
            !name ||
            !location ||
            !address ||
            !chargingType ||
            !availability ||
            availableSlots === undefined ||
            totalSlots === undefined ||
            !operatingHours ||
            !contact ||
            !power ||
            !price
        ) {
            return res.status(400).json({
                success: false,
                message: "All station fields are required"
            });
        }

        const { data, error } = await supabase
            .from("stations")
            .insert([
                {
                    name,
                    location,
                    address,
                    charging_type: chargingType,
                    availability,
                    available_slots: Number(availableSlots),
                    total_slots: Number(totalSlots),
                    operating_hours: operatingHours,
                    contact,
                    power,
                    price
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("CREATE station error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to create charging station",
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: "Charging station created successfully",
            data: formatStation(data)
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error while creating station"
        });
    }
});

// UPDATE STATION
app.put("/api/stations/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid station ID"
            });
        }

        const {
            name,
            location,
            address,
            chargingType,
            availability,
            availableSlots,
            totalSlots,
            operatingHours,
            contact,
            power,
            price
        } = req.body;

        if (
            !name ||
            !location ||
            !address ||
            !chargingType ||
            !availability
        ) {
            return res.status(400).json({
                success: false,
                message: "Required station fields are missing"
            });
        }

        const { data, error } = await supabase
            .from("stations")
            .update({
                name,
                location,
                address,
                charging_type: chargingType,
                availability,
                available_slots: Number(availableSlots),
                total_slots: Number(totalSlots),
                operating_hours: operatingHours,
                contact,
                power,
                price
            })
            .eq("id", id)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                message: "Charging station not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Charging station updated successfully",
            data: formatStation(data)
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error while updating station"
        });
    }
});

// DELETE STATION
app.delete("/api/stations/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid station ID"
            });
        }

        const { data, error } = await supabase
            .from("stations")
            .delete()
            .eq("id", id)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                message: "Charging station not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Charging station deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting station"
        });
    }
});

// =====================================================
// BOOKING APIs
// =====================================================

// GET ALL BOOKINGS
app.get("/api/bookings", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            console.error("GET bookings error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch bookings",
                error: error.message
            });
        }

        const bookings = data.map(formatBooking);

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching bookings"
        });
    }
});

// GET SINGLE BOOKING
app.get("/api/bookings/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID"
            });
        }

        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.status(200).json({
            success: true,
            data: formatBooking(data)
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching booking"
        });
    }
});

// CREATE BOOKING
app.post("/api/bookings", async (req, res) => {
    try {
        const {
            userName,
            userEmail,
            stationId,
            date,
            time,
            vehicleModel,
            vehicleNumber
        } = req.body;

        // Validation
        if (
            !userName ||
            !userEmail ||
            !stationId ||
            !date ||
            !time ||
            !vehicleModel ||
            !vehicleNumber
        ) {
            return res.status(400).json({
                success: false,
                message: "All booking fields are required"
            });
        }

        const numericStationId = Number(stationId);

        if (!Number.isInteger(numericStationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid station ID"
            });
        }

        // Find station in Supabase
        const { data: station, error: stationError } = await supabase
            .from("stations")
            .select("*")
            .eq("id", numericStationId)
            .single();

        if (stationError || !station) {
            return res.status(404).json({
                success: false,
                message: "Charging station not found"
            });
        }

        // Check availability
        if (
            station.availability === "Unavailable" ||
            Number(station.available_slots) <= 0
        ) {
            return res.status(409).json({
                success: false,
                message: "This charging station is currently unavailable"
            });
        }

        // Check duplicate booking
        const { data: duplicateBookings, error: duplicateError } =
            await supabase
                .from("bookings")
                .select("id")
                .eq("station_id", numericStationId)
                .eq("date", date)
                .eq("time", time)
                .eq("status", "Confirmed");

        if (duplicateError) {
            console.error("Duplicate booking check error:", duplicateError);

            return res.status(500).json({
                success: false,
                message: "Failed to check booking availability"
            });
        }

        if (duplicateBookings && duplicateBookings.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This time slot is already booked"
            });
        }

        // Create booking
        const { data: newBooking, error: bookingError } = await supabase
            .from("bookings")
            .insert([
                {
                    user_name: userName,
                    user_email: userEmail,
                    station_id: numericStationId,
                    station_name: station.name,
                    date,
                    time,
                    vehicle_model: vehicleModel,
                    vehicle_number: vehicleNumber,
                    status: "Confirmed"
                }
            ])
            .select()
            .single();

        if (bookingError) {
            console.error("CREATE booking error:", bookingError);

            return res.status(500).json({
                success: false,
                message: "Failed to create booking",
                error: bookingError.message
            });
        }

        // Reduce available slots
        const newAvailableSlots = Math.max(
            0,
            Number(station.available_slots) - 1
        );

        const newAvailability =
            newAvailableSlots === 0
                ? "Unavailable"
                : station.availability === "Unavailable"
                    ? "Available"
                    : station.availability;

        const { error: stationUpdateError } = await supabase
            .from("stations")
            .update({
                available_slots: newAvailableSlots,
                availability: newAvailability
            })
            .eq("id", numericStationId);

        if (stationUpdateError) {
            console.error(
                "Station availability update error:",
                stationUpdateError
            );
        }

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: formatBooking(newBooking)
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error while creating booking"
        });
    }
});

// UPDATE BOOKING
app.put("/api/bookings/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID"
            });
        }

        const {
            userName,
            userEmail,
            date,
            time,
            vehicleModel,
            vehicleNumber
        } = req.body;

        if (
            !userName ||
            !userEmail ||
            !date ||
            !time ||
            !vehicleModel ||
            !vehicleNumber
        ) {
            return res.status(400).json({
                success: false,
                message: "All booking fields are required"
            });
        }

        // Get current booking
        const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", id)
            .single();

        if (bookingError || !booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled booking cannot be updated"
            });
        }

        // Check if another confirmed booking uses the new slot
        const { data: duplicateBookings, error: duplicateError } =
            await supabase
                .from("bookings")
                .select("id")
                .eq("station_id", booking.station_id)
                .eq("date", date)
                .eq("time", time)
                .eq("status", "Confirmed")
                .neq("id", id);

        if (duplicateError) {
            return res.status(500).json({
                success: false,
                message: "Failed to check booking availability"
            });
        }

        if (duplicateBookings && duplicateBookings.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This time slot is already booked"
            });
        }

        const { data: updatedBooking, error: updateError } =
            await supabase
                .from("bookings")
                .update({
                    user_name: userName,
                    user_email: userEmail,
                    date,
                    time,
                    vehicle_model: vehicleModel,
                    vehicle_number: vehicleNumber
                })
                .eq("id", id)
                .select()
                .single();

        if (updateError) {
            console.error("UPDATE booking error:", updateError);

            return res.status(500).json({
                success: false,
                message: "Failed to update booking",
                error: updateError.message
            });
        }

        res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            data: formatBooking(updatedBooking)
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error while updating booking"
        });
    }
});

// CANCEL BOOKING
app.delete("/api/bookings/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID"
            });
        }

        // Get booking
        const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", id)
            .single();

        if (bookingError || !booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled"
            });
        }

        // Mark booking as cancelled
        const { data: cancelledBooking, error: cancelError } =
            await supabase
                .from("bookings")
                .update({
                    status: "Cancelled"
                })
                .eq("id", id)
                .select()
                .single();

        if (cancelError) {
            console.error("CANCEL booking error:", cancelError);

            return res.status(500).json({
                success: false,
                message: "Failed to cancel booking",
                error: cancelError.message
            });
        }

        // Return slot to station
        const { data: station, error: stationError } = await supabase
            .from("stations")
            .select("*")
            .eq("id", booking.station_id)
            .single();

        if (!stationError && station) {
            const returnedSlots = Math.min(
                Number(station.available_slots) + 1,
                Number(station.total_slots)
            );

            let availability = station.availability;

            if (returnedSlots > 0) {
                availability = "Available";
            }

            await supabase
                .from("stations")
                .update({
                    available_slots: returnedSlots,
                    availability
                })
                .eq("id", booking.station_id);
        }

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: formatBooking(cancelledBooking)
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error while cancelling booking"
        });
    }
});

// =====================================================
// INVALID ROUTE
// =====================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
