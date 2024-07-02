// src/containers/Core/Utils/debug.js
let debugMode = false; // Default to false

// Check for debug mode in the environment variable
if (process.env.REACT_APP_DEBUG_MODE === 'true') {
    debugMode = true;
}

// Store original console.log function
const originalLog = console.log;

// Override console.log
console.log = (...args) => {
    if (debugMode) {
        originalLog(...args);
    }
};

// Function to manually toggle debug mode
const toggleDebugMode = (newMode) => {
    debugMode = newMode; // Set debugMode to the provided value
    console.log("Debug mode is now", debugMode ? 'enabled' : 'disabled');
};

export { toggleDebugMode };
