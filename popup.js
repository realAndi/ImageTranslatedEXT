document.addEventListener('DOMContentLoaded', function() {
    // Load saved settings
    chrome.storage.sync.get(['ocrEngine', 'translateFrom', 'translateTo'], function(items) {
        if (items.ocrEngine) {
            document.querySelector(`input[name="ocrEngine"][value="${items.ocrEngine}"]`).checked = true;
        }
        if (items.translateFrom) {
            document.getElementById('translateFrom').value = items.translateFrom;
        }
        if (items.translateTo) {
            document.getElementById('translateTo').value = items.translateTo;
        }
    });

    // Add event listener for save button
    document.getElementById('save').addEventListener('click', saveOptions);
});

function saveOptions() {
    const ocrEngine = document.querySelector('input[name="ocrEngine"]:checked').value;
    const translateFrom = document.getElementById('translateFrom').value;
    const translateTo = document.getElementById('translateTo').value;

    chrome.storage.sync.set({
        ocrEngine: ocrEngine,
        translateFrom: translateFrom,
        translateTo: translateTo
    }, function() {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Settings saved.';
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

function toggleVisionApiKeySection() {
    const visionApiKeySection = document.getElementById('visionApiKeySection');
    visionApiKeySection.style.display = document.querySelector('input[name="ocrEngine"]:checked').value === 'googleVision' ? 'block' : 'none';
}