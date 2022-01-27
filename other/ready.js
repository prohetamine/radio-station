import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import './index.css'

import axios from 'axios'
import sleep from 'sleep-promise'
const MicRecorder = require('mic-recorder-to-mp3');

import { MediaPresenter } from 'sfmediastream'
const presenterMedia = new MediaPresenter({
  audio:{
    channelCount: 1,
    echoCancellation: false
  }
}, 60000)


const App = () => {
  const [isRec, setRec] = useState(false)
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (isRec) {
      presenterMedia.startRecording()
    } else {
      presenterMedia.stopRecording()
    }
  }, [isRec])

  return (
    <div>
      <audio
        id="audio"
        onPlay={async () => {
          const getCurrentTrackInfo = async () => {
            const { data } = await axios.get('http://localhost:8080/radio?getCurrentTrackInfo')
            console.log(data)
            setInfo(JSON.stringify(data))
            setTimeout(getCurrentTrackInfo, data.radioStation.requestTime + 30000)
          }

          getCurrentTrackInfo()
        }}
        src='http://127.0.0.1:8080/radio'
        preload="none"
        controls
      >
      </audio>
      <br />
      <button onClick={() => setRec(s => !s)}>{isRec ? 'stop' : 'start'} rec</button>
      <div>{info}</div>
    </div>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
