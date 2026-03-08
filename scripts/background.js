chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "START_CAPTURE") {
    startOffscreenCapture();
    return true;
  }

  if (msg.type === "AUDIO_DATA") {
    chrome.tabs.sendMessage(msg.tabId, {
      type: "AUDIO_DATA",
      data: msg.data
    });
  }
});

async function startOffscreenCapture() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"]
  });

  if (existingContexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: "../offscreen/offscreen.html",
    reasons: ["USER_MEDIA"],
    justification: "Capture tab audio for visualization"
  });

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const streamId = await chrome.tabCapture.getMediaStreamId({
    targetTabId: tabs[0].id
  });

  chrome.runtime.sendMessage({
    type: "START_CAPTURE",
    streamId,
    tabId: tabs[0].id
  });
}
