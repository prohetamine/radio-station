import { useEffect, useState } from 'react'

const useEther = ({ presenterMedia, socket }) => {
  const [isEther, setEther] = useState(false)
  useEffect(() => {
    if (presenterMedia) {
      if (isEther) {
        socket.emit('switch-launcher-on')
        presenterMedia.startRecording()
      } else {
        socket.emit('switch-launcher-off')
        presenterMedia.stopRecording()
      }
    }
  }, [isEther, presenterMedia])

  useEffect(async () => {
    if (socket && presenterMedia) {
      presenterMedia.onRecordingReady = function(packet){
        //console.log("Recording started!");
        //console.log(packet)
        //console.log("Header size: " + packet.data.size + "bytes");
        socket.emit('launcher-header', packet.data)
      }

      presenterMedia.onBufferProcess = function(packet){
        //console.log("Buffer sent: " + packet[0].size + "bytes");
        socket.emit('launcher-audio', packet[0])
      }
    }
  }, [socket, presenterMedia])

  return [isEther, setEther]
}

export default useEther
