console.log("script.js loaded");

let html5QrCode = null;
let scanning = false;

const scanButton = document.getElementById("scanButton");
const result = document.getElementById("result");

scanButton.addEventListener("click", startScanner);

async function startScanner() {

    console.log("startScanner() called");

    scanButton.disabled = true;
    scanning = true;

    result.innerHTML = "Starting camera...";

    try {

        const cameras = await Html5Qrcode.getCameras();

        console.table(cameras);

        if (cameras.length === 0) {
            throw new Error("No camera found.");
        }

        // Prefer the back camera if available
        let cameraId = cameras[0].id;

        const backCamera = cameras.find(camera =>

            camera.label.toLowerCase().includes("back") ||
            camera.label.toLowerCase().includes("rear") ||
            camera.label.toLowerCase().includes("environment")

        );

        if (backCamera) {
            cameraId = backCamera.id;
        }

        console.log("Using camera:", cameraId);

        html5QrCode = new Html5Qrcode("reader");

        console.log("Scanner object created");

        await html5QrCode.start(

            cameraId,

            {
                fps: 10,
                qrbox: 250
            },

            onScanSuccess,

            function(errorMessage) {
                // Ignore continuous scan failures
            }

        );

        console.log("Scanner started");

    }

    catch(err) {

        console.error(err);

        result.innerHTML = "❌ " + err;

        scanButton.disabled = false;

    }

}

async function onScanSuccess(decodedText) {

    if (!scanning) return;

    scanning = false;

    console.log("QR:", decodedText);

    result.innerHTML = "<h3>Checking attendee...</h3>";

    try {

        await html5QrCode.stop();
        await html5QrCode.clear();

    } catch(e) {}

    try {

        const response = await fetch(

            "https://script.google.com/macros/s/AKfycbyF4uc5j5O9aMbRr8uqGAz1FJ3HC_bscdMdGgRk2Cx90tzO2U5C3RgNSCUcWQUA5PnZpg/exec",

            {

                method: "POST",

                headers: {

                    "Content-Type":"application/x-www-form-urlencoded"

                },

                body:"registrationID="+encodeURIComponent(decodedText)

            }

        );

        const data = await response.json();
        console.log("API Response:", data);

        if (data.status === "checked_in") {

            result.innerHTML = `
                <div class="success-card">

                    <h2>✅ CHECK-IN SUCCESSFUL</h2>

                    <p>👤 <strong>${data.name}</strong></p>

                    <p>🎓 ${data.category}</p>

                    <p>🏫 ${data.institution}</p>

                    <p>🆔 ${data.registrationID}</p>

                    <p>📅 ${data.checkInDate}</p>

                    <p>🕒 ${data.checkInTime}</p>

                </div>
            `;

        }

        else if (data.status === "already_checked_in") {

            result.innerHTML = `
                <div class="warning-card">

                    <h2>⚠️ ALREADY CHECKED IN</h2>

                    <p>👤 <strong>${data.name}</strong></p>

                    <p>🆔 ${data.registrationID}</p>

                    <p>📅 ${data.checkInDate}</p>

                    <p>🕒 ${data.checkInTime}</p>

                </div>
            `;

        }

        else {

            result.innerHTML = `
                <div class="error-card">

                    <h2>❌ REGISTRATION NOT FOUND</h2>

                    <p>Please verify the QR Code.</p>

                </div>
            `;

        }

    }

    catch(err) {

        console.error(err);

        result.innerHTML = "❌ " + err;

    }

    scanButton.disabled = false;

}

scanButton.addEventListener("click", function () {

    console.log("Button clicked");

});
