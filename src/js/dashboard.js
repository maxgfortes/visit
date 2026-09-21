import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
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
const auth = getAuth(app);
const db = getFirestore(app);

const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const navUser = document.getElementById('navUser');
const navUserEmail = document.getElementById('navUserEmail');
const logoutBtn = document.getElementById('logoutBtn');
const dashboardArea = document.getElementById('dashboardArea');
const sideNavButtons = document.querySelectorAll('.side-nav-btn');

const collectionsConfig = {
  eventos: {
    label: 'Eventos',
    collectionName: 'eventos',
    titleField: 'titulo',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text', required: true },
      { key: 'categoria', label: 'Categoria', type: 'select', required: true,
        options: ['cultura', 'musica', 'gastronomia', 'esporte', 'familia'] },
      { key: 'descricao', label: 'Descrição', type: 'textarea', required: true },
      { key: 'local', label: 'Local', type: 'text', required: true },
      { key: 'data', label: 'Data', type: 'date', required: true },
      { key: 'hora', label: 'Horário', type: 'text', required: true, placeholder: 'ex: 19h' },
      { key: 'ingresso', label: 'Ingresso', type: 'text', placeholder: 'ex: Gratuito' }
    ]
  },
  hoteis: {
    label: 'Hotéis',
    collectionName: 'hoteis',
    titleField: 'nome',
    fields: [
      { key: 'nome', label: 'Nome', type: 'text', required: true },
      { key: 'categoria', label: 'Categoria', type: 'text', placeholder: 'ex: Hotel · Centro', required: true },
      { key: 'descricao', label: 'Descrição', type: 'textarea', required: true },
      { key: 'localizacao', label: 'Localização', type: 'text', required: true },
      { key: 'preco', label: 'Preço', type: 'text', placeholder: 'ex: R$ 420 / noite' },
      { key: 'tags', label: 'Tags (separadas por vírgula)', type: 'text', placeholder: 'hotel, centro, premium' },
      { key: 'servicos', label: 'Serviços (separados por vírgula)', type: 'text', placeholder: 'Piscina termal, Café da manhã' },
      { key: 'destaque', label: 'Destaque?', type: 'checkbox' },
      { key: 'imagem', label: 'URL da imagem', type: 'url', required: true, placeholder: 'https://...' },
      { key: 'link', label: 'Link (site, reserva ou mapa)', type: 'url', placeholder: 'https://...' }
    ]
  },
  pousadas: {
    label: 'Pousadas',
    collectionName: 'pousadas',
    titleField: 'nome',
    fields: [
      { key: 'nome', label: 'Nome', type: 'text', required: true },
      { key: 'descricao', label: 'Descrição', type: 'textarea', required: true },
      { key: 'localizacao', label: 'Localização', type: 'text', required: true },
      { key: 'preco', label: 'Preço', type: 'text', placeholder: 'ex: R$ 240 / noite' },
      { key: 'servicos', label: 'Serviços (separados por vírgula)', type: 'text', placeholder: 'Café caseiro, Jardim' },
      { key: 'destaque', label: 'Destaque?', type: 'checkbox' },
      { key: 'imagem', label: 'URL da imagem', type: 'url', required: true, placeholder: 'https://...' },
      { key: 'link', label: 'Link (site, reserva ou mapa)', type: 'url', placeholder: 'https://...' }
    ]
  },
  restaurantes: {
    label: 'Gastronomia',
    collectionName: 'restaurantes',
    titleField: 'nome',
    fields: [
      { key: 'nome', label: 'Nome', type: 'text', required: true },
      { key: 'categoria', label: 'Categoria', type: 'select', required: true,
        options: ['restaurante', 'bar', 'cafe', 'pizzaria', 'regional', 'sofisticada', 'doces'] },
      { key: 'descricao', label: 'Descrição', type: 'textarea', required: true },
      { key: 'localizacao', label: 'Localização', type: 'text', required: true },
      { key: 'preco', label: 'Preço', type: 'text', placeholder: 'ex: R$ 80 / pessoa' },
      { key: 'tags', label: 'Tags (separadas por vírgula)', type: 'text', placeholder: 'romantico, vista, familia' },
      { key: 'servicos', label: 'Horário de funcionamento', type: 'text', placeholder: 'ex: Ter–Dom 12h–22h' },
      { key: 'destaque', label: 'Destaque?', type: 'checkbox' },
      { key: 'imagem', label: 'URL da imagem', type: 'url', required: true, placeholder: 'https://...' },
      { key: 'link', label: 'Link (site, reserva ou mapa)', type: 'url', placeholder: 'https://...' }
    ]
  },
  lojas: {
    label: 'Lojas',
    collectionName: 'lojas',
    titleField: 'nome',
    fields: [
      { key: 'nome', label: 'Nome', type: 'text', required: true },
      { key: 'categoria', label: 'Categoria', type: 'text', placeholder: 'ex: Artesanato', required: true },
      { key: 'descricao', label: 'Descrição', type: 'textarea', required: true },
      { key: 'localizacao', label: 'Localização', type: 'text', required: true },
      { key: 'tags', label: 'Tags (separadas por vírgula)', type: 'text' },
      { key: 'servicos', label: 'Horário de funcionamento', type: 'text', placeholder: 'ex: Seg–Sáb 9h–18h' },
      { key: 'imagem', label: 'URL da imagem', type: 'url', required: true, placeholder: 'https://...' },
      { key: 'link', label: 'Link (site, reserva ou mapa)', type: 'url', placeholder: 'https://...' }
    ]
  }
};

let unsubscribeCurrentList = null;

function stopListening() {
  if (unsubscribeCurrentList) {
    unsubscribeCurrentList();
    unsubscribeCurrentList = null;
  }
}

function setActiveNavButton(view) {
  sideNavButtons.forEach(btn => btn.classList.toggle('on', btn.dataset.view === view));
}

function showView(view) {
  stopListening();
  setActiveNavButton(view);
  if (view === 'criar') {
    renderCreateHub();
  } else {
    renderListView(view);
  }
}

function renderCreateHub() {
  dashboardArea.innerHTML = `
    <div class="panel-header">
      <h1>Criar novo item</h1>
      <p>Escolha o tipo de conteúdo que deseja publicar.</p>
    </div>
    <div class="type-picker" id="typePicker">
      ${Object.entries(collectionsConfig).map(([key, cfg]) => `
        <button class="type-card" data-type="${key}">${cfg.label}</button>
      `).join('')}
    </div>
    <div id="createFormWrap"></div>
  `;
  document.getElementById('typePicker').addEventListener('click', e => {
    const button = e.target.closest('.type-card');
    if (!button) return;
    document.querySelectorAll('.type-card').forEach(b => b.classList.remove('on'));
    button.classList.add('on');
    renderCreateForm(button.dataset.type);
  });
}

function renderFieldHTML(field) {
  const requiredAttr = field.required ? 'required' : '';
  const placeholderAttr = field.placeholder ? `placeholder="${field.placeholder}"` : '';

  if (field.type === 'textarea') {
    return `<label class="field"><span>${field.label}</span><textarea name="${field.key}" ${requiredAttr} ${placeholderAttr} rows="4"></textarea></label>`;
  }
  if (field.type === 'select') {
    const optionsHTML = field.options.map(option => `<option value="${option}">${option}</option>`).join('');
    return `<label class="field"><span>${field.label}</span><select name="${field.key}" ${requiredAttr}>${optionsHTML}</select></label>`;
  }
  if (field.type === 'checkbox') {
    return `<label class="field field-checkbox"><input type="checkbox" name="${field.key}"><span>${field.label}</span></label>`;
  }
  return `<label class="field"><span>${field.label}</span><input type="${field.type}" name="${field.key}" ${requiredAttr} ${placeholderAttr}></label>`;
}

function renderCreateForm(typeKey) {
  const cfg = collectionsConfig[typeKey];
  const wrap = document.getElementById('createFormWrap');
  wrap.innerHTML = `
    <form class="item-form" id="itemForm">
      ${cfg.fields.map(renderFieldHTML).join('')}
      <div class="form-error" id="formError"></div>
      <button type="submit" class="btn-primary">Publicar</button>
    </form>
  `;
  document.getElementById('itemForm').addEventListener('submit', event => {
    event.preventDefault();
    submitNewItem(typeKey, cfg);
  });
}

async function submitNewItem(typeKey, cfg) {
  const form = document.getElementById('itemForm');
  const errorBox = document.getElementById('formError');
  const submitButton = form.querySelector('.btn-primary');
  errorBox.textContent = '';

  const formData = new FormData(form);
  const data = { status: 'ativo', createdAt: serverTimestamp() };

  cfg.fields.forEach(field => {
    if (field.type === 'checkbox') {
      data[field.key] = form.elements[field.key].checked;
      return;
    }
    if (field.type === 'date') {
      const raw = String(formData.get(field.key) || '');
      // Sempre grava como Timestamp (Date nativo), nunca como texto solto,
      // para permitir ordenar/comparar datas de forma confiável no Firestore.
      data[field.key] = raw ? new Date(`${raw}T00:00:00`) : null;
      return;
    }
    if (field.key === 'tags' || field.key === 'servicos') {
      const raw = String(formData.get(field.key) || '');
      data[field.key] = raw.split(',').map(v => v.trim()).filter(Boolean);
      return;
    }
    data[field.key] = formData.get(field.key) || '';
  });

  submitButton.disabled = true;
  try {
    await addDoc(collection(db, cfg.collectionName), data);
    form.reset();
    showToast(`${cfg.label} criado com sucesso.`);
  } catch (err) {
    console.error(err);
    errorBox.textContent = 'Não foi possível salvar. Verifique sua conexão e tente novamente.';
  } finally {
    submitButton.disabled = false;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function renderItemCard(docSnap, cfg) {
  const item = docSnap.data();
  const status = item.status === 'suspenso' ? 'suspenso' : 'ativo';
  const title = item[cfg.titleField] || 'Sem título';
  const subtitleParts = [item.categoria, item.localizacao || item.local].filter(Boolean);

  return `
    <article class="item-card" data-id="${docSnap.id}" data-collection="${cfg.collectionName}">
      ${item.imagem ? `<div class="item-card-thumb"><img src="${escapeHTML(item.imagem)}" alt="" loading="lazy"></div>` : ''}
      <div class="item-card-body">
        <div class="item-card-top">
          <h3>${escapeHTML(title)}</h3>
          <span class="status-badge ${status}">${status === 'ativo' ? 'Ativo' : 'Suspenso'}</span>
        </div>
        ${subtitleParts.length ? `<p class="item-card-subtitle">${escapeHTML(subtitleParts.join(' · '))}</p>` : ''}
        ${item.descricao ? `<p class="item-card-desc">${escapeHTML(item.descricao)}</p>` : ''}
      </div>
      <div class="item-card-actions">
        <button class="btn-suspend" data-action="toggle-status">${status === 'ativo' ? 'Suspender' : 'Ativar'}</button>
        <button class="btn-delete" data-action="delete">Apagar</button>
      </div>
    </article>
  `;
}

function renderListView(view) {
  const cfg = collectionsConfig[view];
  dashboardArea.innerHTML = `
    <div class="panel-header">
      <h1>${cfg.label}</h1>
      <p>Gerencie os itens publicados nesta categoria.</p>
    </div>
    <div class="item-list" id="itemList"><p class="empty-state">Carregando...</p></div>
  `;

  const itemList = document.getElementById('itemList');
  const itemsQuery = query(collection(db, cfg.collectionName), orderBy('createdAt', 'desc'));

  unsubscribeCurrentList = onSnapshot(itemsQuery, snapshot => {
    if (snapshot.empty) {
      itemList.innerHTML = '<p class="empty-state">Nenhum item cadastrado ainda.</p>';
      return;
    }
    itemList.innerHTML = snapshot.docs.map(docSnap => renderItemCard(docSnap, cfg)).join('');
  }, err => {
    console.error(err);
    itemList.innerHTML = '<p class="empty-state">Erro ao carregar os itens.</p>';
  });

  itemList.addEventListener('click', handleListClick);
}

async function handleListClick(event) {
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;

  const card = event.target.closest('.item-card');
  const docRef = doc(db, card.dataset.collection, card.dataset.id);

  if (actionButton.dataset.action === 'toggle-status') {
    const willActivate = actionButton.textContent.trim() === 'Ativar';
    actionButton.disabled = true;
    try {
      await updateDoc(docRef, { status: willActivate ? 'ativo' : 'suspenso' });
    } catch (err) {
      console.error(err);
    } finally {
      actionButton.disabled = false;
    }
  }

  if (actionButton.dataset.action === 'delete') {
    if (!window.confirm('Apagar este item permanentemente?')) return;
    actionButton.disabled = true;
    try {
      await deleteDoc(docRef);
    } catch (err) {
      console.error(err);
      actionButton.disabled = false;
    }
  }
}

let toastTimeout = null;
function showToast(message) {
  let toast = document.getElementById('dashboardToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dashboardToast';
    toast.className = 'dashboard-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 2500);
}

sideNavButtons.forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  loginError.textContent = '';
  const email = document.getElementById('inputEmail').value.trim();
  const password = document.getElementById('inputPassword').value;
  const submitButton = loginForm.querySelector('.login-btn');

  submitButton.disabled = true;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    loginError.textContent = 'Email ou senha inválidos.';
  } finally {
    submitButton.disabled = false;
  }
});

logoutBtn.addEventListener('click', () => {
  stopListening();
  signOut(auth);
});

onAuthStateChanged(auth, user => {
  if (user) {
    loginPage.classList.add('is-hidden');
    dashboardPage.classList.add('is-active');
    navUser.classList.add('is-visible');
    navUserEmail.textContent = user.email;
    showView('criar');
  } else {
    loginPage.classList.remove('is-hidden');
    dashboardPage.classList.remove('is-active');
    navUser.classList.remove('is-visible');
    dashboardArea.innerHTML = '';
    stopListening();
  }
});