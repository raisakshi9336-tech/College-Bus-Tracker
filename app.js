// =====================================================
// FIREBASE IMPORTS
// =====================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    onValue
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";


// =====================================================
// FIREBASE CONFIGURATION
// =====================================================

const firebaseConfig = {

    apiKey: "AIzaSyByYq6oPICKbzrBuj2cazSB-Q3-SZKwF7Q",

    authDomain:
        "college-bus-tracker-3bfa2.firebaseapp.com",

    databaseURL:
        "https://college-bus-tracker-3bfa2-default-rtdb.firebaseio.com",

    projectId:
        "college-bus-tracker-3bfa2",

    storageBucket:
        "college-bus-tracker-3bfa2.firebasestorage.app",

    messagingSenderId:
        "102599632212",

    appId:
        "1:102599632212:web:8f13ca777bc59ea35f14c1"

};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

const busesRef = ref(database, "buses");


// =====================================================
// IMPORTANT
// SESSION START TIME
// =====================================================

// Jab student/driver project open karta hai,
// us moment ka time save hoga.
//
// Iska use old Firebase updates ko hide karne ke liye
// kiya ja raha hai.

const sessionStart = Date.now();


// =====================================================
// BUS INFORMATION
// =====================================================

const busNames = {

    bus1: "SHEAT-01",
    bus2: "SHEAT-02",
    bus3: "SHEAT-03",
    bus4: "SHEAT-04",
    bus5: "SHEAT-05"

};


// =====================================================
// SHOW SECTION
// =====================================================

window.showSection = function(section) {

    const sections = [
        "student",
        "driver",
        "admin"
    ];

    sections.forEach(name => {

        const element =
            document.getElementById(name + "Section");

        if (element) {
            element.classList.remove("active-section");
        }

    });


    const selected =
        document.getElementById(section + "Section");

    if (selected) {
        selected.classList.add("active-section");
    }


    // Navigation button

    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.remove("active");

        });


    if (section === "student") {

        document
            .getElementById("studentBtn")
            .classList.add("active");

    }

    if (section === "driver") {

        document
            .getElementById("driverBtn")
            .classList.add("active");

    }

    if (section === "admin") {

        document
            .getElementById("adminBtn")
            .classList.add("active");

    }

};


// =====================================================
// UPDATE BUS
// =====================================================

window.updateBus = async function() {

    const busId =
        document.getElementById("driverBus").value;

    const route =
        document.getElementById("driverRoute").value;

    const currentStop =
        document.getElementById("currentStop").value;

    const nextStop =
        document.getElementById("nextStop").value;

    const status =
        document.getElementById("busStatus").value;


    const message =
        document.getElementById("driverMessage");


    // Current time

    const now = Date.now();


    // Bus data

    const busData = {

        busNumber: busNames[busId],

        route: route,

        currentStop: currentStop,

        nextStop: nextStop,

        status: status,

        // Numeric timestamp
        updatedAt: now

    };


    try {

        await set(
            ref(database, "buses/" + busId),
            busData
        );


        message.style.color = "#15803d";

        message.textContent =
            "✅ " +
            busNames[busId] +
            " updated successfully!";


        // Clear message after 3 seconds

        setTimeout(() => {

            message.textContent = "";

        }, 3000);


    } catch (error) {

        console.error(error);

        message.style.color = "#dc2626";

        message.textContent =
            "❌ Update failed. Please check Firebase connection.";

    }

};


// =====================================================
// FORMAT TIME
// =====================================================

function formatTime(timestamp) {

    if (!timestamp) {
        return "Not updated";
    }


    const date = new Date(timestamp);


    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(status) {

    if (status === "On Route") {
        return "status-onroute";
    }

    if (status === "Delayed") {
        return "status-delayed";
    }

    if (status === "Stopped") {
        return "status-stopped";
    }

    if (status === "Reached College") {
        return "status-reached";
    }

    return "status-onroute";

}


// =====================================================
// CREATE BUS CARD
// =====================================================

function createBusCard(busId, bus) {

    const busName =
        bus.busNumber ||
        busNames[busId];


    return `

        <div class="bus-card">

            <div class="bus-top">

                <div class="bus-name">
                    🚌 ${busName}
                </div>

                <div class="status ${getStatusClass(bus.status)}">
                    ${bus.status || "On Route"}
                </div>

            </div>


            <div class="info-row">

                <span class="info-label">
                    Route
                </span>

                <span class="info-value">
                    ${bus.route || "-"}
                </span>

            </div>


            <div class="info-row">

                <span class="info-label">
                    Current Stop
                </span>

                <span class="info-value">
                    📍 ${bus.currentStop || "-"}
                </span>

            </div>


            <div class="info-row">

                <span class="info-label">
                    Next Stop
                </span>

                <span class="info-value">
                    ➡️ ${bus.nextStop || "-"}
                </span>

            </div>


            <div class="updated">

                🕐 Last updated:
                ${formatTime(bus.updatedAt)}

            </div>

        </div>

    `;

}


// =====================================================
// DISPLAY BUSES
// =====================================================

let allActiveBuses = {};

function displayBuses(data) {

    const container =
        document.getElementById("busContainer");

    const noBusMessage =
        document.getElementById("noBusMessage");

    const activeCount =
        document.getElementById("activeCount");


    container.innerHTML = "";


    allActiveBuses = {};


    if (!data) {

        activeCount.textContent =
            "0 Active";

        noBusMessage.style.display =
            "block";

        return;

    }


    // =================================================
    // ONLY SHOW NEW UPDATES
    // =================================================

    Object.entries(data).forEach(
        ([busId, bus]) => {

            if (!bus) {
                return;
            }


            const updatedAt =
                Number(bus.updatedAt || 0);


            /*
             * IMPORTANT:
             *
             * If bus was updated BEFORE this page
             * was opened, it will NOT be shown.
             *
             * Driver has to update it again.
             */

            if (updatedAt >= sessionStart) {

                allActiveBuses[busId] = bus;

            }

        }
    );


    const searchInput =
        document.getElementById("searchBus");

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();


    let visibleCount = 0;


    Object.entries(allActiveBuses).forEach(
        ([busId, bus]) => {

            const busName =
                (
                    bus.busNumber ||
                    busNames[busId]
                ).toLowerCase();


            if (
                searchText &&
                !busName.includes(searchText)
            ) {

                return;

            }


            container.innerHTML +=
                createBusCard(busId, bus);


            visibleCount++;

        }
    );


    activeCount.textContent =
        visibleCount + " Active";


    if (visibleCount === 0) {

        noBusMessage.style.display =
            "block";

    } else {

        noBusMessage.style.display =
            "none";

    }


    // Update admin

    updateAdminTable(data);

}


// =====================================================
// SEARCH BUS
// =====================================================

window.searchBus = function() {

    // Firebase listener automatically calls
    // displayBuses again.

    // We simply re-render from stored active buses.

    const container =
        document.getElementById("busContainer");

    const noBusMessage =
        document.getElementById("noBusMessage");

    const activeCount =
        document.getElementById("activeCount");


    container.innerHTML = "";


    const searchText =
        document
            .getElementById("searchBus")
            .value
            .trim()
            .toLowerCase();


    let count = 0;


    Object.entries(allActiveBuses).forEach(
        ([busId, bus]) => {

            const busName =
                (
                    bus.busNumber ||
                    busNames[busId]
                ).toLowerCase();


            if (
                searchText &&
                !busName.includes(searchText)
            ) {

                return;

            }


            container.innerHTML +=
                createBusCard(busId, bus);

            count++;

        }
    );


    activeCount.textContent =
        count + " Active";


    noBusMessage.style.display =
        count === 0
            ? "block"
            : "none";

};


// =====================================================
// ADMIN TABLE
// =====================================================

function updateAdminTable(data) {

    const table =
        document.getElementById("adminTable");

    const adminActive =
        document.getElementById("adminActive");


    table.innerHTML = "";


    let active = 0;


    for (
        let number = 1;
        number <= 5;
        number++
    ) {

        const busId =
            "bus" + number;

        const bus =
            data && data[busId];


        if (!bus) {

            table.innerHTML += `

                <tr>

                    <td>
                        ${busNames[busId]}
                    </td>

                    <td>-</td>

                    <td>-</td>

                    <td>-</td>

                    <td>
                        <span class="status">
                            Inactive
                        </span>
                    </td>

                    <td>
                        Not updated
                    </td>

                </tr>

            `;

            continue;

        }


        const updatedAt =
            Number(bus.updatedAt || 0);


        /*
         * For Admin:
         *
         * Only updates from the current session
         * are considered active.
         */

        const isActive =
            updatedAt >= sessionStart;


        if (isActive) {
            active++;
        }


        table.innerHTML += `

            <tr>

                <td>
                    ${bus.busNumber || busNames[busId]}
                </td>

                <td>
                    ${bus.route || "-"}
                </td>

                <td>
                    ${bus.currentStop || "-"}
                </td>

                <td>
                    ${bus.nextStop || "-"}
                </td>

                <td>

                    <span class="status ${
                        isActive
                            ? getStatusClass(bus.status)
                            : ""
                    }">

                        ${
                            isActive
                                ? bus.status
                                : "Inactive"
                        }

                    </span>

                </td>

                <td>

                    ${
                        isActive
                            ? formatTime(bus.updatedAt)
                            : "Not updated this session"
                    }

                </td>

            </tr>

        `;

    }


    adminActive.textContent =
        active;

}


// =====================================================
// FIREBASE REAL-TIME LISTENER
// =====================================================

onValue(
    busesRef,
    snapshot => {

        const data =
            snapshot.val();


        displayBuses(data);

    },

    error => {

        console.error(
            "Firebase Error:",
            error
        );

    }
);


// =====================================================
// INITIAL STUDENT SECTION
// =====================================================

showSection("student");