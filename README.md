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

```sh
const RadioStation = require('radio-station')
```

I recommend looking at the examples of work right away before trying to use the module yourself. Examples of how to launch your radio station without a launcher and with a launcher can be found on my github repositories [node-web-radio](https://github.com/prohetamine/node-web-radio) and [launcher-web-radio](https://github.com/prohetamine/launcher-web-radio), also note that I supply options much simpler, in the form of docker, which are very easy to run and use [docker-node-web-radio](https://github.com/prohetamine/docker-node-web-radio) and [launcher-web-radio](https://github.com/prohetamine/docker-launcher-web-radio).

#### <a name="radiostation">RadioStation</a>

Объект [RadioStation](#radiostation) имеет только один метод create который является промисом и возвращает объекты: [track](#track), [stream](#stream) и функции: [addListener](#addlistener), [picture](#picture), [info](#info), [onUse](#onuse).

##### object

| ключ | значение | значение по-умолчанию | обязательный | информация |
| ------ | ------ | ------ | ------ | ------ |
| pathWorkDir | text | ./station | нет | рабочая папка с треками и другими системными записями |
| isLauncher | boolean | true | нет | активация лаунчера |
| port | number | 9933 | нет | внутренний системный порт используется также для подключения к лаунчеру |
| login | text | /* random */ | нет | используется для авторизации в лаунчере |
| password | text | /* random */ | нет | используется для авторизации в лаунчере |
| isAutoStart | boolean | false | нет | отвечает за автоматический старт |
| puppeteerLauncher | object | { headless: true, args: ['--no-sandbox'] } | нет | объект лаунчера puppeteer |
| debug | boolean | true | нет | включает режим отладки |
| mainPort | number | false | нет | выводит основной порт в консоль |

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

#### <a name="stream">stream</a>

Объект [stream](#stream) работает с эфиром, имеет функции [start](#start), [onStart](#onstart), [push](#push), [onPush](#onpush), [pop](#pop), [onPop](#onpop), [all](#streamall), [current](#current), [onUse](#onuse).

#### <a name="start">start</a>

Функция [stream.start](#stream) запускает стрим если в [RadioStation](#radiostation) ```isAutoStart``` имеет значение ```false```, возвращает ```true``` или ```false``` как ошибку, также имеет обработчик события загрузки [stream.onStart](#onstart) который срабатывает независимо от вызова функции [stream.start](#stream).

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

Функция [stream.onStart](#stream) обрабатывает запуск трансляции, принимает параметром callback.

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

Функция [stream.push](#push) формирует очередь из треков добавляя трек в конец очереди, принимает ```id```, возвращает ```streamId``` загруженного трека или ```null``` как ошибку, также имеет обработчик события [stream.onPush](#onpush).

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

Функция [stream.onPush](#stream) обрабатывает любое добавление трека в очередь, даже с учетом добавления через лаунчер, первым параметром принимает callback, в callback передает ```streamId``` загруженного трека или ```null``` как ошибку.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  radio.track.onPush(streamId => {
    console.log(streamId)
  })

  const loadId = await radio.track.load('path.mp3')
  const streamId = await radio.track.push(loadId)

  radio.stream.push(streamId)
})()
```

#### <a name="pop">pop</a>

Функция [stream.pop](#pop) удаляет трек из очереди, принимает ```streamId```, возвращает ```streamId``` удаленного трека или ```null``` как ошибку, также имеет обработчик события [stream.onPop](#onpop).

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

Функция [stream.onPop](#stream) обрабатывает любое удаление трека из очереди, даже с учетом удаления через лаунчер, первым параметром принимает callback, в callback передает ```streamId``` загруженного трека или ```null``` как ошибку.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  radio.track.onPop(streamId => {
    console.log(streamId)
  })

  const loadId = await radio.track.load('path.mp3')
  const streamId = await radio.track.push(loadId)
  radio.stream.pop(streamId)
})()
```

#### <a name="track">track</a>

Объект [track](#track) работает с файловой системой, имеет функции [load](#load), [loads](#loads), [onLoad](#onload), [unload](#unload), [onUnload](#onunload), [all](#tracksall), [find](#find), [info](#info), [picture](#picture).

#### <a name="load">load</a>

Функция [track.load](#track) загружает трек в файловую систему радио станции, принимает путь файла с расширением ```.mp3```, является промисом и возвращает ```id``` загруженного трека или ```null``` как ошибку, также имеет обработчик события загрузки [track.onLoad](#onload).

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  const loadId = await radio.track.load('/path.mp3')

  console.log(loadId) // de40e284351ed735b5c4a8cb73cc036a
})()
```

#### <a name="loads">loads</a>

Функция [track.loads](#track) загружает все треки из папки в файловую систему радио станции, принимает путь к папке с файлами с расширениями ```.mp3```, является промисом и возвращает массив элементов ```id``` загруженного трека или ```null``` как ошибку, также имеет обработчик события загрузки [track.onLoad](#onload).

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

Функция [track.onLoad](#track) обрабатывает любую загрузку трека в файловую систему, даже с учетом загрузки через лаунчер, первым параметром принимает callback, в callback передает ```id``` загруженного трека или ```null``` как ошибку.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  radio.track.onLoad(id => {
    const name = radio.track.find(id).name
    console.log(name, id) // название трека и id
  })

  radio.track.load('/path.mp3')
})()
```

#### <a name="unload">unload</a>

Функция [track.unload](#track) удаляет трек из файловой системы, принимает параметром ```id``` удаляемого трека, всегда возвращает ```id``` удаленного трека или ```null``` как ошибку, также имеет обработчик события загрузки [track.onUnload](#onunload).

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

Функция [track.onUnload](#track) обрабатывает любое удаление трека из файловой системы, даже с учетом загрузки через лаунчер, первым параметром принимает callback, в callback передает ```id``` удаленного трека или ```null``` как ошибку.

```javascript
const { create } = require('radio-station')

;(async () => {
  const radio = await create({ /* ... */ })

  radio.track.onUnload(id => {
    console.log(id) // id трека de40e284351ed735b5c4a8cb73cc036a
  })

  const loadId = await radio.track.load('/path.mp3')

  console.log(loadId) // de40e284351ed735b5c4a8cb73cc036a

  radio.track.unload(loadId)
})()
```

#### <a name="tracksall">all</a>

Функция [track.all](#track) возвращает информацию о всех треках в файловой системе в виде массива с объектами.

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

Функция [track.find](#track) возвращает системную информацию треке в файловой системе, в виде объекта или ```null```.

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

Функция [track.info](#track) возвращает полную информацию о файле, принимает параметром ```id```, возвращает объект или ```null```.

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

Функция [track.picture](#track) принимает параметром ```id```, возвращает объект или ```null```.

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

### Contacts

My Telegram: [@prohetamine](https://t.me/prohetamine), [channel](https://t.me/prohetamines)

Email: prohetamine@gmail.com

Donat money: [patreon](https://www.patreon.com/prohetamine)

If you have any questions and/or suggestions, please email me in telegram, if you find any bugs also let me know, I will be very grateful.
