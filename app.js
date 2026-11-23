"use strict";

const byId = (id) => document.getElementById(id);
const photo = (product) => `assets/${product.id}.jpg`;
const rubles = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});
const formatPrice = (price) => rubles.format(price);
const productById = new Map(products.map((product) => [product.id, product]));
const storageKey = "nova-wear-cart";
const favoritesKey = "nova-wear-favorites";
const quantityLimit = 99;
const shopDialog = byId("shop-dialog");
const filterForm = byId("filter-form");
const checkoutForm = byId("checkout-form");
const sizeOptions = byId("product-sizes");
const cartItems = byId("cart-items");
const shopPanels = [...shopDialog.querySelectorAll(".shop-panel")];
const views = ["hero", "catalog", "product-page", "favorites", "info-page"].map(byId);
const textOrder = new Intl.Collator("ru", { numeric: true });
const deliveryCities = {
  moscow: { label: "Москва", pickup: 290, courier: 490 },
  petersburg: { label: "Санкт-Петербург", pickup: 350, courier: 550 },
  ekaterinburg: { label: "Екатеринбург", pickup: 390, courier: 590 },
  other: { label: "Другой город", pickup: 490, courier: 790 },
};
const deliveryMethods = { pickup: "Пункт выдачи", courier: "Курьер" };
const freeDeliveryMinimum = 10000;
const promoCode = "NOVA10";
const infoPages = {
  delivery: {
    title: "Доставка",
    content: `<p>В демо-заказе доступны курьер и доставка в пункт выдачи. Стоимость зависит от выбранного города и рассчитывается при оформлении.</p>
      <ul>${Object.values(deliveryCities).map(({ label, pickup, courier }) =>
        `<li>${label} — пункт выдачи ${formatPrice(pickup)}, курьер ${formatPrice(courier)}.</li>`).join("")}</ul>
      <p>Пункт выдачи бесплатный при сумме товаров от ${formatPrice(freeDeliveryMinimum)} после скидок. Демо-заказы не отправляются.</p>`,
  },
  returns: {
    title: "Возврат",
    content: `<p>Демо-заказ имитирует покупку. Магазин не принимает оплату, не отправляет товары и не передаёт данные формы.</p>
      <p>Для примера: чтобы запросить возврат в обычном магазине, укажите номер заказа и товары, которые хотите вернуть, в обращении в поддержку.</p>
      <p><a href="#contacts">Контакты магазина</a></p>`,
  },
  contacts: {
    title: "Контакты",
    content: `<p>NOVA Wear — демонстрационный магазин одежды из гайда BrainAid «Codex: команды и фишки».</p>
      <p>Пример адреса поддержки: <strong>hello@nova-wear.example</strong>. Адрес предназначен для демонстрации.</p>
      <p><a href="#delivery">Условия доставки</a> · <a href="#returns">Возврат</a></p>`,
  },
};
let activeProduct;
let activeSection = "";
let promoApplied = false;
let notificationTimer;
let cart = readCart();
const favorites = readFavorites();

function readCart() {
  const restored = new Map();

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!Array.isArray(saved)) return [];

    for (const line of saved) {
      const product = productById.get(line?.id);
      if (!product?.sizes.includes(line.size) || !Number.isInteger(line.quantity) || line.quantity < 1) continue;

      const key = `${line.id}:${line.size}`;
      const quantity = Math.min(quantityLimit, line.quantity + (restored.get(key)?.quantity ?? 0));
      restored.set(key, { id: line.id, size: line.size, quantity });
    }
  } catch {
    // Storage can be unavailable for local files or restricted browser sessions.
  }

  return [...restored.values()];
}

function saveCart() {
  saveLocal(storageKey, cart);
}

function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The current page keeps a working in-memory cart.
  }
}

function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(favoritesKey));
    return new Set(Array.isArray(saved) ? saved.filter((id) => productById.has(id)) : []);
  } catch {
    return new Set();
  }
}

function cartTotal() {
  return cart.reduce((sum, line) => sum + productById.get(line.id).price * line.quantity, 0);
}

function productLink(product) {
  return `#product/${product.id}`;
}

function favoriteLabel(product) {
  return `${favorites.has(product.id) ? "Убрать из избранного" : "В избранное"}: ${product.name}, ${product.color}`;
}

function productCard(product) {
  const saved = favorites.has(product.id);
  return `
    <article class="product-card">
      <img src="${photo(product)}" alt="" width="640" height="800" loading="lazy">
      <h3><a class="product-trigger" href="${productLink(product)}" aria-label="${product.name}, ${product.color}">${product.name}</a></h3>
      <p class="product-color">${product.color}</p>
      <p class="product-price">${formatPrice(product.price)}</p>
      <button class="card-favorite" type="button" data-favorite="${product.id}"
        aria-pressed="${saved}" aria-label="${favoriteLabel(product)}">${saved ? "♥" : "♡"}</button>
    </article>
  `;
}

function normalizeSearch(value) {
  return value.toLocaleLowerCase("ru").replaceAll("ё", "е");
}

function priceLimit(id, fallback) {
  const input = byId(id);
  input.setAttribute("aria-invalid", String(!input.validity.valid));
  return input.validity.valid && input.value !== "" ? input.valueAsNumber : fallback;
}

function renderCatalog() {
  const category = byId("category").value;
  const size = byId("filter-size").value;
  const color = byId("filter-color").value;
  const minPrice = priceLimit("min-price", 0);
  const maxPrice = priceLimit("max-price", Infinity);
  const words = normalizeSearch(byId("catalog-search").value.trim()).split(/\s+/).filter(Boolean);

  const matches = products.filter((product) =>
    (!activeSection || product.section === activeSection) &&
    (!category || product.category === category) &&
    (!size || product.sizes.includes(size)) &&
    (!color || product.color === color) &&
    product.price >= minPrice && product.price <= maxPrice &&
    words.every((word) => normalizeSearch(
      `${product.name} ${product.color} ${sections[product.section]} ${categories[product.category]} ${product.description}`
    ).includes(word))
  );

  switch (byId("sort-order").value) {
    case "price-asc": matches.sort((a, b) => a.price - b.price); break;
    case "price-desc": matches.sort((a, b) => b.price - a.price); break;
    case "name": matches.sort((a, b) => textOrder.compare(a.name, b.name) || textOrder.compare(a.color, b.color)); break;
  }
  byId("products").innerHTML = matches.map(productCard).join("");
  byId("result-count").textContent = `Найдено: ${matches.length}`;
  byId("empty-catalog").hidden = matches.length > 0;
}

function renderFavorites() {
  byId("favorite-products").innerHTML = [...favorites].map((id) => productCard(productById.get(id))).join("");
  byId("empty-favorites").hidden = favorites.size > 0;
}

function updateFavoriteButtons() {
  byId("favorites-count").hidden = favorites.size === 0;
  byId("favorites-count").textContent = favorites.size;
  for (const button of document.querySelectorAll("[data-favorite]")) {
    const product = productById.get(button.dataset.favorite);
    const saved = favorites.has(product.id);
    button.setAttribute("aria-pressed", saved);
    button.setAttribute("aria-label", favoriteLabel(product));
    button.textContent = saved ? "♥" : "♡";
  }
}

function renderProduct(product) {
  const selectedSize = activeProduct?.family && activeProduct.family === product.family
    ? sizeOptions.querySelector("input:checked")?.value
    : null;
  activeProduct = product;
  byId("product-image").src = photo(product);
  byId("product-image").alt = `${product.name}, ${product.color}`;
  byId("product-name").textContent = product.name;
  byId("product-section").textContent = `${sections[product.section]} / ${categories[product.category]}`;
  byId("product-price").textContent = formatPrice(product.price);
  byId("product-description").textContent = product.description;
  byId("product-back").href = activeSection ? `#catalog/${activeSection}` : "#catalog";
  byId("product-favorite").dataset.favorite = product.id;
  byId("size-error").textContent = "";
  const variants = product.family ? products.filter((item) => item.family === product.family) : [product];
  byId("product-colors").innerHTML = variants.map((variant) => variant === product
    ? `<span class="color-option selected" aria-current="true" tabindex="-1">${variant.color}</span>`
    : `<a class="color-option" href="${productLink(variant)}">${variant.color}</a>`
  ).join("");
  sizeOptions.innerHTML = product.sizes.map((size) => `
    <label class="size-option">
      <input type="radio" name="size" value="${size}" required aria-describedby="size-error" ${size === selectedSize || product.sizes.length === 1 ? "checked" : ""}>
      <span>${size}</span>
    </label>
  `).join("");
  const related = products.filter((item) => item !== product && (!product.family || item.family !== product.family));
  const relevance = (item) => Number(item.category === product.category) * 2 + Number(item.section === product.section);
  related.sort((a, b) => relevance(b) - relevance(a));
  const distinct = new Set();
  byId("related-products").innerHTML = related.filter((item) => {
    const key = item.family ?? item.id;
    if (distinct.has(key)) return false;
    distinct.add(key);
    return true;
  }).slice(0, 4).map(productCard).join("");
  updateFavoriteButtons();
}

function notify(message) {
  const notification = byId("notification");
  clearTimeout(notificationTimer);
  notification.textContent = message;
  notificationTimer = setTimeout(() => { notification.textContent = ""; }, 3500);
}

function orderAmounts() {
  const subtotal = cartTotal();
  const discount = promoApplied ? Math.round(subtotal / 10) : 0;
  const net = subtotal - discount;
  const city = deliveryCities[byId("delivery-city").value];
  const method = byId("delivery-method").value;
  const delivery = city && method ? (method === "pickup" && net >= freeDeliveryMinimum ? 0 : city[method]) : null;
  return { subtotal, discount, net, delivery, total: net + (delivery ?? 0) };
}

function renderTotals() {
  const { subtotal, discount, net, delivery, total } = orderAmounts();
  for (const panel of ["cart", "checkout"]) {
    byId(`${panel}-subtotal`).textContent = formatPrice(subtotal);
    byId(`${panel}-discount-row`).hidden = discount === 0;
    byId(`${panel}-discount`).textContent = `−${formatPrice(discount)}`;
  }
  byId("cart-total").textContent = formatPrice(net);
  byId("checkout-delivery").textContent = delivery === null ? "Выберите город и способ" : formatPrice(delivery);
  byId("checkout-total").textContent = delivery === null ? "Уточняется" : formatPrice(total);
}

function updateDelivery() {
  const customCity = byId("delivery-city").value === "other";
  byId("custom-city-row").hidden = !customCity;
  byId("custom-city").disabled = !customCity;
  byId("custom-city").required = customCity;
  renderTotals();
}

function setPromo(applied, message) {
  promoApplied = applied;
  byId("promo-message").textContent = message ?? `${promoCode} даёт скидку 10% на товары.`;
  byId("promo-code").value = applied ? promoCode : "";
  byId("remove-promo").hidden = !applied;
  renderTotals();
}

function renderCart() {
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  byId("cart-count").textContent = count;
  byId("open-cart").setAttribute("aria-label", `Корзина, товаров: ${count}`);
  byId("empty-cart").hidden = cart.length > 0;
  byId("cart-summary").hidden = cart.length === 0;
  renderTotals();
  cartItems.innerHTML = cart.map((line, index) => {
    const product = productById.get(line.id);
    const label = `${product.name}, ${line.size}`;

    return `
      <li class="cart-item" data-line="${index}">
        <img src="${photo(product)}" alt="" width="640" height="800">
        <div>
          <h3>${product.name}</h3>
          <p class="muted">Размер ${line.size} · ${product.color}</p>
          <div class="quantity" role="group" aria-label="Количество, ${label}">
            <button type="button" data-action="decrease" aria-label="Уменьшить количество, ${label}" ${line.quantity === 1 ? "disabled" : ""}>−</button>
            <span>${line.quantity}</span>
            <button type="button" data-action="increase" aria-label="Увеличить количество, ${label}" ${line.quantity === quantityLimit ? "disabled" : ""}>+</button>
          </div>
        </div>
        <div class="line-price">
          <p>${formatPrice(product.price * line.quantity)}</p>
          <button type="button" class="text-button remove-item" data-action="remove" aria-label="Удалить ${label}">Удалить</button>
        </div>
      </li>
    `;
  }).join("");
}

function updateCart() {
  saveCart();
  renderCart();
}

function showShopPanel(id) {
  for (const panel of shopPanels) panel.hidden = panel.id !== id;
  byId("cart-announcement").textContent = "";
  if (!shopDialog.open) shopDialog.showModal();
  byId(id).querySelector("h2").focus({ preventScroll: true });
  shopDialog.scrollTop = 0;
}

function showView(...visible) {
  for (const view of views) view.hidden = !visible.includes(view.id);
}

function setMenu(open) {
  byId("menu-toggle").setAttribute("aria-expanded", String(open));
  byId("main-nav").classList.toggle("menu-open", open);
}

function focusPage(id, scrollTarget) {
  byId(id).focus({ preventScroll: true });
  if (scrollTarget) scrollTarget.scrollIntoView({ block: "start" });
  else window.scrollTo(0, 0);
}

function selectOptions(id, placeholder, entries) {
  const select = byId(id);
  select.replaceChildren(new Option(placeholder, ""), ...entries.map(([value, label]) => new Option(label, value)));
}

function valuesFrom(items, getter) {
  return [...new Set(items.flatMap(getter))].sort(textOrder.compare).map((value) => [value, value]);
}

function setSection(section) {
  const items = section ? products.filter((item) => item.section === section) : products;
  const controls = [
    ["category", "Все категории", Object.entries(categories).filter(([id]) => items.some((item) => item.category === id))],
    ["filter-size", "Все размеры", valuesFrom(items, (item) => item.sizes)],
    ["filter-color", "Все цвета", valuesFrom(items, (item) => item.color)],
  ];
  for (const [id, placeholder, entries] of controls) {
    const value = byId(id).value;
    selectOptions(id, placeholder, entries);
    if (entries.some(([key]) => key === value)) byId(id).value = value;
  }
  activeSection = section;
  const hash = section ? `#catalog/${section}` : "#catalog";
  for (const link of document.querySelectorAll(".section-nav a, #main-nav a")) {
    if (link.hash === hash) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  byId("catalog-title").textContent = section ? sections[section] : "Каталог";
  renderCatalog();
}

function renderRoute() {
  const hash = location.hash.slice(1);
  setMenu(false);
  clearTimeout(notificationTimer);
  byId("notification").textContent = "";
  if (!["", "top", "catalog"].includes(hash) && !hash.startsWith("catalog/")) {
    for (const link of document.querySelectorAll("#main-nav [aria-current]")) link.removeAttribute("aria-current");
  }

  const product = hash.startsWith("product/") && productById.get(hash.slice("product/".length));
  if (product) {
    const changingColor = !byId("product-page").hidden && activeProduct?.family && activeProduct.family === product.family;
    showView("product-page");
    renderProduct(product);
    document.title = `${product.name}, ${product.color} — NOVA Wear`;
    if (changingColor) byId("product-colors").querySelector(".selected").focus({ preventScroll: true });
    else focusPage("product-name");
    return;
  }

  if (hash === "favorites") {
    showView("favorites");
    renderFavorites();
    document.title = "Избранное — NOVA Wear";
    focusPage("favorites-title");
    return;
  }

  if (Object.hasOwn(infoPages, hash)) {
    const { title, content } = infoPages[hash];
    showView("info-page");
    byId("info-title").textContent = title;
    byId("info-content").innerHTML = content;
    document.title = `${title} — NOVA Wear`;
    focusPage("info-title");
    return;
  }

  const section = hash.startsWith("catalog/") ? hash.slice("catalog/".length) : "";
  const home = !hash || hash === "top";
  setSection(Object.hasOwn(sections, section) ? section : "");
  showView(...(home ? ["hero", "catalog"] : ["catalog"]));
  document.title = home ? "NOVA Wear — одежда для города" : `${byId("catalog-title").textContent} — NOVA Wear`;
  if (home) window.scrollTo(0, 0);
  else focusPage("catalog-title", byId("catalog"));
}

filterForm.addEventListener("input", renderCatalog);
filterForm.addEventListener("submit", (event) => event.preventDefault());
filterForm.addEventListener("reset", () => requestAnimationFrame(renderCatalog));
byId("catalog-search").addEventListener("input", renderCatalog);
byId("sort-order").addEventListener("change", renderCatalog);
byId("clear-catalog").addEventListener("click", () => {
  byId("catalog-search").value = "";
  filterForm.reset();
  byId("catalog-search").focus();
});
byId("menu-toggle").addEventListener("click", (event) => {
  setMenu(event.currentTarget.getAttribute("aria-expanded") === "false");
});
byId("main-nav").addEventListener("click", (event) => {
  if (event.target.closest("a")?.hash === location.hash && !byId("catalog").hidden) {
    setMenu(false);
    focusPage("catalog-title", byId("catalog"));
  }
});
byId("main-nav").addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || byId("menu-toggle").getAttribute("aria-expanded") !== "true") return;
  setMenu(false);
  byId("menu-toggle").focus();
});
window.addEventListener("hashchange", renderRoute);
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-favorite]");
  if (!button) return;
  const { favorite: id } = button.dataset;
  const product = productById.get(id);
  const saved = favorites.has(id);
  if (saved) favorites.delete(id);
  else favorites.add(id);
  saveLocal(favoritesKey, [...favorites]);
  if (button.closest("#favorite-products")) {
    const grid = byId("favorite-products");
    const index = [...grid.children].indexOf(button.closest(".product-card"));
    renderFavorites();
    const next = grid.children[Math.min(index, grid.children.length - 1)]?.querySelector("button");
    (next ?? byId("empty-favorites").querySelector("a")).focus();
  }
  updateFavoriteButtons();
  notify(`${product.name} · ${product.color} — ${saved ? "убрано из избранного" : "в избранном"}`);
});

sizeOptions.addEventListener("change", () => { byId("size-error").textContent = ""; });
byId("product-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const size = new FormData(event.currentTarget).get("size");
  if (!activeProduct.sizes.includes(size)) {
    byId("size-error").textContent = "Выберите размер.";
    sizeOptions.querySelector("input").focus();
    return;
  }

  const line = cart.find((item) => item.id === activeProduct.id && item.size === size);
  if (line?.quantity === quantityLimit) {
    byId("size-error").textContent = `В корзине уже ${quantityLimit} шт. этого размера.`;
    return;
  }

  if (line) line.quantity += 1;
  else cart.push({ id: activeProduct.id, size, quantity: 1 });
  updateCart();
  showShopPanel("cart-panel");
});

shopDialog.addEventListener("click", (event) => {
  if (event.target.closest("[data-close]")) shopDialog.close();
});

byId("open-cart").addEventListener("click", () => showShopPanel("cart-panel"));
cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const index = Number(button.closest("[data-line]").dataset.line);
  const line = cart[index];
  const label = `${productById.get(line.id).name}, ${line.size}`;
  const action = button.dataset.action;
  if (action === "remove") {
    cart.splice(index, 1);
    if (!cart.length) setPromo(false);
  } else {
    line.quantity += action === "increase" ? 1 : -1;
  }
  updateCart();

  const nextRow = cartItems.children[Math.min(index, cart.length - 1)];
  const nextControl = nextRow?.querySelector(`[data-action="${action}"]:enabled`) ?? nextRow?.querySelector("button:enabled");
  (nextControl ?? byId("empty-cart").querySelector("button")).focus();
  byId("cart-announcement").textContent = action === "remove"
    ? `${label} — удалён из корзины`
    : `${label} — ${line.quantity} шт.`;
});

byId("promo-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (byId("promo-code").value.trim().toUpperCase() === promoCode) {
    setPromo(true, `Промокод ${promoCode} применён.`);
  } else {
    byId("promo-message").textContent = promoApplied
      ? `Код не найден. Продолжает действовать ${promoCode}.`
      : `Код не найден. Попробуйте ${promoCode}.`;
  }
});
byId("remove-promo").addEventListener("click", () => {
  setPromo(false);
  byId("promo-code").focus();
});
byId("delivery-city").addEventListener("change", updateDelivery);
byId("delivery-method").addEventListener("change", updateDelivery);
byId("start-checkout").addEventListener("click", () => {
  if (cart.length) showShopPanel("checkout-panel");
});
byId("back-to-cart").addEventListener("click", () => showShopPanel("cart-panel"));
checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!cart.length || !checkoutForm.reportValidity()) return;

  byId("confirmed-total").textContent = formatPrice(orderAmounts().total);
  cart = [];
  setPromo(false);
  updateCart();
  checkoutForm.reset();
  updateDelivery();
  showShopPanel("confirmation-panel");
});

const mobileViewport = matchMedia("(max-width: 40rem)");
function setFilterLayout() {
  byId("filters").open = !mobileViewport.matches;
}
mobileViewport.addEventListener("change", setFilterLayout);
setFilterLayout();
selectOptions("delivery-city", "Выберите город", Object.entries(deliveryCities).map(([id, city]) => [id, city.label]));
selectOptions("delivery-method", "Выберите способ", Object.entries(deliveryMethods));
renderRoute();
updateFavoriteButtons();
renderCart();
