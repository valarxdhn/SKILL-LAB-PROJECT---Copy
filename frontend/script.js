// =====================================================
// VOLTCHARGE - FRONTEND JAVASCRIPT
// =====================================================

// Backend API
const API_URL = "http://localhost:3000/api";

// Application state
let stations = [];
let liveRefreshTimer = null;

// Refresh every 5 seconds
const LIVE_REFRESH_INTERVAL = 5000;


// =====================================================
// SAFE ELEMENT HELPER
// =====================================================

function getElement(id) {
    return document.getElementById(id);
}


// =====================================================
// LOAD STATIONS
// =====================================================

async function loadStations() {

    const container = getElement("stationContainer");
    const loading = getElement("stationLoading");

    try {

        if (loading) {
            loading.style.display = "block";
        }

        if (container) {

            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading charging stations...</p>
                </div>
            `;
        }


        const response =
            await fetch(`${API_URL}/stations`);


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );
        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                "Failed to load stations"
            );
        }


        // Store stations
        stations =
            Array.isArray(result.data)
                ? result.data
                : [];


        // Hide loading
        if (loading) {
            loading.style.display = "none";
        }


        // Display stations
        filterStations();


        // Update live statistics
        updateLiveStats(stations);


        // Connection status
        updateConnectionStatus(true);


        // Update timestamp
        updateLastUpdated();


        console.log(
            "Stations loaded:",
            stations.length
        );


    } catch (error) {

        console.error(
            "Load stations error:",
            error
        );


        if (loading) {
            loading.style.display = "none";
        }


        if (container) {

            container.innerHTML = `
                <div class="error-state">

                    <h3>
                        Unable to load charging stations
                    </h3>

                    <p>
                        Make sure your backend is running on
                        <strong>http://localhost:3000</strong>
                    </p>

                    <button
                        class="primary-button"
                        onclick="loadStations()"
                    >
                        Try Again
                    </button>

                </div>
            `;
        }


        updateConnectionStatus(false);
    }
}


// =====================================================
// DISPLAY STATIONS
// =====================================================

function displayStations(data) {

    const container =
        getElement("stationContainer");


    if (!container) {

        console.error(
            "stationContainer not found in HTML"
        );

        return;
    }


    // No stations
    if (!data || data.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ⚡
                </div>

                <h3>
                    No charging stations found
                </h3>

                <p>
                    Try changing your search or filter.
                </p>

            </div>
        `;

        return;
    }


    // Display cards
    container.innerHTML =
        data.map((station, index) => {

            const availability =
                String(
                    station.availability ||
                    "Unavailable"
                );


            const statusClass =
                availability
                    .toLowerCase()
                    .replace(/\s+/g, "-");


            const availableSlots =
                Number(
                    station.availableSlots || 0
                );


            const totalSlots =
                Number(
                    station.totalSlots || 0
                );


            return `
                <article
                    class="station-card live-card"
                    style="--card-index: ${index}"
                >

                    <div class="station-live-indicator">

                        <span></span>

                        LIVE

                    </div>


                    <span
                        class="status ${statusClass}"
                    >
                        ${escapeHTML(availability)}
                    </span>


                    <h3>
                        ${escapeHTML(
                            station.name ||
                            "Charging Station"
                        )}
                    </h3>


                    <p class="station-location">

                        ${escapeHTML(
                            station.location ||
                            "Location unavailable"
                        )}

                    </p>


                    <div class="station-info">


                        <!-- CHARGING TYPE -->

                        <div>

                            <span>
                                Charging
                            </span>

                            <strong>

                                ${escapeHTML(
                                    station.chargingType ||
                                    "Not available"
                                )}

                            </strong>

                        </div>


                        <!-- POWER -->

                        <div>

                            <span>
                                Power
                            </span>

                            <strong>

                                ${escapeHTML(
                                    station.power ||
                                    "N/A"
                                )}

                            </strong>

                        </div>


                        <!-- AVAILABLE SLOTS -->

                        <div>

                            <span>
                                Available
                            </span>

                            <strong>

                                ${availableSlots}/${totalSlots}

                            </strong>

                        </div>


                        <!-- PRICE -->

                        <div>

                            <span>
                                Price
                            </span>

                            <strong>

                                ${escapeHTML(
                                    station.price ||
                                    "N/A"
                                )}

                            </strong>

                        </div>

                    </div>


                    <!-- CARD ACTIONS -->

                    <div class="card-actions">


                        <button
                            class="secondary-button"
                            onclick="viewStation(${station.id})"
                        >
                            Details
                        </button>


                        <button
                            class="primary-button"
                            onclick="openBookingModal(${station.id})"
                            ${availableSlots <= 0
                                ? "disabled"
                                : ""}
                        >
                            Book
                        </button>


                    </div>

                </article>
            `;

        }).join("");
}


// =====================================================
// SEARCH + FILTER
// =====================================================

function filterStations() {

    const searchElement =
        getElement("searchInput");

    const typeElement =
        getElement("typeFilter");

    const availabilityElement =
        getElement("availabilityFilter");


    const search =
        searchElement
            ? searchElement.value
                .trim()
                .toLowerCase()
            : "";


    const type =
        typeElement
            ? typeElement.value
            : "all";


    const availability =
        availabilityElement
            ? availabilityElement.value
            : "all";


    const filtered =
        stations.filter(station => {

            const name =
                String(
                    station.name || ""
                ).toLowerCase();


            const location =
                String(
                    station.location || ""
                ).toLowerCase();


            const address =
                String(
                    station.address || ""
                ).toLowerCase();


            const chargingType =
                String(
                    station.chargingType || ""
                );


            const stationAvailability =
                String(
                    station.availability || ""
                );


            const matchesSearch =
                name.includes(search) ||
                location.includes(search) ||
                address.includes(search);


            const matchesType =
                type === "all" ||
                chargingType === type;


            const matchesAvailability =
                availability === "all" ||
                stationAvailability === availability;


            return (
                matchesSearch &&
                matchesType &&
                matchesAvailability
            );

        });


    displayStations(filtered);


    // IMPORTANT:
    // Live network statistics should always
    // represent ALL stations, not filtered stations.

    updateLiveStats(stations);
}


// =====================================================
// SEARCH EVENTS
// =====================================================

function setupSearchAndFilters() {

    const searchInput =
        getElement("searchInput");

    const typeFilter =
        getElement("typeFilter");

    const availabilityFilter =
        getElement("availabilityFilter");


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterStations
        );
    }


    if (typeFilter) {

        typeFilter.addEventListener(
            "change",
            filterStations
        );
    }


    if (availabilityFilter) {

        availabilityFilter.addEventListener(
            "change",
            filterStations
        );
    }
}


// =====================================================
// VIEW STATION
// =====================================================

function viewStation(id) {

    const station =
        stations.find(
            station =>
                Number(station.id) === Number(id)
        );


    if (!station) {

        showToast(
            "Station information unavailable.",
            "error"
        );

        return;
    }


    const message =
        `Station: ${station.name}\n\n` +
        `Address: ${
            station.address ||
            "Not available"
        }\n` +
        `Charging: ${
            station.chargingType ||
            "Not available"
        }\n` +
        `Power: ${
            station.power ||
            "Not available"
        }\n` +
        `Availability: ${
            station.availableSlots || 0
        }/${
            station.totalSlots || 0
        }\n` +
        `Hours: ${
            station.operatingHours ||
            "Not available"
        }\n` +
        `Contact: ${
            station.contact ||
            "Not available"
        }\n` +
        `Price: ${
            station.price ||
            "Not available"
        }`;


    alert(message);
}


// =====================================================
// OPEN BOOKING MODAL
// =====================================================

function openBookingModal(stationId) {

    const station =
        stations.find(
            station =>
                Number(station.id) ===
                Number(stationId)
        );


    if (!station) {

        showToast(
            "Station not found.",
            "error"
        );

        return;
    }


    const availableSlots =
        Number(
            station.availableSlots || 0
        );


    if (availableSlots <= 0) {

        showToast(
            "This charging station is currently unavailable.",
            "error"
        );

        return;
    }


    const stationIdInput =
        getElement("stationId");

    const selectedStation =
        getElement("selectedStation");

    const bookingModal =
        getElement("bookingModal");


    if (stationIdInput) {

        stationIdInput.value =
            stationId;
    }


    if (selectedStation) {

        selectedStation.textContent =
            `Selected station: ${station.name}`;
    }


    if (bookingModal) {

        bookingModal.classList.add(
            "active"
        );
    }
}


// =====================================================
// CLOSE BOOKING MODAL
// =====================================================

function closeBookingModal() {

    const modal =
        getElement("bookingModal");

    const form =
        getElement("bookingForm");


    if (modal) {

        modal.classList.remove(
            "active"
        );
    }


    if (form) {

        form.reset();
    }
}


// =====================================================
// BOOKING FORM
// =====================================================

function setupBookingForm() {

    const form =
        getElement("bookingForm");


    if (!form) {

        console.warn(
            "bookingForm not found."
        );

        return;
    }


    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const bookingData = {

                userName:
                    getElement("userName")
                        ?.value
                        .trim(),

                userEmail:
                    getElement("userEmail")
                        ?.value
                        .trim(),

                stationId:
                    Number(
                        getElement("stationId")
                            ?.value
                    ),

                date:
                    getElement("bookingDate")
                        ?.value,

                time:
                    getElement("bookingTime")
                        ?.value,

                vehicleModel:
                    getElement("vehicleModel")
                        ?.value
                        .trim(),

                vehicleNumber:
                    getElement("vehicleNumber")
                        ?.value
                        .trim()
                        .toUpperCase()
            };


            // =================================================
            // VALIDATION
            // =================================================

            if (
                !bookingData.userName ||
                !bookingData.userEmail ||
                !bookingData.stationId ||
                !bookingData.date ||
                !bookingData.time ||
                !bookingData.vehicleModel ||
                !bookingData.vehicleNumber
            ) {

                showToast(
                    "Please fill in all fields.",
                    "error"
                );

                return;
            }


            // Email validation
            if (
                !validateEmail(
                    bookingData.userEmail
                )
            ) {

                showToast(
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            // Vehicle number validation
            if (
                !validateVehicleNumber(
                    bookingData.vehicleNumber
                )
            ) {

                showToast(
                    "Enter a valid vehicle number. Example: KA01AB1234",
                    "error"
                );

                return;
            }


          // ---------------------------------------------
// CHECK DATE AND TIME
// ---------------------------------------------

const selectedDateTime =
    new Date(`${bookingData.date}T${bookingData.time}`);

if (isNaN(selectedDateTime.getTime())) {

    showToast(
        "Please select a valid date and time.",
        "error"
    );

    return;
}


// ---------------------------------------------
// PREVENT PAST DATE
// ---------------------------------------------

const now = new Date();

// Remove seconds and milliseconds
now.setSeconds(0, 0);

if (selectedDateTime < now) {

    showToast(
        "You cannot book a past date or time.",
        "error"
    );

    return;
}

            // =================================================
            // SUBMIT BOOKING
            // =================================================

            try {

                const submitButton =
                    form.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Processing...";
                }


                const response =
                    await fetch(
                        `${API_URL}/bookings`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    bookingData
                                )
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Booking failed."
                    );
                }


                showToast(
                    "Booking confirmed successfully!",
                    "success"
                );


                closeBookingModal();


                // Refresh stations
                await loadStations();


                // Refresh bookings
                await loadBookings();


            } catch (error) {

                console.error(
                    "Booking error:",
                    error
                );


                showToast(
                    error.message ||
                    "Unable to complete booking.",
                    "error"
                );


            } finally {

                const submitButton =
                    form.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Confirm booking";
                }
            }
        }
    );
}


// =====================================================
// LOAD BOOKINGS
// =====================================================

async function loadBookings() {

    try {

        const response =
            await fetch(
                `${API_URL}/bookings`
            );


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );
        }


        const result =
            await response.json();


        displayBookings(
            result.data || []
        );


    } catch (error) {

        console.error(
            "Load bookings error:",
            error
        );


        const container =
            getElement(
                "bookingContainer"
            );


        if (container) {

            container.innerHTML = `
                <p>
                    Unable to load bookings.
                </p>
            `;
        }
    }
}


// =====================================================
// DISPLAY BOOKINGS
// =====================================================

function displayBookings(data) {

    const container =
        getElement("bookingContainer");

    const emptyState =
        getElement("emptyBookings");

    const countElement =
        getElement("bookingCount");


    if (!container) {
        return;
    }


    const bookings =
        Array.isArray(data)
            ? data
            : [];


    // Booking count
    if (countElement) {

        countElement.textContent =
            `${bookings.length} booking${
                bookings.length !== 1
                    ? "s"
                    : ""
            }`;
    }


    // No bookings
    if (bookings.length === 0) {

        container.innerHTML = "";


        if (emptyState) {

            emptyState.style.display =
                "block";
        }


        return;
    }


    // Hide empty state
    if (emptyState) {

        emptyState.style.display =
            "none";
    }


    // Display bookings
    container.innerHTML =
        bookings.map(
            booking => {

                const status =
                    String(
                        booking.status ||
                        "Confirmed"
                    );


                const statusClass =
                    status
                        .toLowerCase()
                        .replace(
                            /\s+/g,
                            "-"
                        );


                return `
                    <article
                        class="booking-card"
                    >

                        <div>

                            <h3>
                                ${escapeHTML(
                                    booking.stationName ||
                                    booking.station?.name ||
                                    "Charging Station"
                                )}
                            </h3>


                            <p>

                                ${escapeHTML(
                                    booking.date ||
                                    ""
                                )}

                                at

                                ${escapeHTML(
                                    booking.time ||
                                    ""
                                )}

                            </p>


                            <p>

                                ${escapeHTML(
                                    booking.vehicleModel ||
                                    booking.vehicle ||
                                    ""
                                )}

                                -

                                ${escapeHTML(
                                    booking.vehicleNumber ||
                                    ""
                                )}

                            </p>


                            <p>
                                Booking #${booking.id}
                            </p>

                        </div>


                        <div>

                            <p
                                class="booking-status ${statusClass}"
                            >
                                ${escapeHTML(status)}
                            </p>


                            ${
                                status
                                    .toLowerCase() ===
                                "confirmed"

                                ? `

                                    <button
                                        class="secondary-button"
                                        onclick="cancelBooking(${booking.id})"
                                    >
                                        Cancel
                                    </button>

                                `

                                : ""
                            }

                        </div>

                    </article>
                `;
            }
        ).join("");
}


// =====================================================
// CANCEL BOOKING
// =====================================================

async function cancelBooking(id) {

    const confirmCancel =
        confirm(
            "Are you sure you want to cancel this booking?"
        );


    if (!confirmCancel) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/bookings/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to cancel booking."
            );
        }


        showToast(
            "Booking cancelled successfully.",
            "success"
        );


        await loadBookings();

        await loadStations();


    } catch (error) {

        console.error(
            "Cancel booking error:",
            error
        );


        showToast(
            error.message ||
            "Unable to cancel booking.",
            "error"
        );
    }
}


// =====================================================
// LIVE NETWORK STATISTICS
// =====================================================

function updateLiveStats(data = stations) {

    if (!Array.isArray(data)) {
        return;
    }


    // =================================================
    // TOTAL STATIONS
    // =================================================

    const totalStations =
        data.length;


    // =================================================
    // TOTAL AVAILABLE CHARGERS
    // =================================================

    const availableChargers =
        data.reduce(
            (sum, station) => {

                return (
                    sum +
                    Number(
                        station.availableSlots ||
                        0
                    )
                );

            },
            0
        );


    // =================================================
    // BUSY STATIONS
    // =================================================

    const busyStations =
        data.filter(
            station => {

                return (
                    String(
                        station.availability ||
                        ""
                    )
                    .toLowerCase() ===
                    "busy"
                );

            }
        ).length;


    // =================================================
    // HTML ELEMENTS
    // =================================================

    const stationCount =
        getElement(
            "stationCount"
        );

    const availableCount =
        getElement(
            "availableCount"
        );

    const busyCount =
        getElement(
            "busyCount"
        );


    // =================================================
    // UPDATE STATION COUNT
    // =================================================

    if (stationCount) {

        animateNumber(
            stationCount,
            totalStations
        );
    }


    // =================================================
    // UPDATE AVAILABLE CHARGERS
    // =================================================

    if (availableCount) {

        animateNumber(
            availableCount,
            availableChargers
        );
    }


    // =================================================
    // UPDATE BUSY STATIONS
    // =================================================

    if (busyCount) {

        animateNumber(
            busyCount,
            busyStations
        );
    }
}


// =====================================================
// LIVE STATION UPDATE
// =====================================================

async function liveUpdateStations() {

    try {

        const response =
            await fetch(
                `${API_URL}/stations`
            );


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );
        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                "Station refresh failed"
            );
        }


        // Update station data
        stations =
            Array.isArray(result.data)
                ? result.data
                : [];


        // Update station cards
        filterStations();


        // Update network statistics
        updateLiveStats(
            stations
        );


        // Connection status
        updateConnectionStatus(
            true
        );


        // Update time
        updateLastUpdated();


        console.log(
            "LIVE UPDATE:",
            new Date().toLocaleTimeString()
        );


    } catch (error) {

        console.error(
            "Live station update failed:",
            error
        );


        updateConnectionStatus(
            false
        );
    }
}


// =====================================================
// START LIVE UPDATE
// =====================================================

function startLiveStationUpdates() {

    if (liveRefreshTimer) {

        clearInterval(
            liveRefreshTimer
        );
    }


    liveRefreshTimer =
        setInterval(
            liveUpdateStations,
            LIVE_REFRESH_INTERVAL
        );


    console.log(
        "Live station updates started."
    );
}


// =====================================================
// NUMBER ANIMATION
// =====================================================

function animateNumber(
    element,
    target
) {

    if (!element) {
        return;
    }


    const currentText =
        element.textContent || "";


    const start =
        Number(
            currentText.replace(
                /\D/g,
                ""
            )
        ) || 0;


    target =
        Number(target) || 0;


    if (start === target) {

        element.textContent =
            target;

        return;
    }


    const duration = 500;

    const startTime =
        performance.now();


    function update(currentTime) {

        const progress =
            Math.min(
                (
                    currentTime -
                    startTime
                ) / duration,
                1
            );


        const value =
            Math.round(
                start +
                (
                    target -
                    start
                ) *
                progress
            );


        element.textContent =
            value;


        if (progress < 1) {

            requestAnimationFrame(
                update
            );
        }
    }


    requestAnimationFrame(
        update
    );
}


// =====================================================
// CONNECTION STATUS
// =====================================================
function updateConnectionStatus(online) {
    // Connection status is already displayed
    // inside the Live Network section.
    // Do not create an extra indicator on the page.
    return;
}

// =====================================================
// LAST UPDATED
// =====================================================

function updateLastUpdated() {

    const element =
        getElement(
            "lastUpdated"
        );


    if (!element) {
        return;
    }


    element.textContent =
        `Updated ${
            new Date()
                .toLocaleTimeString()
        }`;
}


// =====================================================
// TOAST NOTIFICATION
// =====================================================

function showToast(
    message,
    type = "success"
) {

    let container =
        getElement(
            "toastContainer"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );


        container.id =
            "toastContainer";


        container.className =
            "toast-container";


        document.body.appendChild(
            container
        );
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast toast-${type}`;


    toast.innerHTML = `
        <span
            class="toast-dot"
        ></span>

        <span>
            ${escapeHTML(message)}
        </span>
    `;


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.classList.add(
                "toast-hide"
            );


            setTimeout(
                () => {

                    toast.remove();

                },
                300
            );

        },
        3000
    );
}


// =====================================================
// EMAIL VALIDATION
// =====================================================

function validateEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


// =====================================================
// VEHICLE NUMBER VALIDATION
// =====================================================

function validateVehicleNumber(
    vehicleNumber
) {

    const number =
        String(
            vehicleNumber || ""
        )
        .toUpperCase()
        .replace(/\s+/g, "");


    // Indian vehicle number
    // Examples:
    // KA01AB1234
    // KL07CD5678
    // TN38A1234

    return /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/
        .test(number);
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// =====================================================
// HERO LIVE ANIMATION
// =====================================================

function createHeroAnimation() {

    const hero =
        document.querySelector(
            ".hero"
        );


    if (!hero) {
        return;
    }


    // Prevent duplicate animation
    if (
        hero.querySelector(
            ".hero-live-effects"
        )
    ) {

        return;
    }


    const effects =
        document.createElement(
            "div"
        );


    effects.className =
        "hero-live-effects";


    // =================================================
    // PARTICLES
    // =================================================

    for (
        let i = 0;
        i < 22;
        i++
    ) {

        const particle =
            document.createElement(
                "span"
            );


        particle.className =
            "live-particle";


        particle.style.left =
            `${Math.random() * 100}%`;


        particle.style.top =
            `${35 + Math.random() * 65}%`;


        particle.style.setProperty(
            "--duration",
            `${4 + Math.random() * 5}s`
        );


        particle.style.setProperty(
            "--delay",
            `${Math.random() * 6}s`
        );


        particle.style.setProperty(
            "--move-x",
            `${-60 + Math.random() * 120}px`
        );


        effects.appendChild(
            particle
        );
    }


    // =================================================
    // FLOATING LEAVES
    // =================================================

    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const leaf =
            document.createElement(
                "span"
            );


        leaf.className =
            "live-leaf";


        leaf.style.left =
            `${Math.random() * 95}%`;


        leaf.style.top =
            `${35 + Math.random() * 60}%`;


        leaf.style.setProperty(
            "--duration",
            `${7 + Math.random() * 6}s`
        );


        leaf.style.setProperty(
            "--delay",
            `${Math.random() * 7}s`
        );


        leaf.style.setProperty(
            "--move-x",
            `${-100 + Math.random() * 200}px`
        );


        effects.appendChild(
            leaf
        );
    }


    // =================================================
    // ELECTRICITY ORB
    // =================================================

    const electricityOrb =
        document.createElement(
            "div"
        );


    electricityOrb.className =
        "live-orb";


    electricityOrb.style.top =
        "13%";


    electricityOrb.style.left =
        "48%";


    electricityOrb.innerHTML =
        "<span>ϟ</span>";


    effects.appendChild(
        electricityOrb
    );


    // =================================================
    // BATTERY ORB
    // =================================================

    const batteryOrb =
        document.createElement(
            "div"
        );


    batteryOrb.className =
        "live-orb";


    batteryOrb.style.right =
        "25%";


    batteryOrb.style.bottom =
        "18%";


    batteryOrb.style.animationDelay =
        "1.5s";


    batteryOrb.innerHTML =
        "<span>▣</span>";


    effects.appendChild(
        batteryOrb
    );


    // =================================================
    // LOCATION ORB
    // =================================================

    const locationOrb =
        document.createElement(
            "div"
        );


    locationOrb.className =
        "live-orb";


    locationOrb.style.left =
        "37%";


    locationOrb.style.bottom =
        "12%";


    locationOrb.style.width =
        "70px";


    locationOrb.style.height =
        "70px";


    locationOrb.style.animationDelay =
        "0.8s";


    locationOrb.innerHTML =
        "<span>⌖</span>";


    effects.appendChild(
        locationOrb
    );


    // =================================================
    // DOT GRID
    // =================================================

    const dotGrid =
        document.createElement(
            "div"
        );


    dotGrid.className =
        "live-dot-grid";


    dotGrid.style.right =
        "8%";


    dotGrid.style.top =
        "27%";


    effects.appendChild(
        dotGrid
    );


    // =================================================
    // ROTATING RING
    // =================================================

    const ring =
        document.createElement(
            "div"
        );


    ring.className =
        "live-ring";


    ring.style.right =
        "7%";


    ring.style.bottom =
        "23%";


    effects.appendChild(
        ring
    );


    // =================================================
    // ENERGY WAVE
    // =================================================

    const wave =
        document.createElement(
            "div"
        );


    wave.className =
        "energy-wave";


    wave.style.left =
        "-5%";


    wave.style.bottom =
        "8%";


    effects.appendChild(
        wave
    );


    const wave2 =
        document.createElement(
            "div"
        );


    wave2.className =
        "energy-wave";


    wave2.style.left =
        "8%";


    wave2.style.bottom =
        "5%";


    wave2.style.opacity =
        "0.22";


    wave2.style.animationDelay =
        "1.5s";


    effects.appendChild(
        wave2
    );


    // Add effects to hero
    hero.prepend(
        effects
    );


    // =================================================
    // MOUSE PARALLAX
    // =================================================

    hero.addEventListener(
        "mousemove",
        event => {

            const rect =
                hero.getBoundingClientRect();


            const x =
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width -
                0.5;


            const y =
                (
                    event.clientY -
                    rect.top
                ) /
                rect.height -
                0.5;


            const orbs =
                effects.querySelectorAll(
                    ".live-orb"
                );


            orbs.forEach(
                (orb, index) => {

                    const strength =
                        8 + index * 3;


                    orb.style.transform =
                        `translate(
                            ${x * strength}px,
                            ${y * strength}px
                        )`;
                }
            );


            const particles =
                effects.querySelectorAll(
                    ".live-particle"
                );


            particles.forEach(
                (particle, index) => {

                    const strength =
                        2 + (index % 5);


                    particle.style.marginLeft =
                        `${x * strength}px`;
                }
            );
        }
    );


    // =================================================
    // RESET PARALLAX
    // =================================================

    hero.addEventListener(
        "mouseleave",
        () => {

            const orbs =
                effects.querySelectorAll(
                    ".live-orb"
                );


            orbs.forEach(
                orb => {

                    orb.style.transform =
                        "";
                }
            );
        }
    );


    console.log(
        "VOLTCHARGE live hero animation loaded."
    );
}


// =====================================================
// STATION DETAILS MODAL
// =====================================================

function closeStationDetails() {

    const modal =
        getElement(
            "stationDetailsModal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );
    }
}


// =====================================================
// MODAL CLICK OUTSIDE
// =====================================================

function setupModal() {

    const bookingModal =
        getElement(
            "bookingModal"
        );


    const stationDetailsModal =
        getElement(
            "stationDetailsModal"
        );


    if (bookingModal) {

        bookingModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    bookingModal
                ) {

                    closeBookingModal();
                }
            }
        );
    }


    if (stationDetailsModal) {

        stationDetailsModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    stationDetailsModal
                ) {

                    closeStationDetails();
                }
            }
        );
    }
}


// =====================================================
// ESC KEY
// =====================================================

function setupKeyboardControls() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeBookingModal();

                closeStationDetails();
            }
        }
    );
}


// =====================================================
// PAGE INITIALIZATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "VOLTCHARGE application starting..."
        );


        // Setup UI
        setupSearchAndFilters();

        setupBookingForm();

        setupModal();

        setupKeyboardControls();

        createHeroAnimation();


        // Start as offline
        updateConnectionStatus(
            false
        );


        // Load initial data
        await loadStations();

        await loadBookings();


        // Start 5-second live updates
        startLiveStationUpdates();


        console.log(
            "VOLTCHARGE application ready."
        );
    }
);