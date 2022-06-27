/**
 * Main entry point for communication coming from PubNub
 * The internal state of the application is managed by the 'iotDevices' object.
 * This is designed to show the principle of what IoT with PubNub would look like - obviously storing these objects as part of the client app state does not lend itself to multiple clients viewing the same simulated device(!).  PubNub Objects would be a good approach to managing your IoT devices on the server - see the ReadMe for more information.
 * Note: I used an auto-formatter on this code but I'm not sure I like how it turned out.
 */

var pubnub = null
var iotDevices = null
var selectedId = null

async function onload () {
  iotDevices = {}
  if (!testPubNubKeys()) {
    document.getElementById('noKeysAlert').style.display = 'block'
  } else {
    pubnub = createPubNubObject()
    await pubnub.addListener({
      //  Status events
      status: async statusEvent => {
        //  Channel subscription is now complete, pre-populate with simulators.
        if (statusEvent.affectedChannels != null && statusEvent.affectedChannels[0] === 'device.*') {
          initializeSimulators()
        }
      },
      //  Messages from remote IOT devices.  Update the internal object that stores information about all these devices
      message: async payload => {
        
        //  Tutorial for adding an MQTT device
        //console.log(payload)
        if (typeof payload.message.provision_device != "undefined")
        {
          //  The device is requesting to be provisioned, make an entry for it in the 
          //  local devices array
          provisionDevice(payload)
          return
        }

        //  MQTT publisher is allocated by the broker, so switch to using the device ID we assigned.
        if (typeof payload.message.mqtt_device_id != "undefined")
        {
          payload.publisher = payload.message.mqtt_device_id;
        }
        //  End Tutorial for adding an MQTT device


        //  Unrecognised device
        if (
          iotDevices[payload.publisher] == null ||
          payload.publisher === pubnub.uuid
        )
        {
          return
        }
        
        //console.log(payload)
        var nameChanged =
          iotDevices[payload.publisher].name != payload.message.friendly_name
        iotDevices[payload.publisher].name = payload.message.friendly_name
        iotDevices[payload.publisher].lat = Number(payload.message.lat)
        iotDevices[payload.publisher].long = Number(payload.message.long)
        iotDevices[payload.publisher].sensors[0].sensor_name =
          payload.message.sensors[0].sensor_name
        iotDevices[payload.publisher].sensors[0].sensor_value =
          Math.round(
            (Number(payload.message.sensors[0].sensor_value) + Number.EPSILON) * 100
          ) / 100
        iotDevices[payload.publisher].sensors[0].sensor_update_frequency =
          Number(payload.message.sensors[0].sensor_update_frequency)
        iotDevices[payload.publisher].sensors[0].sensor_units =
          payload.message.sensors[0].sensor_units
        iotDevices[payload.publisher].sensors[0].sensor_lastupdate = new Date(
          payload.timetoken / 10000
        )
        iotDevices[payload.publisher].firmware_version =
          payload.message.firmware_version
        moveMapMarker(payload.publisher, populateSelectedDeviceTable)
        if (iotDevices[payload.publisher].selected)
          populateSelectedDeviceTable(payload.publisher, false)
        if (nameChanged) updateRegisteredDevice(payload.publisher, false)
      },
      presence: presenceEvent => {
        //  Will be invoked regardless of the 'Announce Max' setting on the key
        if (typeof iotDevices[presenceEvent.uuid] != "undefined") {
          if (presenceEvent.action === 'join')
            iotDevices[presenceEvent.uuid].online = 'yes'
          else iotDevices[presenceEvent.uuid].online = 'no'
          updateRegisteredDevice(presenceEvent.uuid)
        }
        else{
          //  MQTT only - Need to look up the device ID from the (broker) uuid returned in the presence event
          for (device in iotDevices)
          {
            if (iotDevices[device].mqttBrokerAssignedId != null &&
              iotDevices[device].mqttBrokerAssignedId == presenceEvent.uuid)
            {
              console.log('mqtt ' + presenceEvent.action);
              if (presenceEvent.action === 'join')
                iotDevices[device].online = 'yes'
              else 
                iotDevices[device].online = 'no'
              updateRegisteredDevice(device)            
            }
          }
        }
      }
    })

    //  Wildcard subscribe, to listen for all devices in a scalable manner
    pubnub.subscribe({
      channels: ["device.*", "mqtt_data_channel"],
      withPresence: true
    })
  }
}
