"use strict";

const products = [
  { id: "hoodie-shadow", category: "hoodie", name: "Худи Shadow", color: "Графит", price: 5490, sizes: ["S", "M", "L", "XL"], description: "Плотный трикотаж с эффектом выстиранной ткани, свободный крой и карман-кенгуру." },
  { id: "tee-core", category: "tee", name: "Футболка Core", color: "Молочный", price: 2490, sizes: ["XS", "S", "M", "L"], description: "Плотная футболка с круглым вырезом, спущенным плечом и прямым кроем." },
  { id: "pants-field", category: "pants", name: "Карго Field", color: "Олива", price: 5990, sizes: ["S", "M", "L"], description: "Прямые брюки из плотной ткани с боковыми карманами и накладными карманами с клапанами." },
  { id: "bomber-night", category: "outerwear", name: "Бомбер Night", color: "Чёрный", price: 8990, sizes: ["M", "L", "XL"], description: "Бомбер из матового нейлона с металлической молнией и эластичными манжетами." },
  { id: "hoodie-cloud", category: "hoodie", name: "Худи Cloud", color: "Серый меланж", price: 4990, sizes: ["XS", "S", "M", "L"], description: "Мягкое худи с объёмным капюшоном, широкими манжетами и карманом-кенгуру." },
  { id: "tee-washed", category: "tee", name: "Футболка Washed", color: "Выстиранный чёрный", price: 2790, sizes: ["S", "M", "L", "XL"], description: "Свободная футболка с удлинённым рукавом и мягкой фактурой выстиранного хлопка." },
  { id: "pants-dune", category: "pants", name: "Чиносы Dune", color: "Песочный", price: 5290, sizes: ["XS", "S", "M", "L"], description: "Свободные прямые брюки из хлопкового твила с прорезными боковыми карманами." },
  { id: "jacket-block", category: "outerwear", name: "Куртка Block", color: "Тёмная олива", price: 7490, sizes: ["S", "M", "L", "XL"], description: "Лёгкая куртка на кнопках с отложным воротником и боковыми карманами." },
];

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
const quantityLimit = 99;
const productDialog = byId("product-dialog");
const shopDialog = byId("shop-dialog");
const filterForm = byId("filter-form");
const checkoutForm = byId("checkout-form");
const sizeOptions = byId("product-sizes");
const cartItems = byId("cart-items");
const shopPanels = [...shopDialog.querySelectorAll(".shop-panel")];
let activeProduct;
let notificationTimer;
let cart = readCart();

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
  try {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  } catch {
    // The current page keeps a working in-memory cart.
  }
}

function cartTotal() {
  return cart.reduce((sum, line) => sum + productById.get(line.id).price * line.quantity, 0);
}

function renderCatalog() {
  const category = byId("category").value;
  const size = byId("filter-size").value;
  const priceInput = byId("max-price");
  const maxPrice = priceInput.value === "" ? Infinity : priceInput.valueAsNumber;
  priceInput.setAttribute("aria-invalid", String(!priceInput.validity.valid));

  const matches = products.filter((product) =>
    (!category || product.category === category) &&
    (!size || product.sizes.includes(size)) &&
    (product.price <= maxPrice || priceInput.validity.badInput)
  );

  byId("products").innerHTML = matches.map((product) => `
    <article class="product-card">
      <img src="${photo(product)}" alt="" width="640" height="800" loading="lazy">
      <h3><button type="button" class="product-trigger" data-product="${product.id}" aria-haspopup="dialog">${product.name}</button></h3>
      <p class="product-color">${product.color}</p>
      <p class="product-price">${formatPrice(product.price)}</p>
    </article>
  `).join("");
  byId("result-count").textContent = `Найдено: ${matches.length}`;
  byId("empty-catalog").hidden = matches.length > 0;
}

function openProduct(product) {
  activeProduct = product;
  byId("product-image").src = photo(product);
  byId("product-image").alt = `${product.name}, цвет: ${product.color}`;
  byId("product-name").textContent = product.name;
  byId("product-color").textContent = product.color;
  byId("product-price").textContent = formatPrice(product.price);
  byId("product-description").textContent = product.description;
  byId("size-error").textContent = "";
  sizeOptions.innerHTML = product.sizes.map((size) => `
    <label class="size-option">
      <input type="radio" name="size" value="${size}" required aria-describedby="size-error">
      <span>${size}</span>
    </label>
  `).join("");
  productDialog.showModal();
  productDialog.scrollTop = 0;
}

function notify(message) {
  const notification = byId("notification");
  clearTimeout(notificationTimer);
  notification.textContent = message;
  notificationTimer = setTimeout(() => { notification.textContent = ""; }, 3500);
}

function renderCart() {
  const total = formatPrice(cartTotal());
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  byId("cart-count").textContent = count;
  byId("empty-cart").hidden = cart.length > 0;
  byId("cart-summary").hidden = cart.length === 0;
  byId("cart-total").textContent = total;
  byId("checkout-total").textContent = total;
  cartItems.innerHTML = cart.map((line, index) => {
    const product = productById.get(line.id);
    const label = `${product.name}, ${line.size}`;

    return `
      <li class="cart-item" data-line="${index}">
        <img src="${photo(product)}" alt="" width="640" height="800">
        <div>
          <h3>${product.name}</h3>
          <p class="muted">Размер ${line.size}</p>
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

filterForm.addEventListener("input", renderCatalog);
filterForm.addEventListener("submit", (event) => event.preventDefault());
filterForm.addEventListener("reset", () => requestAnimationFrame(renderCatalog));
byId("products").addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-product]");
  if (trigger) openProduct(productById.get(trigger.dataset.product));
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
  productDialog.close();
  notify(`${activeProduct.name}, ${size} — в корзине`);
});

for (const dialog of [productDialog, shopDialog]) {
  dialog.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) dialog.close();
  });
}

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

byId("start-checkout").addEventListener("click", () => {
  if (cart.length) showShopPanel("checkout-panel");
});
byId("back-to-cart").addEventListener("click", () => showShopPanel("cart-panel"));
checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!cart.length || !checkoutForm.reportValidity()) return;

  byId("confirmed-total").textContent = formatPrice(cartTotal());
  cart = [];
  updateCart();
  checkoutForm.reset();
  showShopPanel("confirmation-panel");
});

const mobileViewport = matchMedia("(max-width: 40rem)");
function setFilterLayout() {
  byId("filters").open = !mobileViewport.matches;
}
mobileViewport.addEventListener("change", setFilterLayout);
setFilterLayout();
renderCatalog();
renderCart();
