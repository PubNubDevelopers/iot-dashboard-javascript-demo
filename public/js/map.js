/**
 * Logic to handle drawing the map and the markers.
 */

var map = null

var initialize = function () {
  var myLatlng = new google.maps.LatLng(37.7749, 0.0)
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 2,
    minZoom: 2,
    center: myLatlng,
    streetViewControl: false
  })

  //  This toggleBounce function is not used but would be good to indicate that a new event has occured at the device, e.g. overheat or air quality below a certain threshold.
  function toggleBounce (marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null)
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE)
    }
  }
}

function focusOnMarker (deviceId) {
  if (iotDevices[deviceId].marker != null) {
    map.setZoom(10)
    map.setCenter(iotDevices[deviceId].marker.getPosition())
  }
  populateSelectedDeviceTable(deviceId)
}

function focusOnLatLong (latitude, longitude) {
  map.setZoom(10)
  map.setCenter({ lat: latitude, lng: longitude })
}

function moveMapMarker (deviceId, populateSelectedDeviceTable) {
  const iconBase =
    'https://developers.google.com/maps/documentation/javascript/examples/full/images/'
  var theAnimation = null
  if (iotDevices[deviceId].marker == null)
    theAnimation = google.maps.Animation.DROP

  if (iotDevices[deviceId].marker == null) {
    iotDevices[deviceId].marker = new google.maps.Marker({
      map,
      custom_id: '123',
      draggable: false,
      animation: theAnimation,
      position: {
        lat: iotDevices[deviceId].lat,
        lng: iotDevices[deviceId].long
      }
    })
    iotDevices[deviceId].marker.addListener('click', () => {
      map.setZoom(10)
      map.setCenter(iotDevices[deviceId].marker.getPosition())
      populateSelectedDeviceTable(deviceId, true)

      //  DEMO: used by the interactive demo
      actionCompleted({ action: 'Click on a map marker', debug: false })
      //  END DEMO: used by the interactive demo
    })
  } else {
    //  Move the existing marker
    iotDevices[deviceId].marker.setPosition({
      lat: iotDevices[deviceId].lat,
      lng: iotDevices[deviceId].long
    })
    //map.setCenter(iotDevices[deviceId].marker.getPosition());
  }
}

window.initialize = initialize
