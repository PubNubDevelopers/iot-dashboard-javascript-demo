/**
 * Configure the PubNub object.
 * Please specify your publish and subscribe keys here.
 * See Readme for details of the required key configuration
 */

const publish_key = '' //  ENTER YOUR PUBLISH KEY HERE
const subscribe_key = '' //  ENTER YOUR SUBSCRIBE KEY HERE

function createPubNubObject (presetUUID) {
  var UUID = presetUUID // Allows you to force a uuid
  if (!UUID) {
    let savedUUID = sessionStorage.getItem('uuid')
    if (!savedUUID) {
      UUID = makeid(20) // Make new UUID
    } else {
      UUID = savedUUID
    }
  }
  sessionStorage.setItem('uuid', UUID)

  var pubnub = new PubNub({
    publishKey: publish_key,
    subscribeKey: subscribe_key,
    uuid: UUID
  })
  return pubnub
}

function makeid (length) {
  var result = ''
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

function testPubNubKeys () {
  if (publish_key === '' || subscribe_key === '') return false
  else return true
}
