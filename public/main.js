let barCode = ''
let QRcode = ''

document.getElementById('submitDeposit').style.display='none'
document.getElementById('submitDeposit').addEventListener('click', sendDeposit)

var config = { 
  fps: 10,
  qrbox: {width: 250, height: 250},

 
};
//points
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

//qrCode scanner 

function onScanSuccess(decodedText, decodedResult) {
  console.log(`Code matched = ${decodedText}`, decodedResult);
  QRcode = decodedText
  document.getElementById('scannedQRcode').innerText = decodedText
  // if we have a qr code and the barcode then we can unhide the button to submit deposit 
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

// Barcode scanner 
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
          var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

          if (result) {
            
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
