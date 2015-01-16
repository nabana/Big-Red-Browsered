/*globals chrome*/

'use strict';

var MY_HID_PRODUCT_ID = 0x000d,
    MY_HID_VENDOR_ID = 0x1d34,
    DEVICE_INFO = { 'vendorId': MY_HID_VENDOR_ID, 'productId': MY_HID_PRODUCT_ID },
    GET_STATUS = [ 0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02 ];


var GET_STATUS_AB = new ArrayBuffer(9);


for (var i=0; i<9; i++) {
    GET_STATUS_AB[i] = GET_STATUS[i];
}


console.log(GET_STATUS_AB);

function initializeHidWithPoller( pollHid ) {

    var myHidDevice;

    // Try to open the USB HID device
    chrome.hid.getDevices(DEVICE_INFO, function (devices) {
        if (!devices || !devices.length) {
            console.log('device not found');
            return;
        }

        console.log('Found device: ' + devices[0].deviceId);
        myHidDevice = devices[0].deviceId;

        chrome.hid.connect(myHidDevice, function (connection) {

            console.log('Connected to Big Red Button!', connection);
            pollHid( connection.connectionId );

        });
    });
}

function arrayBufferToString( array ) {
    return String.fromCharCode.apply(null, new Uint8Array(array));
}

var myDevicePoll = function ( connectionId ) {

    var myText;

    myText = {};

    if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
    }

    chrome.hid.send(connectionId, 0, GET_STATUS_AB, function (reportId, data) {


        chrome.hid.receive(connectionId, function () {

            console.log(reportId, data);
            console.log(chrome.runtime);

            if (data != null) {
                // Convert Byte into Ascii to follow the format of our device
                myText.value = arrayBufferToString(data);
                console.log('Data: ' + myText.value);

            }

//        setTimeout(myDevicePoll, 100, connectionId);

        });

        setTimeout(myDevicePoll, 100, connectionId);

    });


}

initializeHidWithPoller(myDevicePoll);