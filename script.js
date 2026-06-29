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
            throw new Error("No cameras found.");
        }

        // Default to first camera
        let cameraId = cameras[0].id;

        // Prefer the back/rear/environment camera
        for (const camera of cameras) {

            const label = camera.label.toLowerCase();

            if (
                label.includes("back") ||
                label.includes("rear") ||
                label.includes("environment")
            ) {
                cameraId = camera.id;
                break;
            }

        }

        console.log("Using camera:", cameraId);

        html5QrCode = new Html5Qrcode("reader");

        await html5QrCode.start(
            cameraId,
            {
                fps: 10,
                qrbox: {
                    width: 300,
                    height: 300
                }
            },
            onScanSuccess,
            function () {
                // Ignore continuous scan failures
            }
        );

        console.log("Scanner started");

    } catch (err) {

        console.error(err);

        result.innerHTML = "❌ " + err;

        scanButton.disabled = false;

    }

}

async function onScanSuccess(decodedText) {

    if (!scanning) return;

    scanning = false;

    console.log("QR DETECTED:", decodedText);

    result.innerHTML = "<h3>Checking attendee...</h3>";

    try {

        await html5QrCode.stop();
        await html5QrCode.clear();

    } catch (e) {
        console.log(e);
    }

    try {

        const response = await fetch(
            "https://script.google.com/macros/s/AKfycbyF4uc5j5O9aMbRr8uqGAz1FJ3HC_bscdMdGgRk2Cx90tzO2U5C3RgNSCUcWQUA5PnZpg/exec",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "registrationID=" + encodeURIComponent(decodedText)
            }
        );

        const data = await response.json();

        result.innerHTML = `<pre>${data.message}</pre>`;

    } catch (err) {

        console.error(err);

        result.innerHTML = "❌ " + err;

    }

    scanButton.disabled = false;

}

scanButton.addEventListener("click", function () {
    console.log("Button clicked");
});
