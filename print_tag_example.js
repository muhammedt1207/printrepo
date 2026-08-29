// print_tag_example.js
// For USB-connected printers on macOS (uses the CUPS "lp" command).

const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Load the ZPL template from the same folder as this script.
const template = fs.readFileSync(
  path.join(__dirname, 'jewellery_tag_template.zpl'),
  'utf8'
);

function buildLabel(product) {
  return template
    .replace('{{STICK_GOLD_CODE}}', product.stickGoldCode)
    .replace('{{KARAT}}', product.karat)
    .replace('{{PRODUCT_CODE}}', product.productCode)
    .replace('{{PRODUCT_NAME}}', product.productName)
    .replace('{{PRICE}}', product.price)
    .replace('{{OTHER_DETAILS}}', product.otherDetails)
    .replace('{{COMPANY_NAME}}', product.companyName)
    .replace(/{{BARCODE_VALUE}}/g, product.barcodeValue);
}

// printerName must exactly match the name shown by: lpstat -p
function printTagMac(product, printerName) {
  const zpl = buildLabel(product);
  const tempFile = path.join(os.tmpdir(), `label_${Date.now()}.zpl`);

  fs.writeFileSync(tempFile, zpl, 'utf8');

  // -o raw sends ZPL directly to the printer without converting it to text.
  const cmd = `lp -d "${printerName}" -o raw "${tempFile}"`;

  exec(cmd, (err, stdout, stderr) => {
    fs.unlink(tempFile, () => {});

    if (err) {
      console.error('Print failed:', stderr || err.message);
      return;
    }

    console.log('Label sent to printer.');
    if (stdout) console.log(stdout.trim());
  });
}

// Example product data.
printTagMac(
  {
    stickGoldCode: 'ST-1023',
    karat: '22K',
    productCode: 'JW4587',
    productName: 'Gold Chain',
    price: '\u20B948,500',
    otherDetails: 'Wt: 8.2g',
    companyName: 'Your Jewellers Pvt Ltd',
    barcodeValue: '4587120033',
  },
  'Zebra_Technologies_ZTC_ZD220_203dpi_ZPL' // Replace with the exact name from: lpstat -p
);
