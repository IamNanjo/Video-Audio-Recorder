const { remote } = require("electron");
const { getCurrentWindow, desktopCapturer, Menu, dialog } = remote;
const { writeFile } = require("fs");
const open = require("open");

let mediaRecorder;
let recordedChunks = [];

const titleBar = document.getElementById("titlebar");
const title = document.getElementById("title");
const minimizeWindowBtn = document.getElementById("minimizeWindowBtn");
const maximizeWindowBtn = document.getElementById("maximizeWindowBtn");
const closeWindowBtn = document.getElementById("closeWindowBtn");

const videoElement = document.querySelector("video");
const audioElement = document.querySelector("audio");

const startVidBtn = document.getElementById("startVidBtn");
const stopVidBtn = document.getElementById("stopVidBtn");

const startAudioBtn = document.getElementById("startAudioBtn");
const stopAudioBtn = document.getElementById("stopAudioBtn");

const videoSelectBtn = document.getElementById("videoSelectBtn");
const audioSelectBtn = document.getElementById("audioSelectBtn");

title.onclick = e => open("https://github.com/IamNanjo/video-audio-recorder");
title.addEventListener("contextmenu", () => {
    Menu.buildFromTemplate([{
        label: "GitHub page",
        click: () => open("https://github.com/IamNanjo/video-audio-recorder")
    }]).popup();
})

getCurrentWindow().isMaximized() ? maximizeWindowBtn.setAttribute("src", "./images/unmaximizebtn.png") : maximizeWindowBtn.setAttribute("src", "./images/maximizebtn.png");
getCurrentWindow().isFullScreen() ? titleBar.style.display = "None" : titleBar.style.display = "Block";

window.addEventListener("resize", () => {
    getCurrentWindow().isMaximized() ? maximizeWindowBtn.setAttribute("src", "./images/unmaximizebtn.png") : maximizeWindowBtn.setAttribute("src", "./images/maximizebtn.png");
    getCurrentWindow().isFullScreen() ? titleBar.style.display = "None" : titleBar.style.display = "Block";
})

minimizeWindowBtn.onclick = () => getCurrentWindow().minimize();
maximizeWindowBtn.onclick = () => getCurrentWindow().isMaximized() ? getCurrentWindow().unmaximize() : getCurrentWindow().maximize();
closeWindowBtn.onclick = () => getCurrentWindow().close();
startVidBtn.onclick = e => {
    mediaRecorder.start();
    startVidBtn.classList.replace("is-primary", "is-dark");
    startVidBtn.innerText = "Recording";
    stopVidBtn.classList.replace("is-dark", "is-danger");
}
stopVidBtn.onclick = () => {
    mediaRecorder.stop();
    startVidBtn.classList.replace("is-dark", "is-primary");
    startVidBtn.innerText = "Start recording video";
    stopVidBtn.classList.replace("is-danger", "is-dark");
}

startAudioBtn.onclick = () => {
    mediaRecorder.start();
    startAudioBtn.classList.replace("is-primary", "is-dark");
    startAudioBtn.innerText = "Recording";
    stopAudioBtn.classList.replace("is-dark", "is-danger");
}
stopAudioBtn.onclick = () => {
    mediaRecorder.stop();
    startAudioBtn.classList.replace("is-dark", "is-primary");
    startAudioBtn.innerText = "Start recording video";
    stopAudioBtn.classList.replace("is-danger", "is-dark");

}

videoSelectBtn.addEventListener("click", () => {
    getSources();
    getVideoSources();
})
audioSelectBtn.addEventListener("click", () => {
    getSources();
    getAudioSources();
})


let inputSources = [];
(async () => {
    inputSources = await desktopCapturer.getSources({types: ["window", "screen"]});
    inputSources.unshift({ name: "None", id: "None"});
})()


async function getSources() {
    inputSources = await desktopCapturer.getSources({
        types: ["window", "screen"],
        thumbnailSize: {
            width: 0,
            height: 0
        },
        fetchWindowIcons: true
    });
    inputSources.unshift({name: "None", id: "None"});
}


async function getVideoSources() {
    Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectVideoSource(source)
            }
        })
    ).popup();
    console.log(navigator.mediaDevices);
}
async function getAudioSources() {
    Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectAudioSource(source)
            }
        })
    ).popup();
    console.log(navigator.mediaDevices);
}

let constraints = {
    video: false,
    audio: false
}
let stream
let options = { mimeType: "video/webm; codecs=vp9" }
async function selectVideoSource(source) {
    videoSelectBtn.innerText = source.name

    if (source.name == "None") return constraints["video"] = false
    else constraints["video"] = true
    console.log(stream);

    stream = await navigator.mediaDevices.getUserMedia(constraints)
    console.log(stream);
    videoElement.setAttribute("src", stream)
    videoElement.play()

    options = { mimeType : "video/webm; codecs=vp9" }
    mediaRecorder = new MediaRecorder(stream, options)
    mediaRecorder.ondataavailable = handleDataAvailable
    mediaRecorder.onstop = handleStop
}
async function selectAudioSource(source) {
    audioSelectBtn.innerText = source.name

    if(source.name == "None") return constraints["audio"] = false
    else constraints["audio"] = true

    stream = await navigator.mediaDevices.getUserMedia(constraints)

    audioElement.srcObject = stream
    audioElement.play()

    mediaRecorder = new MediaRecorder(stream, options)
    mediaRecorder.ondataavailable = handleDataAvailable
    mediaRecorder.onstop = handleStop
}


function handleDataAvailable(e) {
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