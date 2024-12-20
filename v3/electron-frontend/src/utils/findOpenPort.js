export async function findOpenPort(startPort = 6125, endPort = 6135) {
    let openPort = null;
    // TODO: add a timeout on this

    for (let port = startPort; port <= endPort; port++) {
        try {
            // Attempt to fetch from each port
            const response = await fetch(`http://localhost:${port}`).catch(e => console.log(e.message));
            console.log("checking port " + port);
            // Check if the response is successful
            if (response.ok) {
                const text = await response.text();
                if (text === "Screentime API!") {
                    openPort = port;
                    console.log(`Open port found: ${openPort}`);
                    break;  // Exit the loop if an open port is found
                }

            }
        } catch (error) {
            // Ignore errors and continue to the next port
            continue;
        }
    }

    if (openPort === null) {
        console.log("No open ports found in the specified range.");
    }

    return openPort;  // Return the open port or null if none were found
}