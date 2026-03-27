const fs = require('fs');
const path = require('path');

function createUploadsDirectory() {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✓ Uploads directory created');
  }
}

module.exports = createUploadsDirectory;