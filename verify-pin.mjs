import { writeFileSync, mkdirSync } from "fs";

const PORT = "9224";
const OUT = ".freebuff/pin-check";
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
};
await new Promise((r) => (ws.onopen = r));
const send = (method, params = {}) =>
  new Promise((res) => {
    const mid = ++id;
    pending.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
const ev = async (expression) => {
  const res = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.result?.exceptionDetails) {
    return { pageError: res.result.exceptionDetails.exception?.description || res.result.exceptionDetails.text };
  }
  return res.result?.result?.value;
};

await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.enable");
await send("Page.navigate", { url: "http://localhost:3000/organizer" });
await sleep(6000);

// snapshot helper
const snap = async () => {
  const raw = await ev(`(() => {
    const root = Array.from(document.querySelectorAll('section')).find(s => String(s.className).includes('slider-module__'));
    const scroller = root.querySelector('[class*="scroller"]');
    const bar = root.querySelector('[class*="progressBar"]');
    const r = root.getBoundingClientRect();
    const sr = scroller.getBoundingClientRect();
    const br = bar.getBoundingClientRect();
    const intro = scroller.children[0].getBoundingClientRect();
    const outro = scroller.children[7].getBoundingClientRect();
    return JSON.stringify({
      scrollY: Math.round(window.scrollY),
      rootPos: getComputedStyle(root).position,
      root: { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), bg: getComputedStyle(root).backgroundColor },
      scrollerX: Math.round(sr.left),
      bar: { top: Math.round(br.top), bottom: Math.round(br.bottom), transform: bar.style.transform },
      introLeft: Math.round(intro.left),
      outro: { left: Math.round(outro.left), right: Math.round(outro.right) },
    });
  })()`);
  return JSON.parse(raw);
};

const shot = async (name) => {
  const res = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(res.result.data, "base64"));
  console.log(`SAVED ${name}.png`);
};

// find the pin start: scroll until the section top is at ~64
let pinStartY = null;
for (let i = 0; i < 200 && pinStartY === null; i++) {
  await ev(`window.scrollBy(0, 120)`);
  await sleep(120);
  const s = await snap();
  if (s.root.top <= 70 && s.root.top >= 55) pinStartY = s.scrollY;
}
console.log("PIN_START_Y:", pinStartY);
await sleep(1200); // let the pin settle
console.log("AT_PIN_START:", JSON.stringify(await snap()));
await shot("1-pin-start-intro");

// scrub forward ~3 slides
await ev(`window.scrollBy(0, 4000)`);
await sleep(1500);
console.log("SCRUB_FWD:", JSON.stringify(await snap()));
await shot("2-scrub-forward");

// scrub back to the start (reverse)
const startY = pinStartY;
await ev(`window.scrollTo(0, ${startY})`);
await sleep(1500);
console.log("SCRUB_BACK:", JSON.stringify(await snap()));

// scrub to the very end of the pin
await ev(`window.scrollBy(0, 20000)`);
await sleep(2000);
console.log("AT_PIN_END:", JSON.stringify(await snap()));
await shot("3-pin-end-outro-exit");

// and back up again to confirm reverse from the end
await ev(`window.scrollBy(0, -6000)`);
await sleep(1500);
console.log("REVERSE_FROM_END:", JSON.stringify(await snap()));

ws.close();
console.log("DONE");
