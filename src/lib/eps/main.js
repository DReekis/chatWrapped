/**
 * Minimal main-thread glue for EPS worker.
 * Responsibilities:
 * - Read .txt file
 * - Split into lines only (no full parsing on main thread)
 * - Delegate all computation to Web Worker
 */

export function analyzeChatFileWithEPS(file) {
  if (!file) {
    return Promise.reject(new Error('No file provided'));
  }
  if (!file.name.toLowerCase().endsWith('.txt')) {
    return Promise.reject(new Error('Only WhatsApp .txt exports are supported'));
  }

  return file.text().then((text) => {
    return analyzeChatTextWithEPS(text);
  });
}

export function analyzeChatTextWithEPS(text) {
  const lines = splitLines(text);
  const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

  return new Promise((resolve, reject) => {
    let finished = false;

    worker.onmessage = (event) => {
      if (finished) return;
      finished = true;
      worker.terminate();

      if (event.data?.ok) {
        resolve(event.data.result);
        return;
      }
      reject(new Error(event.data?.error || 'EPS worker error'));
    };

    worker.onerror = () => {
      if (finished) return;
      finished = true;
      worker.terminate();
      reject(new Error('EPS worker crashed'));
    };

    worker.postMessage({ lines });
  });
}

function splitLines(text) {
  // Fast line split that handles \n and \r\n without regex over full content.
  const lines = [];
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const c = text.charCodeAt(i);
    if (c === 10 || c === 13) {
      lines.push(text.slice(start, i));
      if (c === 13 && i + 1 < text.length && text.charCodeAt(i + 1) === 10) i += 1;
      start = i + 1;
    }
  }
  if (start <= text.length) lines.push(text.slice(start));
  return lines;
}
