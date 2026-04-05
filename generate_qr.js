const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// INTERNAL IP ADDRESS (Found via ipconfig)
const localIP = '192.168.1.42'; 
const port = '3000';

const reportUrl = `http://${localIP}:${port}/report.html`;
const dashboardUrl = `http://${localIP}:${port}/index.html`;

const outputDir = path.join(__dirname, 'public', 'assets', 'qr');

if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Generating QR Codes for network IP: ${localIP}...`);

// Generate for Report Page
QRCode.toFile(path.join(outputDir, 'report_qr.png'), reportUrl, {
    color: {
        dark: '#2E7D32',  // Eco-friendly green
        light: '#FFFFFF'
    },
    width: 600,
    margin: 2
}, (err) => {
    if (err) throw err;
    console.log(`- Report QR: ${reportUrl}`);
});

// Generate for Dashboard
QRCode.toFile(path.join(outputDir, 'dashboard_qr.png'), dashboardUrl, {
    color: {
        dark: '#2E7D32',
        light: '#FFFFFF'
    },
    width: 600,
    margin: 2
}, (err) => {
    if (err) throw err;
    console.log(`- Dashboard QR: ${dashboardUrl}`);
});
