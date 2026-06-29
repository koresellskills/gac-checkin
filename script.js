console.log("script.js loaded");
let html5QrCode = null;
let scanning = false;

const scanButton = document.getElementById("scanButton");
const result = document.getElementById("result");

scanButton.addEventListener("click", startScanner);

async function startScanner() {

    console.log("startScanner() called");

    try {

        const cameras = await Html5Qrcode.getCameras();

        console.table(cameras);

        const cameraId = cameras[0].id;

        html5QrCode = new Html5Qrcode("reader");

        console.log("Scanner object created");

        await html5QrCode.start(
            cameraId,
            {
                fps: 10,
                qrbox: 250
            },
            function(decodedText) {
                console.log("QR DETECTED:", decodedText);
                alert(decodedText);
            }
        );

        console.log("Scanner started");

    } catch(err) {

        console.error("START ERROR:", err);

    }

}

async function onScanSuccess(decodedText) {

    console.log("QR:", decodedText);

    // Prevent duplicate scans
    if (!scanning) return;

    scanning = false;

    result.innerHTML = "<h3>Checking attendee...</h3>";

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

    try {
        await html5QrCode.stop();
        await html5QrCode.clear();
    } catch(e) {}

    scanButton.disabled = false;

}
document.getElementById("scanButton").addEventListener("click", function () {
    console.log("Button clicked");
});