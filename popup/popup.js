document.getElementById("btn-start").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "START_CAPTURE" }, (response) => {
    console.log("Response from background:", response);
  });
});