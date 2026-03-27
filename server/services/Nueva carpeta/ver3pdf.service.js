const puppeteer = require('puppeteer');

class PDFService {
  generateGuideHTML(guide, config, settings) {
    const logo = config?.logo || '';
    const primaryColor = config?.primaryColor || '#0066CC';

    return `
      <div class="guide" style="
        border: 1px solid #333;
        padding: 6px;
        font-family: Arial, sans-serif;
        font-size: 8px;
        height: 365px;
        box-sizing: border-box;
        background: white;
        position: relative;
      ">
        <!-- Header con Logo e Información de Entrega -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
          <div style="flex: 1;">
            ${logo ? `<img src="${logo}" style="max-height: 45px; max-width: 180px;" />` : 
            '<div style="font-size: 14px; font-weight: bold; color: #0066CC;">MEKA PLUSS<br><span style="font-size: 10px; color: #CC0000;">EXPRESS S.A.S</span></div>'}
          </div>
          <div style="text-align: right;">
            <div style="margin-bottom: 3px;">
              <span style="font-weight: bold;">FECHA DE ENTREGA:</span>
              <span style="border: 1px solid #00aa00; padding: 2px 15px; margin-left: 5px; display: inline-block; min-width: 100px;">
                ${guide.fechaEntrega ? new Date(guide.fechaEntrega).toLocaleDateString() : ''}
              </span>
            </div>
            <div>Hora de entrega: ${guide.horaEntrega || '__________'}</div>
          </div>
        </div>

        <!-- Información del Remitente -->
        <div style="font-size: 7px; color: #555; margin-bottom: 5px; border-left: 2px solid #0066CC; padding-left: 5px;">
          <div style="font-weight: bold; font-size: 9px; margin-bottom: 2px;">Mekaplus Express S.A.S NIT. 901505437-1</div>
          <div style="font-weight: bold; color: #0066CC;">REMITTE Y DIRECCIÓN</div>
          <div>Organización Sayco Acinpro-OSA</div>
          <div>Calle.41 No.43 - 128 Ofic 11 Centro</div>
        </div>

        <!-- Información del Destinatario -->
        <div style="border: 1px solid #333; padding: 5px; margin-bottom: 5px; background: #f9f9f9;">
          <div style="margin-bottom: 3px;"><strong style="color: #0066CC;">RAZON SOCIAL:</strong> ${guide.razonSocial}</div>
          <div style="margin-bottom: 3px;"><strong style="color: #0066CC;">DIRECCION:</strong> ${guide.direccion}</div>
          <div style="margin-bottom: 3px;"><strong style="color: #0066CC;">CIUDAD:</strong> ${guide.localidad}</div>
          <div><strong style="color: #0066CC;">LIQUIDACION No.</strong> _______________</div>
        </div>

        <!-- Sección Central: Checklist, Inmueble, Piso y Recibido -->
        <div style="display: flex; gap: 4px; margin-bottom: 5px;">
          <!-- Checklist de Estados -->
          <div style="flex: 1.1; border: 1px solid #333; padding: 3px;">
            <div style="margin-bottom: 1px; font-size: 7.5px;">☐ ENTREGA EFECTIVA</div>
            <div style="margin-bottom: 1px; font-size: 7.5px;">☐ INTENTO DE ENTREGA</div>
            <div style="margin-bottom: 1px; font-size: 7.5px;">☐ DEV.DIR INCOMPLETA</div>
            <div style="margin-bottom: 1px; font-size: 7.5px;">☐ DEV. DESCONOCIDO</div>
            <div style="margin-bottom: 1px; font-size: 7.5px;">☐ DEV.NO EXISTE</div>
            <div style="margin-bottom: 1px; font-size: 7.5px;">☐ DEV. CAMBIO DE DOMICILIO</div>
            <div style="margin-bottom: 1px; font-size: 7.5px;">☐ DEV.OTROS</div>
            <div style="margin-bottom: 1px; font-size: 7.5px;">☐ DEV.FALLECIDO</div>
            <div style="font-size: 7.5px;">☐ DEV. NO RECIBIDA</div>
          </div>

          <!-- Tipo de Inmueble -->
          <div style="border: 1px solid #333; padding: 3px; width: 80px;">
            <div style="font-weight: bold; font-size: 7px; margin-bottom: 3px; writing-mode: vertical-rl; transform: rotate(180deg); float: left; margin-right: 2px; height: 65px; letter-spacing: 2px;">INMUEBLE</div>
            <div style="margin-left: 12px; margin-bottom: 2px; font-size: 7.5px;">☐ Casa</div>
            <div style="margin-left: 12px; margin-bottom: 2px; font-size: 7.5px;">☐ Edificio</div>
            <div style="margin-left: 12px; margin-bottom: 2px; font-size: 7.5px;">☐ Negocio</div>
            <div style="margin-left: 12px; font-size: 7.5px;">☐ Conjunto</div>
          </div>

          <!-- Piso -->
          <div style="border: 1px solid #333; padding: 3px; width: 38px;">
            <div style="font-weight: bold; font-size: 7px; margin-bottom: 3px; writing-mode: vertical-rl; transform: rotate(180deg); float: left; margin-right: 2px; height: 65px; letter-spacing: 1px;">PISO</div>
            <div style="margin-left: 10px; margin-bottom: 2px; font-size: 7.5px;">☐ 1</div>
            <div style="margin-left: 10px; margin-bottom: 2px; font-size: 7.5px;">☐ 2</div>
            <div style="margin-left: 10px; margin-bottom: 2px; font-size: 7.5px;">☐ 3</div>
            <div style="margin-left: 10px; margin-bottom: 2px; font-size: 7.5px;">☐ 4</div>
            <div style="margin-left: 10px; font-size: 7.5px;">☐ +4</div>
          </div>

          <!-- Recibido -->
          <div style="flex: 1.3; border: 1px solid #333; padding: 4px;">
            <div style="font-weight: bold; font-size: 7px; margin-bottom: 5px; text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 2px;">
              RECIBE A CONFORMIDAD<br>(NOMBRE LEGIBLE, SELLO Y.D.I)
            </div>
            <div style="height: 28px; margin-bottom: 3px;"></div>
            <div style="font-size: 7px;">CC. _________________________</div>
          </div>
        </div>

        <!-- Tipo de Puerta -->
        <div style="border: 1px solid #333; padding: 4px; margin-bottom: 5px;">
          <div style="display: flex; align-items: center; gap: 5px;">
            <div style="font-weight: bold; font-size: 7px; writing-mode: vertical-rl; transform: rotate(180deg); height: 18px; letter-spacing: 1px;">Puerta</div>
            <div style="flex: 1; display: flex; gap: 15px; font-size: 7.5px; margin-left: 3px;">
              <div>☐ Madera</div>
              <div>☐ Vidrio</div>
              <div>☐ Otros</div>
              <div>☐ Metal</div>
              <div>☐ Aluminio</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="display: flex; justify-content: flex-end; align-items: center; font-size: 7px; border-top: 1px solid #ddd; padding-top: 3px;">
          <div style="margin-right: 15px;">Quien Entrega: _________________________</div>
        </div>

        <!-- Referencia (opcional, en la parte inferior) -->
        ${guide.referenciaEntrega ? `<div style="position: absolute; bottom: 2px; left: 6px; font-size: 6px; color: #999; max-width: 60%;">Ref: ${guide.referenciaEntrega}</div>` : ''}
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
      await page.setViewport({ width: 816, height: 1056 });

      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page {
              size: letter;
              margin: 0.35in;
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
              gap: 0.08in;
            }
            .guide {
              page-break-inside: avoid;
            }
            .cut-line {
              border-top: 1px dashed #999;
              margin: 0.03in 0;
              opacity: 0.6;
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

      pages.forEach((pageGuides) => {
        htmlContent += `<div class="page">`;
        
        pageGuides.forEach((guide, index) => {
          const guideHTML = this.generateGuideHTML(guide, config, settings);
          htmlContent += `<div class="guide">${guideHTML}</div>`;
          
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
          top: '0.35in',
          right: '0.35in',
          bottom: '0.35in',
          left: '0.35in'
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