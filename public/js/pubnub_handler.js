/**
 * Main entry point for communication coming from PubNub.
 * The state of the dashboard is in the 'iotDevices' object, one entry per device ID.
 * This shows the principle of an IoT dashboard on PubNub. Keeping devices in the browser doesn't let several
 * dashboards share them; see the ReadMe for how you would store devices on the server.
 */

var pubnub = null
var iotDevices = null
var selectedId = null
var simulatorsStarted = false

function onload () {
  iotDevices = {}
  initializeMap()
  if (!testPubNubKeys()) {
    document.getElementById('noKeysAlert').style.display = 'block'
    return
  }
  pubnub = createPubNubObject()
  pubnub.addListener({
    status: statusEvent => {
      //  The subscription to all device channels is up, so start the simulated devices.
      if (statusEvent.category === 'PNConnectedCategory' && !simulatorsStarted) {
        simulatorsStarted = true
        initializeSimulators()
      }
    }
  })

  //  Wildcard subscribe: one subscription gets messages and presence events from every device.* channel.
  const subscription = pubnub.channel('device.*').subscription({ receivePresenceEvents: true })

  //  Sensor readings from the devices. Update the stored device, the map and the tables.
  subscription.onMessage = event => {
    const device = iotDevices[event.publisher]
    const reading = readDeviceMessage(event.message)
    if (!device || !reading) return
    const nameChanged = device.name !== reading.name
    device.name = reading.name
    device.lat = reading.lat
    device.long = reading.long
    Object.assign(device.sensors[0], reading.sensor)
    device.sensors[0].sensor_lastupdate = new Date(Number(event.timetoken) / 10000) //  A timetoken counts 100-nanosecond intervals.
    device.firmware_version = reading.firmwareVersion
    moveMapMarker(event.publisher, populateSelectedDeviceTable)
    if (device.selected) populateSelectedDeviceTable(event.publisher)
    if (nameChanged) updateRegisteredDevice(event.publisher)
  }

  //  A device is online while it's subscribed to its channel: join means online, leave or timeout means offline.
  subscription.onPresence = event => {
    if (event.action === 'interval') { //  On busy channels PubNub batches joins and leaves into interval events.
      ;(event.join || []).forEach(id => setOnline(id, true))
      ;[...(event.leave || []), ...(event.timeout || [])].forEach(id => setOnline(id, false))
    } else if (event.action === 'join') {
      setOnline(event.uuid, true)
    } else if (event.action === 'leave' || event.action === 'timeout') {
      setOnline(event.uuid, false)
    }
  }

  subscription.subscribe()
}

function setOnline (deviceId, online) {
  if (!iotDevices[deviceId]) return
  iotDevices[deviceId].online = online ? 'yes' : 'no'
  updateRegisteredDevice(deviceId)
}

//  Anyone with your keys can publish on the device channels, so only accept readings with the expected shape.
function readDeviceMessage (message) {
  if (!message || typeof message !== 'object' || !Array.isArray(message.sensors) || !message.sensors[0]) return null
  const sensor = message.sensors[0]
  const lat = Number(message.lat)
  const long = Number(message.long)
  const value = Number(sensor.sensor_value)
  if (!Number.isFinite(lat) || !Number.isFinite(long) || !Number.isFinite(value)) return null
  return {
    name: String(message.friendly_name ?? '').substring(0, 40),
    lat,
    long,
    firmwareVersion: String(message.firmware_version ?? 'Unknown').substring(0, 60),
    sensor: {
      sensor_name: String(sensor.sensor_name ?? ''),
      sensor_value: Math.round((value + Number.EPSILON) * 100) / 100,
      sensor_update_frequency: Number(sensor.sensor_update_frequency) || 0,
      sensor_units: String(sensor.sensor_units ?? '')
    }
  }
}
