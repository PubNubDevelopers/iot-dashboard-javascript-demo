import paho.mqtt.client as mqtt
from threading import Timer
import json

publish_key = "pub-c-76bc5dff-cd00-4c1a-9360-f750e213331b"
subscribe_key = "sub-c-8f498a3e-8ef4-4373-913a-95aeb73fd21d"
client_id = "sim_py"
channel_name = "device/" + client_id
channel_name2 = "device." + client_id
channel_name3 = "device/#"
channel_name4 = "mqtt_data_channel"
device_name = "MQTT Python Device"
sensor_frequency = 5000
sensor_value = -4.5
latitude = "51.4037"
longitude = "-0.3376"
firmware_version = "v1.0"
client = mqtt.Client(client_id=publish_key + "/" + subscribe_key + "/" + client_id)

def debounce(wait_time):
    """
    Decorator that will debounce a function so that it is called after wait_time seconds
    If it is called multiple times, will wait for the last call to be debounced and run only this one.
    """

    def decorator(function):
        def debounced(*args, **kwargs):
            def call_function():
                debounced._timer = None
                return function(*args, **kwargs)
            # if we already have a call to the function currently waiting to be executed, reset the timer
            if debounced._timer is not None:
                debounced._timer.cancel()

            # after wait_time, call the function provided to the decorator with its arguments
            debounced._timer = Timer(wait_time, call_function)
            debounced._timer.start()

        debounced._timer = None
        return debounced

    return decorator

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    #client.subscribe("device/sim_py")  # Get the action:reboot this way
    client.subscribe(channel_name)
    client.subscribe(channel_name4)
    provision_device()
    post_message_loop()

def on_disconnect(client, userdata, rc):
    print("Client disconnected with result " + str(rc))

@debounce(0.1)
def on_message(client, userdata, msg):
    print("onMsg " + msg.topic + " " + str(msg.payload) + " " + str(userdata))
    if str(msg.payload).find('"action":"reboot"') != -1:
        print("DEVICE IS REBOOTING")
        client.unsubscribe(channel_name)
        client.unsubscribe(channel_name4)
        client.disconnect()
        r = Timer(5.0, connect)
        r.start()
    elif str(msg.payload).find('"action":"update"') != -1:
        print ("Updating parameters")
        attr = json.loads(msg.payload)
        global sensor_frequency 
        sensor_frequency = int(attr["params"]["sensorUpdateFrequency"])
        global device_name 
        device_name = attr["params"]["deviceName"]
    

def post_message_loop():
    msgStr = '{"mqtt_device_id": "' + client_id + '", "lat": "' + latitude + '", "long": "' + longitude + '", "friendly_name": "' + device_name + '", "firmware_version": "' + firmware_version + '", "sensors": [{"sensor_name": "Refrigerator Temperature", "sensor_type": "Temperature", "sensor_update_frequency": "' + str(sensor_frequency) + '", "sensor_value": "' + str(sensor_value) + '", "sensor_units": "°c"}]}'
    client.publish(channel_name4, msgStr)
    r = Timer(sensor_frequency / 1000, post_message_loop)
    r.start()

@debounce(0.1)
def provision_device():
    client.publish(channel_name4, str('{"provision_device":{"device_id": "sim_py", "channel_name": "' + channel_name2 + '", "device_name": "' + device_name + '"}}'))

@debounce(0.1)
def connect():
    print("Connecting")
    global client
    client = mqtt.Client(client_id=publish_key + "/" + subscribe_key + "/" + client_id)
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message
    client.connect("mqtt.pndsn.com", 1883, 6000)
    client.loop_forever()
    print("Connect called")


client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_message = on_message
client.connect("mqtt.pndsn.com", 1883, 6000)
client.loop_forever()

