/**
 * Code copy / pasted from https://github.com/darryncampbell-pubnub/pubnub-demo-integration
 */
 function actionCompleted (args) {
  const pub = 'pub-c-c8d024f7-d239-47c3-9a7b-002f346c1849';
  const sub = 'sub-c-95fe09e0-64bb-4087-ab39-7b14659aab47';
  let identifier = "";
  let action = args.action;
  let blockDuplicateCalls = args.blockDuplicateCalls;
  let debug = args.debug;
  let windowLocation = args.windowLocation;

  if (typeof action === 'undefined')
  {
      console.log('Interactive Demo Integration Error: No action provided');        
      return;
  }

  if (typeof blockDuplicateCalls === 'undefined')
  {
      blockDuplicateCalls = true;
  }

  if (typeof debug === 'undefined')
  {
      debug = false;
  }

  //  If invoked from client-side, you can omit the window location
  if (typeof windowLocation === 'undefined')
      windowLocation = window.location.href;

  var fetchClient = null;
  if (typeof fetch === 'undefined')
      fetchClient = args.fetchClient;
  else
      fetchClient = fetch;

  let queryString = new URL(windowLocation).search.substring(1);
  const urlParamsArray = queryString.split('&');
  for (let i = 0; i < urlParamsArray.length; i++) {
      if (urlParamsArray[i].startsWith('identifier') && urlParamsArray[i].includes('=')) {
          let identifierPair = urlParamsArray[i].split('=');
          identifier = identifierPair[1];
      }
  }
  if (identifier === "") {
      if (debug)
      {
          console.log('Interactive Demo Integration Error: Failed to detect identifier in URL query string');
      }
      return;
  }
  if (blockDuplicateCalls) {
      //  This option only works if the sessionStorage object is defined (client-side only)
      if (!(typeof sessionStorage === 'undefined')) {
          //  Read the id from session storage and only send the message if the message was not previous sent
          let sessionStorageKey = "Demo_" + identifier + action;
          let storedId = sessionStorage.getItem(sessionStorageKey);
          if (storedId == null) {
              if (debug)
                  console.log('Setting session key to avoid duplicate future messages being sent. Action: ' + action + '. Identifier: ' + identifier);
                  sessionStorage.setItem(sessionStorageKey, "set");
          }
          else {
              //  This is a duplicate message, do not send it
              if (debug)
                  console.log('Message blocked as it is a duplicate. Action: ' + action + '. Identifier: ' + identifier);
              return;
          }
      }
  }

  if (debug)
  {
      console.log('Sending message. Action: ' + action + '. Identifier: ' + identifier);
  }
  
  const url = `https://ps.pndsn.com/publish/${pub}/${sub}/0/demo/myCallback/${encodeURIComponent(JSON.stringify({ id: identifier, feature: action }))}?store=0&uuid=${identifier}`;
  fetchClient(url)
      .then(response => {
      if (!response.ok) {
          throw new Error(response.status + ' ' + response.statusText);
      }
      return response;
  })
      .then(data => {
      //  Successfully set demo action with demo server
      //console.log("Guided Demo Integration success", url, data)
  })
      .catch(e => {
      console.log('Interactive Demo Integration: ', e);
  });
  return;
}
