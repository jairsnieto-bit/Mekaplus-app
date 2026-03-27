const puppeteer = require('puppeteer');

class PDFService {

generateGuideHTML(guide, config, settings) {

const logo = config?.logo || '';
const company = this.getCompanyInfo();

return `
<div class="guide">

<div class="guide-grid">

<!-- SIDEBAR -->
<div class="sidebar">
<div class="sidebar-text">

${company.legalText}

</div>
</div>

<!-- BLOQUE IZQUIERDO -->

<div class="left">

<div class="logo">

${logo ? `<img src="${logo}"/>` : ''}

</div>

<div class="sender-box">

<div class="sender-title">
Mekaplus Express S.A.S NIT. ${company.nit}
</div>

<div>REMITE Y DIRECCION</div>

<div>${company.sender}</div>

<div>${company.address}</div>

</div>

<div class="checklist">

${this.renderChecklist()}

</div>

</div>

<!-- BLOQUE DERECHO -->

<div class="right">

<div class="header-delivery">

<div class="date">
FECHA DE ENTREGA:
<span class="date-box">${this.formatDate(guide.fechaEntrega)}</span>
</div>

<div>
Hora de entrega: ${guide.horaEntrega || ''}
</div>

</div>

<div class="recipient">

<div>
<b>RAZON SOCIAL:</b> ${guide.razonSocial || ''}
</div>

<div>
<b>DIRECCION:</b> ${guide.direccion || ''}
</div>

<div>
<b>CIUDAD:</b> ${guide.localidad || ''}
</div>

<div>
<b>LIQUIDACION No.</b>
</div>

</div>

<div class="middle-grid">

<div class="inmueble">

<div class="vertical">INMUEBLE</div>

<div class="options">
<label><span></span>Casa</label>
<label><span></span>Edificio</label>
<label><span></span>Negocio</label>
<label><span></span>Conjunto</label>
</div>

</div>

<div class="piso">

<div class="vertical">PISO</div>

<div class="options">
<label><span></span>1</label>
<label><span></span>2</label>
<label><span></span>3</label>
<label><span></span>4</label>
<label><span></span>+4</label>
</div>

</div>

<div class="firma">

<div class="firma-title">
RECIBE A CONFORMIDAD
<br/>
<small>(NOMBRE LEGIBLE, SELLO Y D.I)</small>
</div>

<div class="firma-area"></div>

<div>CC. __________________</div>

</div>

</div>

<div class="footer">

<div class="puerta">

<div class="vertical">Puerta</div>

<div class="door-options">

<label><span></span>Madera</label>
<label><span></span>Metal</label>
<label><span></span>Vidrio</label>
<label><span></span>Aluminio</label>
<label><span></span>Otros</label>

</div>

</div>

<div class="entrega">

Quien Entrega:

<div class="firma-mini"></div>

</div>

</div>

</div>

</div>

</div>
`;
}

async generateGuidesPDF(guides, config, settings){

const browser = await puppeteer.launch({
headless:true,
args:['--no-sandbox','--disable-setuid-sandbox']
});

try{

const page = await browser.newPage();

await page.setViewport({
width:816,
height:1056
});

const html = this.buildHTML(guides,config,settings);

await page.setContent(html,{waitUntil:'networkidle0'});

const pdf = await page.pdf({

format:'letter',

landscape:false,

printBackground:true,

margin:{
top:'0.2in',
bottom:'0.2in',
left:'0.2in',
right:'0.2in'
}

});

await browser.close();

return pdf;

}catch(err){

await browser.close();
throw err;

}

}

buildHTML(guides,config,settings){

const pages = this.groupGuides(guides,3);

return `

<html>

<head>

<meta charset="utf-8">

<style>

${this.styles()}

</style>

</head>

<body>

${pages.map(p=>this.renderPage(p,config,settings)).join('')}

</body>

</html>

`;

}

renderPage(guides,config,settings){

return `

<div class="page">

${guides.map((g,i)=>`

<div class="guide-container">

${this.generateGuideHTML(g,config,settings)}

${i<guides.length-1?'<div class="cut"></div>':''}

</div>

`).join('')}

</div>

`;

}

styles(){

return `

*{box-sizing:border-box}

body{

font-family:Arial;

font-size:7pt;

}

.page{

width:8.5in;

height:11in;

display:flex;

flex-direction:column;

gap:5px;

}

.guide-container{

flex:1;

}

.cut{

border-top:2px dashed #999;

margin:4px 0;

}

.guide{

border:1px solid #000;

padding:0.12in;

height:100%;

}

.guide-grid{

display:grid;

grid-template-columns:0.6in 3in 1fr;

gap:10px;

height:100%;

}

.sidebar{

border-right:1px solid #000;

display:flex;

align-items:center;

justify-content:center;

}

.sidebar-text{

writing-mode:vertical-rl;

transform:rotate(180deg);

font-size:5pt;

}

.logo img{

max-height:40px;

}

.sender-box{

border:1px solid #000;

padding:5px;

background:#f2f2f2;

margin-top:5px;

}

.checklist label{

display:flex;

gap:4px;

margin-top:3px;

}

.checklist span{

width:12px;

height:12px;

border:2px solid #4CAF50;

display:inline-block;

}

.header-delivery{

display:flex;

justify-content:space-between;

margin-bottom:5px;

}

.date-box{

border:2px solid #4CAF50;

padding:3px 20px;

margin-left:5px;

}

.recipient{

border:1px solid #000;

padding:5px;

margin-bottom:5px;

}

.middle-grid{

display:grid;

grid-template-columns:1.4in 0.6in 1fr;

border:1px solid #000;

}

.inmueble,.piso{

display:flex;

border-right:1px solid #000;

}

.vertical{

writing-mode:vertical-rl;

transform:rotate(180deg);

font-weight:bold;

font-size:6pt;

padding:2px;

}

.options{

padding:5px;

display:flex;

flex-direction:column;

gap:3px;

}

.options span{

width:12px;

height:12px;

border:2px solid #4CAF50;

display:inline-block;

margin-right:4px;

}

.firma{

padding:5px;

display:flex;

flex-direction:column;

}

.firma-area{

border-bottom:1px solid #000;

height:40px;

margin:5px 0;

}

.footer{

display:grid;

grid-template-columns:1fr 1.5in;

margin-top:5px;

}

.puerta{

display:flex;

border:1px solid #000;

}

.door-options{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:4px;

padding:5px;

}

.entrega{

padding-left:10px;

}

.firma-mini{

border-bottom:1px solid #000;

height:20px;

margin-top:5px;

}

`;

}

renderChecklist(){

const states=[

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

return states.map(s=>`<label><span></span>${s}</label>`).join('');

}

groupGuides(guides,n){

const pages=[];

for(let i=0;i<guides.length;i+=n){

pages.push(guides.slice(i,i+n));

}

return pages;

}

formatDate(date){

if(!date) return '';

return new Date(date).toLocaleDateString('es-CO');

}

getCompanyInfo(){

return{

nit:'901505437-1',

legalText:`

Mekaplus Express S.A.S

NIT 901505437-1

Cartagena Colombia

`,

sender:'Organizacion Sayco Acinpro',

address:'Calle 41 No.43 – 128 Ofic 11 Centro'

};

}

}

module.exports=new PDFService();