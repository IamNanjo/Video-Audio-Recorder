const { getCurrentWindow, desktopCapturer, Menu, dialog } = require("electron").remote
const { writeFile } = require("fs")
const open = require("open")

let mediaRecorder
let recordedChunks = []

const title = document.getElementById("title")
const minimizeWindowBtn = document.getElementById("minimizeWindowBtn")
const maximizeWindowBtn = document.getElementById("maximizeWindowBtn")
const closeWindowBtn = document.getElementById("closeWindowBtn")

const videoElement = document.querySelector("video")
const audioElement = document.querySelector("audio")

const startVidBtn = document.getElementById("startVidBtn")
const stopVidBtn = document.getElementById("stopVidBtn")

const startAudioBtn = document.getElementById("startAudioBtn")
const stopAudioBtn = document.getElementById("stopAudioBtn")

const videoSelectBtn = document.getElementById("videoSelectBtn")
const audioSelectBtn = document.getElementById("audioSelectBtn")


title.onclick = e => open("https://github.com/IamNanjo/video-audio-recorder")
minimizeWindowBtn.onclick = () => getCurrentWindow().minimize()
maximizeWindowBtn.onclick = () => (getCurrentWindow().isMaximized()) ? getCurrentWindow().unmaximize() : getCurrentWindow().maximize()
closeWindowBtn.onclick = () => getCurrentWindow().close()

startVidBtn.onclick = e => {
    mediaRecorder.start()
    startVidBtn.classList.replace("is-primary", "is-dark")
    startVidBtn.innerText = "Recording"
    stopVidBtn.classList.replace("is-dark", "is-danger")
}
stopVidBtn.onclick = e => {
    mediaRecorder.stop()
    startVidBtn.classList.replace("is-dark", "is-primary")
    startVidBtn.innerText = "Start recording video"
    stopVidBtn.classList.replace("is-danger", "is-dark")
}

startAudioBtn.onclick = e => {
    mediaRecorder.start()
    startAudioBtn.classList.replace("is-primary", "is-dark")
    startAudioBtn.innerText = "Recording"
    stopAudioBtn.classList.replace("is-dark", "is-danger")
}
stopAudioBtn.onclick = e => {
    mediaRecorder.stop()
    startAudioBtn.classList.replace("is-dark", "is-primary")
    startAudioBtn.innerText = "Start recording video"
    stopAudioBtn.classList.replace("is-danger", "is-dark")

}

videoSelectBtn.onclick = getVideoSources
audioSelectBtn.onclick = getAudioSources


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
async function getAudioSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ["window", "screen"]
    })

    const audioOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectAudioSource(source)
            }
        })
    )

    audioOptionsMenu.popup()
}


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

    const options = { mimeType : "video/webm; codecs=vp9" }
    mediaRecorder = new MediaRecorder(stream, options)
    mediaRecorder.ondataavailable = handleDataAvailable
    mediaRecorder.onstop = handleStop
}
async function selectAudioSource(source) {
    audioSelectBtn.innerText = source.name

    const constraints = {
        audio: {
            mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: source.id
            }
        },
        video: false
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    audioElement.srcObject = stream
    audioElement.play()

    const options = { mimeType: "video/webm; codecs=vp9" }
    mediaRecorder = new MediaRecorder(stream, options)
    mediaRecorder.ondataavailable = handleDataAvailable
    mediaRecorder.onstop = handleStop
}


function handleDataAvailable(e) {
    console.log("Video data available")
    recordedChunks.push(e.data)
}

async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: "video/webm"
    })
    
    const buffer = Buffer.from(await blob.arrayBuffer())

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: "Save video",
        defaultPath: `vid-${Date.now()}.webm`
    })
    console.log(filePath)

    writeFile(filePath, buffer, () => console.log("Video saved"))
}