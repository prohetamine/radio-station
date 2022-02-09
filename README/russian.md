![logo](https://github.com/prohetamine/radio-station/blob/main/media/logo.png)

##### README доступен на языках: [Русский](https://github.com/prohetamine/radio-station/blob/main/README/russian.md) | [Английский](https://github.com/prohetamine/radio-station/blob/main/README.md)


# Radio Station

> radio-station - простой способ развернуть свою радиостанцию и стать радиоведущим онлайн на javascript.

### Почему ?
Я решил, что хочу быть радиоведущим, но у меня не было особого желания разбираться в существующем программном обеспечении, и я создал свое собственное программное обеспечение, может быть, когда-нибудь оно станет стандартом, я старался добиться лучшего результата.

### С чего начать

Установим npm модуль ```radio-station```

```sh
$ npm install radio-station
```

или

```sh
$ yarn add radio-station
```

или

```sh
$ npm install https://github.com/prohetamine/radio-station
```

### Примеры и описание

Подключение модуля

```javascript
const RadioStation = require('radio-station')
```

Я рекомендую сразу ознакомиться с примерами работы, прежде чем пытаться использовать модуль самостоятельно. Примеры того, как запустить вашу радиостанцию без лаунчера и с лаунчером, можно найти в моих репозиториях github [node-web-radio](https://github.com/prohetamine/node-web-radio) и [launcher-web-radio](https://github.com/prohetamine/launcher-web-radio), также обратите внимание, что я предоставляю гораздо более простые варианты в виде docker, которые очень просты в запуске и использовании [docker-node-web-radio](https://github.com/prohetamine/docker-node-web-radio) и [launcher-web-radio](https://github.com/prohetamine/docker-launcher-web-radio). Вы должны использовать ```mp3``` файлы потому что они содержат мета данные необходимые для корректного отображения обратите на это внимание.

#### <a name="radiostation">RadioStation</a>

Объект [RadioStation](#radiostation) имеет только один метод create который является промисом и возвращает объекты: [track](#track), [stream](#stream) и функции: [addListener](#classic), [picture](#classic), [info](#classic), [onUse](#classic).

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

#### <a name="classic">classic</a>

Полный рабочий пример [node-web-radio](https://github.com/prohetamine/node-web-radio)

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

Объект [track](#radiostation) работает с файловой системой, имеет функции [load](#load), [loads](#loads), [onLoad](#onload), [unload](#unload), [onUnload](#onunload), [all](#tracksall), [find](#find), [info](#info), [picture](#picture).

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

#### <a name="stream">stream</a>

Объект [stream](#radiostation) работает с эфиром, имеет функции [start](#start), [onStart](#onstart), [push](#push), [onPush](#onpush), [pop](#pop), [onPop](#onpop), [all](#streamall), [current](#current), [onUse](#onuse).

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
  const streamId = await radio.stream.push(loadId)

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
    console.log(streamId) // 36ed07fd2438271197e37420b582c6f575608bcb1580ff21675311e1913a035e
  })

  const loadId = await radio.track.load('path.mp3')
  const streamId = await radio.stream.push(loadId)
  radio.stream.pop(streamId)
})()
```

#### <a name="streamall">all</a>

Функция [stream.all](#stream) возвращает информацию о всех треках в очереди виде массива с объектами. Имеет три типа треков. ```random```, ```queue```, ```error```.

| тип | информация о типе |
| ------ | ------ |
| random | трек подбирается случайно, динамический тип трека, появляется в момент отсутствия очереди |
| queue | трек находящийся в очереди |
| error | трек удален или поврежден |

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

Функция [current](#current) возвращает информацию о текущем треке в эфире в виде объекта или ```null``` как ошибка, можно считать обработчиком события [stream.onUse](#onuse).

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

Функция [stream.onUse](#stream) обрабатывает обновление текущего трека, первым параметром принимает callback, в callback передает первым параметром позицию в очереди, вторым информацию о треке.

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

### Контакты

Мой Телеграм: [@prohetamine](https://t.me/prohetamine), [канал](https://t.me/prohetamines)

Почта: prohetamine@gmail.com

Донат денег: [patreon](https://www.patreon.com/prohetamine)

Если у вас есть какие-либо вопросы и/или предложения, пожалуйста, напишите мне в телеграмме, если вы найдете ошибки также дайте мне знать, я буду очень благодарен.
