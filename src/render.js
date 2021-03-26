const { getCurrentWindow, desktopCapturer, Menu, dialog } = require("electron").remote
const { writeFile } = require("fs")

const minimizeWindowBtn = document.getElementById("minimizeWindowBtn")
minimizeWindowBtn.onclick = () => getCurrentWindow().minimize()
const maximizeWindowBtn = document.getElementById("maximizeWindowBtn")
maximizeWindowBtn.onclick = () => (getCurrentWindow().isMaximized()) ? getCurrentWindow().unmaximize() : getCurrentWindow().maximize()
const closeWindowBtn = document.getElementById("closeWindowBtn")
closeWindowBtn.onclick = () => getCurrentWindow().close()

const videoElement = document.querySelector("video")

const startVidBtn = document.getElementById("startVidBtn")
startVidBtn.onclick = e => {
    mediaRecorder.start()
    startVidBtn.classList.replace("is-dark", "is-danger")
    startVidBtn.innerText = "Recording"
}
const stopVidBtn = document.getElementById("stopVidBtn")

const startAudioBtn = document.getElementById("startAudioBtn")
const stopAudioBtn = document.getElementById("stopAudioBtn")

const videoSelectBtn = document.getElementById("videoSelectBtn")
videoSelectBtn.onclick = getVideoSources
const audioSelectBtn = document.getElementById("audioSelectBtn")



async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ["window", "screen"]
    })

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectVideoSource(source)
            }
        })
    )

    videoOptionsMenu.popup()
}


let mediaRecorder
let recordedChunks = []


async function selectVideoSource(source) {
    videoSelectBtn.innerText = source.name

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: source.id
            }
        }
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    videoElement.srcObject = stream
    videoElement.play()

    const options = { 
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
        mimeType: 'video/mp4'
    }
    mediaRecorder = new mediaRecorder(stream, options)
    mediaRecorder.ondataavailable = handleDataAvailable
    mediaRecorder.onstop = handleStop
}

function handleDataAvailable(e) {
    console.log("Video data available")
    recordedChunks.push(e.data)
}

async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: "video/mp4"
    })
    
    const buffer = Buffer.from(await blob.arrayBuffer())

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: "Save video",
        defaultPath: `vid-${Date.now()}.mp4`
    })
    console.log(filePath)

    writeFile(filePath, buffer, () => console.log("Video saved"))
}