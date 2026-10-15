/**
 * Functions update the data in the selected device and registered devices tables.
 */

function updateRegisteredDevice (deviceId) {
  document.getElementById(deviceId).replaceWith(registeredDeviceRow(deviceId))
}

function addRegisteredDevice (deviceId) {
  document.getElementById('registeredDevicesList').appendChild(registeredDeviceRow(deviceId))
}

function removeRegisteredDevice (deviceId) {
  document.getElementById(deviceId).remove()
}

//  One row of the Registered Devices list: name, 'Moving' badge, online status and the edit icon.
//  Built with createElement and textContent, so a device name can't inject HTML.
function registeredDeviceRow (deviceId) {
  const device = iotDevices[deviceId]
  const online = device.online === 'yes'
  const li = document.createElement('li')
  li.setAttribute('class', 'list-group-item small cursor-hand')
  li.setAttribute('id', deviceId)
  li.append(device.name + ' ')

  const status = document.createElement('span')
  status.style.cssText = `color:${online ? 'green' : 'gray'};float:right;margin-right:5px`
  status.title = online ? 'Device is Online' : 'Device is Offline'
  if (device.mobile === true) {
    const badge = document.createElement('span')
    badge.className = 'badge rounded-pill custom-bubble'
    badge.textContent = 'Moving'
    status.append(badge, ' ')
  }
  status.append(icon(online ? 'fa-solid fa-circle' : 'fa-regular fa-circle'), '\u00a0\u00a0')

  const edit = document.createElement('a')
  edit.href = '#'
  edit.style.color = 'black'
  edit.title = 'Edit device'
  edit.addEventListener('click', event => {
    event.preventDefault()
    editDevice(deviceId)
  })
  edit.append(icon('fa-regular fa-pen-to-square'))
  const editHeading = document.createElement('h5')
  editHeading.style.float = 'right'
  editHeading.append(edit)
  status.append(editHeading)

  li.append(status)
  return li
}

function icon (className) {
  const i = document.createElement('i')
  i.className = className
  return i
}

function registeredDeviceRow_click (e) {
  if (e !== null && e.target !== null && iotDevices[e.target.id]) {
    populateSelectedDeviceTable(e.target.id)
    focusOnMarker(e.target.id)
  }
}

function populateSelectedDeviceTable (deviceId) {
  if (selectedId != null && deviceId != null) {
    iotDevices[selectedId].selected = false
  }

  selectedId = deviceId
  if (deviceId != null) {
    iotDevices[deviceId].selected = true
  }

  document.getElementById('selected-name').textContent =
    deviceId != null ? '' + iotDevices[deviceId].name : 'Selected: '
  document.getElementById('selected-id').textContent =
    deviceId != null ? '' + deviceId : ''
  document.getElementById('selected-channel-name').textContent =
    deviceId != null ? '' + iotDevices[deviceId].channelName : ''
  if (deviceId == null || iotDevices[deviceId].lat == 0) {
    document.getElementById('selected-location').textContent =
      'Location: Not yet seen'
  } else {
    document.getElementById('selected-location').textContent =
      'Location: [' +
      iotDevices[deviceId].lat +
      ', ' +
      iotDevices[deviceId].long +
      ']'
  }
  document.getElementById('selected-sensor-name').textContent =
    deviceId != null
      ? 'Sensor: ' + iotDevices[deviceId].sensors[0].sensor_name
      : 'Sensor: '
  document.getElementById('selected-sensor-value').textContent =
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
    document.getElementById('selected-sensor-update-frequency').textContent =
      'Update Frequency: Not yet seen'
  } else {
    document.getElementById('selected-sensor-update-frequency').textContent =
      'Update Frequency: ' +
      iotDevices[deviceId].sensors[0].sensor_update_frequency / 1000 +
      's'
  }
  document.getElementById('selected-last-seen').textContent =
    deviceId != null
      ? 'Last Seen: ' + formatDate(iotDevices[deviceId].sensors[0].sensor_lastupdate)
      : 'Last Seen:'
  document.getElementById('selected-firmware').textContent =
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
