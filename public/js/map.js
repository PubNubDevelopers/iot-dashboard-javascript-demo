/**
 * Draws the map and one marker per device with Leaflet and OpenStreetMap tiles. No API key needed.
 */

var map = null

function initializeMap () {
  map = L.map('map-canvas', { minZoom: 2, worldCopyJump: true }).setView([37.7749, 0.0], 2)
  //  OpenStreetMap's tile servers are fine for a tutorial. For production, use a tile provider: see the tutorial.
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)
}

function focusOnMarker (deviceId) {
  if (iotDevices[deviceId].marker != null) {
    map.setView(iotDevices[deviceId].marker.getLatLng(), 10)
  }
  populateSelectedDeviceTable(deviceId)
}

function focusOnLatLong (latitude, longitude) {
  map.setView([latitude, longitude], 10)
}

function moveMapMarker (deviceId, populateSelectedDeviceTable) {
  const device = iotDevices[deviceId]
  if (device.marker == null) {
    device.marker = L.marker([device.lat, device.long]).addTo(map)
    device.marker.on('click', () => {
      map.setView(device.marker.getLatLng(), 10)
      populateSelectedDeviceTable(deviceId)
    })
  } else {
    device.marker.setLatLng([device.lat, device.long])
  }
}

function removeMapMarker (deviceId) {
  if (iotDevices[deviceId].marker != null) iotDevices[deviceId].marker.remove()
}
