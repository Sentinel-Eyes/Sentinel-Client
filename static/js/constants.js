const vonnUrl = "https://climbing-smashing-grouse.ngrok-free.app";
const shynUrl = "https://gorgeous-bengal-innocent.ngrok-free.app";
let urlAPI = ""
const servers = [
    { url: vonnUrl, host: "Vonn is Hosting" },
    { url: shynUrl, host: "Shyn is Hosting" }
];

function checkServerAndUpdateLink(server, callback) {
    $.ajax({
        url: `${server.url}/server_status/`,
        method: "GET",
        success: function () {
            console.log(`${server.url} is up and running. ${server.host}`);
            callback(server); // Call the callback with the server info
        },
        error: function () {
            console.error(`${server.url} is not reachable. Server may be down. ${server.host}`);
            // Display an error message or take other actions as needed
        }
    });
}

function updateLink(server) {
    $('#admin-link').attr('href', server.url + '/admin');
    urlAPI = server.url;
    $('#host-status').text(server.host);
}

// Loop through the servers array and check each server
servers.forEach(server => {
    checkServerAndUpdateLink(server, updateLink);
});