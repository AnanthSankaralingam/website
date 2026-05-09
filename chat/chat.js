import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';
import { PERSON_CONTEXT } from './context.js';

const MODEL_ID = 'Xenova/distilbert-base-uncased-distilled-squad';
const CHUNK_SOFT_LIMIT = 900;
const SCORE_THRESHOLD = 0.04;

const els = {
  form: document.getElementById('chat-form'),
  input: document.getElementById('chat-input'),
  send: document.getElementById('chat-send'),
  log: document.getElementById('chat-log'),
  status: document.getElementById('chat-status'),
};

function chunkContext(text, maxLen = CHUNK_SOFT_LIMIT) {
  const paras = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks = [];
  let cur = '';
  for (const p of paras) {
    const next = cur ? `${cur}\n\n${p}` : p;
    if (next.length > maxLen && cur) {
      chunks.push(cur);
      cur = p;
    } else {
      cur = next;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

const chunks = chunkContext(PERSON_CONTEXT);

let qa = null;
let loadPromise = null;

function setBusy(busy) {
  els.input.disabled = busy;
  els.send.disabled = busy;
}

function appendBubble(role, text) {
  const row = document.createElement('div');
  row.className = `chat-row chat-row--${role}`;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble--${role}`;
  bubble.textContent = text;
  row.appendChild(bubble);
  els.log.appendChild(row);
  els.log.scrollTop = els.log.scrollHeight;
}

async function ensureModel() {
  if (qa) return qa;
  if (!loadPromise) {
    els.status.hidden = false;
    els.status.textContent = 'Loading model… (first visit may download tens of MB)';
    loadPromise = pipeline('question-answering', MODEL_ID, {
      progress_callback: (info) => {
        if (info.status === 'progress' && typeof info.progress === 'number' && info.file) {
          els.status.textContent = `Loading ${info.file} — ${Math.round(info.progress)}%`;
        } else if (info.status === 'progress_total' && typeof info.progress === 'number') {
          els.status.textContent = `Loading model — ${Math.round(info.progress)}%`;
        }
      },
    }).then((pipe) => {
      qa = pipe;
      els.status.textContent = 'Ready — answers are extracted on-device from this profile.';
      return pipe;
    });
  }
  return loadPromise;
}

async function answerQuestion(question) {
  const q = question.trim();
  if (!q) return '';

  let best = { score: -Infinity, answer: '' };

  for (const ctx of chunks) {
    const out = await qa(q, ctx);
    if (out.score > best.score) {
      best = { score: out.score, answer: out.answer };
    }
  }

  if (best.score < SCORE_THRESHOLD || !best.answer) {
    return "I can only answer from Ananth's public profile on this site, and I didn't find a clear match. Try naming a topic (chromie.dev, Promptly, NeurIPS, internships, research, music, or triathlon).";
  }

  return best.answer.trim();
}

els.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = els.input.value.trim();
  if (!text) return;

  appendBubble('user', text);
  els.input.value = '';
  setBusy(true);
  els.status.hidden = false;
  els.status.textContent = 'Thinking…';

  try {
    await ensureModel();
    const reply = await answerQuestion(text);
    appendBubble('assistant', reply);
    els.status.textContent = 'Ready — answers are extracted on-device from this profile.';
  } catch (err) {
    console.error(err);
    appendBubble(
      'assistant',
      "Something went wrong running the model in your browser. Check the console, try another browser, or reload the page.",
    );
    els.status.textContent = 'Error loading or running the model.';
  } finally {
    setBusy(false);
  }
});

ensureModel().catch((err) => {
  console.error(err);
  els.status.hidden = false;
  els.status.textContent = 'Could not start the model. Check your connection and try again.';
});
