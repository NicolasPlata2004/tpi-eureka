const puppeteer = require('puppeteer');

(async () => {
  console.log("Iniciando navegador Puppeteer...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Capturar errores del navegador
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ BROWSER CONSOLE ERROR:', msg.text());
    } else {
      console.log('ℹ️ BROWSER LOG:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.error('💥 BROWSER RUNTIME EXCEPTION:', err.message);
    if (err.stack) {
      console.error(err.stack);
    }
  });

  page.on('requestfailed', request => {
    console.log('⚠️ REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  console.log("Navegando a dev-login...");
  await page.goto('http://localhost:3000/auth/dev-login', { waitUntil: 'networkidle0' });

  console.log("Buscando y dando clic en el botón de iniciar sesión de Valentina...");
  // Valentina es el primer botón
  const buttons = await page.$$('button');
  let clickSucceeded = false;
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Valentina')) {
      console.log("Dando clic en el botón de Valentina...");
      await btn.click();
      clickSucceeded = true;
      break;
    }
  }

  if (!clickSucceeded) {
    console.error("No se encontró el botón de Valentina.");
    await browser.close();
    return;
  }

  console.log("Esperando navegación a /dashboard...");
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 });
  } catch (e) {
    console.log("Tiempo de espera agotado de networkidle0, procediendo de todos modos.");
  }

  console.log("Navegación completada. URL actual:", page.url());
  console.log("Esperando 3 segundos adicionales para capturar errores de montaje...");
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log("Cerrando navegador...");
  await browser.close();
  console.log("Proceso terminado.");
})();
