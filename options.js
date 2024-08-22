// Saves options to chrome.storage
function saveOptions() {
    const visionApiKey = document.getElementById('visionApiKey').value;
    const translateApiKey = document.getElementById('translateApiKey').value;
    const debugMode = document.getElementById('debugMode').checked;
    chrome.storage.sync.set({
        visionApiKey: visionApiKey,
        translateApiKey: translateApiKey,
        debugMode: debugMode
    }, function() {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);

        // Notify all tabs that settings have changed
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(function(tab) {
                chrome.tabs.sendMessage(tab.id, {action: "settingsUpdated"});
            });
        });
    });
}

function restoreOptions() {
    chrome.storage.sync.get({
        visionApiKey: '',
        translateApiKey: '',
        debugMode: false
    }, function(items) {
        document.getElementById('visionApiKey').value = items.visionApiKey;
        document.getElementById('translateApiKey').value = items.translateApiKey;
        document.getElementById('debugMode').checked = items.debugMode;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);