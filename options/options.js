const options = ["curr", "goal", "opacity", "opacity2", "direction"];
function saveOptions() {
    chrome.storage.sync.set({enabled: document.getElementById("enabled").checked});
    var x = {}
    options.forEach(e => {
        x[e] = document.getElementById(e).value;
    });
    chrome.storage.sync.set(x);
}
function loadOptions() {    
    chrome.storage.sync.get(["enabled"], (result) => {
        document.getElementById("enabled").checked = result.enabled;
    });
    chrome.storage.sync.get(options, (result) => {
        options.forEach(e => {
            document.getElementById(e).value = result[e];
        });
    });
}
document.addEventListener('DOMContentLoaded', loadOptions);
["enabled", "curr", "goal", "opacity", "opacity2", "direction"].forEach(e => {
    document.getElementById(e).addEventListener('change', saveOptions);
});