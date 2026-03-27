const XLSX = require('xlsx');

class ExcelService {
  parseExcel(buffer) {
    console.log('=== [EXCEL SERVICE] parseExcel ===');
    console.log('Buffer type:', typeof buffer);
    console.log('Buffer is Buffer:', Buffer.isBuffer(buffer));
    console.log('Buffer length:', buffer ? buffer.length : 'N/A');
    
    if (!buffer) {
      throw new Error('El buffer del archivo Excel es undefined o null');
    }
    
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('El buffer no es una instancia válida de Buffer');
    }

    try {
      const workbook = XLSX.read(buffer, {
        type: 'buffer',
        cellDates: true
      });

      console.log('Workbooks sheets:', workbook.SheetNames);

      if (workbook.SheetNames.length === 0) {
        throw new Error('El archivo Excel no contiene ninguna hoja');
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      console.log('Worksheet keys:', Object.keys(worksheet).length);

      // Convert to JSON with header row
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: ''
      });

      console.log('=== DATOS DEL EXCEL ===');
      console.log('Total de filas:', data.length);
      if (data.length > 0) {
        console.log('Primera fila (headers):', data[0]);
        console.log('Segunda fila (primer dato):', data[1]);
      }
      console.log('======================');

      if (data.length === 0) {
        throw new Error('El archivo Excel está vacío. Agrega al menos una fila de datos.');
      }

      // First row is headers
      const headers = data[0].map(h => String(h).trim().toUpperCase());
      console.log('Headers normalizados:', headers);
      
      // Validate required headers
      const requiredHeaders = [
        'RAZON SOCIAL',
        'LOCALIDAD',
        'DIRECCION',
        'IDENTIFICACION / CODIGO USUARIO',
        'REFERENCIA DE ENTREGA'
      ];

      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`Faltan las columnas requeridas: ${missingHeaders.join(', ')}. Columnas encontradas: ${headers.join(', ')}`);
      }

      // Map data rows to guide objects
      const guides = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        
        // Skip empty rows
        if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
          console.log(`Fila ${i + 1} saltada (vacía)`);
          continue;
        }

        const guide = {
          razonSocial: this.getCell(row, headers, 'RAZON SOCIAL'),
          localidad: this.getCell(row, headers, 'LOCALIDAD'),
          direccion: this.getCell(row, headers, 'DIRECCION'),
          identificacionUsuario: this.getCell(row, headers, 'IDENTIFICACION / CODIGO USUARIO'),
          referenciaEntrega: this.getCell(row, headers, 'REFERENCIA DE ENTREGA')
        };

        console.log(`Fila ${i + 1}:`, guide);

        // Validate required fields
        if (!guide.razonSocial || !guide.direccion) {
          throw new Error(`Fila ${i + 1}: Razón Social y Dirección son obligatorios. Datos: ${JSON.stringify(guide)}`);
        }

        guides.push(guide);
      }

      if (guides.length === 0) {
        throw new Error('No se encontraron datos válidos en el archivo Excel. Verifica que haya al menos una fila con datos después de los encabezados.');
      }

      console.log(`✅ Total de guías procesadas: ${guides.length}`);
      return guides;
      
    } catch (error) {
      console.error('❌ Error procesando Excel:', error.message);
      throw error;
    }
  }

  getCell(row, headers, headerName) {
    const index = headers.findIndex(h => h === headerName);
    if (index === -1) {
      console.warn(`Columna "${headerName}" no encontrada. Índices disponibles: 0-${row.length - 1}`);
      return '';
    }
    const value = row[index];
    return value ? String(value).trim() : '';
  }

  validateExcelStructure(headers) {
    const requiredHeaders = [
      'RAZON SOCIAL',
      'LOCALIDAD', 
      'DIRECCION',
      'IDENTIFICACION / CODIGO USUARIO',
      'REFERENCIA DE ENTREGA'
    ];

    const missing = requiredHeaders.filter(h => !headers.includes(h));
    return {
      valid: missing.length === 0,
      missing
    };
  }
}

module.exports = new ExcelService();