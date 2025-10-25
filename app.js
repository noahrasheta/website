// Global variables
let cleanedTranscript = '';
let originalFileName = '';

// DOM elements
const apiKeyInput = document.getElementById('apiKey');
const transcriptFileInput = document.getElementById('transcriptFile');
const fileInfo = document.getElementById('fileInfo');
const processBtn = document.getElementById('processBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const statusDiv = document.getElementById('status');
const downloadSection = document.getElementById('downloadSection');
const downloadBtn = document.getElementById('downloadBtn');

// Load saved API key from localStorage
window.addEventListener('DOMContentLoaded', () => {
    const savedApiKey = localStorage.getItem('claudeApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        checkFormValidity();
    }
});

// Save API key to localStorage
apiKeyInput.addEventListener('input', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem('claudeApiKey', apiKey);
    }
    checkFormValidity();
});

// Handle file selection
transcriptFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        originalFileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        const fileSizeKB = (file.size / 1024).toFixed(2);
        fileInfo.textContent = `Selected: ${file.name} (${fileSizeKB} KB)`;
        checkFormValidity();
    } else {
        fileInfo.textContent = '';
        originalFileName = '';
    }
});

// Check if form is valid to enable process button
function checkFormValidity() {
    const hasApiKey = apiKeyInput.value.trim().length > 0;
    const hasFile = transcriptFileInput.files.length > 0;
    processBtn.disabled = !(hasApiKey && hasFile);
}

// Show status message
function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
}

// Hide status message
function hideStatus() {
    statusDiv.className = 'status';
}

// Process transcript
processBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const file = transcriptFileInput.files[0];

    if (!apiKey || !file) {
        showStatus('Please provide both an API key and a transcript file.', 'error');
        return;
    }

    // Show loading state
    processBtn.disabled = true;
    btnText.textContent = 'Processing...';
    btnSpinner.classList.remove('hidden');
    hideStatus();
    downloadSection.classList.remove('show');

    try {
        // Read file content
        const fileContent = await readFileContent(file);

        if (!fileContent || fileContent.trim().length === 0) {
            throw new Error('File is empty or could not be read.');
        }

        showStatus('Sending transcript to Claude AI for processing...', 'info');

        // Call Claude API
        const response = await callClaudeAPI(apiKey, fileContent);

        cleanedTranscript = response;

        // Show success and download option
        showStatus('Transcript processed successfully!', 'success');
        downloadSection.classList.add('show');

    } catch (error) {
        console.error('Error:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        // Reset button state
        processBtn.disabled = false;
        btnText.textContent = 'Process Transcript';
        btnSpinner.classList.add('hidden');
    }
});

// Read file content
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result);
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
}

// Call Claude API via proxy server
async function callClaudeAPI(apiKey, transcriptContent) {
    const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            apiKey: apiKey,
            transcriptContent: transcriptContent
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.cleanedTranscript) {
        throw new Error('Unexpected response format');
    }

    return data.cleanedTranscript;
}

// Download cleaned transcript
downloadBtn.addEventListener('click', () => {
    if (!cleanedTranscript) {
        showStatus('No cleaned transcript available to download.', 'error');
        return;
    }

    // Create blob and download
    const blob = new Blob([cleanedTranscript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${originalFileName}_cleaned.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showStatus('Markdown file downloaded successfully!', 'success');
});
