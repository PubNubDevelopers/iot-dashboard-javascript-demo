/**
 * Functions to handle the 'Edit Device' modal.
 */

function editDevice (target) {
  var deviceId = target
  if (deviceId instanceof HTMLLIElement) deviceId = target.id
  if (deviceId != null) {
    var editModal = new bootstrap.Modal(
      document.getElementById('editModal'),
      {}
    )
    document.getElementById('editModalTitle').textContent =
      'Edit Device: ' + iotDevices[deviceId].name
    document.getElementById('editModalDeviceId').textContent = deviceId
    document.getElementById('editModalDeviceName').value =
      iotDevices[deviceId].name
    document.getElementById('editModalIntervalRangeLabel').textContent =
      'Sensor Reporting Interval: ' +
      iotDevices[deviceId].sensors[0].sensor_update_frequency / 1000 +
      's'
    document.getElementById('editModalIntervalRange').value =
      iotDevices[deviceId].sensors[0].sensor_update_frequency
    $('#editModalIntervalRange').on('input', UpdateEditModalIntervalRangeLabel)
    //  Avoid duplicate click handlers on the reboot button
    var old_reboot_button = document.getElementById('editModalReboot')
    var new_reboot_button = old_reboot_button.cloneNode(true)
    old_reboot_button.parentNode.replaceChild(
      new_reboot_button,
      old_reboot_button
    )
    document
      .getElementById('editModalReboot')
      .addEventListener('click', function () {
        rebootDevice(deviceId)
      })
    //  Avoid duplicate click handlers on the updateFirmware button
    var old_firmware_button = document.getElementById('editModalUpdateFirmware')
    var new_firmware_button = old_firmware_button.cloneNode(true)
    old_firmware_button.parentNode.replaceChild(
      new_firmware_button,
      old_firmware_button
    )
    document.getElementById('editModalUpdateFirmwareFile').value = ''
    document
      .getElementById('editModalUpdateFirmware')
      .addEventListener('click', function () {
        var firmwareFile = document.getElementById(
          'editModalUpdateFirmwareFile'
        ).files[0]
        if (firmwareFile != null)
          updateFirmware(deviceId, firmwareFile.name, firmwareFile)
      })

    editModal.show()
  }
}

function UpdateEditModalIntervalRangeLabel () {
  document.getElementById('editModalIntervalRangeLabel').textContent =
    'Sensor Reporting Interval: ' +
    document.getElementById('editModalIntervalRange').value / 1000 +
    's'
}

async function rebootDevice (deviceId) {
  await sendCommand(deviceId, { action: 'reboot' })

  $('#editModal').modal('hide')
}

async function updateFirmware (deviceId, firmwareFileName, firmwareFile) {
  if (firmwareFileName === '') return
  else {
    await pubnub.sendFile({
      channel: iotDevices[deviceId].channelName,
      file: firmwareFile
    })

    $('#editModal').modal('hide')
  }
}

async function editModalSaveChanges (args) {
  //  Need to save the following
  var newDeviceName = document.getElementById('editModalDeviceName').value
  var newSensorUpdateFrequency = document.getElementById(
    'editModalIntervalRange'
  ).value
  var deviceId = document.getElementById('editModalDeviceId').textContent
  await sendCommand(deviceId, {
    action: 'update',
    params: {
      deviceName: newDeviceName,
      sensorUpdateFrequency: newSensorUpdateFrequency
    }
  })

  $('#editModal').modal('hide')
}

//  Not strictly part of the edit modal but fits here
async function deleteDevice (target) {
  var deviceId = target
  if (deviceId instanceof HTMLLIElement) deviceId = target.id
  if (deviceId != null) {
    await sendCommand(deviceId, { action: 'stop' })

    if (iotDevices[deviceId].worker != null)
      iotDevices[deviceId].worker.terminate() //  Should really wait until we get the status message to say the client is disconnected but this is only for the simulator.
    removeRegisteredDevice(deviceId)
    removeMapMarker(deviceId)
    populateSelectedDeviceTable(null)
    iotDevices[deviceId] = null
  }
}
