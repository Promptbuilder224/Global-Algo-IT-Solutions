const base = '';

async function fetchJSON(url, options = {}) {
  const opts = {
    credentials: 'include',
    headers: { ...(options.headers || {}) },
    ...options
  };
  // Only set Content-Type if we actually have a body
  if (opts.body) opts.headers['Content-Type'] = 'application/json';
  const res = await fetch(base + url, opts);
  const text = await res.text();
  try { return JSON.parse(text); } catch (_) { return text; }
}

document.getElementById('btnLogin').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetchJSON('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  document.getElementById('loginResult').innerText = JSON.stringify(res, null, 2);
});

document.getElementById('btnCreateCampaign').addEventListener('click', async () => {
  const name = document.getElementById('campaignName').value;
  const template_body = document.getElementById('campaignTemplate').value;
  const res = await fetchJSON('/api/campaigns', { method: 'POST', body: JSON.stringify({ name, template_body }) });
  document.getElementById('createCampaignResult').innerText = JSON.stringify(res, null, 2);
  // Fill start/id boxes so you can quickly use them
  if (res && res.id) {
    document.getElementById('campaignIdStart').value = res.id;
    document.getElementById('campaignIdStatus').value = res.id;
  }
});

document.getElementById('btnStartCampaign').addEventListener('click', async () => {
  const id = document.getElementById('campaignIdStart').value;
  const res = await fetchJSON(`/api/campaigns/${id}/start`, { method: 'POST' });
  document.getElementById('startResult').innerText = JSON.stringify(res, null, 2);
});

document.getElementById('btnGetStatus').addEventListener('click', async () => {
  const id = document.getElementById('campaignIdStatus').value;
  const res = await fetchJSON(`/api/campaigns/${id}`, { method: 'GET' });
  document.getElementById('statusResult').innerText = JSON.stringify(res, null, 2);
});
