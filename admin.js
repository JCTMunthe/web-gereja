const get = (selector) => document.querySelector(selector);
const api = (path, options = {}) => fetch(`api/${path}`, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
const showMessage = (selector, text, success = false) => { const element = get(selector); element.textContent = text; element.className = `admin-message${success ? ' success' : ''}`; };
const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
const fixedScheduleSlots = [
  { time: '06:00:00', title: '#schedule-06-title', minister: '#schedule-06-minister' },
  { time: '09:00:00', title: '#schedule-09-title', minister: '#schedule-09-minister' },
  { time: '17:00:00', title: '#schedule-17-title', minister: '#schedule-17-minister' },
];

async function readJson(response) {
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `Permintaan gagal (${response.status}).`);
  return result;
}

async function refreshTables() {
  const [scheduleResponse, newsResponse] = await Promise.all([api('schedules.php'), api('news.php')]);
  const [{ data: schedules }, { data: news }] = await Promise.all([readJson(scheduleResponse), readJson(newsResponse)]);
  if (!Array.isArray(schedules) || !Array.isArray(news)) throw new Error('Format data dari server tidak valid.');

  get('#schedule-table').innerHTML = schedules.length
    ? `<table class="admin-table"><tr><th>Tanggal</th><th>Jam</th><th>Judul</th><th>Pelayan</th><th></th></tr>${schedules.map((item) => `<tr><td>${formatDate(item.service_date)}</td><td>${item.service_time.slice(0, 5)}</td><td>${item.title}</td><td>${item.minister || '-'}</td><td><button class="admin-button danger delete-schedule" data-id="${item.id}">Hapus</button></td></tr>`).join('')}</table>`
    : '<p class="empty">Belum ada jadwal.</p>';
  get('#news-table').innerHTML = news.length
    ? `<table class="admin-table"><tr><th>Tanggal</th><th>Judul</th><th>PDF</th><th></th></tr>${news.map((item) => `<tr><td>${formatDate(item.published_at)}</td><td>${item.title}</td><td>${item.file_url ? `<a href="${item.file_url}" target="_blank">Buka PDF</a>` : '-'}</td><td><button class="admin-button danger delete-news" data-id="${item.id}">Hapus</button></td></tr>`).join('')}</table>`
    : '<p class="empty">Belum ada warta.</p>';

  document.querySelectorAll('.delete-schedule').forEach((button) => button.addEventListener('click', async () => { await api(`schedules.php?id=${button.dataset.id}`, { method: 'DELETE' }); refreshTables(); }));
  document.querySelectorAll('.delete-news').forEach((button) => button.addEventListener('click', async () => { await api(`news.php?id=${button.dataset.id}`, { method: 'DELETE' }); refreshTables(); }));
}

async function showDashboard() {
  await refreshTables();
  get('#login-panel').classList.add('hidden');
  get('#dashboard').classList.remove('hidden');
}

get('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const response = await api('login.php', { method: 'POST', body: JSON.stringify({ email: get('#email').value, password: get('#password').value }) });
  let result;
  try {
    result = await readJson(response);
  } catch (error) {
    return showMessage('#login-message', error.message || 'Login gagal.');
  }
  showDashboard().catch((error) => showMessage('#login-message', `Login berhasil, tetapi data belum dapat dimuat: ${error.message}`));
});

get('#logout').addEventListener('click', async () => { await api('logout.php', { method: 'POST' }); window.location.reload(); });
get('#schedule-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const serviceDate = get('#schedule-date').value;
  const requests = fixedScheduleSlots.map((slot) => api('schedules.php', { method: 'POST', body: JSON.stringify({ service_date: serviceDate, service_time: slot.time, title: get(slot.title).value, minister: get(slot.minister).value }) }));
  try {
    await Promise.all(requests.map((request) => request.then(readJson)));
    event.target.reset(); showMessage('#schedule-message', 'Tiga jadwal utama berhasil disimpan.', true); refreshTables();
  } catch (error) {
    showMessage('#schedule-message', error.message || 'Jadwal gagal disimpan.');
  }
});
get('#news-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const response = await api('news.php', { method: 'POST', body: JSON.stringify({ published_at: get('#news-date').value, title: get('#news-title').value, file_url: get('#news-url').value || null }) });
  const result = await response.json();
  if (!response.ok) return showMessage('#news-message', result.error || 'Warta gagal disimpan.');
  event.target.reset(); showMessage('#news-message', 'Warta berhasil disimpan.', true); refreshTables();
});

api('me.php').then((response) => response.json()).then((session) => { if (session.authenticated) showDashboard().catch(() => {}); });
