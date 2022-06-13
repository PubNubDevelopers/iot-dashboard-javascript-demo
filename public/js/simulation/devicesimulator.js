if ('function' === typeof importScripts) {

    const window = null;
importScripts('./pubnub_modified.js');
importScripts('./types.js');
importScripts('./routes/route_i5.js');
importScripts('./routes/route_i5_flip.js');

var deviceSimulator;
var deviceChannelName;
var defaultDeviceName;
var id;
var type;
var mobility;
var localPubNub;
var lat;
var long;
var tick = 1;

onmessage = async function(args)
{
    if (args.data.action === 'init')
    {
        id = args.data.params.id;
        deviceChannelName = 'device_' + id;
        defaultDeviceName = args.data.params.name;
        lat = args.data.params.lat;
        long = args.data.params.long;
        type = args.data.params.type;
        mobility = args.data.params.mobility;
        this.postMessage({command: 'provisionDevice', values: {channelName: deviceChannelName, deviceId: id, deviceName: defaultDeviceName}});
    }
    else if (args.data.action === 'finalizeProvisioning')
    {
        var subKey = args.data.params.sub;
        var pubKey = args.data.params.pub;
        mobility = args.data.params.mobility;
        localPubNub = new PubNub({
            publishKey:   pubKey,
            subscribeKey: subKey, 
            uuid: id
        });
        
        await localPubNub.addListener({
            status: async (statusEvent) => {
                this.postMessage({command: 'provisionComplete', values: {deviceId: id}}); 
            },
            message: async (payload) => {
                if (payload.publisher !== id)
                {
                    console.log(payload);
                }
                //  todo handle commands: setInterval, disable, enable, update_firmware, restart (await localPubNub.unsubscribe({channels: ['test1']});)
            },
        });

        await localPubNub.subscribe({
            channels: [deviceChannelName],
            withPresence: false
        });

        deviceSimulator = new DeviceSimulator(defaultDeviceName, type, mobility, lat, long);                   
    }
    else if (args.data.action === 'start')
    {
        deviceSimulator.start();
    }

}



}

class DeviceSimulator
{
    interval = 5000;
    intervalId;
    model = function(){};
    routeModel = function(){return null;};
    constructor(defaultDeviceName, type, mobility, latitude, longitude) 
    {
        this.deviceName = defaultDeviceName;
        this.sensorType = type;
        this.sensorMobility = mobility;
        this.latitude = latitude;
        this.longitude = longitude;
        this.units = "";
        this.firmwareVersion = "1";
        if (this.sensorType === SensorType.RefrigeratorTemperature)
        {
            //  Average around a temperature of -5.  Vary by 1 (celsius)
            //  y = 1sin(x) -5
            this.model = function(x) {return 1 * Math.sin(x) - 5}
            this.sensorName = "Refrigerator Temp";
            this.sensorType = "Temperature";
            this.units = "°c";
            if (this.sensorMobility === SensorMobility.Moving)
            {
                this.routeModel = function(x) {return {"lat": route_i5.coords[x].lat, "long": route_i5.coords[x].long};}
            }
        }
        else if (this.sensorType == SensorType.FreezerTemperature)
        {
            //  Average around a temperature of -18.  Vary by 1 (celsius)
            //  y = 1sin(x) - 18
            this.model = function(x) {return 1 * Math.sin(x) - 18}
            this.sensorName = "Freezer Temp";
            this.sensorType = "Temperature";
            this.units = "°c";
            if (this.sensorMobility === SensorMobility.Moving)
            {
                this.routeModel = function(x) {return {"lat": route_i5_flip.coords[x].lat, "long": route_i5_flip.coords[x].long};}
            }
        }
        else if (this.sensorType == SensorType.RadiationMonitor)
        {
            //  0.001 with a 5% chance of going to 1
            this.model = function(x) 
            {
                var test = Math.floor(Math.random() * (20) + 1);
                if (test === 1)
                    return 1;
                else
                    return 0.001;
            }
            this.sensorName = "Radiation Monitor";
            this.sensorType = "Radiation";
            this.units = "Sv";
        }
        else if (this.sensorType == SensorType.Altimeter)
        {
            //  Average around a height of 35,000.  Vary by 6000 (ft)
            //  y = 6000sin(x) + 35000
            this.model = function(x) {return 6000 * Math.sin(x) - 35000}
            this.sensorName = "Plane Altitude";
            this.sensorType = "Altitude";
            this.units = "ft";
        }
        else if (this.sensorType == SensorType.Anemometer)
        {
            //  Average around a value of 4.  Vary by 5 (mph)
            //  y = 5sin(x) + 4
            this.model = function(x) {return 5 * Math.sin(x) - 18}
            this.sensorName = "Wind Speed";
            this.sensorType = "Anemometer";
            this.units = "mph";
        }
        else{
            console.error('Unknown sensor type specified: ' + this.sensorType);
        }

    }

    start()
    {
        this.publishMessage(localPubNub, deviceChannelName, this.model, this.routeModel, this.latitude, this.longitude, this.deviceName, this.interval, this.sensorName, this.sensorType, this.units, this.firmwareVersion);
        this.intervalId = setInterval(this.publishMessage, this.interval, localPubNub, deviceChannelName, this.model, this.routeModel, this.latitude, this.longitude, this.deviceName, this.interval, this.sensorName, this.sensorType, this.units, this.firmwareVersion);
    }

    stop()
    {
        clearInterval(this.intervalId);
    }

    setName(name)
    {
        this.name = name;
    }
    
    getFirmwareVersion()
    {
        return this.firmwareVersion;
    }
    
    toString()
    {
        return this.id + " [" + this.latitude + ", " + this.longitude + "]";   
    }

    async publishMessage(localPubNub, channelName, model, routeModel, latitude, longitude, deviceName, interval, sensorName, sensorType, sensorUnits, firmwareVersion) {
        var sensorValue = model(tick);
        var localLatitude = latitude;
        var localLongitude = longitude;
        if (routeModel(tick) != null)
        {
            
            localLatitude = routeModel(tick % route_i5.coords.length).lat;
            localLongitude = routeModel(tick % route_i5.coords.length).long;
        }
        await localPubNub.publish({
            channel: channelName,
            message: {
                'lat': localLatitude,
                'long': localLongitude,
                'friendly_name': deviceName,
                'sensors': [{
                    'sensor_name': sensorName,
                    'sensor_type': sensorType,
                    'sensor_update_frequency': interval,
                    'sensor_value': sensorValue,
                    'sensor_units': sensorUnits}
                ],
                'firmware_version': firmwareVersion
            }
        });
        tick++;
    }

}




class Sensor
{
    constructor(type, updateFrequency)
    {
        this.sensorType = type;
        this.updateFrequency = updateFrequency;
    }
}