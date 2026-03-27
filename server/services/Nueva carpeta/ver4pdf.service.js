const puppeteer = require('puppeteer');

class PDFService {
  /**
   * Genera el HTML de una guía individual con estructura optimizada
   * @param {Object} guide - Datos de la guía
   * @param {Object} config - Configuración del sistema
   * @param {Object} settings - Configuración adicional
   * @returns {string} HTML de la guía
   */
  generateGuideHTML(guide, config, settings) {
    const logo = config?.logo || '';
    const companyInfo = this.getCompanyInfo();

    return `
      <div class="guide">
        <div class="guide-grid">
          
          <!-- Columna 1: Sidebar Vertical con Info Legal -->
          <aside class="sidebar-vertical">
            <div class="sidebar-inner">
              <div class="sidebar-logo">
                ${logo 
                  ? `<img src="${logo}" alt="Logo" />` 
                  : '<div class="logo-fallback">MEKA<br/>PLUS<br/>EXPRESS</div>'
                }
              </div>
              <div class="sidebar-legal">
                ${companyInfo.legalText}
              </div>
            </div>
          </aside>

          <!-- Columna 2: Bloque Izquierdo (Logo, Remitente, Checklist) -->
          <section class="left-block">
            <header class="company-header">
              ${logo 
                ? `<img src="${logo}" alt="Mekaplus Express" class="company-logo" />` 
                : '<div class="company-name">MEKAPLUS EXPRESS S.A.S</div>'
              }
              <div class="company-nit">NIT. ${companyInfo.nit}</div>
            </header>

            <div class="sender-info">
              <div class="info-title">REMITTE Y DIRECCIÓN</div>
              <div class="info-content">${companyInfo.sender}</div>
              <div class="info-address">${companyInfo.address}</div>
              <div class="info-contact">${companyInfo.phone} • ${companyInfo.email}</div>
              <div class="info-dept">${companyInfo.department}</div>
            </div>

            <nav class="checklist-container" aria-label="Estados de entrega">
              ${this.renderChecklist()}
            </nav>
          </section>

          <!-- Columna 3: Bloque Derecho (Datos, Tablas, Firma) -->
          <section class="right-block">
            
            <!-- Fecha y Hora de Entrega -->
            <div class="delivery-header">
              <div class="date-field">
                <span class="field-label">FECHA DE ENTREGA:</span>
                <span class="date-value">${this.formatDate(guide.fechaEntrega)}</span>
              </div>
              <div class="time-field">
                <span class="field-label">Hora de entrega:</span>
                <span class="time-value">${guide.horaEntrega || '__________'}</span>
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
                  ${['Casa', 'Edificio', 'Negocio', 'Conjunto'].map(opt => 
                    `<label class="checkbox"><span>☐</span> ${opt}</label>`
                  ).join('')}
                </div>
              </div>

              <!-- Número de Piso -->
              <div class="floor-box">
                <div class="vertical-title">PISO</div>
                <div class="options-list">
                  ${['1', '2', '3', '4', '+4'].map(opt => 
                    `<label class="checkbox"><span>☐</span> ${opt}</label>`
                  ).join('')}
                </div>
              </div>

              <!-- Espacio de Firma -->
              <div class="signature-box">
                <div class="signature-title">
                  RECIBE A CONFORMIDAD<br/>
                  <small>(NOMBRE LEGIBLE, SELLO Y D.I)</small>
                </div>
                <div class="signature-area"></div>
                <div class="id-field">CC. _________________________</div>
              </div>
            </div>

            <!-- Footer: Tipo de Puerta y Quien Entrega -->
            <footer class="guide-footer">
              <div class="door-section">
                <div class="vertical-title">Puerta</div>
                <div class="door-options">
                  ${['Madera', 'Metal', 'Vidrio', 'Aluminio', 'Otros'].map(opt => 
                    `<label class="checkbox"><span>☐</span> ${opt}</label>`
                  ).join('')}
                </div>
              </div>
              <div class="deliverer-section">
                <div class="field-label">Quien Entrega:</div>
                <div class="signature-mini"></div>
              </div>
            </footer>

          </section>
        </div>
      </div>
    `;
  }

  /**
   * Genera el PDF completo con múltiples guías (3 por página)
   * @param {Array} guides - Array de guías a procesar
   * @param {Object} config - Configuración del sistema
   * @param {Object} settings - Configuración adicional
   * @returns {Buffer} Buffer del PDF generado
   */
  async generateGuidesPDF(guides, config, settings) {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ]
    });

    try {
      const page = await browser.newPage();
      
      // Viewport optimizado para Letter portrait
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

  /**
   * Construye el documento HTML completo con CSS y todas las páginas
   * @private
   */
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
        ${pages.map(page => this.renderPage(page, config, settings)).join('\n')}
      </body>
      </html>
    `;
  }

  /**
   * Renderiza una página con sus guías y líneas de corte
   * @private
   */
  renderPage(guides, config, settings) {
    return `
      <div class="page">
        ${guides.map((guide, index) => `
          <div class="guide-container">
            ${this.generateGuideHTML(guide, config, settings)}
            ${index < guides.length - 1 ? '<div class="cut-line" aria-hidden="true"></div>' : ''}
          </div>
        `).join('\n')}
      </div>
    `;
  }

  /**
   * Obtiene información corporativa predefinida
   * @private
   */
  getCompanyInfo() {
    return {
      nit: '901505437-1',
      legalText: `
        Mekaplus Express S.A.S<br/>
        NIT. 901505437-1<br/>
        Principal: Cartagena Colombia<br/>
        Sec. Víctor Blanco Mz.173.LT.10
      `.trim(),
      sender: 'Organizacion Sayco Acinpro NIT: 800.021.811-9',
      address: 'Calle 41 No.43 – 128 Ofic 11 Centro',
      phone: 'Telefono: 3115922099',
      email: 'DIRECTOR.ZONACUATRO@SAYCOACINPRO.ORG.CO',
      department: 'Dpto: Atlantico'
    };
  }

  /**
   * Genera el HTML del checklist de estados
   * @private
   */
  renderChecklist() {
    const states = [
      'ENTREGA EFECTIVA',
      'INTENTO DE ENTREGA',
      'DEV. DIR INCOMPLETA',
      'DEV. DESCONOCIDO',
      'DEV. NO EXISTE',
      'DEV. CAMBIO DE DOMICILIO',
      'DEV. OTROS',
      'DEV. FALLECIDO',
      'DEV. NO RECIBIDA'
    ];

    return states.map(state => 
      `<label class="checkbox"><span>☐</span> ${state}</label>`
    ).join('\n');
  }

  /**
   * Formatea fecha para visualización
   * @private
   */
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

  /**
   * Agrupa guías en páginas de N elementos
   * @private
   */
  groupGuidesIntoPages(guides, perPage) {
    const pages = [];
    for (let i = 0; i < guides.length; i += perPage) {
      pages.push(guides.slice(i, i + perPage));
    }
    return pages;
  }

  /**
   * Retorna todos los estilos CSS optimizados para impresión
   * @private
   */
  getPrintStyles() {
    return `
      /* ===== RESET Y BASE ===== */
      *, *::before, *::after {
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

      /* ===== PÁGINA LETTER PORTRAIT ===== */
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

      /* ===== CONTENEDOR DE GUÍA ===== */
      .guide-container {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      /* Línea de corte punteada */
      .cut-line {
        border-top: 1px dashed #888;
        margin: 0.04in 0;
        opacity: 0.7;
      }

      /* ===== GUÍA PRINCIPAL ===== */
      .guide {
        flex: 1;
        border: 1px solid #000;
        padding: 0.15in;
        background: white;
        position: relative;
      }

      /* Grid Principal: 3 Columnas */
      .guide-grid {
        display: grid;
        grid-template-columns: 0.9in 2.8in 1fr;
        gap: 0.12in;
        height: 100%;
      }

      /* ===== SIDEBAR VERTICAL ===== */
      .sidebar-vertical {
        border-right: 1px solid #000;
        padding-right: 0.08in;
        display: flex;
        align-items: center;
      }

      .sidebar-inner {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        text-align: center;
        font-size: 5.5pt;
        line-height: 1.5;
        width: 100%;
      }

      .sidebar-logo {
        margin-bottom: 0.15in;
      }

      .sidebar-logo img {
        max-width: 0.9in;
        max-height: 0.4in;
        object-fit: contain;
        display: block;
        margin: 0 auto;
      }

      .logo-fallback {
        font-size: 9pt;
        font-weight: bold;
        color: #0066CC;
        line-height: 1.1;
        letter-spacing: 0.5px;
      }

      .sidebar-legal {
        font-size: 5pt;
        color: #333;
        line-height: 1.4;
      }

      /* ===== BLOQUE IZQUIERDO ===== */
      .left-block {
        display: flex;
        flex-direction: column;
        gap: 0.08in;
      }

      .company-header {
        border-bottom: 1px solid #000;
        padding-bottom: 0.05in;
        margin-bottom: 0.05in;
      }

      .company-logo {
        max-width: 2in;
        max-height: 0.35in;
        object-fit: contain;
        display: block;
      }

      .company-name {
        font-size: 9pt;
        font-weight: bold;
        color: #0066CC;
        letter-spacing: 0.3px;
      }

      .company-nit {
        font-size: 6pt;
        font-weight: bold;
        margin-top: 0.03in;
      }

      .sender-info {
        background: #f8f8f8;
        border: 1px solid #ccc;
        padding: 0.06in;
        font-size: 6pt;
      }

      .info-title {
        font-weight: bold;
        color: #0066CC;
        margin-bottom: 0.03in;
        font-size: 6.5pt;
      }

      .info-content,
      .info-address,
      .info-contact,
      .info-dept {
        margin-bottom: 0.01in;
      }

      /* Checklist */
      .checklist-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 0.02in;
      }

      .checkbox {
        display: flex;
        align-items: center;
        gap: 0.04in;
        font-size: 6.5pt;
        cursor: default;
      }

      .checkbox > span:first-child {
        display: inline-block;
        width: 0.12in;
        height: 0.12in;
        border: 1px solid #000;
        text-align: center;
        line-height: 0.12in;
        flex-shrink: 0;
        font-size: 5pt;
      }

      /* ===== BLOQUE DERECHO ===== */
      .right-block {
        display: flex;
        flex-direction: column;
        gap: 0.08in;
      }

      /* Header: Fecha y Hora */
      .delivery-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #000;
        padding-bottom: 0.05in;
      }

      .date-field,
      .time-field {
        display: flex;
        align-items: center;
        gap: 0.08in;
      }

      .field-label {
        font-weight: bold;
        font-size: 6.5pt;
      }

      .date-value {
        border: 1px solid #00aa00;
        padding: 0.04in 0.2in;
        min-width: 1in;
        text-align: center;
        font-weight: bold;
        font-size: 7pt;
      }

      .time-value {
        font-size: 7pt;
        border-bottom: 1px dotted #999;
        min-width: 0.8in;
        display: inline-block;
      }

      /* Sección Destinatario */
      .recipient-section {
        background: #fafafa;
        border: 1px solid #000;
        padding: 0.06in;
      }

      .field-row {
        display: flex;
        margin-bottom: 0.03in;
        gap: 0.08in;
      }

      .field-row:last-child {
        margin-bottom: 0;
      }

      .field-label {
        font-weight: bold;
        color: #0066CC;
        min-width: 0.9in;
        flex-shrink: 0;
      }

      .field-value {
        flex: 1;
        border-bottom: 1px dotted #aaa;
        padding-bottom: 0.01in;
      }

      /* Grid de Tablas: Inmueble, Piso, Firma */
      .tables-grid {
        display: grid;
        grid-template-columns: 1.3in 0.55in 1fr;
        gap: 0.06in;
        border: 1px solid #000;
        padding: 0.04in;
      }

      .property-box,
      .floor-box {
        border: 1px solid #000;
        padding: 0.04in;
        display: flex;
        gap: 0.04in;
      }

      .vertical-title {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        font-weight: bold;
        font-size: 6pt;
        letter-spacing: 3px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 0.15in;
        line-height: 1;
      }

      .options-list {
        display: flex;
        flex-direction: column;
        gap: 0.02in;
      }

      .signature-box {
        border: 1px solid #000;
        padding: 0.04in;
        display: flex;
        flex-direction: column;
      }

      .signature-title {
        font-weight: bold;
        font-size: 6pt;
        text-align: center;
        border-bottom: 1px solid #ccc;
        padding-bottom: 0.03in;
        margin-bottom: 0.05in;
        line-height: 1.2;
      }

      .signature-title small {
        font-weight: normal;
        font-size: 5.5pt;
        display: block;
        margin-top: 0.02in;
      }

      .signature-area {
        border-bottom: 1px solid #000;
        height: 0.3in;
        margin-bottom: 0.03in;
        flex: 1;
      }

      .id-field {
        font-size: 6.5pt;
      }

      /* Footer: Puerta y Quien Entrega */
      .guide-footer {
        display: grid;
        grid-template-columns: 1fr 1.3in;
        gap: 0.1in;
        border-top: 1px solid #000;
        padding-top: 0.05in;
        align-items: end;
      }

      .door-section {
        border: 1px solid #000;
        padding: 0.04in;
        display: flex;
        gap: 0.04in;
        align-items: flex-start;
      }

      .door-options {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.02in 0.05in;
      }

      .deliverer-section {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        height: 100%;
      }

      .deliverer-section .field-label {
        margin-bottom: 0.03in;
        font-size: 6.5pt;
      }

      .signature-mini {
        border-bottom: 1px solid #000;
        height: 0.18in;
      }

      /* ===== UTILIDADES DE IMPRESIÓN ===== */
      @media print {
        body {
          zoom: 1;
        }
        
        .page {
          page-break-after: always;
          break-after: page;
        }
        
        .guide {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        /* Forzar impresión de fondos */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }

      /* ===== ACCESIBILIDAD ===== */
      @media screen {
        .guide {
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      }
    `;
  }
}

module.exports = new PDFService();