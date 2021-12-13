let barCode = ''
let QRcode = ''

// hide the "magic button" until both are scanned 
document.getElementById('submitDeposit').style.display='none'
//attach an event listener which will send the qrcode and barcode to the server when clicked
document.getElementById('submitDeposit').addEventListener('click', sendDeposit)

var config = { 
  fps: 10,
  qrbox: {width: 250, height: 250},

 
};
//When both QRcode and Barcode are processed then the submit deposit button becomes available to click and once it is clicked the page re freshes with updated earned points. 
function sendDeposit(){
  fetch('QRcode', {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      QRcode: QRcode,
       barCode : barCode
      
    })
  })
  .then(response => {
      return response.json();
  })
  .then(data => {
    console.log(data)

    window.location.reload(true)
  })
}

//HTML5 QR code reader. https://scanapp.org/#reader
function onScanSuccess(decodedText, decodedResult) {
  console.log(`Code matched = ${decodedText}`, decodedResult);
  QRcode = decodedText
  document.getElementById('scannedQRcode').innerText = decodedText
  // condition for the submit deposit to appear 
  if(QRcode && barCode){
    document.getElementById('submitDeposit').style.display='block'
  }
}
function onScanFailure(error) {
}

let html5QrcodeScanner = new Html5QrcodeScanner(
  "reader",
  config,
  /* verbose= */ false);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);

var config = { 
  fps: 1,
  qrbox: {width: 250, height: 250},

};
// QuaggaJS is a barcode-scanner written in JavaScript 
//https://serratus.github.io/quaggaJS/

//the function starts with an empty value when we start the scanner in order to tell when both the QR code and barcode are scanned.
var _scannerIsRunning = false;
      function startScanner(){
        document.getElementById('submitDeposit').style.display='none'
        console.log("START SCANNER")

        console.log("init button")
        Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            constraints: {
              width:1000,
              height: 700,
              facingMode: "environment"
            },
            numberOfWorkers: navigator.hardwareConcurrency,
            target: '#scanner-container',
          },
          locate: true,
          decoder: {
            readers: [
              "code_128_reader",
              "upc_reader",
              "upc_e_reader",

            ],

         
          },

        }, function (err) {
          if (err) {
            console.log("err from startScanner", err);
            return
          }

          console.log("Initialization finished. Ready to start");
          Quagga.start();

          _scannerIsRunning = true;
        });

        Quagga.onProcessed(function (result) {
          //disregard this code please, it was a visible scanner appearing outside of the scanner container. 
           var drawingCtx = Quagga.canvas.ctx.overlay,
             drawingCanvas = Quagga.canvas.dom.overlay;
          if (result) {
            
          }
        });
        // this function is the barcode processed and the conditional for the "magic button"
        Quagga.onDetected(function (result) {
          console.log("Barcode detected and processed : [" + result.codeResult.code + "]", result);
          document.getElementById('scannedBarCode').innerText = result.codeResult.code
          barCode = result.codeResult.code
          console.log("QRCODE && BARCODE", QRcode, barCode);

          if(QRcode && barCode){
            document.getElementById('submitDeposit').style.display='block'
          }
         
          
        });

        // Start/stop scanner
      }
      document.getElementById("btn").addEventListener("click", function () {
        if (_scannerIsRunning) {
          Quagga.stop();
        } else {
          startScanner();
        }
      }, false);
