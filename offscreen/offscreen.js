chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "START_CAPTURE") startCapture(msg.streamId, msg.tabId);
});

async function startCapture(streamId, tabId) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId
      }
    },
    video: false
  });

  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
  source.connect(audioContext.destination);

  const data = new Uint8Array(analyser.frequencyBinCount);

  function loop() {
    analyser.getByteFrequencyData(data);

    chrome.runtime.sendMessage({
      type: "AUDIO_DATA",
      tabId,
      data: Array.from(data)
    });

    setTimeout(loop, 1000/60);
  }

  loop();
}
