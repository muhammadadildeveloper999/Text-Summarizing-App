function selectFile() {
    document.getElementById('file-upload-input').click();
}

function handleFileUpload(files) {
    const selectedFile = files[0];
    const fileNameElement = document.getElementById('selected-file-name');
    const fileSizeElement = document.getElementById('selected-file-size');
    const submitButton = document.getElementById('submit-button');
    const submitButtonContainer = document.querySelector('.submit-container');
    const removeFileIcon = document.getElementById('remove-file-icon');

    if (selectedFile) {
        fileNameElement.innerHTML = `<i class="far fa-file-alt"></i> ${selectedFile.name}`;
        fileSizeElement.textContent = `    ${(selectedFile.size / 1024).toFixed(2)} KB`;

        // Show the submit button and remove file icon
        submitButton.style.display = 'block';
        submitButtonContainer.style.display = 'flex';
        removeFileIcon.style.display = 'inline-block';
    } else {
        submitButtonContainer.style.display = 'none';
        fileNameElement.textContent = '';
        fileSizeElement.textContent = '';

        // Hide the submit button and remove file icon when no file is selected
        submitButton.style.display = 'none';
        removeFileIcon.style.display = 'none';
    }
}

// Function to remove the selected file
function removeSelectedFile() {
    const fileInput = document.getElementById('file-upload-input');
    fileInput.value = ''; // Clear the selected file
    handleFileUpload([]); // Update the display
}

function updateSummary(summaryText) {
    const summaryContainer = document.getElementById('summary-container');
    summaryContainer.style.display = 'block'; // Show the summary container
    summaryContainer.style.backgroundColor = 'rgb(14, 41, 41)'; // Set the background color to white
    summaryContainer.innerHTML = `<p>${summaryText}</p>`;
}

function submitFile() {
    const fileInput = document.getElementById('file-upload-input');
    const selectedFile = fileInput.files[0];

    if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const loadingIndicatorContainer = document.getElementById('loading-indicator-container');

        loadingIndicatorContainer.style.display = 'block';

        fetch('/SummarizeView', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }
            return response.json(); // Parse the JSON response
        })
        .then(summary => {
            loadingIndicatorContainer.style.display = 'none'; // Hide the loading indicator
            updateSummary(summary.summary); // Display the summary text
        })
        .catch(error => {
            console.error('API call failed:', error);
            loadingIndicatorContainer.style.display = 'none'; // Hide the loading indicator on error
            updateSummary('API call failed: ' + error.message); // Display an error message
        });
    }
}