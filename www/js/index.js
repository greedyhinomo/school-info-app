// Wait for Cordova to be fully loaded.
document.addEventListener('deviceready', function() {
    console.log('Cordova is ready!');
    // You can add your Cordova-dependent code here.
}, false);

function loadLocalData() {
    // Path is relative to your index.html file
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            console.log("Data loaded successfully:", data);
            // Now you can use the data, for example:
            // allSchools = data;
            // filterAndRenderSchools();
        })
        .catch(error => {
            console.error("Error loading data.json:", error);
        });
}
