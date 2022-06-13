const publish_key = 'pub-c-76bc5dff-cd00-4c1a-9360-f750e213331b';     //  ENTER YOUR PUBLISH KEY HERE
const subscribe_key = 'sub-c-8f498a3e-8ef4-4373-913a-95aeb73fd21d';   //  ENTER YOUR SUBSCRIBE KEY HERE

function createPubNubObject(presetUUID)
{
    var UUID = presetUUID; // Allows you to force a uuid
    if (!UUID) {
        let savedUUID = sessionStorage.getItem('uuid');
        if (!savedUUID) {
            UUID = makeid(20); // Make new UUID
        } else {
            UUID = savedUUID;
        }
    }
    sessionStorage.setItem('uuid', UUID);

    var pubnub = new PubNub({
        publishKey:   publish_key,
        subscribeKey: subscribe_key, 
        uuid: UUID
      });
    return pubnub;
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
}
return result;
}

function testPubNubKeys()
{
    if (publish_key === '' || subscribe_key === '')
        return false;
    else
        return true;
}

