const options = ["curr", "goal"];
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
        if (result) document.getElementById("enabled").checked = result.enabled;
    });
    chrome.storage.sync.get(options, (result) => {
        options.forEach(e => {
            if (result[e]) document.getElementById(e).value = result[e];
        });
    });
}
document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);