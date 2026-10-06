const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
  });
});

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

async function loadPublishedContent() {
  const [scheduleResponse, newsResponse] = await Promise.all([fetch('api/schedules.php'), fetch('api/news.php')]);
  if (!scheduleResponse.ok || !newsResponse.ok) return;
  const { data: schedules } = await scheduleResponse.json();
  const { data: news } = await newsResponse.json();

  if (schedules?.length) {
    document.querySelector('#public-schedule-list').innerHTML = schedules.map((item) => `
      <article class="service-card ${item.featured ? 'featured' : ''}">
        <div class="service-time">${escapeHtml(item.service_time.slice(0, 5))} <span>WIB</span></div>
        <div class="service-info"><span class="service-type">${escapeHtml(item.title)}</span><strong>${escapeHtml(item.minister || 'Pelayan ibadah')}</strong></div>
        <a href="#kontak" class="round-arrow" aria-label="Detail ibadah">↗</a>
      </article>`).join('');
  }

  if (news?.length) {
    const latest = news[0];
    const card = document.querySelector('#public-latest-news');
    card.querySelector('.news-date').textContent = new Date(`${latest.published_at}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    card.querySelector('h3').textContent = latest.title;
    const link = card.querySelector('.text-link');
    link.href = latest.file_url || '#kontak';
    link.target = latest.file_url ? '_blank' : '';
  }
}

loadPublishedContent().catch(() => {});
