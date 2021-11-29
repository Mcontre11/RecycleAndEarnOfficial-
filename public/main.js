let barCode = ''
let QRcode = ''

// MARK hide the button until both are scanned
document.getElementById('submitDeposit').style.display='none'
// MARK attach an event listener which will send the qrcode and barcode to the server when clicked
document.getElementById('submitDeposit').addEventListener('click', sendDeposit)

var config = { 
  fps: 10,
  qrbox: {width: 250, height: 250},
  // Important notice: this is experimental feature, use it at your
  // own risk. See documentation in
  // mebjas@/html5-qrcode/src/experimental-features.ts
 
};
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

    // MARK reload the page which clears the codes so the user can submit another set of codes
    window.location.reload(true)
  })
}

// import {Html5QrcodeScanner} from "html5-qrcode"
function onScanSuccess(decodedText, decodedResult) {
  // handle the scanned code as you like, for example:
  console.log(`Code matched = ${decodedText}`, decodedResult);
  QRcode = decodedText
  document.getElementById('scannedQRcode').innerText = decodedText
  // if we have a qr code and the barcode then we can unhide the button to submit deposit 
  if(QRcode && barCode){
    document.getElementById('submitDeposit').style.display='block'
  }
}

// .then (res => {
//   if {onScanSuccess.true} console.log(success)
// })

function onScanFailure(error) {
  // handle scan faiflure, usually better to ignore and keep scanning.
  // for example:
  // console.warn(`Code scan error = ${error}`);
}

let html5QrcodeScanner = new Html5QrcodeScanner(
  "reader",
  config,
  /* verbose= */ false);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);

var config = { 
  fps: 1,
  qrbox: {width: 250, height: 250},
  // Important notice: this is experimental feature, use it at your
  // own risk. See documentation in
  // mebjas@/html5-qrcode/src/experimental-features.ts

};

// Barcode scanner 
var _scannerIsRunning = false;
// we assign an empty value when we start the scanner so we can tell when they get both the QR code and barcode 
// we have the button hidden untill both are scanned 
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

            debug: {
              drawBoundingBox: true,
              drawScanline: true,
              showFrequency: true,
              showPattern: true,

              showCanvas: true,
              showPatches: true,
              showFoundPatches: true,
              showSkeleton: true,
              showLabels: true,
              showPatchLabels: true,
              showRemainingPatchLabels: true,
              boxFromPatches: {
                showTransformed: true,
                showTransformedBox: true,
                showBB: true
              }
            }
          },

        }, function (err) {
          if (err) {
            console.log("err from startScanner", err);
            return
          }

          console.log("Initialization finished. Ready to start");
          Quagga.start();

          // Set flag to is running
          _scannerIsRunning = true;
        });
        Quagga.onProcessed(function (result) {
          var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

          if (result) {
            if (result.boxes) {
              drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
              result.boxes.filter(function (box) {
                return box !== result.box;
              }).forEach(function (box) {
                Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
              });
            }

            if (result.box) {
              Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
            }

            if (result.codeResult && result.codeResult.code) {
              Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
            }
          }
        });
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

      // //  addpoints next sttep
      
      // forEach(function (element) {
      // 	console.log(element, 'element')
      //   if (Quagga.OnDetected === 'complete' && onScanSuccess === true) {

      
      // 		console.log(element.parentNode.childNodes[3]);
      // 		element.parentNode.childNodes[3].classList.add('completed');
      // 	}
      // 	element.addEventListener('listen', function () {
      //     console.log(this)
      //   });
      // })