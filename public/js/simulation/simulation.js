/**
 * Logic related to creating predefined and user-specified simulators.
 */

var client = null

async function initializeSimulators () {
  //  Note: Specify null route for a stationary object
  var id = 'sim_1' + makeid(6);
  await createSimulator({
    id: id,
    name: 'Victoria Falls Wind Speed',
    type: SensorType.Anemometer,
    route: null,
    lat: -17.9257,
    long: 25.8625
  }).then(webWorker => {
    iotDevices[id].worker = webWorker
  })
  iotDevices[id].worker.postMessage({ action: 'start' })

  var id = 'sim_2' + makeid(6);
  await createSimulator({
    id: id,
    name: 'EU Freezer Truck',
    type: SensorType.FreezerTemperature,
    route: Routes.Eur2,
    lat: Routes.Eur2.startLat,
    long: Routes.Eur2.startLong
  }).then(webWorker => {
    iotDevices[id].worker = webWorker
  })
  iotDevices[id].worker.postMessage({ action: 'start' })

  var id = 'sim_3' + makeid(6);
  await createSimulator({
    id: id,
    name: 'Radiation Monitor',
    type: SensorType.RadiationMonitor,
    route: null,
    lat: 56.0674,
    long: -4.8146
  }).then(webWorker => {
    iotDevices[id].worker = webWorker
  })
  iotDevices[id].worker.postMessage({ action: 'start' })

  var id = 'sim_4' + makeid(6);
  await createSimulator({
    id: id,
    name: 'Australian Air Quality',
    type: SensorType.Air_Pollution,
    route: Routes.Aus,
    lat: Routes.Aus.startLat,
    long: Routes.Aus.startLong
  }).then(webWorker => {
    iotDevices[id].worker = webWorker
  })
  iotDevices[id].worker.postMessage({ action: 'start' })

  var id = 'sim_5' + makeid(6);
  await createSimulator({
    id: id,
    name: 'USA Chilled Truck',
    type: SensorType.RefrigeratorTemperature,
    route: Routes.I5NS,
    lat: Routes.I5NS.startLat,
    long: Routes.I5NS.startLong
  }).then(webWorker => {
    iotDevices[id].worker = webWorker
  })
  iotDevices[id].worker.postMessage({ action: 'start' })

  var id = 'sim_6' + makeid(6);
  await createSimulator({
    id: id,
    name: 'Transalpine Air Quality',
    type: SensorType.Air_Pollution,
    route: Routes.Eur1,
    lat: Routes.Eur1.startLat,
    long: Routes.Eur1.startLong
  }).then(webWorker => {
    iotDevices[id].worker = webWorker
  })
  iotDevices[id].worker.postMessage({ action: 'start' })
}

async function createSimulator (args) {
  return new Promise((resolve, reject) => {
    var simulatorTask = new Worker('./js/simulation/worker_devicesim.js')

    simulatorTask.onmessage = async function (event) {
      if (event.data.command === 'provisionDevice') {
        //  A NOTE ON PROVISIONING:
        //  Whilst it may seem silly to assign the simulator an ID and then ask the simulator for the ID it was assigned, the intention is to show that these two pieces of information would usually come from a provisioning server, in production.
        var channelName = event.data.values.channelName
        var deviceId = event.data.values.deviceId
        var deviceName = event.data.values.deviceName
        if (!iotDevices[deviceId]) {
          iotDevices[deviceId] = {
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
            mobile: (args.route === null) ? false : true
          }
          addRegisteredDevice(deviceId)
        }
        simulatorTask.postMessage({
          action: 'finalizeProvisioning',
          params: { sub: subscribe_key, pub: publish_key, route: args.route }
        })
      } else if (event.data.command === 'provisionComplete') {
        var deviceId = event.data.values.deviceId

        resolve(simulatorTask)
      }
    }
    simulatorTask.postMessage({
      action: 'init',
      params: {
        id: args.id,
        name: args.name,
        type: args.type,
        route: args.route,
        lat: args.lat,
        long: args.long
      }
    })
  })
}
