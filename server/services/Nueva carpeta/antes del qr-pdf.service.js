const puppeteer = require('puppeteer');

class PDFService {
  generateGuideHTML(guide, config, settings) {
    const logo = config?.logo || '';
    const companyInfo = this.getCompanyInfo();
    const guideNumber = guide.guideNumber || '_______________';

    return `
      <div class="guide">
        <div class="guide-grid">
          
          <!-- Columna 1: Sidebar Vertical con Logo y Texto Legal -->
          <aside class="sidebar-vertical">
            <div class="sidebar-inner-horizontal">
              <div class="sidebar-logo-small">
                ${logo 
                  ? `<img src="${logo}" alt="Logo" class="sidebar-logo-img" />` 
                  : '<div class="logo-fallback">MEKA<br/>PLUS</div>'
                }
              </div>
              <div class="sidebar-legal-text">
                ${companyInfo.legalText}
              </div>
            </div>
          </aside>

          <!-- Columna 2: Bloque Izquierdo -->
          <section class="left-block">
            <header class="company-header">
              ${logo 
                ? `<img src="${logo}" alt="Mekaplus Express" class="company-logo" />` 
                : '<div class="company-name">MEKAPLUS EXPRESS S.A.S</div>'
              }
            </header>

            <div class="sender-info">
              <div class="info-title">REMITTE Y DIRECCIÓN</div>
              <div class="info-content">${companyInfo.sender}</div>
              <div class="info-address">${companyInfo.address}</div>
              <div class="info-contact">${companyInfo.phone}</div>
              <div class="info-email">${companyInfo.email}</div>
              <div class="info-dept">${companyInfo.department}</div>
            </div>

            <nav class="checklist-container">
              ${this.renderChecklist()}
            </nav>
          </section>

          <!-- Columna 3: Bloque Derecho -->
          <section class="right-block">
            
            <!-- Fecha y Hora verticales, Número de Guía a la derecha -->
            <div class="delivery-header">
              <div class="date-time-section">
                <div class="date-field">
                  <span class="field-label">FECHA DE ENTREGA:</span>
                  <span class="date-value">${this.formatDate(guide.fechaEntrega)}</span>
                </div>
                <div class="time-field">
                  <span class="field-label">Hora de entrega:</span>
                  <span class="time-value">${guide.horaEntrega || '__________'}</span>
                </div>
              </div>
              
              <!-- Número de Guía en esquina superior derecha -->
              <div class="guide-number-section">
                <span class="guide-number-label">No. GUÍA:</span>
                <span class="guide-number-value">${guideNumber}</span>
              </div>
            </div>

            <!-- Datos del Destinatario -->
            <div class="recipient-section">
              <div class="field-row">
                <span class="field-label">RAZON SOCIAL:</span>
                <span class="field-value">${guide.razonSocial}</span>
              </div>
              <div class="field-row">
                <span class="field-label">DIRECCION:</span>
                <span class="field-value">${guide.direccion}</span>
              </div>
              <div class="field-row">
                <span class="field-label">CIUDAD:</span>
                <span class="field-value">${guide.localidad}</span>
              </div>
              <div class="field-row">
                <span class="field-label">LIQUIDACION No.</span>
                <span class="field-value">_______________</span>
              </div>
            </div>

            <!-- Sección: Inmueble, Piso y Firma -->
            <div class="tables-grid">
              
              <!-- Tipo de Inmueble -->
              <div class="property-box">
                <div class="vertical-title">INMUEBLE</div>
                <div class="options-list">
                  <label class="checkbox-item">☐ Casa</label>
                  <label class="checkbox-item">☐ Edificio</label>
                  <label class="checkbox-item">☐ Negocio</label>
                  <label class="checkbox-item">☐ Conjunto</label>
                </div>
              </div>

              <!-- Número de Piso -->
              <div class="floor-box">
                <div class="vertical-title">PISO</div>
                <div class="options-list">
                  <label class="checkbox-item">☐ 1</label>
                  <label class="checkbox-item">☐ 2</label>
                  <label class="checkbox-item">☐ 3</label>
                  <label class="checkbox-item">☐ 4</label>
                  <label class="checkbox-item">☐ +4</label>
                </div>
              </div>

              <!-- Espacio de Firma -->
              <div class="signature-box">
                <div class="signature-title">
                  RECIBE A CONFORMIDAD<br/>
                  <small>(NOMBRE LEGIBLE, SELLO Y.D.I)</small>
                </div>
                <div class="signature-area"></div>
                <div class="id-field">CC. _________________________</div>
              </div>
            </div>

            <!-- Footer: Tipo de Puerta y Quien Entrega -->
            <footer class="guide-footer">
              <div class="door-section">
                <div class="vertical-title-small">Puerta</div>
                <div class="door-options">
                  <label class="checkbox-item">☐ Madera</label>
                  <label class="checkbox-item">☐ Metal</label>
                  <label class="checkbox-item">☐ Vidrio</label>
                  <label class="checkbox-item">☐ Aluminio</label>
                  <label class="checkbox-item">☐ Otros</label>
                </div>
              </div>
              <div class="deliverer-section">
                <div class="deliverer-label">Quien Entrega:</div>
                <div class="signature-mini"></div>
              </div>
            </footer>

          </section>
        </div>
      </div>
    `;
  }

  async generateGuidesPDF(guides, config, settings) {
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ]
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 816, height: 1056 });

      const htmlContent = this.buildCompleteHTML(guides, config, settings);

      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      const pdfBuffer = await page.pdf({
        format: 'letter',
        landscape: false,
        printBackground: true,
        margin: {
          top: '0.2in',
          right: '0.2in',
          bottom: '0.2in',
          left: '0.2in'
        },
        displayHeaderFooter: false
      });

      await browser.close();
      return pdfBuffer;

    } catch (error) {
      await browser.close();
      throw new Error(`Error generando PDF: ${error.message}`);
    }
  }

  buildCompleteHTML(guides, config, settings) {
    const pages = this.groupGuidesIntoPages(guides, 3);

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Guías de Mensajería - Mekaplus Express</title>
        <style>${this.getPrintStyles()}</style>
      </head>
      <body>
        ${pages.map((pageGuides, pageIndex) => this.renderPage(pageGuides, config, settings, pageIndex, pages.length)).join('\n')}
      </body>
      </html>
    `;
  }

  renderPage(guides, config, settings, pageIndex, totalPages) {
    const guidesCount = guides.length;
    
    return `
      <div class="page ${guidesCount === 1 ? 'page-single' : guidesCount === 2 ? 'page-double' : 'page-triple'}">
        ${guides.map((guide, index) => `
          <div class="guide-wrapper">
            ${this.generateGuideHTML(guide, config, settings)}
            ${index < guides.length - 1 ? '<div class="cut-line"></div>' : ''}
          </div>
        `).join('\n')}
        ${guidesCount < 3 ? this.renderEmptyGuides(3 - guidesCount) : ''}
      </div>
    `;
  }

  renderEmptyGuides(count) {
    return Array(count).fill(null).map(() => `
      <div class="guide-wrapper guide-wrapper-empty">
        <div class="guide guide-empty"></div>
      </div>
    `).join('\n');
  }

  getCompanyInfo() {
    return {
      nit: '901505437-1',
      legalText: `
        Mekaplus express S.A.S NIT. 901505437-1<br/>
        Principal: Cartagena Colombia<br/>
        Sec Víctor Blanco Mz.173.LT.10<br/>
        <br/>
        REMITE:<br/>
        Organizacion Sayco Acinpro NIT: 800.021.811-9<br/>
        Telefono: 3115922099<br/>
        Email: DIRECTOR.ZONACUATRO@SYCOACINPRO.ORG.CO<br/>
        Dpto: Atlantico
      `.trim(),
      sender: 'Organizacion Sayco Acinpro NIT: 800.021.811-9',
      address: 'Calle 41 No.43 – 128 Ofic 11 Centro',
      phone: '3115922099',
      email: 'DIRECTOR.ZONACUATRO@SYCOACINPRO.ORG.CO',
      department: 'Dpto: Atlantico'
    };
  }

  renderChecklist() {
    const states = [
      'ENTREGA EFECTIVA',
      'INTENTO DE ENTREGA',
      'DEV.DIR INCOMPLETA',
      'DEV. DESCONOCIDO',
      'DEV.NO EXISTE',
      'DEV. CAMBIO DE DOMICILIO',
      'DEV.OTROS',
      'DEV.FALLECIDO',
      'DEV. NO RECIBIDA'
    ];

    return states.map(state => 
      `<label class="checkbox-item">☐ ${state}</label>`
    ).join('\n');
  }

  formatDate(date) {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  }

  groupGuidesIntoPages(guides, perPage) {
    const pages = [];
    for (let i = 0; i < guides.length; i += perPage) {
      pages.push(guides.slice(i, i + perPage));
    }
    return pages;
  }

  getPrintStyles() {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      @page {
        size: letter;
        margin: 0;
      }

      body {
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
        font-size: 7pt;
        line-height: 1.15;
        color: #000;
        background: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .page {
        width: 8.5in;
        height: 11in;
        padding: 0.2in;
        display: flex;
        flex-direction: column;
        gap: 0.08in;
        page-break-after: always;
        background: white;
      }

      .page:last-child {
        page-break-after: auto;
      }

      .guide-container,
      .guide-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .cut-line {
        border-top: 1px dashed #888;
        margin: 0.04in 0;
        opacity: 0.7;
      }

      .guide {
        flex: 1;
        min-height: 3.15in;
        max-height: 3.15in;
        border: 1px solid #000;
        padding: 0.12in;
        background: white;
        position: relative;
      }

      .guide-empty {
        border: 1px dashed #ddd;
        background: #fafafa;
        opacity: 0;
        pointer-events: none;
      }

      .guide-wrapper-empty {
        flex: 1;
      }

      .guide-grid {
        display: grid;
        grid-template-columns: 0.9in 2.7in 1fr;
        gap: 0.1in;
        height: 100%;
      }

      /* Sidebar Vertical */
      .sidebar-vertical {
        border-right: 1px solid #000;
        padding-right: 0.04in;
        display: flex;
        align-items: center;
      }

      .sidebar-inner-horizontal {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 0.12in;
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        text-align: left;
        font-size: 4.8pt;
        line-height: 1.35;
        width: 100%;
        justify-content: flex-start;
        padding-top: 0.05in;
      }

      .sidebar-logo-small {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-right: 0.02in;
      }

      .sidebar-logo-img {
        max-width: 0.75in;
        max-height: 0.55in;
        object-fit: contain;
        display: block;
        transform: rotate(180deg);
        transform-origin: center center;
      }

      .logo-fallback {
        font-size: 8.5pt;
        font-weight: bold;
        color: #0066CC;
        line-height: 1.1;
        writing-mode: horizontal-tb;
        text-align: center;
      }

      .sidebar-legal-text {
        font-size: 4.8pt;
        color: #000;
        line-height: 1.4;
        flex: 1;
        white-space: nowrap;
      }

      .sidebar-legal-text br + br {
        margin: 0.03in 0;
      }

      /* Bloque Izquierdo */
      .left-block {
        display: flex;
        flex-direction: column;
        gap: 0.06in;
      }

      .company-header {
        border-bottom: 1px solid #000;
        padding-bottom: 0.04in;
        margin-bottom: 0.04in;
      }

      .company-logo {
        max-width: 2.5in;
        max-height: 0.5in;
        object-fit: contain;
        display: block;
      }

      .company-name {
        font-size: 10pt;
        font-weight: bold;
        color: #0066CC;
        letter-spacing: 0.3px;
      }

      .sender-info {
        background: #f0f8ff;
        border: 1px solid #0066CC;
        padding: 0.05in;
        font-size: 6pt;
        line-height: 1.3;
      }

      .info-title {
        font-weight: bold;
        color: #0066CC;
        margin-bottom: 0.02in;
        font-size: 6.5pt;
      }

      .info-content,
      .info-address,
      .info-contact,
      .info-email,
      .info-dept {
        margin-bottom: 0.01in;
      }

      .checklist-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 0.02in;
      }

      .checkbox-item {
        display: flex;
        align-items: center;
        gap: 0.03in;
        font-size: 6.5pt;
      }

      .checkbox-item > span:first-child {
        display: inline-block;
        width: 0.1in;
        height: 0.1in;
        border: 1px solid #000;
        text-align: center;
        line-height: 0.1in;
        flex-shrink: 0;
        font-size: 5pt;
      }

      /* Bloque Derecho */
      .right-block {
        display: flex;
        flex-direction: column;
        gap: 0.06in;
      }

      /* Fecha y Hora verticales, Número de Guía a la derecha */
      .delivery-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid #000;
        padding-bottom: 0.04in;
        gap: 0.1in;
      }

      .date-time-section {
        display: flex;
        flex-direction: column;
        gap: 0.03in;
      }

      .date-field,
      .time-field {
        display: flex;
        align-items: center;
        gap: 0.05in;
      }

      .field-label {
        font-weight: bold;
        font-size: 6.5pt;
      }

      /* ✅ CAMBIO: Línea simple en lugar de recuadro verde */
      .date-value {
        border-bottom: 1px solid #000;
        padding: 0.02in 0.05in;
        min-width: 0.9in;
        text-align: left;
        font-weight: normal;
        font-size: 7pt;
      }

      .time-value {
        font-size: 7pt;
        border-bottom: 1px dotted #999;
        min-width: 0.6in;
        display: inline-block;
      }

      /* Número de Guía en esquina superior derecha */
      .guide-number-section {
        text-align: right;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.01in;
      }

      .guide-number-label {
        font-weight: bold;
        font-size: 6pt;
        color: #0066CC;
      }

      .guide-number-value {
        font-weight: bold;
        font-size: 8pt;
        color: #000;
        border: 1px solid #0066CC;
        padding: 0.02in 0.1in;
        background: #f0f8ff;
      }

      /* Sección Destinatario */
      .recipient-section {
        background: #fafafa;
        border: 1px solid #000;
        padding: 0.05in;
      }

      .field-row {
        display: flex;
        margin-bottom: 0.025in;
        gap: 0.06in;
      }

      .field-row:last-child {
        margin-bottom: 0;
      }

      .field-label {
        font-weight: bold;
        color: #0066CC;
        min-width: 0.85in;
        flex-shrink: 0;
      }

      .field-value {
        flex: 1;
        border-bottom: 1px dotted #aaa;
        padding-bottom: 0.01in;
      }

      .tables-grid {
        display: grid;
        grid-template-columns: 1.2in 0.5in 1fr;
        gap: 0.05in;
        border: 1px solid #000;
        padding: 0.03in;
      }

      .property-box,
      .floor-box {
        border: 1px solid #000;
        padding: 0.03in;
        display: flex;
        gap: 0.03in;
      }

      .vertical-title,
      .vertical-title-small {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        font-weight: bold;
        font-size: 6pt;
        letter-spacing: 2px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 0.12in;
      }

      .vertical-title-small {
        letter-spacing: 1px;
        min-width: 0.1in;
      }

      .options-list {
        display: flex;
        flex-direction: column;
        gap: 0.015in;
      }

      .signature-box {
        border: 1px solid #000;
        padding: 0.03in;
        display: flex;
        flex-direction: column;
      }

      .signature-title {
        font-weight: bold;
        font-size: 6pt;
        text-align: center;
        border-bottom: 1px solid #ccc;
        padding-bottom: 0.02in;
        margin-bottom: 0.04in;
        line-height: 1.2;
      }

      .signature-title small {
        font-weight: normal;
        font-size: 5pt;
        display: block;
        margin-top: 0.015in;
      }

      .signature-area {
        border-bottom: 1px solid #000;
        height: 0.28in;
        margin-bottom: 0.025in;
        flex: 1;
      }

      .id-field {
        font-size: 6.5pt;
      }

      .guide-footer {
        display: grid;
        grid-template-columns: 1fr 1.2in;
        gap: 0.08in;
        border-top: 1px solid #000;
        padding-top: 0.04in;
        align-items: end;
      }

      .door-section {
        border: 1px solid #000;
        padding: 0.03in;
        display: flex;
        gap: 0.03in;
        align-items: flex-start;
      }

      .door-options {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.02in;
      }

      .deliverer-section {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }

      .deliverer-label {
        font-weight: bold;
        margin-bottom: 0.02in;
        font-size: 6.5pt;
      }

      .signature-mini {
        border-bottom: 1px solid #000;
        height: 0.16in;
      }

      /* Clases para páginas con 1 o 2 guías */
      .page-single .guide-wrapper:not(.guide-wrapper-empty) {
        flex: none;
        height: 3.15in;
      }

      .page-double .guide-wrapper:not(.guide-wrapper-empty) {
        flex: none;
        height: 3.15in;
      }

      .page-triple .guide-wrapper {
        flex: 1;
      }

      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .page {
          page-break-after: always;
        }
        .guide {
          break-inside: avoid;
        }
      }
    `;
  }
}

module.exports = new PDFService();