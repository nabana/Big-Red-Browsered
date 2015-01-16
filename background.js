var MY_HID_VENDOR_ID  = 0x1d34; // 32825 in hexadecimal!
var MY_HID_PRODUCT_ID = 0x000d;
var DEVICE_INFO = {"vendorId": MY_HID_VENDOR_ID, "productId": MY_HID_PRODUCT_ID };

var connectionId = null;

function initializeHid(pollHid) {
  // Try to open the USB HID device
  chrome.hid.getDevices(DEVICE_INFO, function(devices) {
    if (!devices || !devices.length) {
      console.log('device not found');
      return;
    }
    console.log('Found device: ' + devices[0].deviceId);
    myHidDevice = devices[0].deviceId;

    // Connect to the HID device
    chrome.hid.connect(myHidDevice, function(connection) {
      console.log('Connected to the HID device!');
      connectionId = connection.connectionId;

      // Poll the USB HID Interrupt pipe
      pollHid();
    });
  });
}

function arrayBufferToString(array) {
  return String.fromCharCode.apply(null, new Uint8Array(array));
}

var myDevicePoll = function() {

  var myText;

  myText = {};

  chrome.hid.receive(connectionId, function(data) {
    if (data != null) {
      // Convert Byte into Ascii to follow the format of our device
      myText.value = arrayBufferToString(data);
      console.log('Data: ' + myText.value);
    }

    setTimeout(myDevicePoll, 0);
  });
}

initializeHid(myDevicePoll);