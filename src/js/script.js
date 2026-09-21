import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDy9fJVklgI-Auc-KmY_0YWB0i7a7Mm5i0",
  authDomain: "visite-aguas.firebaseapp.com",
  projectId: "visite-aguas",
  storageBucket: "visite-aguas.firebasestorage.app",
  messagingSenderId: "1027679323436",
  appId: "1:1027679323436:web:e74b50fb4936e5fa459889",
  measurementId: "G-Z13W21GND5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=60&auto=format&fit=crop';

function escapeHTML(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function safeImg(url) {
  return escapeHTML(url && String(url).trim() ? url : FALLBACK_IMG);
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function subscribeCollection(name, cb, orderField = 'createdAt', orderDirection = 'desc') {
  const q = query(collection(db, name), orderBy(orderField, orderDirection));
  onSnapshot(q, snapshot => {
    const items = snapshot.docs
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      .filter(item => item.status !== 'suspenso');
    cb(items);
  }, err => console.error(`Erro ao carregar ${name}:`, err));
}

/* ---------- Hotéis, pousadas, gastronomia e lojas (grid de cards) ---------- */

function renderCard(item) {
  const tagsHTML = toArray(item.tags).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('');
  const hasLink = item.link && String(item.link).trim();
  const tag = hasLink ? 'a' : 'article';
  const linkAttrs = hasLink ? `href="${escapeHTML(item.link)}" target="_blank" rel="noopener"` : '';
  return `
    <${tag} class="card" ${linkAttrs}>
      <div class="card-img">
        <img src="${safeImg(item.imagem)}" alt="${escapeHTML(item.nome)}" loading="lazy">
        ${item.destaque ? '<span class="selo">Destaque</span>' : ''}
      </div>
      <div class="card-body">
        ${item.categoria ? `<div class="card-cat">${escapeHTML(item.categoria)}</div>` : ''}
        <h3>${escapeHTML(item.nome)}</h3>
        <p>${escapeHTML(item.descricao)}</p>
        ${item.localizacao ? `<div class="card-meta"><span>${escapeHTML(item.localizacao)}</span></div>` : ''}
        ${tagsHTML ? `<div class="tags">${tagsHTML}</div>` : ''}
        <div class="card-foot">
          <span class="price">${escapeHTML(item.preco || item.servicos || '')}</span>
        </div>
      </div>
    </${tag}>
  `;
}

function renderCardGrid(gridId, items) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = '<p class="empty-msg">Nenhum item cadastrado no momento.</p>';
    return;
  }
  grid.innerHTML = items.map(renderCard).join('');
}

function initCardCollection(collectionName, gridId) {
  subscribeCollection(collectionName, items => renderCardGrid(gridId, items));
}

/* ---------- Eventos ---------- */

const MESES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatEventDate(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== 'function') return { day: '--', month: '' };
  const date = timestamp.toDate();
  return { day: String(date.getDate()).padStart(2, '0'), month: MESES_PT[date.getMonth()] || '' };
}

function renderEvent(item) {
  const { day, month } = formatEventDate(item.data);
  return `
    <div class="ev">
      <div class="ev-date">
        <span class="d">${escapeHTML(day)}</span>
        <span class="m">${escapeHTML(month)}</span>
      </div>
      <div class="ev-main">
        ${item.categoria ? `<span class="ev-cat">${escapeHTML(item.categoria)}</span>` : ''}
        <h3>${escapeHTML(item.titulo)}</h3>
        <p>${escapeHTML(item.descricao)}</p>
        <div class="ev-meta">
          ${item.local ? `<span>${escapeHTML(item.local)}</span>` : ''}
          ${item.hora ? `<span>${escapeHTML(item.hora)}</span>` : ''}
          ${item.ingresso ? `<span>${escapeHTML(item.ingresso)}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function initEventos() {
  subscribeCollection('eventos', items => {
    const list = document.getElementById('evList');
    if (!list) return;
    if (!items.length) {
      list.innerHTML = '<p class="empty-msg">Nenhum evento cadastrado no momento.</p>';
      return;
    }
    list.innerHTML = items.map(renderEvent).join('');
  }, 'data', 'asc');
}

/* ---------- Categorias de entrada (links para as seções) ---------- */

const CATEGORIAS = [
  { title: 'A cidade', desc: 'Paisagens, história e clima de serra.', img: 'https://picsum.photos/seed/lindoia-cidade2/600/800', href: '#cidade' },
  { title: 'Hotéis', desc: 'Hotéis e resorts para todos os estilos.', img: 'https://picsum.photos/seed/lindoia-hotel/600/800', href: '#hoteis' },
  { title: 'Pousadas', desc: 'Charme e hospitalidade em endereços menores.', img: 'https://picsum.photos/seed/lindoia-pousada/600/800', href: '#pousadas' },
  { title: 'Gastronomia', desc: 'Restaurantes, bares e cafés da cidade.', img: 'https://picsum.photos/seed/lindoia-gastro/600/800', href: '#gastronomia' },
  { title: 'Compras', desc: 'Lojas, artesanato e produtos regionais.', img: 'https://picsum.photos/seed/lindoia-compras/600/800', href: '#compras' },
  { title: 'Eventos', desc: 'Agenda cultural, shows e festivais.', img: 'https://picsum.photos/seed/lindoia-eventos/600/800', href: '#eventos' }
];

function renderCatCard(cat) {
  return `
    <a class="cat-card" href="${escapeHTML(cat.href)}">
      <img src="${escapeHTML(cat.img)}" alt="${escapeHTML(cat.title)}" loading="lazy">
      <div class="cat-body">
        <h3>${escapeHTML(cat.title)}</h3>
        <p>${escapeHTML(cat.desc)}</p>
        <span class="go">Explorar →</span>
      </div>
    </a>
  `;
}

function initCatGrid() {
  const grid = document.getElementById('catGrid');
  if (!grid) return;
  grid.innerHTML = CATEGORIAS.map(renderCatCard).join('');
}

function initDynamicContent() {
  initCatGrid();
  initCardCollection('hoteis', 'hoteisGrid');
  initCardCollection('pousadas', 'pousadasGrid');
  initCardCollection('restaurantes', 'gastroGrid');
  initCardCollection('lojas', 'comprasGrid');
  initEventos();
}

function initStickyHeader() {
  const header = document.getElementById('topbar');
  if (!header) return;
  const updateHeaderState = () => header.classList.toggle('solid', window.scrollY > 30);
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
}

function initMobileMenu() {
  const menuToggle = document.getElementById('burger');
  const menuPanel = document.getElementById('drawer');
  if (!menuToggle || !menuPanel) return;

  const closeMenu = () => {
    menuToggle.classList.remove('on');
    menuPanel.classList.remove('on');
  };

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('on');
    menuPanel.classList.toggle('on');
  });

  menuPanel.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
}

function initHeroEntrance() {
  const heroElements = document.querySelectorAll('.reveal-hero');
  heroElements.forEach((element, index) => {
    element.style.transitionDelay = `${0.25 + index * 0.12}s`;
    requestAnimationFrame(() => element.classList.add('is-visible'));
  });
}

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(element => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  revealElements.forEach(element => observer.observe(element));
}

function animateCounter(element) {
  const targetValue = parseFloat(element.dataset.count);
  const prefix = element.dataset.prefix || '';
  const suffix = element.dataset.suffix || '';
  const duration = 1600;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${prefix}${Math.floor(eased * targetValue)}${suffix}`;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('.stat .n');
  if (!counters.length) return;

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  counters.forEach(counter => observer.observe(counter));
}

function init() {
  initStickyHeader();
  initMobileMenu();
  initHeroEntrance();
  initScrollReveal();
  initCounters();
  initDynamicContent();
}

document.addEventListener('DOMContentLoaded', init);