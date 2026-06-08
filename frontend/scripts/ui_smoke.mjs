import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';


const APP_URL = process.env.MVP_WEB_URL || 'http://127.0.0.1:5173/tupka2.0';
const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9300 + Math.floor(Math.random() * 500);
const SCREENSHOT_PATH = join(tmpdir(), 'synthmarket-mvp-profile.png');
const title = `UI MVP smoke ${Date.now()}`;
const photoUrl = `${APP_URL}/favicon.svg`;
const profileDir = await mkdtemp(join(tmpdir(), 'synthmarket-ui-'));


class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();

    socket.addEventListener('message', async (event) => {
      const rawMessage = event.data instanceof Blob ? await event.data.text() : String(event.data);
      const message = JSON.parse(rawMessage);
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
}


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDebugger() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const targets = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`).then((response) => response.json());
      const page = targets.find((target) => target.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await sleep(150);
  }
  throw new Error('Chrome debugging endpoint did not start');
}

async function evaluate(cdp, expression) {
  const response = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text || 'Browser evaluation failed');
  }
  return response.result.value;
}

async function waitFor(cdp, expression, label, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await evaluate(cdp, expression)) return;
    await sleep(150);
  }
  const bodyText = await evaluate(cdp, `document.body?.innerText || ''`).catch(() => '');
  throw new Error(`Timed out waiting for ${label}. Visible text: ${bodyText.slice(0, 500)}`);
}

async function act(cdp, expression, label) {
  if (!(await evaluate(cdp, expression))) {
    throw new Error(`Could not ${label}`);
  }
}

const setValueExpression = (selector, value) => `(() => {
  const element = document.querySelector(${JSON.stringify(selector)});
  if (!element) return false;
  const prototype = element instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : element instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, ${JSON.stringify(value)});
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
})()`;

const selectByTextExpression = (index, text) => `(() => {
  const element = document.querySelectorAll('select')[${index}];
  if (!element) return false;
  const option = [...element.options].find((item) => item.textContent.includes(${JSON.stringify(text)}));
  if (!option) return false;
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(element, option.value);
  element.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
})()`;

const clickTextExpression = (selector, text) => `(() => {
  const element = [...document.querySelectorAll(${JSON.stringify(selector)})]
    .find((item) => item.textContent.includes(${JSON.stringify(text)}));
  if (!element) return false;
  element.click();
  return true;
})()`;

const clickAriaExpression = (label) => `(() => {
  const element = document.querySelector(${JSON.stringify(`[aria-label="${label}"]`)});
  if (!element) return false;
  element.click();
  return true;
})()`;

const bodyIncludesExpression = (text) =>
  `document.body?.innerText.toLocaleLowerCase().includes(${JSON.stringify(text.toLocaleLowerCase())})`;


const chrome = spawn(
  CHROME_PATH,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-allow-origins=*',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profileDir}`,
    '--window-size=420,900',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

let cdp;
try {
  const socket = new WebSocket(await waitForDebugger());
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  cdp = new CdpClient(socket);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Page.navigate', { url: APP_URL });

  await waitFor(cdp, bodyIncludesExpression('Свежие'), 'feed');
  await waitFor(cdp, bodyIncludesExpression('Elektron Digitakt'), 'seeded listing');

  await act(cdp, clickTextExpression('article[role="button"]', 'Elektron Digitakt'), 'open listing detail');
  await waitFor(cdp, bodyIncludesExpression('Написать продавцу'), 'listing detail');
  await act(cdp, clickAriaExpression('Назад'), 'return to feed');
  await waitFor(cdp, bodyIncludesExpression('Свежие'), 'feed after detail');

  await act(cdp, clickAriaExpression('Создать объявление'), 'open create form');
  await waitFor(cdp, bodyIncludesExpression('Новое объявление'), 'create form');

  await act(cdp, setValueExpression('input[placeholder*="https://"]', photoUrl), 'set photo URL');
  await waitFor(cdp, bodyIncludesExpression('Фото готово к публикации'), 'photo preview');
  await act(cdp, setValueExpression('input[placeholder="Korg Minilogue XD"]', title), 'set title');
  await act(cdp, selectByTextExpression(0, 'Сэмплеры'), 'select category');
  await waitFor(cdp, `[...document.querySelectorAll('select')[2].options].some((item) => item.textContent.includes('Digitakt'))`, 'equipment models');
  await act(cdp, selectByTextExpression(2, 'Digitakt'), 'select equipment model');
  await act(cdp, setValueExpression('textarea', 'Объявление создано автоматической проверкой полного MVP-сценария.'), 'set description');
  await act(cdp, setValueExpression('input[type="number"]', '54321'), 'set price');
  await act(cdp, setValueExpression('input[placeholder="Москва"]', 'Moscow'), 'set city');

  await waitFor(
    cdp,
    `[...document.querySelectorAll('button')].some((item) => item.textContent.includes('Опубликовать объявление') && !item.disabled)`,
    'enabled publish button',
  );
  await act(cdp, clickTextExpression('button', 'Опубликовать объявление'), 'publish listing');
  await waitFor(cdp, bodyIncludesExpression(title), 'created listing in feed');

  await act(cdp, clickTextExpression('article[role="button"]', title), 'open created listing');
  await waitFor(cdp, `${bodyIncludesExpression(title)} && ${bodyIncludesExpression('Написать продавцу')}`, 'created listing detail');
  await act(cdp, clickAriaExpression('Назад'), 'return from created listing');
  await waitFor(cdp, bodyIncludesExpression(title), 'created listing in feed again');

  await act(cdp, clickAriaExpression('Профиль'), 'open profile');
  await waitFor(cdp, bodyIncludesExpression('Активные объявления'), 'profile');
  await waitFor(cdp, bodyIncludesExpression(title), 'created listing in profile');

  const profileBio = `UI profile smoke ${Date.now()}`;
  await act(cdp, clickAriaExpression('Редактировать профиль'), 'open profile editor');
  await waitFor(cdp, bodyIncludesExpression('Сохранить профиль'), 'profile editor');
  await act(cdp, setValueExpression('input[placeholder="Demo"]', 'Demo'), 'set profile name');
  await act(cdp, setValueExpression('input[placeholder="Москва"]', 'Moscow'), 'set profile city');
  await act(cdp, setValueExpression('input[placeholder="username"]', 'demo_seller'), 'set profile username');
  await act(cdp, setValueExpression('textarea[placeholder*="Что продаёте"]', profileBio), 'set profile bio');
  await act(cdp, setValueExpression('textarea[placeholder*="Проекты"]', 'UI smoke live project'), 'set profile projects');
  await act(cdp, setValueExpression('textarea[placeholder*="soundcloud"]', 'soundcloud.com/demo'), 'set profile links');
  await act(cdp, clickTextExpression('button', 'Сохранить профиль'), 'save profile');
  await waitFor(cdp, bodyIncludesExpression(profileBio), 'saved profile bio');

  await act(cdp, clickAriaExpression('Чат'), 'open community');
  await waitFor(cdp, `${bodyIncludesExpression('Community')} && ${bodyIncludesExpression('Synthesizers')}`, 'community rooms');
  await act(cdp, clickTextExpression('button', 'Synthesizers'), 'open synth community room');
  await waitFor(cdp, bodyIncludesExpression('#Synthesizers'), 'community room');

  const chatMessage = `UI chat smoke ${Date.now()}`;
  await act(cdp, setValueExpression('input[placeholder="Write a message..."]', chatMessage), 'set chat message');
  await act(
    cdp,
    `(() => {
      const input = document.querySelector('input[placeholder="Write a message..."]');
      const button = input?.parentElement?.querySelector('button');
      if (!button || button.disabled) return false;
      button.click();
      return true;
    })()`,
    'send chat message',
  );
  await waitFor(cdp, bodyIncludesExpression(chatMessage), 'sent chat message');
  await act(cdp, clickAriaExpression('Назад'), 'return from community room');
  await waitFor(cdp, bodyIncludesExpression('Synthesizers'), 'community after room');

  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  await writeFile(SCREENSHOT_PATH, Buffer.from(screenshot.data, 'base64'));

  console.log(`UI smoke check passed for "${title}".`);
  console.log(`Screenshot: ${SCREENSHOT_PATH}`);
} finally {
  if (cdp) {
    await evaluate(cdp, `(async () => {
      const response = await fetch('/api/v1/listings?search=' + encodeURIComponent(${JSON.stringify(title)}) + '&size=100', {
        headers: { 'x-init-data': 'mock' },
      });
      if (!response.ok) return false;
      const listings = await response.json();
      await Promise.all(listings.map((listing) => fetch('/api/v1/listings/' + listing.id, {
        method: 'DELETE',
        headers: { 'x-init-data': 'mock' },
      })));
      return true;
    })()`).catch(() => {});
  }
  chrome.kill();
  if (chrome.exitCode === null) {
    await Promise.race([
      new Promise((resolve) => chrome.once('exit', resolve)),
      sleep(3000),
    ]);
  }
  await rm(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {});
}
