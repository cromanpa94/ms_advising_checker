// popup.js v1.0

function setStatus(msg, cls) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = cls;
}

document.getElementById('runBtn').addEventListener('click', async () => {
  const programKey = document.getElementById('programSelect').value;

  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (programKey) {
      // Manual override: send specific program key
      await browser.tabs.sendMessage(tab.id, { action: 'runWithProgram', programKey });
      setStatus('Panel updated on the page.', 'st-ok');
    } else {
      // Auto-detect: send runWithProgram with null key — content script will auto-detect
      await browser.tabs.sendMessage(tab.id, { action: 'runWithProgram', programKey: null });
      setStatus('Running with auto-detected program.', 'st-info');
    }
  } catch (e) {
    setStatus('Could not reach the page. Try reloading the page and opening the POS again.', 'st-err');
  }
});

document.getElementById('closeBtn').addEventListener('click', async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    await browser.tabs.sendMessage(tab.id, { action: 'closePanel' });
    setStatus('Panel closed.', 'st-info');
  } catch (e) {
    setStatus('Could not reach the page.', 'st-err');
  }
});
