const puppeteer = require('puppeteer');

class PDFService {
  // Función simple para generar un código de barras en formato texto/SVG
  generateBarcodeSVG(guideNumber) {
    // Generamos un SVG simple que simula un código de barras
    // En producción podrías usar una librería como bwip-js que no requiere canvas
    const bars = [];
    let x = 0;
    
    // Generar barras pseudo-aleatorias basadas en el número de guía
    for (let i = 0; i < guideNumber.length; i++) {
      const charCode = guideNumber.charCodeAt(i);
      const barWidth = 2 + (charCode % 3);
      bars.push(`<rect x="${x}" y="0" width="${barWidth}" height="40" fill="black"/>`);
      x += barWidth + 1;
    }
    
    const svgWidth = x;
    
    return `
      <svg width="${svgWidth}" height="60" xmlns="http://www.w3.org/2000/svg">
        <g>
          ${bars.join('')}
        </g>
        <text x="${svgWidth / 2}" y="55" text-anchor="middle" font-family="Arial" font-size="10" fill="black">
          ${guideNumber}
        </text>
      </svg>
    `;
  }

  generateGuideHTML(guide, config, settings) {
    const barcodeSVG = this.generateBarcodeSVG(guide.guideNumber);
    const logo = config?.logo || '';
    const primaryColor = config?.primaryColor || '#0066CC';

    return `
      <div class="guide-container" style="border: 2px solid #000; padding: 15px; font-family: Arial, sans-serif; font-size: 11px; height: 350px; box-sizing: border-box;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 5px;">
          <div style="flex: 1;">
            ${logo ? `<img src="${logo}" style="max-height: 50px; max-width: 200px;" />` : ''}
            <div style="margin-top: 5px; font-weight: bold;">Mekaplus Express S.A.S NIT. 901505437-1</div>
            <div style="font-size: 9px;">REMITTE Y DIRECCIÓN<br>Organización Sayco Acinpro-OSA<br>Calle.41 No.43 - 128 Ofic 11 Centro</div>
          </div>
          <div style="text-align: right;">
            <div style="border: 2px solid ${primaryColor}; padding: 5px 15px; border-radius: 5px;">
              <div style="font-weight: bold; color: ${primaryColor};">FECHA DE ENTREGA:</div>
              <div>${guide.fechaEntrega ? new Date(guide.fechaEntrega).toLocaleDateString() : '_______________'}</div>
            </div>
            <div style="margin-top: 5px;">Hora de entrega: ${guide.horaEntrega || '__________'}</div>
          </div>
        </div>

        <!-- Main Info -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 10px;">
          <div style="margin-bottom: 5px;"><strong>RAZON SOCIAL:</strong> ${guide.razonSocial}</div>
          <div style="margin-bottom: 5px;"><strong>DIRECCION:</strong> ${guide.direccion}</div>
          <div style="margin-bottom: 5px;"><strong>CIUDAD:</strong> ${guide.localidad}</div>
          <div><strong>LIQUIDACION No.</strong> _______________</div>
        </div>

        <!-- Checklist and Property Info -->
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
          <!-- Checklist -->
          <div style="flex: 1; border: 2px solid #000; padding: 5px;">
            <div style="margin-bottom: 3px;">☐ ENTREGA EFECTIVA</div>
            <div style="margin-bottom: 3px;">☐ INTENTO DE ENTREGA</div>
            <div style="margin-bottom: 3px;">☐ DEV.DIR INCOMPLETA</div>
            <div style="margin-bottom: 3px;">☐ DEV. DESCONOCIDO</div>
            <div style="margin-bottom: 3px;">☐ DEV.NO EXISTE</div>
            <div style="margin-bottom: 3px;">☐ DEV. CAMBIO DE DOMICILIO</div>
            <div style="margin-bottom: 3px;">☐ DEV.OTROS</div>
            <div style="margin-bottom: 3px;">☐ DEV.FALLECIDO</div>
            <div>☐ DEV. NO RECIBIDA</div>
          </div>

          <!-- Property Type -->
          <div style="border: 2px solid #000; padding: 5px; width: 120px;">
            <div style="font-weight: bold; margin-bottom: 5px; writing-mode: vertical-rl; transform: rotate(180deg); position: absolute; left: 2px;">INMUEBLE</div>
            <div style="margin-left: 20px; margin-bottom: 3px;">☐ Casa</div>
            <div style="margin-left: 20px; margin-bottom: 3px;">☐ Edificio</div>
            <div style="margin-left: 20px; margin-bottom: 3px;">☐ Negocio</div>
            <div style="margin-left: 20px;">☐ Conjunto</div>
          </div>

          <!-- Floor -->
          <div style="border: 2px solid #000; padding: 5px; width: 60px;">
            <div style="font-weight: bold; margin-bottom: 5px; writing-mode: vertical-rl; transform: rotate(180deg); position: absolute; left: 2px;">PISO</div>
            <div style="margin-left: 20px; margin-bottom: 3px;">☐ 1</div>
            <div style="margin-left: 20px; margin-bottom: 3px;">☐ 2</div>
            <div style="margin-left: 20px; margin-bottom: 3px;">☐ 3</div>
            <div style="margin-left: 20px; margin-bottom: 3px;">☐ 4</div>
            <div style="margin-left: 20px;">☐ +4</div>
          </div>

          <!-- Reception -->
          <div style="flex: 2; border: 2px solid #000; padding: 5px;">
            <div style="font-weight: bold; margin-bottom: 10px;">RECIBE A CONFORMIDAD (NOMBRE LEGIBLE, SELLO Y.D.I)</div>
            <div style="border-bottom: 1px solid #000; height: 40px; margin-bottom: 5px;"></div>
            <div>CC. _________________________</div>
          </div>
        </div>

        <!-- Door Type -->
        <div style="border: 2px solid #000; padding: 5px; margin-bottom: 10px;">
          <div style="font-weight: bold; margin-bottom: 5px;">Puerta:</div>
          <div style="display: flex; gap: 20px;">
            <div>☐ Madera</div>
            <div>☐ Vidrio</div>
            <div>☐ Otros</div>
            <div>☐ Metal</div>
            <div>☐ Aluminio</div>
          </div>
        </div>

        <!-- Barcode and Footer -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="background: white; padding: 5px; border: 1px solid #000;">
              ${barcodeSVG}
            </div>
          </div>
          <div style="text-align: right;">
            <div>Quien Entrega: _________________________</div>
            <div style="margin-top: 5px; font-size: 9px;">${guide.referenciaEntrega || ''}</div>
          </div>
        </div>
      </div>
    `;
  }

  async generateGuidesPDF(guides, config, settings) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Set paper size to Letter (8.5 x 11 inches)
      await page.setViewport({ width: 816, height: 1056 });

      // Generate HTML for all guides (3 per page)
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page {
              size: letter;
              margin: 0.5in;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            .page {
              width: 8.5in;
              height: 11in;
              page-break-after: always;
              display: flex;
              flex-direction: column;
              gap: 0.1in;
            }
            .guide-wrapper {
              flex: 1;
              page-break-inside: avoid;
            }
            .cut-line {
              border-top: 1px dashed #999;
              margin: 0.05in 0;
            }
            @media print {
              .page {
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
      `;

      // Group guides into pages (3 per page)
      const pages = [];
      for (let i = 0; i < guides.length; i += 3) {
        pages.push(guides.slice(i, i + 3));
      }

      pages.forEach((pageGuides, pageIndex) => {
        htmlContent += `<div class="page">`;
        
        pageGuides.forEach((guide, index) => {
          const guideHTML = this.generateGuideHTML(guide, config, settings);
          htmlContent += `<div class="guide-wrapper">${guideHTML}</div>`;
          
          // Add cut line between guides (except after the last one)
          if (index < pageGuides.length - 1) {
            htmlContent += `<div class="cut-line"></div>`;
          }
        });

        htmlContent += `</div>`;
      });

      htmlContent += `</body></html>`;

      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      const pdfBuffer = await page.pdf({
        format: 'letter',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      });

      await browser.close();
      return pdfBuffer;

    } catch (error) {
      await browser.close();
      throw error;
    }
  }
}

module.exports = new PDFService();