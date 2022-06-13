async function createSimulator(args)
{
    return new Promise((resolve, reject) => {

        var simulatorTask = new Worker('./js/simulation/devicesimulator.js');

        simulatorTask.onmessage = async function(event)
        {
             if (event.data.command === 'provisionDevice')
             {
                //  A NOTE ON PROVISIONING:
                //  Whilst it may seem silly to assign the simulator an ID and then ask the simulator for the ID it was assigned, the intention is to show that these two pieces of information would usually come from a provisioning server, in production.
                var channelName = event.data.values.channelName;
                var deviceId = event.data.values.deviceId;
                var deviceName = event.data.values.deviceName;
                //  Add simulator to channel group
                try {
                    const controlSubscirbeRsesult = await pubnub.subscribe({
                        channels: [channelName + '-pnpres'],
                    });

                    const result = await pubnub.channelGroups.addChannels({
                    channels: [channelName],
                    channelGroup: channelGroupAllDevices
                });
                }
                catch (status) {
                    console.log("Failed to create channel groups: " + status);
                }
                if (!iotDevices[deviceId])
                {
                    iotDevices[deviceId] = {'online' :'unknown', 'selected': false, 'name': deviceName, 'channelName': channelName, 'lat': 0.000, 'long': 0.000, 'sensors': [{'sensor_name': '', 'sensor_type': '', 'sensor_update_frequency':5000, 'sensor_value': '', 'sensor_units': '', 'sensor_lastupdate': ''}], 'firmware_version': '1.0.0', 'eaAction': '', 'eaActionTime': '', 'mapMarker': null};
                    addRegisteredDevice(deviceId);
                }
                simulatorTask.postMessage({action: "finalizeProvisioning", params: {sub: subscribe_key, pub: publish_key, mobility: args.mobility}});
            }
            else if (event.data.command === 'provisionComplete')
            {
                var deviceId = event.data.values.deviceId;
                await updateDevicePresence(deviceId);

                resolve(simulatorTask);        
            }
        }
        simulatorTask.postMessage({ action: "init", params: {id: args.id, name: args.name, type: args.type, lat: args.lat, long: args.long}});
    })

    }

    async function updateDevicePresence(deviceId)
    {
        //  In the case of page refreshes, update the presence information manually for pre-created simulators
        try {
            const result = await pubnub.whereNow({
                uuid: deviceId,
            });
            if (result.channels.length > 0)
            {
                //  This device is subscribed to at least one channel
                if (iotDevices[deviceId])
                {
                    iotDevices[deviceId].online = 'yes';
                    updateRegisteredDevice(deviceId);
                }
            }
        } catch (status) {
            console.log(status);
        }
    }

