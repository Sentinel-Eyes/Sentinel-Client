const vonnUrl = "https://climbing-smashing-grouse.ngrok-free.app";
const shynUrl = "https://gorgeous-bengal-innocent.ngrok-free.app";
let urlAPI = ""
function checkServerAndUpdateLink(url, callback, host) {
    $.ajax({
        url: `${url}/server_status/`,
        method: "GET",
        success: function () {
            console.log(`${url} is up and running. ${host}`);
            callback(url); // Call the callback with the URL
        },
        error: function () {
            console.error(`${url} is not reachable. Server may be down. ${host}}`);
            // Display an error message or take other actions as needed
        }
    });
}

// Function to update the link with the given URL
function updateLink(url) {
    $('#admin-link').attr('href', url + '/admin');
    urlAPI = url;
}

// Check vonnUrl
checkServerAndUpdateLink(vonnUrl, updateLink, "Vonn Hosting");

// Check shynUrl
checkServerAndUpdateLink(shynUrl, updateLink, "Shyn Hosting");
