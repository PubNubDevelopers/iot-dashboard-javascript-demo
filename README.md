# IoT Dashboard Demo written in JavaScript
> Application to show how PubNub can be used for IoT use cases, displaying and controlling worldwide IoT assets in real time

PubNub can help you manage your distributed portfolio of IoT devices, either built into an existing product you produce or by integrating with 3rd party sensors.  Using PubNub you can communicate bidirectionally with global assets in real time with minimum latency.

This IoT dashboard shows how an IoT solution managed by PubNub might look - remote devices will periodically report their status and sensor readings.  You can view device location as well as their online / offline state.

> This application is designed to show how an IoT solution with PubNub might look and is deliberately a **canned demo**.  For information on how to take this concept to production, please see the next steps section at the end of this ReadMe.  

![Screenshot](https://raw.githubusercontent.com/PubNubDevelopers/iot-dashboard-javascript-demo/main/media/screenshot_square.png)

## Demo

A hosted version of this demo can be found at https://www.pubnub.com/demos/iot-dashboard/

## Features

* Communicates over the PubNub network - devices send sensor data and location which is displayed on the dashboard
* Administrative tasks such as firmware update and remote device reboot can be performed from the dashboard 
* Uses JavaScript WebWorkers to simulate real hardware.
* Experience the real time, scalable performance delivered by PubNub

## Installing / Getting started

This dashboard uses Node, npm and express to show how a PubNub IoT dashboard might look.  For ease of use, devices are simulated but please see [PubNub.com](https://www.pubnub.com/) for previous blogs on integrating real IoT hardware such as Arduino and Raspberry Pi.

To run this project yourself you need a free PubNub account. The map uses [Leaflet](https://leafletjs.com/) with [OpenStreetMap](https://www.openstreetmap.org/) tiles, so it needs no API key.

Tested with the PubNub JavaScript SDK 13.1.2 and Node.js 22 (October 2026).

### Requirements
- [Node.js](https://nodejs.org/en/)
- [PubNub Account](#pubnub-account) (*Free*)

<a href="https://admin.pubnub.com/signup">
	<img alt="PubNub Signup" src="https://i.imgur.com/og5DDjf.png" width=260 height=97/>
</a>


### Get Your PubNub Keys

1. Sign in to the [Admin Portal](https://admin.pubnub.com/) or [create a free account](https://admin.pubnub.com/signup).
1. Go to **Apps & Keysets**, click **Create app** and give it a name.
1. Open the app and click **Create keyset**. Enter a name, keep the environment on **Testing** and click **Next**.
1. Presence and File Sharing are already on. Under **Presence**, choose **All channels**, then click **Create**. With the default, **Selected channels only**, the dashboard never sees devices go online or offline until you add a Presence rule for the `device.*` channels.
1. Copy the **Publish key** and the **Subscribe key**.

You can also create the keyset from your AI coding tool with the [PubNub MCP Server](https://www.pubnub.com/docs/ai-development/set-up-mcp-server).

### Building and Running

1. Clone the repository:

	```bash
	git clone https://github.com/PubNubDevelopers/iot-dashboard-javascript-demo.git
	cd iot-dashboard-javascript-demo
	```

1. Open `public/js/keys.js` and replace `YOUR_PUBLISH_KEY` and `YOUR_SUBSCRIBE_KEY` with your keys.

1. Install the dependencies and start the server:

	```bash
	npm install
	npm start
	```

1. Open http://localhost:8001 in your browser. The page needs this server, not `file://`, because the simulated devices run as web workers.

## Contributing
Please fork the repository if you'd like to contribute. Pull requests are always welcome. 

## Links


## Further Information

Checkout the following lins for more information on developing IoT solutions with PubNub:

- IoT use cases with PubNub: https://www.pubnub.com/solutions/iot-device-control/
- IoT customers and case studies: https://www.pubnub.com/solutions/iot-device-control/

## Architectural Notes, Next Steps and Future Work

**Map tiles**

The map uses OpenStreetMap's tile servers, which are fine for a demo with a few users. They aren't meant for heavy use ([tile usage policy](https://operations.osmfoundation.org/policies/tiles/)), so in production use a tile provider.

**A Note about Signals**

PubNub offers the `signal()` method as an alternative to `publish()` for short lived, ephemeral data which goes out of date quickly.  The same delivery guarantees do not exist for signals but signal pricing can be lower than publish.  The primary limitation of signals, besides not being able to be stored in history or trigger push messages, is that they are limited to **64bytes**.  This demo opts to use a more descriptive message payload and therefore uses `publish()` but if you want to limit your updates to 64bytes, e.g. just passing a lat/long, then you could potentially save costs on your overall solution by using `signal()`.

**Provisioning**

This demo has been built to be expanded in the future to handle real IoT devices.  You may see strange workflows in the code, for example, assigning the simulator an ID and then asking that same simulator for the ID it was just assigned.  The intention is to show that these two pieces of information would usually come from a provisioning server in production and hence the workflow is separated.


**Message Persistence:**

- For ease of use, this demo lacks any kind of serverside message persistence.  In production you would store the attributes of each device on PubNub with **[DataSync](https://www.pubnub.com/docs/data-storage/structured-data/overview)** (which needs [Access Manager](https://www.pubnub.com/docs/security/access-control/overview)) or in your own database.  This is analogous to a 'device shadow' in AWS or 'twin device' in Azure.
- Because entities are only stored locally, if you refresh the page you will lose any created simulators.  **This is a limitation of the demo, not a limitation of PubNub**.
- You will also see this if you open multiple instances of this application in different browser tabs.  Any device (simulator) you create will only have its messages subscribed to by the tab in which you created the device.

**MQTT:**

- Most IoT solutions will use [MQTT](https://www.pubnub.com/guides/mqtt/) to exchange messages between devices and a server.  The simulated devices spawned by this application only support the [PubNub JavaScript SDK](https://www.pubnub.com/docs/sdks/javascript) - **This is a limitation of the demo, not a limitation of PubNub**.  MQTT integration is best done using real devices.
- **Real Devices:** Although this dashboard has been designed to integrate with real devices, the step-by-step tutorial to do this is left for a future exercise.

**Reacting to readings**

- A [PubNub Function](https://www.pubnub.com/docs/message-processing/serverless/overview) can check every reading as it's published, for example to alert the person watching the dashboard when a freezer gets too warm.
- This demo does not include a Function; this is left for a future exercise.
