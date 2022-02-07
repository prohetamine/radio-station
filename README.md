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

I recommend looking at the examples of work right away before trying to use the module yourself. Examples of how to launch your radio station without a launcher and with a launcher can be found on my github repositories [node-web-radio](https://github.com/prohetamine/node-web-radio) and [launcher-web-radio](https://github.com/prohetamine/launcher-web-radio), also note that I supply options much simpler, in the form of docker, which are very easy to run and use [docker-node-web-radio](https://github.com/prohetamine/docker-node-web-radio) and [launcher-web-radio](https://github.com/prohetamine/docker-launcher-web-radio)

#### <a name="radiostation">RadioStation</a>

Объект [RadioStation](#radiostation) имеет только один метод create который является промисом и возвращает объекты: [track](#track), [stream](#stream) и функции: [addListener](#addlistener), [picture](#picture), [info](#info), [onUse](#onuse) 

##### object

| ключ | значение | значение по-умолчанию | обязательный | информация |
| ------ | ------ | ------ | ------ | ------ |
| pathWorkDir | text | ./station | нет | рабочая папка с треками и другими системными записями |
| isLauncher | boolean | true | нет | активация лаунчера |
| port | number | 9933 | нет | внутренний системный порт используется также для подключения к лаунчеру |
| login | text | /* random */ | нет | используется для авторизации в лаунчере |
| password | text | /* random */ | нет | используется для авторизации в лаунчере |
| isAutoStart | boolean | /* random */ | нет | отвечает за автоматический старт |
| puppeteerLauncher | object | { headless: true, args: ['--no-sandbox'] } | нет | объект лаунчера puppeteer |
| debug | boolean | false | нет | включает режим отладки |
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



### Contacts

My Telegram: [@prohetamine](https://t.me/prohetamine), [channel](https://t.me/prohetamines)

Email: prohetamine@gmail.com

Donat money: [patreon](https://www.patreon.com/prohetamine)

If you have any questions and/or suggestions, please email me in telegram, if you find any bugs also let me know, I will be very grateful.
