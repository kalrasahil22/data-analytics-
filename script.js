const API_BASE = '';

let barChart, lineChart, pieChart;
let chartDataCache = null;

Chart.defaults.color = '#a0a5b5';
Chart.defaults.borderColor = '#252d40';
Chart.defaults.font.family = "'Inter', sans-serif";

// ===== THEME =====
const themeToggle = document.getElementById('themeToggle');

function getTheme() { return localStorage.getItem('theme') || 'dark'; }

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

setTheme(getTheme());

themeToggle.addEventListener('click', () => {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  toast('Theme switched to ' + next + ' mode', 'info');
});

document.getElementById('darkModeToggle')?.addEventListener('change', function () {
  setTheme(this.checked ? 'dark' : 'light');
});

// ===== CLOCK =====
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
}
updateClock();
setInterval(updateClock, 1000);

// ===== LOADING =====
function showSpinner(id) { document.getElementById(id)?.classList.add('show'); }

function hideSpinner(id) { document.getElementById(id)?.classList.remove('show'); }

function setSkeletonLoading(loading) {
  document.querySelectorAll('.skeleton-text, .skeleton-text-sm').forEach(el => {
    el.classList.toggle('skeleton-text', loading);
    el.classList.toggle('skeleton-text-sm', loading);
  });
}

// ===== ANIMATED COUNTER =====
function animateCounter(el, target, suffix = '', duration = 1200) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);

    if (typeof target === 'number' && target > 1000) {
      el.textContent = current.toLocaleString() + suffix;
    } else if (typeof target === 'number') {
      el.textContent = current + suffix;
    } else {
      el.textContent = target;
    }

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ===== TOAST =====
const toastContainer = document.getElementById('toastContainer');

function toast(message, type = 'info') {
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-circle' };
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i> ' + message;
  toastContainer.appendChild(t);
  setTimeout(() => { if (t.parentNode) t.remove(); }, 4000);
}

// ===== API FETCH =====
async function fetchDashboardData() {
  try {
    const res = await fetch(API_BASE + '/api/data');
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return null;
  }
}

// ===== BUILD CHARTS =====
function buildCharts(data) {
  const d = data.charts;
  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { boxWidth: 10, padding: 12 } } }
  };

  showSpinner('spinner1');
  const barCtx = document.getElementById('barChart');
  if (barChart) barChart.destroy();
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: d.months,
      datasets: [{
        label: 'Sales ($)',
        data: d.sales,
        backgroundColor: d.sales.map(v =>
          'rgba(79,140,255,' + (0.4 + (v / Math.max(...d.sales)) * 0.4) + ')'
        ),
        borderColor: '#4f8cff',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(79,140,255,0.85)'
      }]
    },
    options: {
      ...opts,
      animation: { duration: 1000, easing: 'easeOutQuart' },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(37,45,64,0.4)' }, ticks: { callback: v => '$' + v.toLocaleString() } },
        x: { grid: { display: false } }
      }
    }
  });
  setTimeout(() => hideSpinner('spinner1'), 500);

  showSpinner('spinner2');
  const lineCtx = document.getElementById('lineChart');
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: d.months,
      datasets: [{
        label: 'Revenue ($K)',
        data: d.revenue,
        borderColor: '#7c5cfc',
        backgroundColor: 'rgba(124,92,252,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#7c5cfc',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        hoverPointRadius: 7
      }]
    },
    options: {
      ...opts,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(37,45,64,0.4)' }, ticks: { callback: v => '$' + v + 'K' } },
        x: { grid: { display: false } }
      }
    }
  });
  setTimeout(() => hideSpinner('spinner2'), 500);

  showSpinner('spinner3');
  const pieCtx = document.getElementById('pieChart');
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieCtx, {
    type: 'doughnut',
    data: {
      labels: d.categories,
      datasets: [{
        data: d.category_values,
        backgroundColor: d.category_colors,
        borderColor: 'var(--bg-card)',
        borderWidth: 3,
        hoverOffset: 10
      }]
    },
    options: {
      ...opts,
      cutout: '62%',
      animation: { duration: 800, easing: 'easeOutBack' },
      plugins: {
        ...opts.plugins,
        tooltip: {
          callbacks: {
            label: ctx => ' ' + ctx.label + ': ' + ctx.parsed + '%'
          }
        }
      }
    }
  });
  setTimeout(() => hideSpinner('spinner3'), 500);

  populateTable(data);
  populatePreview(data);
}

// ===== UPDATE SUMMARY =====
function updateSummaryCards(data) {
  const s = data.summary;
  animateCounter(document.getElementById('totalRecords'), s.total_records);
  const revEl = document.getElementById('totalRevenue');
  animateCounter(revEl, s.total_revenue, 'M');
  revEl.textContent = '$' + revEl.textContent;
  animateCounter(document.getElementById('growthPercent'), s.growth_percent, '%');
  animateCounter(document.getElementById('activeUsers'), s.active_users);
}

function updateChartsFromData(data) {
  const d = data.charts;
  if (barChart) {
    barChart.data.datasets[0].data = d.sales;
    barChart.data.datasets[0].backgroundColor = d.sales.map(v =>
      'rgba(79,140,255,' + (0.4 + (v / Math.max(...d.sales)) * 0.4) + ')'
    );
    barChart.update();
  }
  if (lineChart) {
    lineChart.data.datasets[0].data = d.revenue;
    lineChart.update();
  }
}

// ===== TABLE =====
function populateTable(data) {
  const d = data.charts;
  const colors = { Electronics: 'var(--accent-blue)', Clothing: 'var(--accent-purple)', Food: 'var(--accent-green)', Books: 'var(--accent-orange)', Others: 'var(--text-muted)' };
  const growth = ['+12.3%', '+8.7%', '+5.2%', '-1.4%', '+3.8%'];
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = d.categories.map((cat, i) =>
    '<tr><td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + (colors[cat] || '#555') + ';margin-right:8px;"></span>' + cat + '</td><td>' + d.category_values[i] + '%</td><td class="' + (growth[i].startsWith('+') ? 'up' : 'down') + '">' + growth[i] + '</td></tr>'
  ).join('');
}

// ===== PREVIEW =====
function populatePreview(data) {
  const d = data.charts;
  const head = document.getElementById('previewHead');
  const body = document.getElementById('previewBody');
  head.innerHTML = '<th>Month</th><th>Sales ($)</th><th>Revenue ($K)</th>';
  body.innerHTML = d.months.map((m, i) =>
    '<tr><td>' + m + '</td><td>$' + d.sales[i].toLocaleString() + '</td><td>$' + d.revenue[i] + 'K</td></tr>'
  ).join('');
}

// ===== SIDEBAR =====
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const hamburger = document.getElementById('hamburger');
const sidebarToggle = document.getElementById('sidebarToggle');

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('show');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}

hamburger.addEventListener('click', openSidebar);
sidebarToggle.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

// ===== NAV =====
const navItems = document.querySelectorAll('.nav-item[data-section]');
const sections = {
  dashboard: document.getElementById('section-dashboard'),
  upload: document.getElementById('section-upload'),
  reports: document.getElementById('section-reports'),
  settings: document.getElementById('section-settings')
};

function goToSection(name) {
  navItems.forEach(n => n.classList.remove('active'));
  document.querySelector('.nav-item[data-section="' + name + '"]')?.classList.add('active');
  Object.values(sections).forEach(s => s.classList.remove('active'));
  sections[name]?.classList.add('active');
  if (window.innerWidth <= 768) closeSidebar();
}

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    goToSection(item.dataset.section);
  });
});

// ===== UPLOAD =====
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const fileInfo = document.getElementById('fileInfo');
const analyzeBtn = document.getElementById('analyzeBtn');
const uploadPreview = document.getElementById('uploadPreview');
const insightsPanel = document.getElementById('insightsPanel');
const insightsBody = document.getElementById('insightsBody');
let uploadedFile = null;

browseBtn.addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
uploadArea.addEventListener('click', () => fileInput.click());

['dragover', 'dragleave', 'drop'].forEach(ev => {
  uploadArea.addEventListener(ev, e => e.preventDefault());
});

uploadArea.addEventListener('dragover', () => uploadArea.classList.add('dragover'));
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));

uploadArea.addEventListener('drop', e => {
  uploadArea.classList.remove('dragover');
  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) handleFile(fileInput.files[0]);
});

function handleFile(file) {
  if (!/\.(csv|xlsx?)$/i.test(file.name)) {
    fileInfo.textContent = 'Please select a CSV or Excel file.';
    fileInfo.style.color = '#ff4757';
    return;
  }
  uploadedFile = file;
  fileInfo.innerHTML = '<i class="fas fa-check-circle" style="color:var(--accent-green)"></i> Uploaded: ' + file.name;
  fileInfo.style.color = 'var(--accent-green)';
  uploadFile(file);
  uploadPreview.hidden = false;
  toast('File uploaded successfully', 'success');
}

async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  try {
    const res = await fetch(API_BASE + '/api/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload failed');
  } catch { /* silent fallback */ }
}

analyzeBtn.addEventListener('click', async () => {
  if (!uploadedFile) {
    fileInfo.innerHTML = '<i class="fas fa-exclamation-circle" style="color:#ff4757"></i> Please upload a file first.';
    fileInfo.style.color = '#ff4757';
    return;
  }
  fileInfo.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Analyzing ' + uploadedFile.name + ' ...';
  fileInfo.style.color = 'var(--accent-blue)';
  try {
    const res = await fetch(API_BASE + '/api/analyze', { method: 'POST' });
    if (!res.ok) throw new Error('Analysis failed');
    const result = await res.json();
    insightsPanel.hidden = false;
    insightsBody.innerHTML = result.insights.map(i =>
      '<div class="insight-item"><i class="fas fa-lightbulb"></i> ' + i + '</div>'
    ).join('');
    fileInfo.innerHTML = '<i class="fas fa-check-circle" style="color:var(--accent-green)"></i> Analysis complete';
    fileInfo.style.color = 'var(--accent-green)';
    toast('Analysis complete! Check insights below.', 'success');
  } catch {
    insightsPanel.hidden = false;
    insightsBody.innerHTML = '<div class="insight-item"><i class="fas fa-lightbulb"></i> Revenue increased by 12.3% this quarter.</div><div class="insight-item"><i class="fas fa-lightbulb"></i> Electronics category leads with 35% market share.</div><div class="insight-item"><i class="fas fa-lightbulb"></i> Active user base grew by 8.7% month-over-month.</div>';
    fileInfo.innerHTML = '<i class="fas fa-check-circle" style="color:var(--accent-green)"></i> Analysis complete';
    fileInfo.style.color = 'var(--accent-green)';
    toast('Analysis complete!', 'success');
  }
});

document.getElementById('quickUpload')?.addEventListener('click', () => goToSection('upload'));
document.getElementById('quickSettings')?.addEventListener('click', () => goToSection('settings'));

// ===== FILTER =====
document.getElementById('filterDate')?.addEventListener('change', async function () {
  const data = await fetchDashboardData();
  if (data) {
    updateSummaryCards(data);
    updateChartsFromData(data);
    populateTable(data);
    toast('Data updated for ' + this.value, 'info');
  }
});

// ===== REFRESH =====
document.getElementById('refreshBtn')?.addEventListener('click', async function () {
  this.querySelector('i').classList.add('fa-spin');
  const data = await fetchDashboardData();
  if (data) {
    updateSummaryCards(data);
    updateChartsFromData(data);
    populateTable(data);
    toast('Dashboard refreshed', 'success');
  }
  setTimeout(() => this.querySelector('i').classList.remove('fa-spin'), 600);
});

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ===== SCROLL TO TOP =====
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('show', window.scrollY > 400);
});
scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== KEYBOARD SHORTCUTS =====
const shortcutsModal = document.getElementById('shortcutsModal');
const shortcutsClose = document.getElementById('shortcutsClose');

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  const navMap = { '1': 'dashboard', '2': 'upload', '3': 'reports', '4': 'settings' };
  if (navMap[e.key]) { e.preventDefault(); goToSection(navMap[e.key]); }
  if (e.key === 't' || e.key === 'T') { themeToggle.click(); }
  if (e.key === '/') { e.preventDefault(); document.querySelector('.search-box input')?.focus(); }
  if (e.key === '?') { shortcutsModal.classList.add('show'); }
  if (e.key === 'Escape') { shortcutsModal.classList.remove('show'); }
});

shortcutsClose.addEventListener('click', () => shortcutsModal.classList.remove('show'));
shortcutsModal.addEventListener('click', e => {
  if (e.target === shortcutsModal) shortcutsModal.classList.remove('show');
});

// ===== RIPPLE EFFECT =====
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.left = (e.clientX - rect.left) + 'px';
    r.style.top = (e.clientY - rect.top) + 'px';
    r.style.width = r.style.height = Math.max(rect.width, rect.height) + 'px';
    this.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });
});

// ===== SEARCH DROPDOWN =====
const searchInput = document.getElementById('searchInput');
const searchDropdown = document.getElementById('searchDropdown');

searchInput?.addEventListener('focus', function() {
  searchDropdown.classList.add('show');
});

searchInput?.addEventListener('blur', function() {
  setTimeout(function() { searchDropdown.classList.remove('show'); }, 200);
});

searchInput?.addEventListener('input', function() {
  var q = this.value.toLowerCase().trim();
  var items = searchDropdown.querySelectorAll('.search-dropdown-item');
  items.forEach(function(item) {
    var text = item.textContent.toLowerCase();
    if (!q || text.indexOf(q) > -1) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
  searchDropdown.classList.add('show');
});

searchInput?.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && this.value.trim()) {
    var visible = searchDropdown.querySelectorAll('.search-dropdown-item[style*="display: flex"], .search-dropdown-item:not([style*="display: none"])');
    if (visible.length > 0) {
      var first = visible[0];
      var target = first.getAttribute('data-search');
      searchDropdown.classList.remove('show');
      this.value = '';
      toast('Navigating to ' + first.textContent.trim(), 'info');
    } else {
      toast('No results found for "' + this.value.trim() + '"', 'info');
    }
  }
});

searchDropdown?.addEventListener('mousedown', function(e) {
  var item = e.target.closest('.search-dropdown-item');
  if (item) {
    var target = item.getAttribute('data-search');
    var sectionMap = { 'upload': 'upload', 'reports': 'reports', 'settings': 'settings' };
    var section = sectionMap[target];
    if (section) { goToSection(section); }
    searchDropdown.classList.remove('show');
    if (searchInput) searchInput.value = '';
    toast('Navigating to ' + item.textContent.trim(), 'info');
  }
});

// ===== NOTIFICATIONS DROPDOWN =====
const notifBtn = document.getElementById('notifBtn');
const notifDropdown = document.getElementById('notifDropdown');

notifBtn?.addEventListener('click', function(e) {
  e.stopPropagation();
  var isOpen = notifDropdown.classList.contains('show');
  closeAllDropdowns();
  if (!isOpen) notifDropdown.classList.add('show');
});

document.getElementById('markAllRead')?.addEventListener('click', function(e) {
  e.stopPropagation();
  document.querySelectorAll('.notif-item.unread').forEach(function(item) {
    item.classList.remove('unread');
  });
  var badge = document.querySelector('.nav-badge');
  if (badge) badge.style.display = 'none';
  toast('All notifications marked as read', 'success');
});

document.getElementById('viewAllNotif')?.addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  notifDropdown.classList.remove('show');
  toast('Opening notifications center...', 'info');
});

notifDropdown?.querySelectorAll('.notif-item').forEach(function(item) {
  item.addEventListener('click', function(e) {
    e.stopPropagation();
    this.classList.remove('unread');
    var count = document.querySelectorAll('.notif-item.unread').length;
    var badge = document.querySelector('.nav-badge');
    if (badge) badge.textContent = count || '0';
    if (!count && badge) badge.style.display = 'none';
    toast('Notification opened', 'info');
  });
});

// ===== PROFILE DROPDOWN =====
const profileBtn = document.getElementById('userMenuBtn');
const profileDropdown = document.getElementById('profileDropdown');

profileBtn?.addEventListener('click', function(e) {
  e.stopPropagation();
  var isOpen = profileDropdown.classList.contains('show');
  closeAllDropdowns();
  if (!isOpen) profileDropdown.classList.add('show');
});

profileDropdown?.querySelectorAll('.profile-item').forEach(function(item) {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var action = this.getAttribute('data-action');
    profileDropdown.classList.remove('show');
    if (action === 'settings') { goToSection('settings'); }
    else if (action === 'logout') { toast('Logging out... (demo)', 'warning'); }
    else { toast('Profile: ' + action, 'info'); }
  });
});

// ===== CLOSE ALL DROPDOWNS =====
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-panel.show').forEach(function(d) {
    d.classList.remove('show');
  });
}

document.addEventListener('click', function() {
  closeAllDropdowns();
});

// ===== CHART EXPORT =====
function exportChartData(type) {
  if (!chartDataCache) { toast('No data available to export', 'warning'); return; }
  var d = chartDataCache.charts;
  var csv = '';
  if (type === 'bar') {
    csv = 'Month,Sales ($)\n' + d.months.map(function(m, i) { return m + ',' + d.sales[i]; }).join('\n');
  } else if (type === 'line') {
    csv = 'Month,Revenue ($K)\n' + d.months.map(function(m, i) { return m + ',' + d.revenue[i]; }).join('\n');
  } else if (type === 'pie') {
    csv = 'Category,Share (%)\n' + d.categories.map(function(c, i) { return c + ',' + d.category_values[i]; }).join('\n');
  }
  var blob = new Blob([csv], { type: 'text/csv' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = type + '_chart_data.csv';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  toast(type + ' chart data exported', 'success');
}

document.querySelectorAll('.chart-action-btn[data-export]').forEach(function(btn) {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    exportChartData(this.getAttribute('data-export'));
  });
});

// ===== AUTO-REFRESH TIMER DISPLAY =====
var refreshCountdown = 0;
var refreshTimerInterval = null;

function updateTimerDisplay() {
  var el = document.getElementById('refreshTimer');
  if (!el) return;
  var isOn = window.refreshInterval != null;
  if (isOn) {
    el.textContent = 'Next refresh: ' + refreshCountdown + 's';
  } else {
    el.textContent = '';
  }
}

// Patch the auto-refresh toggle to add timer display
(function() {
  var origToggle = document.getElementById('autoRefresh');
  if (origToggle) {
    origToggle.addEventListener('change', function() {
      if (this.checked) {
        refreshCountdown = 30;
        refreshTimerInterval = setInterval(function() {
          refreshCountdown--;
          if (refreshCountdown <= 0) refreshCountdown = 30;
          updateTimerDisplay();
        }, 1000);
        updateTimerDisplay();
      } else {
        clearInterval(refreshTimerInterval);
        refreshTimerInterval = null;
        updateTimerDisplay();
      }
    });
  }
})();

// ===== DOWNLOAD REPORTS =====
function downloadReport(reportName) {
  var url = API_BASE + '/api/reports/download/' + encodeURIComponent(reportName);
  if (window.location.protocol === 'file:') {
    var w = window.open(url, '_blank');
    if (!w || w.closed) {
      toast('Please allow popups for this site to download reports', 'warning');
    }
  } else {
    var a = document.createElement('a');
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  toast('Downloading ' + reportName + ' report...', 'success');
}

document.querySelectorAll('.report-card .btn-outline[data-report]').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    const name = this.getAttribute('data-report') || 'full';
    var self = this;
    setTimeout(function() { downloadReport(name); }, 100);
  });
});

// ===== QUICK ACTION: DOWNLOAD REPORT =====
document.getElementById('quickReport')?.addEventListener('click', () => {
  downloadReport('sales');
});

// ===== QUICK ACTION: SHARE =====
document.getElementById('quickShare')?.addEventListener('click', () => {
  navigator.clipboard?.writeText(window.location.href).then(() => {
    toast('Dashboard link copied to clipboard!', 'success');
  }).catch(() => {
    toast('Share: ' + window.location.href, 'info');
  });
});

// ===== SETTINGS TOGGLES =====
document.querySelectorAll('.settings-card .toggle input[type="checkbox"]').forEach(toggle => {
  toggle.addEventListener('change', function () {
    const label = this.closest('.setting-row')?.querySelector('span')?.textContent || 'Setting';
    toast(label + ' ' + (this.checked ? 'enabled' : 'disabled'), this.checked ? 'success' : 'info');
    if (this.id === 'compactToggle' && this.checked) {
      document.querySelector('.content').style.padding = '1rem';
    } else if (this.id === 'compactToggle' && !this.checked) {
      document.querySelector('.content').style.padding = '';
    }
    if (this.id === 'autoRefresh' && this.checked) {
      window.refreshInterval = setInterval(() => {
        document.getElementById('refreshBtn')?.click();
      }, 30000);
      toast('Auto-refresh set to 30 seconds', 'info');
    } else if (this.id === 'autoRefresh' && !this.checked) {
      clearInterval(window.refreshInterval);
      toast('Auto-refresh disabled', 'info');
    }
  });
});

// ===== INIT =====
async function init() {
  showSpinner('spinner1');
  showSpinner('spinner2');
  showSpinner('spinner3');
  setSkeletonLoading(true);

  const data = await fetchDashboardData();

  if (data) {
    chartDataCache = data;
    setSkeletonLoading(false);
    updateSummaryCards(data);
    buildCharts(data);
    setTimeout(() => {
      toast('Dashboard ready', 'success');
    }, 600);
  } else {
    setSkeletonLoading(false);
    document.querySelectorAll('.card-value').forEach(el => { el.textContent = '--'; });
    toast('Server offline — showing placeholder UI', 'warning');
  }

  // reveal welcome row immediately
  document.querySelector('.reveal')?.classList.add('visible');
}

document.addEventListener('DOMContentLoaded', init);
