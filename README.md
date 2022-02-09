![logo](https://github.com/prohetamine/radio-station/blob/main/media/logo.png)

##### README is available in the following languages: [Russian](https://github.com/prohetamine/radio-station/blob/main/README/russian.md) | [English](https://github.com/prohetamine/radio-station/blob/main/README.md)


# Radio Station

> radio-station - an easy way to deploy your radio station and become a radio host online in javascript.

### Why ?
I decided that I wanted to be a radio host, but I had no particular desire to understand the existing software and I created my own software, maybe someday it will become a standard, I tried to achieve a better result.

### Get started

Install the npm module ```radio-station```

```sh
$ npm install radio-station
```

or

```sh
$ yarn add radio-station
```

or

```sh
$ npm install https://github.com/prohetamine/radio-station
```

### Examples and description

Connecting the module

```javascript
const RadioStation = require('radio-station')
```

I recommend looking at the examples of work right away before trying to use the module yourself. Examples of how to launch your radio station without a launcher and with a launcher can be found on my github repositories [node-web-radio](https://github.com/prohetamine/node-web-radio) and [launcher-web-radio](https://github.com/prohetamine/launcher-web-radio), also note that I supply options much simpler, in the form of docker, which are very easy to run and use [docker-node-web-radio](https://github.com/prohetamine/docker-node-web-radio) and [launcher-web-radio](https://github.com/prohetamine/docker-launcher-web-radio). You should use ```mp3``` files because they contain the metadata necessary for correct display pay attention to this.

#### <a name="radiostation">RadioStation</a>

The Object [RadioStation](#radiostation) has only one method to create which is a craft and returns objects: [track](#track), [stream](#stream) and functions: [addListener](#classic), [picture](#classic), [info](#classic), [onUse](#classic).

##### object

| key | value | default value | mandatory | information |
| ------ | ------ | ------ | ------ | ------ |
| patchWorkDir | text | ./station | no | working folder with the tracks and other system records |
| isLauncher | boolean | true | no | launcher activation |
| port | number | 9933 | no | the internal system port is also used to connect to the launcher |
| login | text | /* random */ | none | used for authorization in the launcher |
| password | text | /* random */ | none | used for authorization in the launcher |
| isAutoStart | boolean | false | none | responsible for automatic start |
| puppeteerLauncher | object | { headless: true, args: ['--no-sandbox'] } | no | puppeteer launcher object |
| debug | boolean | true | none | enables debugging mode |
| mainPort | number | false | no | outputs the main port to the console |


```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({
    pathWorkDir: `${__dirname}/tracks-data-folder`,
    isLauncher: true,
    port: 9933,
    login: 'localhost',
    password: 'hackme',
  })

  console.log(radio)

  /*
    {
      track: {
        load: [AsyncFunction: load],
        loads: [AsyncFunction: loads],
        unload: [AsyncFunction: unload],
        all: [Function: all],
        find: [Function: find],
        info: [AsyncFunction: info],
        picture: [AsyncFunction: picture],
        onLoad: [Function (anonymous)],
        onUnload: [Function (anonymous)]
      },
      stream: {
        start: [Function: start],
        pop: [Function: pop],
        push: [AsyncFunction: push],
        current: [Function: current],
        all: [Function: all],
        onStart: [Function (anonymous)],
        onPush: [Function (anonymous)],
        onPop: [Function (anonymous)],
        onUse: [Function (anonymous)]
      },
      addListener: [Function: addListener],
      picture: [AsyncFunction: picture],
      info: [AsyncFunction: info],
      onUse: [AsyncFunction: onUse],
    }
  */
})()
```

#### <a name="classic">classic</a>

Full working example [node-web-radio](https://github.com/prohetamine/node-web-radio)

```javascript
;(async () => {
  const radio = await RadioStation.create({ /* ... */ })

  await radio.track.loads(
    path.join(__dirname, '/tracks-for-load')
  )

  app.get('/radio', (req, res) => {
    radio.addListener(req, res)
  })

  io.on('connection', async socket => {
    radio.onUse(info => {
      socket.emit('onUse', info)
    })
  })

  app.get('/picture', async (req, res) => {
    radio.picture(req, res)
  })

  app.get('/info', async (req, res) => {
    radio.info(req, res)
  })
})()
```

#### <a name="track">track</a>

The object [track](#radiostation) works with the file system, has functions [load](#load), [loads](#loads), [onLoad](#onload), [unload](#unload), [onUnload](#onunload), [all](#tracksall), [find](#find), [info](#info), [picture](#picture).

#### <a name="load">load</a>

The function [track.load](#track) loads a track into the radio station's file system, accepts the file path with the extension ```.mp3```, is a promise and returns the ```id``` of the loaded track or ```null``` as an error, also has a handler for the [track.onLoad](#onload) loading event.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  const loadId = await radio.track.load('/path.mp3')

  console.log(loadId) // de40e284351ed735b5c4a8cb73cc036a
})()
```

#### <a name="loads">loads</a>

The function [track.loads](#track) loads all tracks from a folder into the radio station's file system, accepts the path to a folder with files with the extensions ```.mp3```, is a promise and returns an array of elements of the ```id``` of the downloaded track or ```null``` as an error, also has a handler for the download event [track.onLoad](#onload).

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  const loadsId = await radio.track.loads('/folder')

  console.log(loadsId)

  /*
    [
      "de40e284351ed735b5c4a8cb73cc036a",
      null,
      "1de781bc71488694434557166e3f8c51"
    ]
  */
})()
```

#### <a name="onload">onLoad</a>

The function [track.onLoad](#track) processes any download of a track to the file system, even taking into account the download via the launcher, takes a callback as the first parameter, passes the ```id``` of the downloaded track or ```null``` to the callback as an error.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  radio.track.onLoad(id => {
    const name = radio.track.find(id).name
    console.log(name, id) // track name and id
  })

  radio.track.load('/path.mp3')
})()
```

#### <a name="unload">unload</a>

The function [track.unload](#track) deletes a track from the file system, accepts the ```id``` parameter of the track being deleted, always returns the ```id``` of the deleted track or "null" as an error, also has a handler for the loading event [track.onUnload](#onunload).

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  const loadId = await radio.track.load('/path.mp3')

  console.log(loadId) // de40e284351ed735b5c4a8cb73cc036a

  const unloadId = await radio.track.unload(loadId)

  console.log(unloadId) // de40e284351ed735b5c4a8cb73cc036a
})()
```

#### <a name="onunload">onUnload</a>

The function [track.onUnload](#track) handles any deletion of a track from the file system, even taking into account the download via the launcher, takes a callback as the first parameter, passes the ```id``` of the deleted track or ```null``` to the callback as an error.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  radio.track.onUnload(id => {
    console.log(id) // id track de40e284351ed735b5c4a8cb73cc036a
  })

  const loadId = await radio.track.load('/path.mp3')

  console.log(loadId) // de40e284351ed735b5c4a8cb73cc036a

  radio.track.unload(loadId)
})()
```

#### <a name="tracksall">all</a>

The function [track.all](#track) returns information about all tracks in the file system as an array with objects.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  const tracks = radio.track.all()
  console.log(tracks)

  /*
    [
      {
        id: 'de40e284351ed735b5c4a8cb73cc036a',
        path: '/track3.mp3',
        parentPath: '/track3.mp3',
        name: 'track3.mp3'
      },
      {
        id: '1de781bc71488694434557166e3f8c51',
        path: '/track1.mp3',
        parentPath: '/track1.mp3',
        name: 'track1.mp3'
      },
      {
        id: '629cf251fad1890d8ffea3c6f5b19cf5',
        path: '/track2.mp3',
        parentPath: '/track2.mp3',
        name: 'track2.mp3'
      }
    ]
  */
})()
```

#### <a name="find">find</a>

The function [track.find](#track) returns the system information of the track in the file system, in the form of an object or ```null```.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  const loadId = await radio.track.load('/path.mp3')

  const systemInfo = radio.track.find(loadId)

  console.log(systemInfo)

  /*
    {
      id: '629cf251fad1890d8ffea3c6f5b19cf5',
      path: '/path.mp3',
      parentPath: '/path.mp3',
      name: 'path.mp3'
    }
  */
})()
```

#### <a name="info">info</a>

Function [track.info](#track) returns complete information about the file, takes the parameter ```id```, returns an object or ```null```.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  const loadId = await radio.track.load('/path.mp3')

  const fullInfo = await radio.track.info(loadId)

  console.log(fullInfo)

  /*
    {
      id: 'de40e284351ed735b5c4a8cb73cc036a',
      path: 'track.mp3',
      parentPath: 'track.mp3',
      name: 'track.mp3',
      format: {
        tagTypes: ['ID3v2.4'],
        trackInfo: [],
        lossless: false,
        container: 'MPEG',
        codec: 'MPEG 1 Layer 3',
        sampleRate: 48000,
        numberOfChannels: 2,
        bitrate: 128000,
        codecProfile: 'CBR',
        duration: 195.624
      },
      common: {
        track: { no: 2, of: null },
        disk: { no: null, of: null },
        movementIndex: {},
        title: '...',
        artists: [ '...' ],
        artist: '...',
        album: '...',
        encodersettings: 'Lavf58.76.100'
      },
      isAlbumImage: true
    }
  */
})()
```

#### <a name="picture">picture</a>

The function [track.picture](#track) takes the parameter ```id```, returns an object or ```null```.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  const loadId = await radio.track.load('/path.mp3')

  const picture = await radio.track.picture(loadId)

  console.log(picture)

  /*
    {
      contentType: 'image/png',
      contentLength: 121291,
      buffer: <Buffer 89 50 00 ... 121241 more bytes>
    }
  */
})()
```

#### <a name="stream">stream</a>

Object [stream](#radiostation) works with ether, has functions [start](#start), [onStart](#onstart), [push](#push), [onPush](#onpush), [pop](#pop), [onPop](#onpop), [all](#streamall), [current](#current), [onUse](#onuse).

#### <a name="start">start</a>

The function [stream.start](#stream) starts the stream if in [RadioStation](#radiostation) ```isAutoStart``` has the value ```false```, returns ```true``` or ```false``` as an error, also has a load event handler [stream.onStart](#onstart) which is triggered regardless of the function call [stream.start](#stream).

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  const isStart = radio.stream.start()
  await new Promise(radio.stream.onStart)
  console.log(isStart) // true
})()
```

#### <a name="onstart">onStart</a>

The function [stream.onStart](#stream) handles the start of the broadcast, accepts the callback parameter.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  radio.track.onStart(() => {
    console.log('start stream!')
  })
})()
```

#### <a name="push">push</a>

The function [stream.push](#push) forms a queue of tracks by adding a track to the end of the queue, accepts ```id```, returns ```streamId``` of the uploaded track or ```null``` as an error, also has an event handler [stream.onPush](#onpush).

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  const loadId = await radio.track.load('path.mp3')
  const streamId = await radio.stream.push(loadId)

  console.log(streamId) // 36ed07fd2438271197e37420b582c6f575608bcb1580ff21675311e1913a035e
})()
```

#### <a name="onpush">onPush</a>

The function [stream.onPush](#stream) processes any addition of a track to the queue, even taking into account the addition via the launcher, takes a callback as the first parameter, passes the ```streamId``` of the uploaded track or ```null``` to the callback as an error.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  radio.track.onPush(streamId => {
    console.log(streamId)
  })

  const loadId = await radio.track.load('path.mp3')
  const streamId = await radio.stream.push(loadId)

  radio.stream.push(streamId)
})()
```

#### <a name="pop">pop</a>

The function [stream.pop](#pop) deletes a track from the queue, accepts ```streamId```, returns ```streamId``` of the deleted track or ```null``` as an error, also has an event handler [stream.onPop](#onpop).

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  const loadId = await radio.track.load('path.mp3')

  const streamId = await radio.stream.push(loadId)
  const popStreamId = await radio.stream.pop(streamId)

  console.log(popStreamId) // 36ed07fd2438271197e37420b582c6f575608bcb1580ff21675311e1913a035e
})()
```

#### <a name="onpop">onPop</a>

The function [stream.onPop](#stream) handles any deletion of a track from the queue, even taking into account deletion via the launcher, accepts callback as the first parameter, passes ```streamId``` of the uploaded track or ```null``` to callback as an error.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  radio.track.onPop(streamId => {
    console.log(streamId) // 36ed07fd2438271197e37420b582c6f575608bcb1580ff21675311e1913a035e
  })

  const loadId = await radio.track.load('path.mp3')
  const streamId = await radio.stream.push(loadId)
  radio.stream.pop(streamId)
})()
```

#### <a name="streamall">all</a>

The function [stream.all](#stream) returns information about all tracks in the queue as an array with objects. It has three types of tracks. ```random```, ```queue```, ```error```.

| type | type information |
| ------ | ------ |
| random | the track is selected randomly, the dynamic type of track appears when there is no queue |
| queue | track in the queue |
| error | track deleted or damaged |

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  const tracks = radio.stream.all()
  console.log(tracks)

  /*
    [
      {
        id: '1de781bc71488694434557166e3f8c51',
        path: 'track1.mp3',
        parentPath: 'track1.mp3',
        name: 'track1.mp3',
        type: 'random'
      },
      {
        id: '1de781bc71488694434557166e3f8c51',
        path: 'track2.mp3',
        parentPath: 'track2.mp3',
        name: 'track2.mp3',
        streamId: 'f365c82f7bbe33cf52e60be959f4741adf08d63db0df8e080ef8585d56ce0b29',
        type: 'queue'
      },
      {
        id: '1de781bc71488694434557166e3f8c51',
        path: 'track2.mp3',
        parentPath: 'track2.mp3',
        name: 'track2.mp3',
        streamId: 'f365c82f7bbe33cf52e60be959f4741adf08d63db0df8e080ef8585d56ce0b29',
        type: 'error'
      }
    ]
  */
})()
```

#### <a name="current">current</a>

The function [current](#current) returns information about the current track on the air in the form of an object or ```null``` as an error, can be considered an event handler [stream.onUse](#onuse).

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  const track = radio.track.current()

  console.log(track)

  /*
    {
      id: '1de781bc71488694434557166e3f8c51',
      path: '/track1.mp3',
      parentPath: '/track1.mp3',
      name: 'track1.mp3',
      type: 'random'
    }
  */
})()
```

#### <a name="onuse">onUse</a>

The function [stream.onUse](#stream) processes the update of the current track, accepts the callback with the first parameter, passes the position in the queue to the callback with the first parameter, and the track information with the second.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  radio.stream.onUse((index, track) => {
    console.log(index, track)
    /*
    0 {
      id: '1de781bc71488694434557166e3f8c51',
      path: '/track1.mp3',
      parentPath: '/track1.mp3',
      name: 'track1.mp3',
      type: 'random'
    }
    */
  })
})()
```

### Contacts

My Telegram: [@prohetamine](https://t.me/prohetamine), [channel](https://t.me/prohetamines)

Email: prohetamine@gmail.com

Donat money: [patreon](https://www.patreon.com/prohetamine)

If you have any questions and/or suggestions, please email me in telegram, if you find any bugs also let me know, I will be very grateful.
