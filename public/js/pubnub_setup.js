/**
 * Configure the PubNub object.
 * Please specify your publish and subscribe keys here.
 * See Readme for details of the required key configuration
 */

  //  See Keys.js for the PubNub Publish and Subscribe keys

  function createPubNubObject (presetUUID) {
   var UUID = presetUUID // Allows you to force a uuid
   let savedUUID = null
   if (!UUID) {
    try {
      savedUUID = sessionStorage.getItem('uuid')
    }
    catch (err) {console.log("Session storage is unavailable");} //  Session storage not available
     if (!savedUUID) {
       UUID = makeid(20) // Make new UUID
     } else {
       UUID = savedUUID
     }
   }
   try {
    sessionStorage.setItem('uuid', UUID)
  }
  catch (err) {}//  Session storage is not availalbe

   var pubnub = new PubNub({
     publishKey: publish_key,
     subscribeKey: subscribe_key,
     uuid: UUID
   })
   pubnub.setFilterExpression("uuid != '" + pubnub.getUUID() +"'");
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
 