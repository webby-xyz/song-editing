const $ = id => document.getElementById(id);

const audio = $("audio");
const fileInput = $("fileInput");
const editor = $("editor");
const canvas = $("waveform");
const ctx = canvas.getContext("2d");

let audioContext = null;
let sourceNode = null;
let gainNode = null;
let bassNode = null;
let midNode = null;
let trebleNode = null;
let panNode = null;
let compressorNode = null;

let audioBuffer = null;
let originalBuffer = null;
let audioURL = null;

let reverseEnabled = false;
let effectState = {
  d8:false,
  d16:false,
  d32:false,
  slow:false,
  lofi:false,
  bassboost:false,
  echo:false,
  reverb:false
};

function setStatus(text){
  $("status").textContent = "● " + text;
}

function formatTime(sec){
  if(!Number.isFinite(sec)) return "00:00";

  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);

  return String(m).padStart(2,"0") + ":" +
         String(s).padStart(2,"0");
}

/* ---------------- AUDIO PREVIEW ---------------- */

async function initAudio(){

  if(audioContext) return;

  audioContext =
    new (window.AudioContext ||
         window.webkitAudioContext)();

  sourceNode =
    audioContext.createMediaElementSource(audio);

  bassNode =
    audioContext.createBiquadFilter();

  bassNode.type = "lowshelf";
  bassNode.frequency.value = 200;

  midNode =
    audioContext.createBiquadFilter();

  midNode.type = "peaking";
  midNode.frequency.value = 1000;
  midNode.Q.value = 1;

  trebleNode =
    audioContext.createBiquadFilter();

  trebleNode.type = "highshelf";
  trebleNode.frequency.value = 3500;

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

  updatePreviewNodes();
}

function updatePreviewNodes(){

  if(!audioContext) return;

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
}

/* ---------------- FILE IMPORT ---------------- */

fileInput.addEventListener("change", async () => {

  const file = fileInput.files[0];

  if(!file) return;

  setStatus("LOADING");

  if(audioURL)
    URL.revokeObjectURL(audioURL);

  audioURL = URL.createObjectURL(file);

  audio.src = audioURL;

  $("songName").textContent = file.name;

  editor.classList.remove("hidden");

  try{

    const arrayBuffer =
      await file.arrayBuffer();

    audioBuffer =
      await decodeAudio(arrayBuffer);

    originalBuffer = cloneBuffer(audioBuffer);

    $("trimStart").value = 0;
    $("trimEnd").value =
      audioBuffer.duration.toFixed(2);

    $("durationText").textContent =
      formatTime(audioBuffer.duration);

    $("totalTime").textContent =
      formatTime(audioBuffer.duration);

    drawWaveform(audioBuffer);

    await initAudio();

    setStatus("READY");

  }catch(error){

    console.error(error);

    alert(
      "This file could not be decoded by your browser."
    );

    setStatus("ERROR");
  }
});

async function decodeAudio(data){

  const tempContext =
    new (window.AudioContext ||
         window.webkitAudioContext)();

  const buffer =
    await tempContext.decodeAudioData(data.slice(0));

  await tempContext.close();

  return buffer;
}

function cloneBuffer(buffer){

  const ctx2 =
    new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

  const copy =
    ctx2.createBuffer(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

  for(let c=0;c<buffer.numberOfChannels;c++){

    copy.getChannelData(c)
      .set(buffer.getChannelData(c));
  }

  return copy;
}

/* ---------------- YOUTUBE LINK ---------------- */

$("ytBtn").onclick = () => {

  const url = $("ytUrl").value.trim();

  const match =
    url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?/]+)/
    );

  if(!match){

    $("ytMsg").textContent =
      "❌ Valid YouTube link nahi mila.";

    $("ytPreview").classList.add("hidden");

    return;
  }

  const id = match[1];

  $("ytMsg").textContent =
    "✅ YouTube video detected. Preview loaded.";

  $("ytPreview").classList.remove("hidden");

  $("ytPreview").innerHTML =
    `<iframe
      src="https://www.youtube.com/embed/${id}"
      title="YouTube preview"
      allowfullscreen>
    </iframe>`;

  setStatus("YT LINK READY");
};

/* ---------------- PLAYBACK ---------------- */

$("playBtn").onclick = async () => {

  if(!audio.src) return;

  await initAudio();

  if(audioContext.state === "suspended")
    await audioContext.resume();

  if(audio.paused){

    await audio.play();

    $("playBtn").textContent = "⏸";

    setStatus("PLAYING");

  }else{

    audio.pause();

    $("playBtn").textContent = "▶";

    setStatus("PAUSED");
  }
};

audio.addEventListener("ended", () => {
  $("playBtn").textContent = "▶";
  setStatus("READY");
});

audio.addEventListener("timeupdate", () => {

  if(!audio.duration) return;

  $("currentTime").textContent =
    formatTime(audio.currentTime);

  $("seek").value =
    audio.currentTime / audio.duration * 100;
});

$("seek").oninput = e => {

  if(!audio.duration) return;

  audio.currentTime =
    Number(e.target.value) / 100 *
    audio.duration;
};

$("minus10").onclick = () => {
  audio.currentTime =
    Math.max(0,audio.currentTime - 10);
};

$("plus10").onclick = () => {
  audio.currentTime =
    Math.min(
      audio.duration,
      audio.currentTime + 10
    );
};

/* ---------------- CONTROLS ---------------- */

$("volume").oninput = e => {

  $("volumeVal").textContent =
    Math.round(Number(e.target.value)*100) + "%";

  updatePreviewNodes();
};

$("bass").oninput = e => {

  $("bassVal").textContent =
    Number(e.target.value).toFixed(1) + " dB";

  updatePreviewNodes();
};

$("mid").oninput = e => {

  $("midVal").textContent =
    Number(e.target.value).toFixed(1) + " dB";

  updatePreviewNodes();
};

$("treble").oninput = e => {

  $("trebleVal").textContent =
    Number(e.target.value).toFixed(1) + " dB";

  updatePreviewNodes();
};

$("pan").oninput =
$("width").oninput = () => {
  updatePreviewNodes();
};

$("compression").oninput =
$("limiter").oninput = () => {
  updatePreviewNodes();
};

$("speed").oninput = e => {

  $("speedVal").textContent =
    Number(e.target.value).toFixed(2) + "x";

  audio.playbackRate =
    Number(e.target.value);
};

$("pitch").oninput = e => {

  $("pitchVal").textContent =
    Number(e.target.value);
};

/* speed presets */

document.querySelectorAll("[data-speed]")
.forEach(btn => {

  btn.onclick = () => {

    const value =
      Number(btn.dataset.speed);

    $("speed").value = value;

    $("speedVal").textContent =
      value.toFixed(2) + "x";

    audio.playbackRate = value;
  };
});

/* pitch presets */

document.querySelectorAll("[data-pitch]")
.forEach(btn => {

  btn.onclick = () => {

    const value =
      Number(btn.dataset.pitch);

    $("pitch").value = value;

    $("pitchVal").textContent = value;
  };
});

/* ---------------- EFFECTS ---------------- */

document.querySelectorAll("[data-effect]")
.forEach(button => {

  button.onclick = () => {

    const name =
      button.dataset.effect;

    effectState[name] =
      !effectState[name];

    button.classList.toggle(
      "active",
      effectState[name]
    );

    applyPreviewEffect(name);
  };
});

function applyPreviewEffect(name){

  if(name === "bassboost"){
    $("bass").value =
      effectState.bassboost ? 15 : 0;

    $("bassVal").textContent =
      effectState.bassboost ? "15.0 dB" : "0.0 dB";
  }

  if(name === "lofi"){

    if(effectState.lofi){

      $("treble").value = -12;
      $("bass").value = 6;
      $("speed").value = .9;

    }else{

      $("treble").value = 0;
      $("bass").value = 0;
      $("speed").value = 1;
    }

    $("trebleVal").textContent =
      Number($("treble").value).toFixed(1) + " dB";

    $("bassVal").textContent =
      Number($("bass").value).toFixed(1) + " dB";

    $("speedVal").textContent =
      Number($("speed").value).toFixed(2) + "x";

    audio.playbackRate =
      Number($("speed").value);
  }

  if(name === "slow"){

    audio.playbackRate =
      effectState.slow ? .75 : 1;

    $("speed").value =
      audio.playbackRate;

    $("speedVal").textContent =
      audio.playbackRate.toFixed(2) + "x";
  }

  updatePreviewNodes();
}

/* ---------------- TRIM ---------------- */

$("useCurrentEnd").onclick = () => {

  $("trimEnd").value =
    audio.currentTime.toFixed(2);
};

/* ---------------- REVERSE ---------------- */

$("reverseBtn").onclick = () => {

  reverseEnabled = !reverseEnabled;

  $("reverseBtn").textContent =
    reverseEnabled
      ? "↩ REVERSE ON"
      : "REVERSE PREVIEW";

  if(audioBuffer){

    audioBuffer =
      reverseBuffer(audioBuffer);

    drawWaveform(audioBuffer);
  }
};

function reverseBuffer(buffer){

  const reversed =
    new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    ).createBuffer(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

  for(let c=0;c<buffer.numberOfChannels;c++){

    const src =
      buffer.getChannelData(c);

    const dst =
      reversed.getChannelData(c);

    for(let i=0;i<src.length;i++)
      dst[i] =
        src[src.length - 1 - i];
  }

  return reversed;
}

/* ---------------- RESET ---------------- */

$("resetBtn").onclick = () => {

  $("volume").value = 1;
  $("bass").value = 0;
  $("mid").value = 0;
  $("treble").value = 0;
  $("pan").value = 0;
  $("width").value = 1;
  $("speed").value = 1;
  $("pitch").value = 0;
  $("compression").value = 0;
  $("limiter").value = .2;

  $("volumeVal").textContent = "100%";
  $("bassVal").textContent = "0.0 dB";
  $("midVal").textContent = "0.0 dB";
  $("trebleVal").textContent = "0.0 dB";
  $("speedVal").textContent = "1.00x";
  $("pitchVal").textContent = "0";

  audio.playbackRate = 1;

  Object.keys(effectState).forEach(k=>{
    effectState[k] = false;
  });

  document.querySelectorAll("[data-effect]")
    .forEach(b=>b.classList.remove("active"));

  updatePreviewNodes();

  setStatus("RESET");
};

/* ---------------- WAVEFORM ---------------- */

function drawWaveform(buffer){

  const width = canvas.clientWidth || 800;
  const height = canvas.clientHeight || 170;

  canvas.width =
    width * devicePixelRatio;

  canvas.height =
    height * devicePixelRatio;

  ctx.setTransform(
    devicePixelRatio,0,
    0,devicePixelRatio,0,0
  );

  ctx.clearRect(0,0,width,height);

  if(!buffer) return;

  const data =
    buffer.getChannelData(0);

  const step =
    Math.ceil(data.length / width);

  const amp = height / 2;

  ctx.beginPath();

  for(let x=0;x<width;x++){

    let min=1;
    let max=-1;

    const start=x*step;
    const end=
      Math.min(start+step,data.length);

    for(let i=start;i<end;i++){

      const value=data[i];

      if(value<min) min=value;
      if(value>max) max=value;
    }

    ctx.moveTo(x,amp+min*amp);
    ctx.lineTo(x,amp+max*amp);
  }

  ctx.strokeStyle="#8d70ff";
  ctx.lineWidth=1;
  ctx.stroke();
}

/* ---------------- OFFLINE RENDER ---------------- */

$("exportBtn").onclick = async () => {

  if(!audioBuffer){

    alert(
      "Pehle audio/video file upload karo."
    );

    return;
  }

  const progressBox =
    $("progressBox");

  const fill =
    $("progressFill");

  const text =
    $("progressText");

  const msg =
    $("exportMsg");

  progressBox.classList.remove("hidden");

  msg.textContent = "";

  try{

    fill.style.width = "5%";
    text.textContent =
      "Preparing audio...";

    const sampleRate =
      audioBuffer.sampleRate;

    let start =
      Math.max(
        0,
        Number($("trimStart").value) || 0
      );

    let end =
      Number($("trimEnd").value);

    if(!end || end > audioBuffer.duration)
      end = audioBuffer.duration;

    if(end <= start)
      throw new Error("Invalid trim range");

    const source =
      sliceBuffer(
        audioBuffer,
        start,
        end
      );

    fill.style.width = "15%";
    text.textContent =
      "Building effects...";

    const rendered =
      await renderAudio(
        source,
        sampleRate,
        p => {

          fill.style.width =
            (15 + p * 75) + "%";

          text.textContent =
            "Rendering " +
            Math.round(p*100) + "%";
        }
      );

    fill.style.width = "95%";

    text.textContent =
      "Creating WAV...";

    const wav =
      encodeWAV(rendered);

    const blob =
      new Blob([wav],{
        type:"audio/wav"
      });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href=url;

    link.download =
      "Song-Edit-with-Ritesh.wav";

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(
      ()=>URL.revokeObjectURL(url),
      1000
    );

    fill.style.width="100%";

    text.textContent =
      "Complete";

    msg.textContent =
      "✅ Edited WAV downloaded successfully.";

    setStatus("EXPORT COMPLETE");

  }catch(error){

    console.error(error);

    msg.textContent =
      "❌ Export failed: " +
      error.message;

    text.textContent =
      "Error";

    setStatus("EXPORT ERROR");
  }
};

function sliceBuffer(buffer,start,end){

  const startSample =
    Math.floor(start * buffer.sampleRate);

  const endSample =
    Math.floor(end * buffer.sampleRate);

  const length =
    endSample-startSample;

  const offline =
    new OfflineAudioContext(
      buffer.numberOfChannels,
      length,
      buffer.sampleRate
    );

  const result =
    offline.createBuffer(
      buffer.numberOfChannels,
      length,
      buffer.sampleRate
    );

  for(let c=0;c<buffer.numberOfChannels;c++){

    result.getChannelData(c)
      .set(
        buffer.getChannelData(c)
          .slice(startSample,endSample)
      );
  }

  return result;
}

async function renderAudio(
  buffer,
  sampleRate,
  progress
){

  let speed =
    Number($("speed").value);

  if(effectState.slow)
    speed *= .75;

  const pitch =
    Number($("pitch").value);

  /*
    Browser-native offline rendering.
    Pitch changes playback rate together with speed.
  */

  const pitchRate =
    Math.pow(2,pitch/12);

  speed *= pitchRate;

  const outputLength =
    Math.max(
      1,
      Math.ceil(
        buffer.length / speed
      )
    );

  const offline =
    new OfflineAudioContext(
      2,
      outputLength,
      sampleRate
    );

  const source =
    offline.createBufferSource();

  source.buffer=buffer;

  source.playbackRate.value=speed;

  /* EQ */

  const bass =
    offline.createBiquadFilter();

  bass.type="lowshelf";
  bass.frequency.value=200;
  bass.gain.value =
    Number($("bass").value) +
    (effectState.bassboost ? 12 : 0);

  const mid =
    offline.createBiquadFilter();

  mid.type="peaking";
  mid.frequency.value=1000;
  mid.Q.value=1;
  mid.gain.value =
    Number($("mid").value);

  const treble =
    offline.createBiquadFilter();

  treble.type="highshelf";
  treble.frequency.value=3500;
  treble.gain.value =
    Number($("treble").value) +
    (effectState.lofi ? -8 : 0);

  const gain =
    offline.createGain();

  gain.gain.value =
    Number($("volume").value);

  /* compressor */

  const compressor =
    offline.createDynamicsCompressor();

  const compression =
    Number($("compression").value);

  compressor.threshold.value =
    -10-compression*60;

  compressor.ratio.value =
    1+compression*11;

  compressor.attack.value=.003;
  compressor.release.value=.2;

  /* stereo */

  const panner =
    offline.createStereoPanner();

  panner.pan.value =
    Number($("pan").value);

  /* main chain */

  source
    .connect(bass)
    .connect(mid)
    .connect(treble)
    .connect(gain)
    .connect(panner)
    .connect(compressor)
    .connect(offline.destination);

  /* fade */

  const fadeIn =
    Number($("fadeIn").value)||0;

  const fadeOut =
    Number($("fadeOut").value)||0;

  const duration =
    outputLength/sampleRate;

  gain.gain.setValueAtTime(
    Number($("volume").value),
    0
  );

  if(fadeIn>0){

    gain.gain.linearRampToValueAtTime(
      Number($("volume").value),
      Math.min(fadeIn,duration)
    );
  }

  if(fadeOut>0){

    const begin =
      Math.max(
        0,
        duration-fadeOut
      );

    gain.gain.setValueAtTime(
      Number($("volume").value),
      begin
    );

    gain.gain.linearRampToValueAtTime(
      0,
      duration
    );
  }

  source.start();

  const rendered =
    await offline.startRendering();

  progress(1);

  return rendered;
}

/* ---------------- WAV ENCODER ---------------- */

function encodeWAV(buffer){

  const channels =
    Math.min(2,buffer.numberOfChannels);

  const sampleRate =
    buffer.sampleRate;

  const frames =
    buffer.length;

  const bytesPerSample=2;

  const blockAlign =
    channels*bytesPerSample;

  const dataSize =
    frames*blockAlign;

  const arrayBuffer =
    new ArrayBuffer(
      44+dataSize
    );

  const view =
    new DataView(arrayBuffer);

  writeString(view,0,"RIFF");

  view.setUint32(
    4,
    36+dataSize,
    true
  );

  writeString(view,8,"WAVE");

  writeString(view,12,"fmt ");

  view.setUint32(16,16,true);

  view.setUint16(20,1,true);

  view.setUint16(
    22,
    channels,
    true
  );

  view.setUint32(
    24,
    sampleRate,
    true
  );

  view.setUint32(
    28,
    sampleRate*blockAlign,
    true
  );

  view.setUint16(
    32,
    blockAlign,
    true
  );

  view.setUint16(
    34,
    16,
    true
  );

  writeString(view,36,"data");

  view.setUint32(
    40,
    dataSize,
    true
  );

  let offset=44;

  const left =
    buffer.getChannelData(0);

  const right =
    channels>1
      ? buffer.getChannelData(1)
      : left;

  for(let i=0;i<frames;i++){

    let l =
      Math.max(-1,Math.min(1,left[i]));

    let r =
      Math.max(-1,Math.min(1,right[i]));

    view.setInt16(
      offset,
      l<0 ? l*0x8000 : l*0x7fff,
      true
    );

    offset+=2;

    if(channels>1){

      view.setInt16(
        offset,
        r<0 ? r*0x8000 : r*0x7fff,
        true
      );

      offset+=2;
    }
  }

  return arrayBuffer;
}

function writeString(view,offset,string){

  for(let i=0;i<string.length;i++)
    view.setUint8(
      offset+i,
      string.charCodeAt(i)
    );
}

/* resize waveform */

window.addEventListener(
  "resize",
  ()=>{
    if(audioBuffer)
      drawWaveform(audioBuffer);
  }
);
