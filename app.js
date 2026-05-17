// Grab your UI pieces using your custom framework's shorthand
const uploadBtn = painless.get('#uploadImage');
const cameraInput = painless.get('#cameraInput');
const imageDisplayDiv = painless.get('#image');
const stepsDisplayDiv = painless.get('#cleaningSteps');

// Tap the hidden camera input when clicking your styled button
painless.onClick(uploadBtn, () => {
    cameraInput.click();
});

// Run this the second the user snaps their image
cameraInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    painless.alertPlus("Loading your space...", "#087035");

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = reader.result;

        // Show the taken picture instantly on the page
        imageDisplayDiv.innerHTML = `<img src="${base64String}" style="max-width: 100%; border-radius: 5px; margin-top: 15px;" />`;
        
        // Save the raw text string locally on the user's phone via your library
        painless.save('last_cleanup_photo', base64String);

        painless.alertPlus("Analyzing with Gemini AI...", "#130954");
        stepsDisplayDiv.innerHTML = "<p>Reading image metadata... Please wait.</p>";

        try {
            // Hit your painlesseasy backend route running on port 5000
            const response = await fetch('https://cleanerupper.onrender.com/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64String })
            });

            const data = await response.json();

            if (data.success) {
                painless.alertPlus("Success!", "#087035");
                stepsDisplayDiv.innerHTML = `
                    <hr>
                    <h3 style="margin-top: 15px;">Your Cleanup Plan:</h3>
                    <div style="white-space: pre-wrap; font-size: 15px; margin-top: 10px; line-height: 1.6;">
                        ${data.steps}
                    </div>
                `;
            } else {
                stepsDisplayDiv.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
            }

        } catch (error) {
            console.error(error);
            stepsDisplayDiv.innerHTML = "<p style='color: red;'>Could not reach your custom backend engine.</p>";
        }
    };

    reader.readAsDataURL(file);
});
