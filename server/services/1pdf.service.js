const puppeteer = require('puppeteer');
const QRCode = require('qrcode');

class PDFService {
  
  async generateGuideHTML(guide, config, settings) {
  const logo = config?.logo || '';
  const sender = guide.sender || this.getDefaultSender();
  const companyInfo = this.getCompanyInfo(sender);
  const guideNumber = guide.guideNumber || '_______________';

  // Generar QR Code
  const qrCodeData = await this.generateQRCode(guide);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${this.getPrintStyles()}</style>
    </head>
    <body>
      <div class="guide">
        
        <!-- Sidebar Vertical -->
        <aside class="sidebar-vertical">
          <div class="sidebar-content">
            ${logo 
              ? `<img src="${logo}" alt="Logo" class="sidebar-logo" />` 
              : '<div class="logo-fallback">MEKA<br/>PLUS</div>'
            }
            <div class="sidebar-text">
              ${companyInfo.legalText}
            </div>
          </div>
        </aside>

        <!-- Contenido Principal -->
        <div class="main-content">
          
          <!-- Header -->
          <div class="header-section">
            <div class="header-left">
              ${logo 
                ? `<img src="${logo}" alt="Logo" class="header-logo" />` 
                : '<div class="logo-text">MEKA PLUS<br/>EXPRESS S.A.S</div>'
              }
            </div>
            <div class="header-center">
              <div class="fecha-entrega">
                <span class="label">FECHA DE ENTREGA:</span>
                <span class="line">${this.formatDate(guide.fechaEntrega)}</span>
              </div>
              <div class="hora-entrega">
                <span class="label">HORA DE ENTREGA:</span>
                <span class="line">${guide.horaEntrega || ''}</span>
              </div>
            </div>
            <div class="header-right">
              <div class="guia-box">
                <div class="guia-label">No. GUÍA:</div>
                <div class="guia-number">${guideNumber}</div>
              </div>
              ${qrCodeData ? `<img src="${qrCodeData}" alt="QR" class="qr-code" />` : ''}
            </div>
          </div>

          <!-- Grid Principal -->
          <div class="guide-grid">
            
            <!-- Columna Izquierda -->
            <div class="left-column">
              <div class="remitte-box">
                <div class="box-title">REMITTE Y DIRECCIÓ</div>
                <div class="box-content">
                  ${companyInfo.sender}<br/>
                  ${companyInfo.address}<br/>
                  ${companyInfo.phone}<br/>
                  ${companyInfo.email}<br/>
                  ${companyInfo.department}
                </div>
              </div>

              <div class="checklist">
                ${this.renderChecklist()}
              </div>
            </div>

            <!-- Columna Derecha -->
            <div class="right-column">
              
              <!-- Datos Destinatario -->
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
                  <span class="field-value">${guide.identificacionUsuario || ''}</span>
                </div>
              </div>

              <!-- Tablas Intermedias -->
               <!-- Tablas -->
                <div class="tables-grid">
                  <div class="property-box">
                    <div class="vertical-label" style="padding-top: 0.02in;">INMUEBLE</div>
                    <div class="options" style="padding: 0.01in 0;">
                      <label style="display: block; margin: 0.08in 0.09in;">☐ Casa</label>
                      <label style="display: block; margin: 0.08in 0.09in;">☐ Edificio</label>
                      <label style="display: block; margin: 0.08in 0.09in;">☐ Negocio</label>
                      <label style="display: block; margin: 0.08in 0.09in;">☐ Conjunto</label>
                    </div>
                  </div>

                  <div class="floor-box">
                    <div class="vertical-label-small" style="padding-top: 0.03in;">PISO</div>
                      <div class="options" style="padding: 0.01in 0;">
                        <label style="display: block; margin: 0.05in 0;">☐ 1</label>
                        <label style="display: block; margin: 0.05in 0;">☐ 2</label>
                        <label style="display: block; margin: 0.05in 0;">☐ 3</label>
                        <label style="display: block; margin: 0.05in 0;">☐ 4</label>
                        <label style="display: block; margin: 0.05in 0;">☐ +4</label>
                      </div>
                  </div>

                <div class="signature-box">
                  <div class="signature-title">RECIBE A CONFORMIDAD<br/><small>(NOMBRE LEGIBLE, SELLO Y.D.I)</small></div>
                  <div class="signature-line"></div>
                  <div class="cc-field">CC. _________________________</div>
                </div>
              </div>

              <!-- Footer Mejorado -->
              <div class="guide-footer">
                <div class="door-section">
                  <div class="vertical-label-small">Puerta</div>
                  <div class="door-options">
                    <label>☐ Madera</label>
                    <label>☐ Metal</label>
                    <label>☐ Vidrio</label>
                    <label>☐ Aluminio</label>
                    <label>☐ Otros</label>
                  </div>
                </div>
                <div class="deliverer-section">
                  <div class="deliverer-label">Quien Entrega:</div>
                  <div class="deliverer-line"></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

  /*async generateQRCode(guideNumber) {
    try {
      const trackingUrl = `http://localhost:3000/tracking/${guideNumber}`;
      const qrCode = await QRCode.toDataURL(trackingUrl, {
        width: 70,
        margin: 0,
        errorCorrectionLevel: 'M'
      });
      return qrCode;
    } catch (error) {
      console.error('Error generating QR:', error);
      return null;
    }
  }*/

   /* async generateQRCode(guideNumber) {
  try {
    // ✅ CAMBIO: QR contiene solo el número de guía (no la URL)
    const qrCode = await QRCode.toDataURL(guideNumber, {
      width: 80,
      margin: 0,
      errorCorrectionLevel: 'M'
    });
    return qrCode;
  } catch (error) {
    console.error('Error generating QR:', error);
    return null;
  }
}*/

    async generateQRCode(guide) {  // ✅ CAMBIO: Ahora recibe el objeto guide completo
  try {
      // ✅ NUEVO: Crear string con toda la información de la guía
      const qrData = 
        `GUÍA: ${guide.guideNumber || ''}\n` +
        `RAZON SOCIAL: ${guide.razonSocial || ''}\n` +
        `DIRECCION: ${guide.direccion || ''}\n` +
        `CIUDAD: ${guide.localidad || ''}\n` +
        `LIQUIDACION No: ${guide.identificacionUsuario || ''}\n` +
        `ESTADO: ${guide.estado || 'PENDIENTE'}`;

      const qrCode = await QRCode.toDataURL(qrData, {
        width: 80,
        margin: 0,
        errorCorrectionLevel: 'M'
      });
      return qrCode;
    } catch (error) {
      console.error('Error generating QR:', error);
      return null;
    }
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

      const htmlContent = await this.buildCompleteHTML(guides, config, settings);

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

  async buildCompleteHTML(guides, config, settings) {
    const pages = this.groupGuidesIntoPages(guides, 3);
    let html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Guías de Mensajería</title>
        <style>${this.getPrintStyles()}</style>
      </head>
      <body>
    `;

    for (const pageGuides of pages) {
      html += await this.renderPage(pageGuides, config, settings);
    }

    html += `</body></html>`;
    return html;
  }

  async renderPage(guides, config, settings) {
    const guidesCount = guides.length;
    let pageHTML = '<div class="page">';
    
    for (let index = 0; index < guides.length; index++) {
      const guide = guides[index];
      pageHTML += '<div class="guide-wrapper">';
      pageHTML += await this.generateGuideHTML(guide, config, settings);
      
      if (index < guides.length - 1) {
        pageHTML += `<div class="cut-line" style="margin: 0.05in 0;"></div>`;
        //pageHTML += '<div class="cut-line"></div>';
      }
      
      pageHTML += '</div>';
    }

    if (guidesCount < 3) {
      pageHTML += this.renderEmptyGuides(3 - guidesCount);
    }

    pageHTML += '</div>';
    return pageHTML;
  }

  renderEmptyGuides(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += '<div class="guide-wrapper guide-wrapper-empty"><div class="guide guide-empty"></div></div>';
    }
    return html;
  }
    // ✅ MODIFICAR: getCompanyInfo (aceptar sender como parámetro)
    getCompanyInfo(sender = null) {
      // ✅ Si hay sender, usar sus datos; si no, usar default
      const s = sender || this.getDefaultSender();
      
      return {
        nit: s.nit || '901505437-1',
        legalText: `
          ${s.name || 'Mekaplus express S.A.S'} ${s.nit ? `NIT. ${s.nit}` : 'NIT. 901505437-1'}<br/>
          Principal: ${s.address || 'Cartagena Colombia'}<br/>
          ${s.phone || ''}<br/>
          ${s.email || ''}<br/>
          ${s.department || ''}
        `.trim(),
        sender: `${s.name || 'Organizacion Sayco Acinpro'} ${s.nit ? `NIT: ${s.nit}` : ''}`,
        address: s.address || 'Calle 41 No.43 – 128 Ofic 11 Centro',
        phone: s.phone || '3115922099',
        email: s.email || 'DIRECTOR.ZONACUATRO@SYCOACINPRO.ORG.CO',
        department: s.department || 'Dpto: Atlantico'
      };
    }
          // ✅ AGREGAR: Método para obtener remitente por defecto (compatibilidad)
          /*getDefaultSender() {
            return {
              name: 'Mekaplus express S.A.S',
              nit: '901505437-1',
              address: 'Cartagena Colombia Sec Víctor Blanco Mz.173.LT.10',
              phone: '3115922099',
              email: 'DIRECTOR.ZONACUATRO@SYCOACINPRO.ORG.CO',
              department: 'Dpto: Atlantico'
            };
          }*/
     
  /*getCompanyInfo() {
    return {
      nit: '901505437-1',
      legalText: 'Mekaplus express S.A.S NIT. 901505437-1<br/>Principal: Cartagena Colombia<br/>Sec Víctor Blanco Mz.173.LT.10<br/><br/>REMITE:<br/>Organizacion Sayco Acinpro NIT: 800.021.811-9<br/>Telefono: 3115922099<br/>Email: DIRECTOR.ZONACUATRO@SYCOACINPRO.ORG.CO<br/>Dpto: Atlantico',
      sender: 'Organizacion Sayco Acinpro NIT: 800.021.811-9',
      address: 'Calle 41 No.43 – 128 Ofic 11 Centro',
      phone: '3115922099',
      email: 'DIRECTOR.ZONACUATRO@SYCOACINPRO.ORG.CO',
      department: 'Dpto: Atlantico'
    };
  }*/

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
    return states.map(state => `<label class="checkbox-item">☐ ${state}</label>`).join('');
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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: letter; margin: 0; }
    body {
      font-family: Arial, sans-serif;
      font-size: 7pt;
      line-height: 1.2;
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
      gap: 0;
      page-break-after: always;
    }
    .page:last-child { page-break-after: auto; }

    .guide-wrapper { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      margin-bottom: 0.09in; /* ✅ ESPACIO DESPUÉS DE CADA GUÍA */
    }

    .cut-line { 
      border-top: 1px dashed #999;
      margin: 0.15in 0; /* ✅ ESPACIO GENEROSO ARRIBA Y ABAJO */
      width: 100%;
      position: relative;
    }

    .cut-line::before {
      content: '✂';
      position: absolute;
      left: 0;
      top: -0.1in;
      font-size: 8pt;
      color: #999;
    }

    .cut-line::after {
      content: '✂';
      position: absolute;
      right: 0;
      top: -0.1in;
      font-size: 8pt;
      color: #999;
    }

    .guide {
      flex: 1;
      min-height: 3.28in;
      max-height: 3.28in;
      border: 1px solid #000;
      padding: 0;
      background: white;
      display: flex;
      position: relative;
    }
    .guide-empty { opacity: 0; }
    .guide-wrapper-empty { flex: 1; }

    /* ===== SIDEBAR VERTICAL ===== */
    .sidebar-vertical {
      width: 0.7in;
      border-right: 1px solid #000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      flex-shrink: 0;
      position: relative;
    }
    /* ✅ Línea punteada vertical con segmentos */
    .sidebar-vertical::after {
      content: '';
      position: absolute;
      right: -0.05in;
      top: 0;
      bottom: 0;
      width: 1px;
      background: repeating-linear-gradient(
        to bottom,
        #000 0px,
        #000 1px,
        transparent 3px,
        transparent 6px
      );
      pointer-events: none;
    }
    /* ✅ Marcas de tijera superior e inferior */

    .sidebar-vertical::before {
      content: '✂';
      position: absolute;
      right: -0.15in;
      top: 0;
      font-size: 10pt;
      color: #000;
    }
    /* CONTENIDO INTERNO */
    .sidebar-content {
      writing-mode: vertical-rl;
      transform: rotate(180deg);

      text-align: left;
      font-size: 4pt;
      line-height: 1.4;
      padding: 0.08in 0.04in;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.04in;
    }
    /* LOGO */
    .sidebar-logo {
      max-width: 0.80in;
      max-height: 0.35in;
      object-fit: contain;
      display: block;
      flex-shrink: 0;
      transform: rotate(90deg);
      transform-origin: center;

      margin-bottom: 0.35in; /* ✅ ESPACIO ENTRE LOGO Y TEXTO */
    }

    .logo-fallback {
      font-size: 7pt;
      font-weight: bold;
      color: #0066CC;
      flex-shrink: 0;
    }
    /* TEXTO */
    .sidebar-text {
      font-size: 5pt;
      line-height: 1.3;
      color: #000;
      text-align: left; 
      max-width: 0.45in;
    }

    /* ===== CONTENIDO PRINCIPAL ===== */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0.06in;
    }

    /* Header */
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1.5px solid #000;
      padding-bottom: 0.04in;
      margin-bottom: 0.04in;
    }

    .header-left { flex: 1; }
    .header-logo { max-width: 2in; max-height: 0.45in; object-fit: contain; }
    .logo-text { font-size: 9pt; font-weight: bold; color: #0066CC; line-height: 1.1; }

    .header-center {
      display: flex;
      flex-direction: column;
      gap: 0.5in;
      margin: 0 0.12in;
    }

    .fecha-entrega, .hora-entrega {
      display: flex;
      align-items: center;
      gap: 0.15in;
    }

    .fecha-entrega .label, .hora-entrega .label {
      font-weight: bold;
      color: #0066CC;
      font-size: 7pt;
      white-space: nowrap;
    }

    .fecha-entrega .line, .hora-entrega .line {
      border-bottom: 1px solid #000;
      min-width: 1.5in;
      display: inline-block;
    }

    .header-right {
      display: flex;
      align-items: flex-start;
      gap: 0.04in;
    }

    .guia-box {
      border: 1px solid #0066CC;
      background: #f0f8ff;
      padding: 0.03in 0.06in;
      text-align: center;
      min-width: 1in;
    }

    .guia-label { font-size: 5pt; color: #0066CC; margin-bottom: 0.015in; }
    .guia-number { font-size: 8pt; font-weight: bold; letter-spacing: 0.3px; }

    .qr-code { width: 0.65in; height: 0.65in; object-fit: contain; }

    /* Grid Principal */
    .guide-grid {
      display: grid;
      grid-template-columns: 2.3in 1fr;
      gap: 0.05in;
      flex: 1;
    }

    /* Columna Izquierda */
    .left-column {
      display: flex;
      flex-direction: column;
      gap: 0.035in;
    }

    .remitte-box {
      background: #f0f8ff;
      border: 1px solid #0066CC;
      padding: 0.035in;
    }

    .box-title {
      font-weight: bold;
      color: #0066CC;
      font-size: 6.5pt;
      margin-bottom: 0.025in;
    }

    .box-content { font-size: 5pt; line-height: 1.3; }

    .checklist {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.012in;
    }

    .checkbox-item { 
      font-size: 5.5pt; 
      display: flex; 
      align-items: center; 
      gap: 0.025in; 
    }

    /* Columna Derecha */
    .right-column {
      display: flex;
      flex-direction: column;
      gap: 0.035in;
    }

    .recipient-section {
      background: #fafafa;
      border: 1px solid #000;
      padding: 0.035in;
    }

    .field-row {
      display: flex;
      margin-bottom: 0.018in;
      gap: 0.035in;
    }
    .field-row:last-child { margin-bottom: 0; }

    .field-label {
      font-weight: bold;
      color: #0066CC;
      min-width: 0.9in;
      font-size: 5.5pt;
      flex-shrink: 0;
    }

    .field-value {
      flex: 1;
      border-bottom: 1px dotted #aaa;
      font-size: 5.5pt;
    }

    /* Tablas Intermedias */
    .tables-grid {
      display: grid;
      grid-template-columns: 1in 0.4in 1fr;
      gap: 0.025in;
      border: 1px solid #000;
      padding: 0.018in;
      flex: 1;
    }

    .property-box, .floor-box {
      border: 1px solid #000;
      padding: 0.018in;
      display: flex;
      gap: 0.018in;
    }

    .vertical-label, .vertical-label-small {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      font-weight: bold;
      font-size: 5.5pt;
      letter-spacing: 1.5px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0.09in;
    }

    .vertical-label-small {
      letter-spacing: 0.8px;
      min-width: 0.07in;
      padding-top: 0.02in;
    }

    .options { 
      display: flex; 
      flex-direction: column; 
      gap: 0.004in;
    }

    .options label { 
      font-size: 5.5pt;
      display: block;
      margin: 0.003in 0;
    }

    .signature-box {
      border: 1px solid #000;
      padding: 0.018in;
      display: flex;
      flex-direction: column;
    }

    .signature-title {
      font-weight: bold;
      font-size: 5.5pt;
      text-align: center;
      border-bottom: 1px solid #ccc;
      padding-bottom: 0.015in;
      margin-bottom: 0.025in;
      line-height: 1.15;
    }
    .signature-title small { font-weight: normal; font-size: 4.5pt; display: block; margin-top: 0.008in; }

    .signature-line {
      border-bottom: 1px solid #000;
      height: 0.22in;
      margin-bottom: 0.018in;
      flex: 1;
    }

    .cc-field { font-size: 5.5pt; }

    /* Footer Mejorado */
    .guide-footer {
      display: grid;
      grid-template-columns: 1.5in 1fr;
      gap: 0.05in;
      border-top: 1px solid #000;
      padding-top: 0.025in;
    }

    .door-section {
      border: 1px solid #000;
      padding: 0.018in;
      display: flex;
      gap: 0.018in;
    }

    .door-options {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.012in;
    }
    .door-options label { font-size: 5.5pt; }

    .deliverer-section { 
      display: flex; 
      flex-direction: column; 
      justify-content: flex-end;
    }
    .deliverer-label { 
      font-weight: bold; 
      font-size: 5.5pt; 
      margin-bottom: 0.018in; 
    }
    .deliverer-line { 
      border-bottom: 1.5px solid #000; 
      height: 0.13in; 
    }

    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .page { page-break-after: always; }
      .guide { break-inside: avoid; }
    }
  `;
}

}

module.exports = new PDFService();