# Sample MQTT client - proof of concept
# MQTT does not support file transfer.  Though not supported in this sample file, in production you could do this using the PubNub SDK, e.g. the Python SDK if you were extending this sample.

import paho.mqtt.client as mqtt
from threading import Timer
import json
import random

publish_key = ""    # YOUR PUBNUB PUBLISH KEY HERE
subscribe_key = ""  # YOUR PUBNUB SUBSCRIBE KEY HERE
client_id = "sim_py"
channel_name = "device/" + client_id
channel_name2 = "device." + client_id
channel_name4 = "mqtt_data_channel"
device_name = "MQTT Python Device"
sensor_frequency = 5000
sensor_value = -4.5
latitude = "51.4037"
longitude = "-0.3376"
firmware_version = "v1.0"
client = mqtt.Client(client_id=publish_key + "/" + subscribe_key + "/" + client_id)
timer_post = Timer(1000, ())
timer_connect = Timer(1000, ())

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
    client.subscribe(channel_name)
    client.subscribe(channel_name4)
    provision_device()
    post_message_loop()

def on_disconnect(client, userdata, rc):
    print("Client disconnected with result " + str(rc))

@debounce(0.1)
def on_message(client, userdata, msg):
    #print("onMsg " + msg.topic + " " + str(msg.payload) + " " + str(userdata))
    if str(msg.payload).find('"action":"reboot"') != -1:
        print("DEVICE IS REBOOTING")
        client.unsubscribe(channel_name)
        client.unsubscribe(channel_name4)
        client.disconnect()
        timer_post.cancel()
        global timer_connect
        timer_connect = Timer(7.0, connect)
        timer_connect.start()
    elif str(msg.payload).find('"action":"update"') != -1:
        print ("UPDATING PARAMETERS")
        attr = json.loads(msg.payload)
        global sensor_frequency 
        sensor_frequency = int(attr["params"]["sensorUpdateFrequency"])
        global device_name 
        device_name = attr["params"]["deviceName"]
        timer_post.cancel()
        post_message_loop()
    

def post_message_loop():
    msgStr = '{"mqtt_device_id": "' + client_id + '", "lat": "' + latitude + '", "long": "' + longitude + '", "friendly_name": "' + device_name + '", "firmware_version": "' + firmware_version + '", "sensors": [{"sensor_name": "Refrigerator Temperature", "sensor_type": "Temperature", "sensor_update_frequency": "' + str(sensor_frequency) + '", "sensor_value": "' + str(sensor_value + random.uniform(0.1, 0.4)) + '", "sensor_units": "°c"}]}'
    client.publish(channel_name4, msgStr)
    global timer_post
    timer_post = Timer(sensor_frequency / 1000, post_message_loop)
    timer_post.start()

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


connect()
