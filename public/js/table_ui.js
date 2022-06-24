/**
 * Functions update the data in the selected device and registered devices tables.
 */

function updateRegisteredDevice (deviceId) {
  var li_old = document.getElementById(deviceId)

  var li = document.createElement('li')
  li.setAttribute('class', 'list-group-item small cursor-hand')
  li.setAttribute('id', deviceId)
  li.innerHTML = registeredDeviceRow(deviceId)
  li_old.replaceWith(li)
}

function addRegisteredDevice (deviceId) {
  var ul = document.getElementById('registeredDevicesList')
  var li = document.createElement('li')
  li.setAttribute('class', 'list-group-item small cursor-hand')

  li.setAttribute('id', deviceId)
  li.innerHTML = registeredDeviceRow(deviceId, li)
  ul.appendChild(li)
}

function removeRegisteredDevice (deviceId) {
  var ul = document.getElementById('registeredDevicesList')
  var li = document.getElementById(deviceId)
  ul.removeChild(li)
}

function registeredDeviceRow (deviceId) {
  var editIcon =
    "<span style='float:right'><H5><a href='javascript:editDevice(\"" +
    deviceId +
    "\")' style='color:black'><i class='fa-regular fa-pen-to-square'></i></H5></span>"
  var html = ''
  var mobile = ''
  if (iotDevices[deviceId].mobile === true) {
    mobile = "<span class='badge rounded-pill custom-bubble'>Moving</span>"
  }
  var presence = ''
  if (iotDevices[deviceId].online === 'yes') {
    presence +=
      "<span style='color:green;float:right;margin-right:5px' data-bs-toggle='tooltip' data-bs-placement='right' title='Device is Online'>" + mobile + " <i class='fa-solid fa-circle'></i>&nbsp;&nbsp;" + editIcon + "</span>"
  } else {
    presence +=
      "<span style='color:gray;float:right;margin-right:5px' data-bs-toggle='tooltip' data-bs-placement='right' title='Device is Offline'>" + mobile + " <i class='fa-regular fa-circle'></i>&nbsp;&nbsp;" + editIcon + "</span>"
  }
  html += iotDevices[deviceId].name + ' '
  //html += editIcon + ''
  html += presence + ''
  return html
}

function registeredDeviceRow_click (e) {
  if (e !== null && e.target !== null && iotDevices[e.target.id]) {
    populateSelectedDeviceTable(e.target.id, true)
    focusOnMarker(e.target.id)
  }
}

function populateSelectedDeviceTable (deviceId, manuallyInvoked) {
  if (selectedId != null && deviceId != null) {
    iotDevices[selectedId].selected = false
  }

  selectedId = deviceId
  if (deviceId != null) {
    iotDevices[deviceId].selected = true
  }

  if (manuallyInvoked) {
    //  DEMO: used by the interactive demo
    if (
      deviceId != null &&
      iotDevices[deviceId].name == 'Victoria Falls Wind Speed'
    )
      actionCompleted({
        action: 'View the Victoria falls windspeed',
        debug: false
      })
    if (
      deviceId != null &&
      iotDevices[deviceId].name == 'EU Freezer Truck'
    )
      actionCompleted({
        action: 'Find the European freezer truck',
        debug: false
      })
    //  END used by interactive demo
  }

  document.getElementById('selected-name').innerHTML =
    deviceId != null ? '' + iotDevices[deviceId].name : 'Selected: '
  document.getElementById('selected-id').innerHTML =
    deviceId != null ? '' + deviceId : ''
  document.getElementById('selected-channel-name').innerHTML =
    deviceId != null ? '' + iotDevices[deviceId].channelName : ''
  if (deviceId == null || iotDevices[deviceId].lat == 0) {
    document.getElementById('selected-location').innerHTML =
      'Location: Not yet seen'
  } else {
    document.getElementById('selected-location').innerHTML =
      'Location: [' +
      iotDevices[deviceId].lat +
      ', ' +
      iotDevices[deviceId].long +
      ']'
  }
  document.getElementById('selected-sensor-name').innerHTML =
    deviceId != null
      ? 'Sensor: ' + iotDevices[deviceId].sensors[0].sensor_name
      : 'Sensor: '
  document.getElementById('selected-sensor-value').innerHTML =
    deviceId != null
      ? 'Reading: ' +
        iotDevices[deviceId].sensors[0].sensor_value +
        ' ' +
        iotDevices[deviceId].sensors[0].sensor_units
      : 'Reading: '
  if (
    deviceId == null ||
    iotDevices[deviceId].sensors[0].sensor_update_frequency == 0
  ) {
    document.getElementById('selected-sensor-update-frequency').innerHTML =
      'Update Frequency: Not yet seen'
  } else {
    document.getElementById('selected-sensor-update-frequency').innerHTML =
      'Update Frequency: ' +
      iotDevices[deviceId].sensors[0].sensor_update_frequency / 1000 +
      's'
  }
  document.getElementById('selected-last-seen').innerHTML =
    deviceId != null
      ? 'Last Seen: ' + formatDate(iotDevices[deviceId].sensors[0].sensor_lastupdate)
      : 'Last Seen:'
  document.getElementById('selected-firmware').innerHTML =
    deviceId != null
      ? 'Firmware: ' + iotDevices[deviceId].firmware_version
      : 'Firmware:'
  document.getElementById('selected-delete-device').style.display =
    deviceId != null ? 'block' : 'none'
}

function formatDate(dateString)
{
  let formattedDate = new Date(dateString)
  const options = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };

  return formattedDate.toLocaleDateString('en-US', options);
}

var ul = document.getElementById('registeredDevicesList');
ul.addEventListener('click', registeredDeviceRow_click, true);
