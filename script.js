
// script.js - load products.json, handle search, filters, and modal product detail
async function loadProducts() {
  const resp = await fetch('products.json');
  const data = await resp.json();
  return data;
}

function formatProductCard(p){
  return `
  <article class="card" data-id="${p.id}">
    <img src="${p.image}" alt="${p.title}" loading="lazy" />
    <div class="card-body">
      <h3 class="card-title">${p.title}</h3>
      <div class="card-meta">ID: ${p.id} · ${p.capacity_kg} кг · ${p.fuel}</div>
      <div class="card-price">${p.price}</div>
      <div class="card-actions">
        <button class="btn-outline" data-action="details" data-id="${p.id}">Подробнее</button>
        <button class="btn" data-action="contact" data-id="${p.id}">Связаться</button>
      </div>
    </div>
  </article>`;
}

function renderCatalog(items){
  const container = document.getElementById('catalog');
  if(!items.length){
    container.innerHTML = '<p style="grid-column:1/-1;color:#666">Ничего не найдено.</p>';
    return;
  }
  container.innerHTML = items.map(formatProductCard).join('\n');
}

function applyFilters(products){
  const q = document.getElementById('search').value.trim().toLowerCase();
  const fuel = document.getElementById('filter-fuel').value;
  const capacityMin = parseInt(document.getElementById('filter-capacity').value || '0', 10);

  return products.filter(p => {
    if(fuel && p.fuel !== fuel) return false;
    if(capacityMin && p.capacity_kg < capacityMin) return false;
    if(!q) return true;
    const hay = (p.title + ' ' + p.id + ' ' + p.description).toLowerCase();
    return hay.includes(q);
  });
}

function openModal(html){
  const modal = document.getElementById('modal');
  document.getElementById('modal-body').innerHTML = html;
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}

function closeModal(){
  const modal = document.getElementById('modal');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

function productDetailHtml(p){
  return `
  <div class="product-detail">
    <div class="left">
      <img src="${p.image}" alt="${p.title}" style="width:100%;height:auto;border-radius:8px" />
    </div>
    <div class="right">
      <h2 id="modal-title">${p.title}</h2>
      <p style="color:var(--muted)">${p.description}</p>
      <div class="kv"><strong>Цена</strong><span>${p.price}</span></div>
      <div class="kv"><strong>Грузоподъёмность</strong><span>${p.capacity_kg} кг</span></div>
      <div class="kv"><strong>Тип топлива</strong><span>${p.fuel}</span></div>
      <div class="kv"><strong>Высота мачты</strong><span>${p.mast_height_mm} мм</span></div>
      <div style="margin-top:12px">
        <a href="mailto:info@example.com?subject=Вопрос по ${encodeURIComponent(p.title)}" class="btn">Запросить информацию</a>
      </div>
    </div>
  </div>
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  const products = await loadProducts();
  let filtered = products.slice();
  renderCatalog(filtered);

  // controls
  document.getElementById('search').addEventListener('input', () => {
    renderCatalog(applyFilters(products));
  });
  document.getElementById('filter-fuel').addEventListener('change', () => {
    renderCatalog(applyFilters(products));
  });
  document.getElementById('filter-capacity').addEventListener('input', () => {
    renderCatalog(applyFilters(products));
  });
  document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('search').value = '';
    document.getElementById('filter-fuel').value = '';
    document.getElementById('filter-capacity').value = '';
    renderCatalog(products);
  });

  // delegation for card buttons
  document.getElementById('catalog').addEventListener('click', (ev) => {
    const t = ev.target.closest('[data-action]');
    if(!t) return;
    const id = t.dataset.id;
    const action = t.dataset.action;
    const prod = products.find(p => p.id === id);
    if(action === 'details' && prod){
      openModal(productDetailHtml(prod));
    } else if(action === 'contact' && prod){
      window.location.href = `mailto:info@example.com?subject=${encodeURIComponent('Интересует ' + prod.title)}&body=${encodeURIComponent('ID: ' + prod.id)}`;
    }
  });

  // modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', (ev) => {
    if(ev.target.id === 'modal') closeModal();
  });

  // keyboard close
  document.addEventListener('keydown', (ev) => {
    if(ev.key === 'Escape') closeModal();
  });
});
