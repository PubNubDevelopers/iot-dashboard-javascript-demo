/**
 * Functions to handle device creation and the 'Create New Device' modal.
 */

//  CreateNewDevice modal
function createNewDevice () {
  var createModal = new bootstrap.Modal(
    document.getElementById('createModal'),
    {}
  )

  //  Clear previous modal data
  var inDeviceName = document.getElementById('createModalDeviceName')
  inDeviceName.value = ''
  var validationAlert = document.getElementById('createDeviceValidationDialog')
  validationAlert.style = 'display:none'
  var selectSensorType = document.getElementById('createModalSelectSensorType')
  selectSensorType.selectedIndex = 0
  var selectRoute = document.getElementById('createModalSelectRoute')
  selectRoute.selectedIndex = 0

  //  Assign a random ID
  var newId = makeid(8)
  var idPlaceholder = document.getElementById('createModalDeviceId')
  idPlaceholder.innerHTML = newId

  //  Populate sensor types
  if (selectSensorType.options.length === 1) {
    for (sensor in SensorType) {
      var option = document.createElement('option')
      option.value = SensorType[sensor]
      option.innerHTML = SensorType[sensor]
      selectSensorType.appendChild(option)
    }
  }

  //  Populate routes
  var latLongPair = document.getElementById('createDeviceLatLongPair')
  if (selectRoute.options.length === 1) {
    for (route in Routes) {
      var option = document.createElement('option')
      option.value = route
      option.innerHTML = Routes[route].description
      selectRoute.appendChild(option)
    }
  }
  selectRoute.addEventListener('change', function (e) {
    if (selectRoute.value == 'None') {
      //  Show latitude
      latLongPair.style = 'display:block'
    } else {
      //  Hide lat and long
      latLongPair.style = 'display:none'
    }
  })
  createModal.show()
}

//  Button handler when the user presses the 'create device' button from the creat modal
async function createModalCreateDevice () {
  var inDeviceName = document.getElementById('createModalDeviceName').value
  if (inDeviceName === null || inDeviceName === '') {
    showValidationAlert('Invalid Device Name')
    return
  }

  var deviceId = document.getElementById('createModalDeviceId').innerHTML

  var selectSensorType = document.getElementById('createModalSelectSensorType')
  if (selectSensorType.selectedIndex == 0) {
    showValidationAlert('Please select a sensor type')
    return
  }

  var selectRoute = document.getElementById('createModalSelectRoute')
  if (selectRoute.selectedIndex == 0) {
    showValidationAlert('Please select a route')
    return
  }

  //  Only validate the lat / long if the route is 'none'.
  var inDeviceLat = Routes[selectRoute.value].startLat
  var inDeviceLong = Routes[selectRoute.value].startLong
  if (selectRoute.selectedIndex == 1) {
    inDeviceLat = Number(document.getElementById('createDeviceLat').value)
    inDeviceLong = Number(document.getElementById('createDeviceLong').value)
    if (
      inDeviceLat === null ||
      inDeviceLat === '' ||
      inDeviceLat < -90 ||
      inDeviceLat > 90
    ) {
      showValidationAlert('Invalid Latitude.  Should be in range -90 to 90')
      return
    }
    if (
      inDeviceLong === null ||
      inDeviceLong === '' ||
      inDeviceLong < -180 ||
      inDeviceLong > 180
    ) {
      showValidationAlert('Invalid Longitude.  Should be in range -180 to 180')
      return
    }
  }

  //  Validation passed - clear any earlier validation issues.
  var validationAlert = document.getElementById('createDeviceValidationDialog')
  validationAlert.style = 'display:none'

  //  This demo only currently supports simulators
  await createSimulator({
    id: deviceId,
    name: inDeviceName,
    type: selectSensorType.value,
    route: Routes[selectRoute.value],
    lat: inDeviceLat,
    long: inDeviceLong
  }).then(webWorker => {
    iotDevices[deviceId].worker = webWorker
  })
  iotDevices[deviceId].worker.postMessage({ action: 'start' })
  focusOnLatLong(inDeviceLat, inDeviceLong)
  populateSelectedDeviceTable(deviceId, true)

  //  DEMO: used by the interactive demo
  if (
    Routes[selectRoute.value].fileName == Routes['Eur3'].fileName &&
    selectSensorType.value == SensorType['FreezerTemperature']
  )
    actionCompleted({
      action: 'Create a mobile freezer temperature sensor, starting in Warsaw',
      debug: false
    })
  if (
    Routes[selectRoute.value].fileName == Routes['USA2'].fileName &&
    selectSensorType.value == SensorType['Air_Pollution']
  )
    actionCompleted({
      action: 'Create a mobile air pollution sensor, starting in Dallas',
      debug: false
    })
  //  END DEMO: used by the interactive demo

  $('#createModal').modal('hide')
}

function showValidationAlert (message) {
  document.getElementById('createDeviceValidationWarning').innerText = message
  var validationAlert = document.getElementById('createDeviceValidationDialog')
  validationAlert.style = 'display:block'
}
