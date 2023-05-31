/**
 * Web worker to represent a simulated device.
 * Although the device is simulated, all communication between the simulator and the dashboard is over the (external) PubNub network.
 */

if ('function' === typeof importScripts) {
  const window = null
  importScripts('https://cdn.pubnub.com/sdk/javascript/pubnub.7.2.2.min.js')
  importScripts('./simulator_types.js')

  var deviceSimulator
  var deviceChannelName
  var defaultDeviceName
  var id
  var type
  var route
  var localPubNub
  var lat
  var long
  var tick = 0

  onmessage = async function (args) {
    //  Initialization / provisioning has been implemented this way to more closely resemble how provisioning will work in production - see ReadMe for more details.
    if (args.data.action === 'init') {
      id = args.data.params.id
      deviceChannelName = 'device.' + id
      defaultDeviceName = args.data.params.name
      lat = args.data.params.lat
      long = args.data.params.long
      type = args.data.params.type
      route = args.data.params.route
      if (route != null && route.fileName == '') route = null
      if (route != null) importScripts(route.fileName)
      this.postMessage({
        command: 'provisionDevice',
        values: {
          channelName: deviceChannelName,
          deviceId: id,
          deviceName: defaultDeviceName
        }
      })
    } else if (args.data.action === 'finalizeProvisioning') {
      var subKey = args.data.params.sub
      var pubKey = args.data.params.pub
      route = args.data.params.route
      localPubNub = new PubNub({
        publishKey: pubKey,
        subscribeKey: subKey,
        uuid: id,
        listenToBrowserNetworkEvents: false //  Allows us to call the PubNub SDK from a web worker
      })
      var accessManagerToken = await requestAccessManagerToken(id)
      if (accessManagerToken == null)
      {
        console.log('Error retrieving access manager token')
      }
      else{
        localPubNub.setToken(accessManagerToken)
      }

      await localPubNub.addListener({
        status: async statusEvent => {
          //console.log(statusEvent)
          this.postMessage({
            command: 'provisionComplete',
            values: { deviceId: id }
          })
        },
        message: async payload => {
          if (payload.publisher !== id) {
            if (payload.message.action === 'reboot') {
              deviceSimulator.reboot()
            } else if (payload.message.action === 'stop') {
              deviceSimulator.stop()
            } else if (payload.message.action === 'update') {
              deviceSimulator.setName(payload.message.params.deviceName)
              deviceSimulator.changeIntervalValue(
                payload.message.params.sensorUpdateFrequency
              )
            }
          }
        },
        file: async payload => {
          if (payload.publisher !== id) {
            //  Only file we handle is firmware
            deviceSimulator.updateFirmware(payload.file.name)
          }
        }
      })

      await localPubNub.subscribe({
        channels: [deviceChannelName],
        withPresence: false
      })

      deviceSimulator = new DeviceSimulator(
        defaultDeviceName,
        type,
        route,
        lat,
        long
      )
    } else if (args.data.action === 'start') {
      deviceSimulator.start()
    }
  }

  class DeviceSimulator {
    interval = 5000
    intervalId
    model = function () {}
    routeModel = function () {
      return null
    }
    constructor (defaultDeviceName, type, route, latitude, longitude) {
      this.deviceName = defaultDeviceName
      this.sensorType = type
      this.route = route
      if (this.route != null && this.route.fileName == '') this.route = null

      this.latitude = latitude
      this.longitude = longitude
      this.units = ''
      this.firmwareVersion = '1.0.0'
      if (this.sensorType === SensorType.RefrigeratorTemperature) {
        //  Average around a temperature of -5.  Vary by 1 (celsius)
        //  y = 1sin(x) -5
        this.model = function (x) {
          return 1 * Math.sin(x) - 5
        }
        this.sensorName = SensorType['RefrigeratorTemperature']
        this.sensorType = 'Temperature'
        this.units = '°c'
        if (this.route != null) {
          this.routeModel = function (x) {
            return {
              lat: route_coords.coords[x].lat,
              long: route_coords.coords[x].long
            }
          }
        }
      } else if (this.sensorType == SensorType.FreezerTemperature) {
        //  Average around a temperature of -18.  Vary by 1 (celsius)
        //  y = 1sin(x) - 18
        this.model = function (x) {
          return 1 * Math.sin(x) - 18
        }
        this.sensorName = SensorType['FreezerTemperature']
        this.sensorType = 'Temperature'
        this.units = '°c'
        if (this.route != null) {
          this.routeModel = function (x) {
            return {
              lat: route_coords.coords[x].lat,
              long: route_coords.coords[x].long
            }
          }
        }
      } else if (this.sensorType == SensorType.RadiationMonitor) {
        //  Average around 0.04.  Vary by 0.03Sv
        //  0.5% chance of going to 1
        this.model = function (x) {
          var test = Math.floor(Math.random() * 200 + 1)
          if (test === 1) return 1
          else return 0.03 * Math.sin(x) + 0.04;
        }
        this.sensorName = SensorType['RadiationMonitor']
        this.sensorType = 'Radiation'
        this.units = 'Sv'
        if (this.route != null) {
          this.routeModel = function (x) {
            return {
              lat: route_coords.coords[x].lat,
              long: route_coords.coords[x].long
            }
          }
        }
      } else if (this.sensorType == SensorType.Anemometer) {
        //  Average around a value of 4.  Vary by 5 (mph)
        //  y = 5sin(x) + 4
        this.model = function (x) {
          return Math.abs(5 * Math.sin(x) - 4)
        }
        this.sensorName = SensorType['Anemometer']
        this.sensorType = 'Anemometer'
        this.units = 'mph'
        if (this.route != null) {
          this.routeModel = function (x) {
            return {
              lat: route_coords.coords[x].lat,
              long: route_coords.coords[x].long
            }
          }
        }
      } else if (this.sensorType == SensorType.Air_Pollution) {
        //  Average around a value of 7.  Vary by 3 (ppm)
        //  y = 3sin(x) + 7
        this.model = function (x) {
          return 3 * Math.sin(x) + 7
        }
        this.sensorName = SensorType['Air_Pollution']
        this.sensorType = 'Air_Pollution'
        this.units = 'ppm'
        if (this.route != null) {
          this.routeModel = function (x) {
            return {
              lat: route_coords.coords[x].lat,
              long: route_coords.coords[x].long
            }
          }
        }
      } else {
        console.error('Unknown sensor type specified: ' + this.sensorType)
      }
    }

    start () {
      this.publishMessage(
        localPubNub,
        deviceChannelName,
        this.model,
        this.routeModel,
        this.latitude,
        this.longitude,
        this.deviceName,
        this.interval,
        this.sensorName,
        this.sensorType,
        this.units,
        this.firmwareVersion
      )
      this.intervalId = setInterval(
        this.publishMessage,
        this.interval,
        localPubNub,
        deviceChannelName,
        this.model,
        this.routeModel,
        this.latitude,
        this.longitude,
        this.deviceName,
        this.interval,
        this.sensorName,
        this.sensorType,
        this.units,
        this.firmwareVersion
      )
    }

    stop () {
      clearInterval(this.intervalId)
    }

    setName (name) {
      this.deviceName = name
    }

    changeIntervalValue (newInterval) {
      this.stop()
      this.interval = newInterval
      this.start()
    }

    async reboot () {
      this.stop()
      await localPubNub.unsubscribe({ channels: [deviceChannelName] })
      setTimeout(this.postReboot, 5000, this)
    }

    async postReboot (deviceSimulator) {
      await localPubNub.subscribe({
        channels: [deviceChannelName],
        withPresence: false
      })
      deviceSimulator.start()
    }

    async updateFirmware (fileName) {
      this.firmwareVersion = fileName
      this.reboot()
    }

    getFirmwareVersion () {
      return this.firmwareVersion
    }

    toString () {
      return this.id + ' [' + this.latitude + ', ' + this.longitude + ']'
    }

    async publishMessage (
      localPubNub,
      channelName,
      model,
      routeModel,
      latitude,
      longitude,
      deviceName,
      interval,
      sensorName,
      sensorType,
      sensorUnits,
      firmwareVersion
    ) {
      var sensorValue = model(tick)
      var localLatitude = latitude
      var localLongitude = longitude
      if (routeModel(0) != null) {
        localLatitude = routeModel(tick % route_coords.coords.length).lat
        localLongitude = routeModel(tick % route_coords.coords.length).long
      }

      //  A note about signals
      //  PubNub offers the signal() method as an alternative to publish() for short lived, ephemeral data which goes out of date quickly.  The same delivery guarantees do not exist for signals but signal pricing can be lower than publish.  The primary limitation of signals, besides not being able to be stored from history or trigger push messages, is that they are limited to 64bytes.  This demo opts to use a more descriptive message payload and therefore uses .publish() but if you want to limit your updates to 64bytes, e.g. just passing a lat/long, then you could potentially save costs on your overall solution.
      await localPubNub.publish({
        channel: channelName,
        message: {
          lat: localLatitude,
          long: localLongitude,
          friendly_name: deviceName,
          sensors: [
            {
              sensor_name: sensorName,
              sensor_type: sensorType,
              sensor_update_frequency: interval,
              sensor_value: sensorValue,
              sensor_units: sensorUnits
            }
          ],
          firmware_version: firmwareVersion
        }
      })

      tick++
    }
  }

  async function requestAccessManagerToken (userId) {
    try {
      const TOKEN_SERVER = 'https://devrel-demos-access-manager.netlify.app/.netlify/functions/api/iotdemo'
      const response = await fetch(`${TOKEN_SERVER}/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ UUID: userId })
      })
  
      const token = (await response.json()).body.token
      //console.log('created token: ' + token)
  
      return token
    } catch (e) {
      console.log('failed to create token ' + e)
      return null
    }
  }
}
