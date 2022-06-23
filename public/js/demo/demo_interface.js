/**
 * Interface between the app client code and the NodeJS endpoint that will send the message to the interactive demo
 */

 function actionCompleted (args) {
  //args: {
  //    action:string,
  //    blockDuplicateCalls:boolean,
  //    debug:boolean
  //}) {

  const url =
    window.location.origin +
    `/interactivedemo/${encodeURIComponent(
      JSON.stringify({
        action: args.action,
        debug: args.debug,
        windowLocation: window.location.href
      })
    )}`
  fetch(url, {})
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status + ' ' + response.statusText)
      }
      return response
    })
    .then(data => {
      //  Successfully set demo action with demo server
      if (args.debug)
        console.log('Interactive Demo Integration success', url, data)
    })
    .catch(e => {
      console.log('Interactive Demo Integration: ', e)
    })
  return
}
