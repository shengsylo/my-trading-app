// src/components/Shared/Footer.jsx
import React from 'react';

function Footer() {
    return (
        <footer className="footer fixed-bottom text-light bg-dark">
        <p>&copy; {new Date().getFullYear()} AI-Powered Forex Genius</p>
        {/* Add other footer content (e.g., links, social icons) as needed */}
        </footer>
    );
}

export default Footer;
