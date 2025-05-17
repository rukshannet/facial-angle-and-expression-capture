document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const fileName = document.getElementById('fileName');
    const uploadedImage = document.getElementById('uploadedImage');
    const imagePreviewArea = document.getElementById('image-preview-area');
    const uploadProgress = document.getElementById('uploadProgress');

    // Function to display the uploaded image
    const displayImage = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImage.src = e.target.result;
            imagePreviewArea.classList.remove('is-hidden');
        }
        reader.readAsDataURL(file);
    };

    // Function to send the image to the API
    const sendImageToAPI = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('api_key', 'ruk-5fc8b429-2598-49c2-be91-d74629bc45bb');
        formData.append('service_id', 'face-pose-classifier');
        formData.append('service_name', 'face-pose');

        const apiEndpoint = 'https://llm-backend-service-862538437546.asia-southeast1.run.app/classifyPose';

        try {
            uploadProgress.classList.remove('is-hidden');
            uploadProgress.value = 0;

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                console.error("API Error:", response.status, response.statusText);
                handleApiError("Error classifying image.");
                return;
            }

            const responseData = await response.json();
            console.log("API Response:", responseData);
            handleApiResponse(responseData);

        } catch (error) {
            console.error("Error sending image to API:", error);
            handleApiError("An unexpected error occurred or network error.");
        } finally {
            uploadProgress.classList.add('is-hidden');
        }
    };

    // Function to handle the API response and place the image
    const handleApiResponse = (response) => {
        // Print the full response object for debugging
        console.log("Full API Response:", response);
        // Show the reply section of the response where the file name is displayed
        const fileNameElement = document.getElementById('fileName');
        fileNameElement.textContent = response.reply;

        // Clear previous image from all boxes
        document.querySelectorAll('.pose-box .card-content img').forEach(img => img.remove());

        try {
            const replyJson = JSON.parse(response.reply);
            console.log("Parsed Reply JSON:", replyJson);

            // Assuming 'Angle' and 'Expression' are the relevant fields in the reply
            // You might need to map these to your pose categories
            const predictedAngle = replyJson.Angle;
            const predictedExpression = replyJson.Expression;

            // Determine the poseId based on Angle and Expression
            // This is a placeholder logic, you'll need to implement the actual mapping
            let poseId = 0; // Default to unassigned

            if (predictedAngle === "Front" && predictedExpression === "Relaxed") {
                poseId = 1;
            } else if (predictedAngle === "Right_profile" && predictedExpression === "Relaxed") {
                poseId = 2;
            } else if (predictedAngle === "Left_profile" && predictedExpression === "Relaxed") {
                poseId = 3;
            } else if (predictedAngle === "Right_45DegreeAngle" && predictedExpression === "Relaxed") {
                poseId = 4;
            } else if (predictedAngle === "Left_45DegreeAngle" && predictedExpression === "Relaxed") {
                poseId = 5;
            } else if (predictedAngle === "Front" && predictedExpression === "Active") {
                poseId = 6;
            } else if (predictedAngle === "Right_profile" && predictedExpression === "Active") {
                poseId = 7;
            } else if (predictedAngle === "Left_profile" && predictedExpression === "Active") {
                poseId = 8;
            } else if (predictedAngle === "Right_45DegreeAngle" && predictedExpression === "Active") {
                poseId = 9;
            } else if (predictedAngle === "Left_45DegreeAngle" && predictedExpression === "Active") {
                poseId = 10;
            } else if (predictedAngle === "Closeup_Front" && predictedExpression === "Relaxed") {
                poseId = 11;
            } else if (predictedAngle === "Closeup_Right_45DegreeAngle" && predictedExpression === "Relaxed") {
                poseId = 12;
            } else if (predictedAngle === "Closeup_Left_45DegreeAngle" && predictedExpression === "Relaxed") {
                poseId = 13;
            }

            const targetBoxId = `pose-category-${poseId}`;
            const targetBoxContent = document.getElementById(targetBoxId).querySelector('.card-content');

            if (targetBoxContent) {
                const imgElement = document.createElement('img');
                imgElement.src = uploadedImage.src; // Use the displayed image source
                imgElement.alt = "Classified Pose";
                targetBoxContent.appendChild(imgElement);
            } else {
                console.error("Target pose box not found for ID:", targetBoxId);
                handleApiError("Invalid pose ID received or mapping failed.");
            }
        } catch (e) {
            console.error("Error parsing reply JSON or handling response:", e);
            handleApiError("Error processing API response.");
        }
    };

    // Function to handle API errors
    const handleApiError = (message) => {
        // Display an error message to the user (you could use a modal or an alert)
        alert("Classification failed: " + message);
        // Optionally place the image in the unassigned box on error
        const unassignedBoxContent = document.getElementById('pose-category-0').querySelector('.card-content');
        if (unassignedBoxContent && uploadedImage.src !== '#') {
            // Clear previous image from unassigned box if any
            unassignedBoxContent.querySelectorAll('img').forEach(img => img.remove());
            const imgElement = document.createElement('img');
            imgElement.src = uploadedImage.src;
            imgElement.alt = "Classification Failed";
            unassignedBoxContent.appendChild(imgElement);
        }
    };

    // Event listener for file input change
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];

        if (file) {
            fileName.textContent = file.name;
            displayImage(file);
            sendImageToAPI(file);
        } else {
            fileName.textContent = 'No file selected';
            imagePreviewArea.classList.add('is-hidden');
            // Clear any image from boxes if upload is cancelled
            document.querySelectorAll('.pose-box .card-content img').forEach(img => img.remove());
        }
    });
});
