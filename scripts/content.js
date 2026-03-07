var enabled = true;
var interval;
chrome.storage.sync.get(["enabled"], (result) => {
    enabled = result.enabled;
    if (enabled) interval = setInterval(update, 50);
    overlay.style.visibility = enabled ? "visible" : "hidden";
});

const overlay = document.createElement("div");
overlay.style.visibility = "hidden";
overlay.style.position = "fixed";
overlay.style.top = "0px";
overlay.style.left = "0px";
overlay.style.zIndex = "10000";
overlay.style.backgroundImage = "linear-gradient(to right, #0080ff80 , #0080ff10 15%, #ff800010 85%, #ff800080)";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.userSelect = "none";
overlay.style.pointerEvents = "none";
overlay.style.mixBlendMode = "hard-light";
document.querySelector("body").insertAdjacentElement("afterend", overlay);

var update = ()=>{
    overlay.style.filter = `hue-rotate(${Date.now()/100%360}deg)`
}
update();

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === 'enabled') {
            enabled = newValue;
            overlay.style.visibility = enabled ? "visible" : "hidden";
            if (enabled) interval = setInterval(update, 100);
            else clearInterval(interval);
        }
    }
});