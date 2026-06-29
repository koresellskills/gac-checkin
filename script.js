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

        html5QrCode = new Html5Qrcode("reader");

        console.log("Scanner object created");

        await html5QrCode.start(
            {
                facingMode: "environment" // Use back camera on phones
            },
            {
                fps: 10,
                qrbox: {
                    width: 300,
                    height: 300
                }
            },
            onScanSuccess,
            function (errorMessage) {
                // Ignore continuous scan errors
            }
        );

        console.log("Scanner started");

    } catch (err) {

        console.error("START ERROR:", err);

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
