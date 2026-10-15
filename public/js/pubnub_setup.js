/**
 * Creates the PubNub client the dashboard uses. Your keys are in keys.js.
 */

function createPubNubObject () {
  //  Keep the same User ID while the tab is open, so a reload doesn't look like a new dashboard.
  let userId = null
  try {
    userId = sessionStorage.getItem('userId')
  } catch (err) {} //  Session storage isn't always available.
  if (!userId) userId = makeid(20)
  try {
    sessionStorage.setItem('userId', userId)
  } catch (err) {}

  const pubnub = new PubNub({
    publishKey: publish_key,
    subscribeKey: subscribe_key,
    userId: userId
  })
  //  The dashboard sends commands (e.g. 'reboot') on the device channels it listens to.
  //  sendCommand() marks them with meta.sender, and this filter tells PubNub not to send them back to the dashboard.
  pubnub.setFilterExpression("meta.sender != 'dashboard'")
  return pubnub
}

//  Send a command to one device, on that device's channel.
function sendCommand (deviceId, message) {
  return pubnub.publish({
    channel: iotDevices[deviceId].channelName,
    message: message,
    meta: { sender: 'dashboard' }
  })
}

function makeid (length) {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

function testPubNubKeys () {
  return ![publish_key, subscribe_key].some(key => key === '' || key.startsWith('YOUR_'))
}
