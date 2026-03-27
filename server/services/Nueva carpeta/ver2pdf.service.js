const puppeteer = require('puppeteer');

class PDFService {
  // Generar código de barras SVG simple
  generateBarcodeSVG(guideNumber) {
    const bars = [];
    let x = 0;
    
    for (let i = 0; i < guideNumber.length; i++) {
      const charCode = guideNumber.charCodeAt(i);
      const barWidth = 2 + (charCode % 3);
      bars.push(`<rect x="${x}" y="0" width="${barWidth}" height="40" fill="black"/>`);
      x += barWidth + 1;
    }
    
    const svgWidth = x;
    
    return `
      <svg width="${svgWidth}" height="60" xmlns="http://www.w3.org/2000/svg">
        <g>${bars.join('')}</g>
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
      <div class="guide" style="
        border: 1.5px solid #333;
        padding: 8px;
        font-family: Arial, sans-serif;
        font-size: 9px;
        height: 360px;
        box-sizing: border-box;
        position: relative;
        background: white;
      ">
        <!-- Header con Logo -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 4px;">
          <div style="flex: 1;">
            ${logo ? `<img src="${logo}" style="max-height: 40px; max-width: 150px; margin-bottom: 3px;" />` : ''}
            <div style="font-weight: bold; font-size: 10px; color: ${primaryColor};">Mekaplus Express S.A.S NIT. 901505437-1</div>
            <div style="font-size: 8px; color: #555;">REMITTE Y DIRECCIÓN<br>Organización Sayco Acinpro-OSA<br>Calle.41 No.43 - 128 Ofic 11 Centro</div>
          </div>
          <div style="text-align: right;">
            <div style="border: 1.5px solid ${primaryColor}; padding: 3px 8px; border-radius: 3px; background: #f0f8ff;">
              <div style="font-weight: bold; color: ${primaryColor}; font-size: 9px;">FECHA DE ENTREGA:</div>
              <div style="font-size: 10px; font-weight: bold;">${guide.fechaEntrega ? new Date(guide.fechaEntrega).toLocaleDateString() : '_______________'}</div>
            </div>
            <div style="margin-top: 3px; font-size: 8px;">Hora: ${guide.horaEntrega || '__________'}</div>
          </div>
        </div>

        <!-- Información Principal -->
        <div style="border: 1.5px solid #333; padding: 5px; margin-bottom: 5px; background: #fafafa;">
          <div style="margin-bottom: 2px;"><strong style="color: ${primaryColor};">RAZON SOCIAL:</strong> ${guide.razonSocial}</div>
          <div style="margin-bottom: 2px;"><strong style="color: ${primaryColor};">DIRECCION:</strong> ${guide.direccion}</div>
          <div style="margin-bottom: 2px;"><strong style="color: ${primaryColor};">CIUDAD:</strong> ${guide.localidad}</div>
          <div><strong style="color: ${primaryColor};">LIQUIDACION No.</strong> _______________</div>
        </div>

        <!-- Sección Central -->
        <div style="display: flex; gap: 5px; margin-bottom: 5px;">
          <!-- Checklist -->
          <div style="flex: 1; border: 1.5px solid #333; padding: 4px; background: #fff;">
            <div style="margin-bottom: 1px; font-size: 8px;">☐ ENTREGA EFECTIVA</div>
            <div style="margin-bottom: 1px; font-size: 8px;">☐ INTENTO DE ENTREGA</div>
            <div style="margin-bottom: 1px; font-size: 8px;">☐ DEV.DIR INCOMPLETA</div>
            <div style="margin-bottom: 1px; font-size: 8px;">☐ DEV. DESCONOCIDO</div>
            <div style="margin-bottom: 1px; font-size: 8px;">☐ DEV.NO EXISTE</div>
            <div style="margin-bottom: 1px; font-size: 8px;">☐ DEV. CAMBIO DE DOMICILIO</div>
            <div style="margin-bottom: 1px; font-size: 8px;">☐ DEV.OTROS</div>
            <div style="margin-bottom: 1px; font-size: 8px;">☐ DEV.FALLECIDO</div>
            <div style="font-size: 8px;">☐ DEV. NO RECIBIDA</div>
          </div>

          <!-- Inmueble -->
          <div style="border: 1.5px solid #333; padding: 3px; width: 85px;">
            <div style="font-weight: bold; font-size: 8px; margin-bottom: 3px; writing-mode: vertical-rl; transform: rotate(180deg); float: left; margin-right: 3px; height: 70px;">INMUEBLE</div>
            <div style="margin-left: 15px; margin-bottom: 1px; font-size: 8px;">☐ Casa</div>
            <div style="margin-left: 15px; margin-bottom: 1px; font-size: 8px;">☐ Edificio</div>
            <div style="margin-left: 15px; margin-bottom: 1px; font-size: 8px;">☐ Negocio</div>
            <div style="margin-left: 15px; font-size: 8px;">☐ Conjunto</div>
          </div>

          <!-- Piso -->
          <div style="border: 1.5px solid #333; padding: 3px; width: 40px;">
            <div style="font-weight: bold; font-size: 8px; margin-bottom: 3px; writing-mode: vertical-rl; transform: rotate(180deg); float: left; margin-right: 2px; height: 70px;">PISO</div>
            <div style="margin-left: 12px; margin-bottom: 1px; font-size: 8px;">☐ 1</div>
            <div style="margin-left: 12px; margin-bottom: 1px; font-size: 8px;">☐ 2</div>
            <div style="margin-left: 12px; margin-bottom: 1px; font-size: 8px;">☐ 3</div>
            <div style="margin-left: 12px; margin-bottom: 1px; font-size: 8px;">☐ 4</div>
            <div style="margin-left: 12px; font-size: 8px;">☐ +4</div>
          </div>

          <!-- Recibido -->
          <div style="flex: 1.2; border: 1.5px solid #333; padding: 4px;">
            <div style="font-weight: bold; font-size: 8px; margin-bottom: 5px; text-align: center;">RECIBE A CONFORMIDAD<br>(NOMBRE LEGIBLE, SELLO Y.D.I)</div>
            <div style="border-bottom: 1px solid #333; height: 30px; margin-bottom: 3px;"></div>
            <div style="font-size: 8px;">CC. _________________________</div>
          </div>
        </div>

        <!-- Tipo de Puerta -->
        <div style="border: 1.5px solid #333; padding: 4px; margin-bottom: 5px; background: #fafafa;">
          <div style="font-weight: bold; margin-bottom: 3px; font-size: 8px;">Puerta:</div>
          <div style="display: flex; gap: 15px; font-size: 8px;">
            <div>☐ Madera</div>
            <div>☐ Vidrio</div>
            <div>☐ Otros</div>
            <div>☐ Metal</div>
            <div>☐ Aluminio</div>
          </div>
        </div>

        <!-- Footer con Barcode -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #ddd; padding-top: 4px;">
          <div style="background: white; padding: 2px;">
            ${barcodeSVG}
          </div>
          <div style="text-align: right; font-size: 8px;">
            <div>Quien Entrega: _________________________</div>
            <div style="margin-top: 2px; color: #666;">${guide.referenciaEntrega || ''}</div>
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
      
      // Letter size: 8.5 x 11 inches
      await page.setViewport({ width: 816, height: 1056 });

      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page {
              size: letter;
              margin: 0.3in;
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
              gap: 0.05in;
            }
            .guide {
              page-break-inside: avoid;
            }
            .cut-line {
              border-top: 1px dashed #999;
              margin: 0.02in 0;
              opacity: 0.5;
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
          htmlContent += `<div class="guide">${guideHTML}</div>`;
          
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
          top: '0.3in',
          right: '0.3in',
          bottom: '0.3in',
          left: '0.3in'
        },
        displayHeaderFooter: false
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