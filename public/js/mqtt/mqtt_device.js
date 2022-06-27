function provisionDevice(payload)
{
    var deviceId = payload.message.provision_device.device_id;
    //  The simulators and MQTT both use the payload.publisher as the unique identifier for the device but for the simulator (only), this is equal to the device Id we assign.  For MQTT, this is assigned by the broker.
    console.log(payload)
    //var deviceId = payload.publisher;
    var channelName = payload.message.provision_device.channel_name;
    var deviceName = payload.message.provision_device.device_name;
    if (!iotDevices[deviceId]) {
        iotDevices[deviceId] = {
          mqttBrokerAssignedId: payload.publisher,
          online: 'yes',
          selected: false,
          name: deviceName,
          channelName: channelName,
          lat: 0.0,
          long: 0.0,
          sensors: [
            {
              sensor_name: '',
              sensor_type: '',
              sensor_update_frequency: 0,
              sensor_value: 0.0,
              sensor_units: '',
              sensor_lastupdate: ''
            }
          ],
          firmware_version: 'Unknown',
          eaAction: '',
          eaActionTime: '',
          mapMarker: null,
          mobile: false
        }
        addRegisteredDevice(deviceId)
    }
    else{
      iotDevices[deviceId].mqttBrokerAssignedId = payload.publisher
      iotDevices[deviceId].online = 'yes'
      updateRegisteredDevice(deviceId)
    }
}