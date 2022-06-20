/**
 * Types associated with the device simulators.
 */

const SensorType = {
  FreezerTemperature: 'Freezer Temperature',
  RefrigeratorTemperature: 'Refrigerator Temperature',
  RadiationMonitor: 'Radiation Monitor',
  Anemometer: 'Wind Speed',
  Air_Pollution: 'Air Pollution'
}

//  Routes are stored in separate js files and loaded only by the web worker simulating that route.  The easiest way I could find to generate routes was to use https://www.gpsvisualizer.com/convert_input
const Routes = {
  None: {
    description: 'None (Device is Stationary)',
    fileName: '',
    startLat: 0.0,
    startLong: 0.0
  },
  I5NS: {
    description: 'USA: San Francisco to Los Angeles',
    fileName: './routes/route_sanfran_la.js',
    startLat: 37.77104,
    startLong: -122.41808
  },
  I5SN: {
    description: 'USA: Los Angeles to San Francisco',
    fileName: './routes/route_la_sanfran.js',
    startLat: 34.05462,
    startLong: -118.23982
  },
  USA2: {
    description: 'USA: Dallas Tx to Kansas Mo',
    fileName: './routes/route_dallas_kansas.js',
    startLat: 32.77317,
    startLong: -96.79828
  },
  UK: {
    description: 'UK: London to Edinburgh',
    fileName: './routes/route_london_edinburgh.js',
    startLat: 51.50767,
    startLong: -013102
  },
  Aus: {
    description: 'Australia: Melbourne to Adelaide',
    fileName: './routes/route_melbourne_adelaide.js',
    startLat: -37.81624,
    startLong: 144.96417
  },
  Eur1: {
    description: 'Europe: Munich to Rome',
    fileName: './routes/route_munich_rome.js',
    startLat: 48.13447,
    startLong: 11.58231
  },
  Eur2: {
    description: 'Europe: Paris to Brussels',
    fileName: './routes/route_paris_brussels.js',
    startLat: 48.85556,
    startLong: 2.3523
  },
  Eur3: {
    description: 'Europe: Warsaw to Prague',
    fileName: './routes/route_warsaw_prague.js',
    startLat: 52.23011,
    startLong: 21.01161
  }
}
