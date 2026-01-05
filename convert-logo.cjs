const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function convertLogo() {
    const inputPath = path.join(__dirname, 'assets', 'logo.avif');
    const assetsDir = path.join(__dirname, 'assets');
    
    // Ensure assets directory exists
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    try {
        // Convert to PNG for HTML/UI usage
        await sharp(inputPath)
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(assetsDir, 'logo.png'));
        console.log('✓ Created logo.png (512x512)');

        // Create smaller PNG for UI
        await sharp(inputPath)
            .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(assetsDir, 'logo-small.png'));
        console.log('✓ Created logo-small.png (128x128)');

        // Create icon sizes for Windows
        const iconSizes = [16, 24, 32, 48, 64, 128, 256];
        for (const size of iconSizes) {
            await sharp(inputPath)
                .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .png()
                .toFile(path.join(assetsDir, `icon-${size}.png`));
            console.log(`✓ Created icon-${size}.png`);
        }

        console.log('\n✅ All logo files created successfully!');
        console.log('\nNote: For .ico file, you may need to use a tool like png-to-ico or ImageMagick');
        console.log('Or use the 256x256 icon-256.png directly in Electron');
    } catch (error) {
        console.error('Error converting logo:', error);
    }
}

convertLogo();
