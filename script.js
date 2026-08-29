"use strict";

/* =====================================================
   SONG EDIT WITH RITESH
   PRO BROWSER AUDIO EDITOR
   ===================================================== */

const $ = id => document.getElementById(id);

const fileInput = $("fileInput");
const editor = $("editor");
const audio = $("audio");

const canvas = $("waveform");
const ctx = canvas.getContext("2d");

let currentURL = null;
let audioBuffer = null;

let audioContext = null;
let sourceNode = null;

let gainNode = null;
let bassNode = null;
let midNode = null;
let trebleNode = null;
let panNode = null;
let compressorNode = null;

let reverseMode = false;
let panTimer = null;


/* =====================================================
   STATUS
   ===================================================== */

function status(text){

    const el = $("status");

    if(el){
        el.innerHTML =
            `<i></i> ${text}`;
    }
}


/* =====================================================
   TIME
   ===================================================== */

function timeText(seconds){

    if(!Number.isFinite(seconds))
        return "00:00";

    const m =
        Math.floor(seconds / 60);

    const s =
        Math.floor(seconds % 60);

    return (
        String(m).padStart(2,"0") +
        ":" +
        String(s).padStart(2,"0")
    );
}


/* =====================================================
   UPLOAD
   ===================================================== */

fileInput.addEventListener(
    "change",
    async event => {

        const file =
            event.target.files[0];

        if(!file)
            return;

        status("LOADING");

        try{

            if(currentURL){
                URL.revokeObjectURL(currentURL);
                currentURL = null;
            }

            currentURL =
                URL.createObjectURL(file);

            audio.pause();

            audio.src = currentURL;

            audio.load();

            /* SHOW EDITOR */

            editor.classList.remove("hidden");

            $("songName").textContent =
                file.name;

            $("uploadInfo").textContent =
                "✓ " +
                file.name +
                " loaded successfully";

            /* DECODE */

            const data =
                await file.arrayBuffer();

            audioBuffer =
                await decodeAudio(data);

            /* TRIM */

            $("trimStart").value = "0";

            $("trimEnd").value =
                audioBuffer.duration.toFixed(2);

            $("durationText").textContent =
                timeText(audioBuffer.duration);

            $("totalTime").textContent =
                timeText(audioBuffer.duration);

            /* WAVEFORM */

            drawWaveform(audioBuffer);

            /* AUDIO ENGINE */

            await setupAudio();

            status("SONG READY");

        }catch(error){

            console.error(error);

            status("LOAD ERROR");

            alert(
                "Song load nahi ho saka.\n\n" +
                "MP3 ya WAV file try karo."
            );
        }
    }
);


/* =====================================================
   DECODE
   ===================================================== */

async function decodeAudio(data){

    const AC =
        window.AudioContext ||
        window.webkitAudioContext;

    const temp =
        new AC();

    try{

        return await temp.decodeAudioData(
            data.slice(0)
        );

    }finally{

        if(temp.close)
            await temp.close();
    }
}


/* =====================================================
   AUDIO ENGINE
   ===================================================== */

async function setupAudio(){

    if(audioContext){

        if(audioContext.state === "suspended")
            await audioContext.resume();

        updateEngine();

        return;
    }

    const AC =
        window.AudioContext ||
        window.webkitAudioContext;

    audioContext = new AC();

    sourceNode =
        audioContext
            .createMediaElementSource(audio);

    bassNode =
        audioContext.createBiquadFilter();

    bassNode.type = "lowshelf";
    bassNode.frequency.value = 180;

    midNode =
        audioContext.createBiquadFilter();

    midNode.type = "peaking";
    midNode.frequency.value = 1000;
    midNode.Q.value = 1;

    trebleNode =
        audioContext.createBiquadFilter();

    trebleNode.type = "highshelf";
    trebleNode.frequency.value = 4000;

    gainNode =
        audioContext.createGain();

    panNode =
        audioContext.createStereoPanner();

    compressorNode =
        audioContext.createDynamicsCompressor();

    sourceNode
        .connect(bassNode)
        .connect(midNode)
        .connect(trebleNode)
        .connect(gainNode)
        .connect(panNode)
        .connect(compressorNode)
        .connect(audioContext.destination);

    updateEngine();
}


/* =====================================================
   UPDATE ENGINE
   ===================================================== */

function updateEngine(){

    if(!audioContext)
        return;

    gainNode.gain.value =
        Number($("volume").value);

    bassNode.gain.value =
        Number($("bass").value);

    midNode.gain.value =
        Number($("mid").value);

    trebleNode.gain.value =
        Number($("treble").value);

    panNode.pan.value =
        Number($("pan").value);

    const compression =
        Number($("compression").value);

    compressorNode.threshold.value =
        -10 - compression * 60;

    compressorNode.ratio.value =
        1 + compression * 11;

    compressorNode.attack.value =
        0.003;

    compressorNode.release.value =
        0.2;
}


/* =====================================================
   PLAY
   ===================================================== */

$("playBtn").addEventListener(
    "click",
    async () => {

        if(!audio.src){

            alert(
                "Pehle song upload karo."
            );

            return;
        }

        await setupAudio();

        if(audioContext.state === "suspended")
            await audioContext.resume();

        if(audio.paused){

            try{

                await audio.play();

                $("playBtn").textContent =
                    "⏸";

                status("PLAYING");

            }catch(error){

                console.error(error);

                alert(
                    "Audio play nahi ho saka."
                );
            }

        }else{

            audio.pause();

            $("playBtn").textContent =
                "▶";

            status("PAUSED");
        }
    }
);


/* =====================================================
   AUDIO EVENTS
   ===================================================== */

audio.addEventListener(
    "loadedmetadata",
    () => {

        if(!Number.isFinite(audio.duration))
            return;

        $("totalTime").textContent =
            timeText(audio.duration);

        if(
            !Number($("trimEnd").value)
        ){

            $("trimEnd").value =
                audio.duration.toFixed(2);
        }
    }
);


audio.addEventListener(
    "timeupdate",
    () => {

        if(!audio.duration)
            return;

        $("currentTime").textContent =
            timeText(audio.currentTime);

        $("seek").value =
            audio.currentTime /
            audio.duration *
            100;

        /* Fake visual meters */

        const value =
            25 + Math.random()*65;

        $("meterL").style.height =
            value + "%";

        $("meterR").style.height =
            (20 + Math.random()*70) + "%";
    }
);


audio.addEventListener(
    "ended",
    () => {

        $("playBtn").textContent =
            "▶";

        status("READY");
    }
);


/* =====================================================
   SEEK
   ===================================================== */

$("seek").addEventListener(
    "input",
    function(){

        if(!audio.duration)
            return;

        audio.currentTime =
            Number(this.value) /
            100 *
            audio.duration;
    }
);


/* =====================================================
   10 SECOND
   ===================================================== */

$("minus10").addEventListener(
    "click",
    () => {

        audio.currentTime =
            Math.max(
                0,
                audio.currentTime - 10
            );
    }
);


$("plus10").addEventListener(
    "click",
    () => {

        audio.currentTime =
            Math.min(
                audio.duration || 0,
                audio.currentTime + 10
            );
    }
);


/* =====================================================
   VOLUME
   ===================================================== */

$("volume").addEventListener(
    "input",
    function(){

        $("volumeVal").textContent =
            Math.round(
                Number(this.value) * 100
            ) + "%";

        updateEngine();
    }
);


/* =====================================================
   EQ
   ===================================================== */

$("bass").addEventListener(
    "input",
    function(){

        $("bassVal").textContent =
            Number(this.value)
                .toFixed(1) + " dB";

        updateEngine();
    }
);


$("mid").addEventListener(
    "input",
    function(){

        $("midVal").textContent =
            Number(this.value)
                .toFixed(1) + " dB";

        updateEngine();
    }
);


$("treble").addEventListener(
    "input",
    function(){

        $("trebleVal").textContent =
            Number(this.value)
                .toFixed(1) + " dB";

        updateEngine();
    }
);


/* =====================================================
   COMPRESSION
   ===================================================== */

$("compression").addEventListener(
    "input",
    function(){

        $("compressionVal").textContent =
            Math.round(
                Number(this.value) * 100
            ) + "%";

        updateEngine();
    }
);


/* =====================================================
   PAN
   ===================================================== */

$("pan").addEventListener(
    "input",
    function(){

        const v =
            Number(this.value);

        if(v === 0)
            $("panVal").textContent =
                "CENTER";

        else if(v < 0)
            $("panVal").textContent =
                "LEFT " +
                Math.round(Math.abs(v)*100) +
                "%";

        else
            $("panVal").textContent =
                "RIGHT " +
                Math.round(v*100) +
                "%";

        updateEngine();
    }
);


/* =====================================================
   WIDTH
   ===================================================== */

$("width").addEventListener(
    "input",
    function(){

        $("widthVal").textContent =
            Math.round(
                Number(this.value) * 100
            ) + "%";
    }
);


/* =====================================================
   SPEED
   ===================================================== */

$("speed").addEventListener(
    "input",
    function(){

        const value =
            Number(this.value);

        audio.playbackRate =
            value;

        $("speedVal").textContent =
            value.toFixed(2) + "x";
    }
);


/* SPEED PRESETS */

document.querySelectorAll(
    "[data-speed]"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const value =
                Number(button.dataset.speed);

            $("speed").value = value;

            $("speedVal").textContent =
                value.toFixed(2) + "x";

            audio.playbackRate =
                value;
        }
    );
});


/* =====================================================
   PITCH
   ===================================================== */

$("pitch").addEventListener(
    "input",
    function(){

        $("pitchVal").textContent =
            this.value;
    }
);


document.querySelectorAll(
    "[data-pitch]"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const value =
                Number(button.dataset.pitch);

            $("pitch").value =
                value;

            $("pitchVal").textContent =
                value;
        }
    );
});


/* =====================================================
   TRIM
   ===================================================== */

$("useCurrentEnd").addEventListener(
    "click",
    () => {

        $("trimEnd").value =
            audio.currentTime.toFixed(2);
    }
);


/* =====================================================
   EFFECTS
   ===================================================== */

document.querySelectorAll(
    "[data-effect]"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const effect =
                button.dataset.effect;

            button.classList.toggle(
                "active"
            );

            applyEffect(effect);
        }
    );
});


function applyEffect(effect){

    if(!audioContext)
        return;

    if(effect === "bassboost"){

        const active =
            document
                .querySelector(
                    '[data-effect="bassboost"]'
                )
                .classList
                .contains("active");

        $("bass").value =
            active ? 15 : 0;

        $("bassVal").textContent =
            (active ? "15.0" : "0.0") +
            " dB";

        updateEngine();
    }


    if(effect === "lofi"){

        const active =
            document
                .querySelector(
                    '[data-effect="lofi"]'
                )
                .classList
                .contains("active");

        if(active){

            $("bass").value = 5;
            $("treble").value = -10;
            $("speed").value = .9;

        }else{

            $("bass").value = 0;
            $("treble").value = 0;
            $("speed").value = 1;
        }

        $("bassVal").textContent =
            Number($("bass").value)
                .toFixed(1) + " dB";

        $("trebleVal").textContent =
            Number($("treble").value)
                .toFixed(1) + " dB";

        $("speedVal").textContent =
            Number($("speed").value)
                .toFixed(2) + "x";

        audio.playbackRate =
            Number($("speed").value);

        updateEngine();
    }


    if(effect === "slow"){

        const active =
            document
                .querySelector(
                    '[data-effect="slow"]'
                )
                .classList
                .contains("active");

        const value =
            active ? .75 : 1;

        $("speed").value =
            value;

        $("speedVal").textContent =
            value.toFixed(2) + "x";

        audio.playbackRate =
            value;
    }


    if(
        effect === "8d" ||
        effect === "16d" ||
        effect === "32d"
    ){

        startSpatialMovement();
    }


    if(
        effect === "echo" ||
        effect === "reverb"
    ){

        /*
          Visual activation is ready.
          Advanced convolution DSP can be
          connected to the same engine later.
        */

        status(
            effect.toUpperCase() +
            " SELECTED"
        );
    }
}


/* =====================================================
   SPATIAL MOVEMENT
   ===================================================== */

function startSpatialMovement(){

    if(panTimer)
        clearInterval(panTimer);

    let p = -1;
    let direction = 1;

    panTimer =
        setInterval(
            () => {

                if(!panNode)
                    return;

                p +=
                    0.025 * direction;

                if(p >= 1){

                    p = 1;
                    direction = -1;
                }

                if(p <= -1){

                    p = -1;
                    direction = 1;
                }

                panNode.pan.value = p;

            },
            60
        );
}


/* =====================================================
   REVERSE
   ===================================================== */

$("reverseBtn").addEventListener(
    "click",
    () => {

        if(!audioBuffer)
            return;

        reverseMode =
            !reverseMode;

        audioBuffer =
            reverseBuffer(audioBuffer);

        drawWaveform(audioBuffer);

        $("reverseBtn").textContent =
            reverseMode
                ? "↔ REVERSE ON"
                : "↔ REVERSE";

        status(
            reverseMode
                ? "REVERSE ON"
                : "REVERSE OFF"
        );
    }
);


function reverseBuffer(buffer){

    const reversed =
        new AudioBuffer({
            length:buffer.length,
            numberOfChannels:
                buffer.numberOfChannels,
            sampleRate:
                buffer.sampleRate
        });

    for(
        let c=0;
        c<buffer.numberOfChannels;
        c++
    ){

        const source =
            buffer.getChannelData(c);

        const target =
            reversed.getChannelData(c);

        for(
            let i=0;
            i<source.length;
            i++
        ){

            target[i] =
                source[
                    source.length - 1 - i
                ];
        }
    }

    return reversed;
}


/* =====================================================
   RESET
   ===================================================== */

$("resetBtn").addEventListener(
    "click",
    () => {

        $("volume").value = 1;
        $("bass").value = 0;
        $("mid").value = 0;
        $("treble").value = 0;
        $("compression").value = 0;
        $("pan").value = 0;
        $("width").value = 1;
        $("speed").value = 1;
        $("pitch").value = 0;

        $("volumeVal").textContent =
            "100%";

        $("bassVal").textContent =
            "0 dB";

        $("midVal").textContent =
            "0 dB";

        $("trebleVal").textContent =
            "0 dB";

        $("compressionVal").textContent =
            "0%";

        $("panVal").textContent =
            "CENTER";

        $("widthVal").textContent =
            "100%";

        $("speedVal").textContent =
            "1.00x";

        $("pitchVal").textContent =
            "0";

        audio.playbackRate = 1;

        document.querySelectorAll(
            "[data-effect]"
        ).forEach(
            button =>
                button.classList.remove(
                    "active"
                )
        );

        if(panTimer){

            clearInterval(panTimer);

            panTimer = null;
        }

        updateEngine();

        status("RESET COMPLETE");
    }
);


/* =====================================================
   WAVEFORM
   ===================================================== */

function drawWaveform(buffer){

    const width =
        canvas.clientWidth || 900;

    const height =
        canvas.clientHeight || 190;

    const dpr =
        window.devicePixelRatio || 1;

    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    if(!buffer)
        return;

    const data =
        buffer.getChannelData(0);

    const step =
        Math.max(
            1,
            Math.ceil(
                data.length / width
            )
        );

    const center =
        height / 2;

    ctx.beginPath();

    for(
        let x=0;
        x<width;
   
