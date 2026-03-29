const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

function createExcelTemplate() {
  // Create headers
  const headers = [
    'RAZON SOCIAL',
    'LOCALIDAD',
    'DIRECCION',
    'IDENTIFICACION / CODIGO USUARIO',
    'REFERENCIA DE ENTREGA'
  ];

  // Create sample data
  const sampleData = [
    ['Empresa Ejemplo S.A.S', 'Bogotá', 'Calle 123 # 45-67', '900123456-1', 'Pedido #001'],
    ['Comercial ABC Ltda', 'Medellín', 'Carrera 10 # 5-20', '800987654-3', 'Orden #12345'],
    ['Servicios XYZ', 'Cali', 'Avenida 5N # 12-34', '901234567-8', 'Guía #98765']
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

  // Set column widths
  ws['!cols'] = [
    { wch: 35 }, // RAZON SOCIAL
    { wch: 20 }, // LOCALIDAD
    { wch: 40 }, // DIRECCION
    { wch: 35 }, // IDENTIFICACION
    { wch: 30 }  // REFERENCIA
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Guías');

  // Generate buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return buffer;
}

function saveExcelTemplate(filePath) {
  const buffer = createExcelTemplate();
  fs.writeFileSync(filePath, buffer);
  console.log(`✓ Excel template saved to: ${filePath}`);
}

// If run directly
if (require.main === module) {
  const templatePath = path.join(__dirname, '..', 'templates', 'plantilla_guias.xlsx');
  
  // Create templates directory if not exists
  const templatesDir = path.dirname(templatePath);
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
  saveExcelTemplate(templatePath);
}

module.exports = { createExcelTemplate, saveExcelTemplate };