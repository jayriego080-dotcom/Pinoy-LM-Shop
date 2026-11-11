
"use strict";

/* =========================================
   PINOY LM SHOP
   FRONTEND DEMO - PART 1 OF 5
   ========================================= */

// Temporary demo products.
// Papalitan natin ito ng Supabase products later.

const demoProducts = [
  {
    id: "rss-old-001",
    name: "Old Kingdom RSS Pack",
    category: "RSS",
    description: "RSS package for Old Kingdoms.",
    price: 60,
    stock: 50,
    emoji: "📦",
    badge: "Popular"
  },
  {
    id: "rss-rare-001",
    name: "Rarely KD RSS Pack",
    category: "RSS",
    description: "RSS package for Rarely KD.",
    price: 50,
    stock: 30,
    emoji: "💎",
    badge: "Rare"
  },
  {
    id: "rss-fresh-001",
    name: "Fresh Kingdom RSS Pack",
    category: "RSS",
    description: "RSS package for Fresh Kingdoms.",
    price: 35,
    stock: 40,
    emoji: "🌾",
    badge: "New"
  },
  {
    id: "bot-farm-001",
    name: "Farm Bot",
    category: "Bot",
    description: "Farm bot subscription.",
    price: 150,
    stock: 100,
    emoji: "🤖",
    badge: "Best Seller"
  },
  {
    id: "bot-new-001",
    name: "New Bot Complete Feature",
    category: "Bot",
    description: "Bot with complete features.",
    price: 200,
    stock: 100,
    emoji: "⚙️",
    badge: "Featured"
  },
  {
    id: "tracker-001",
    name: "Tracker Bot",
    category: "Tracker",
    description: "Kingdom and player tracking tool.",
    price: 100,
    stock: 50,
    emoji: "🛰️",
    badge: "Tracker"
  },
  {
    id: "gems-001",
    name: "Gems Package",
    category: "Gems",
    description: "Gems product listing.",
    price: 250,
    stock: 20,
    emoji: "💎",
    badge: "Available"
  },
  {
    id: "other-001",
    name: "Other Products",
    category: "Other",
    description: "Other available shop products.",
    price: 100,
    stock: 20,
    emoji: "🎁",
    badge: "More"
  }
];

// Main application state

let products = [...demoProducts];

let cart = [];

let activeCategory = "All";

let searchKeyword = "";

// Local storage key for demo cart

const CART_STORAGE_KEY = "pinoy_lm_shop_cart";

// Currency formatter

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2
});

function formatPrice(amount) {
  return pesoFormatter.format(Number(amount) || 0);
}

// Safe HTML output

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[character];
  });
}

// Get element safely

function getElement(selector) {
  return document.querySelector(selector);
}

// Show notification

function showToast(message, type = "info") {
  const container = getElement("#toast-container");

  if (!container) {
    console.log(message);
    return;
  }

  const toast = document.createElement("div");

  toast.className = "toast";
  toast.dataset.type = type;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Save cart in browser

function saveCart() {
  try {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cart)
    );
  } catch (error) {
    console.warn("Unable to save cart:", error);
  }
}

// Load saved cart

function loadCart() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
      cart = [];
      return;
    }

    const parsedCart = JSON.parse(savedCart);

    cart = Array.isArray(parsedCart) ? parsedCart : [];

  } catch (error) {
    cart = [];
    console.warn("Unable to load cart:", error);
  }
}

// Find product using ID

function findProduct(productId) {
  return products.find(product => product.id === productId);
}

// Calculate cart quantity

function getCartQuantity() {
  return cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
}

// Calculate cart total

function getCartTotal() {
  return cart.reduce((total, item) => {
    const product = findProduct(item.id);

    if (!product) return total;

    return total + product.price * item.quantity;
  }, 0);
}

/* =========================================
   PINOY LM SHOP
   FRONTEND DEMO - PART 2 OF 5
   PRODUCT DISPLAY AND FILTERING
   ========================================= */

// Display products

function renderProducts() {
  const productGrid = getElement("#product-grid");

  if (!productGrid) return;

  let filteredProducts = [...products];

  // Category filter

  if (activeCategory !== "All") {
    filteredProducts = filteredProducts.filter(product => {
      return product.category.toLowerCase() ===
        activeCategory.toLowerCase();
    });
  }

  // Search filter

  if (searchKeyword.trim() !== "") {
    const keyword = searchKeyword.toLowerCase();

    filteredProducts = filteredProducts.filter(product => {
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword)
      );
    });
  }

  // Empty state

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-products">
        <div style="font-size:40px;">🔍</div>
        <h3>No products found</h3>
        <p>Try another search or category.</p>
      </div>
    `;

    return;
  }

  // Product cards

  productGrid.innerHTML = filteredProducts.map(product => {
    const stock = Number(product.stock) || 0;

    return `
      <article class="product-card">

        <div class="product-image">
          <span class="product-emoji">
            ${escapeHTML(product.emoji)}
          </span>

          ${
            product.badge
              ? `<span class="product-badge">
                  ${escapeHTML(product.badge)}
                </span>`
              : ""
          }
        </div>

        <div class="product-details">

          <span class="product-category">
            ${escapeHTML(product.category)}
          </span>

          <h3>${escapeHTML(product.name)}</h3>

          <p>${escapeHTML(product.description)}</p>

          <div class="product-bottom">

            <div>
              <div class="product-price">
                ${formatPrice(product.price)}
              </div>

              <small>
                ${stock > 0 ? `${stock} available` : "Out of stock"}
              </small>
            </div>

            <button
              class="add-cart-button"
              data-add-cart="${escapeHTML(product.id)}"
              ${stock <= 0 ? "disabled" : ""}
            >
              ${stock > 0 ? "Add to Cart" : "Sold Out"}
            </button>

          </div>
        </div>

      </article>
    `;
  }).join("");
}

// Set active category

function setCategory(category) {
  activeCategory = category || "All";

  // Update category buttons

  document.querySelectorAll("[data-filter]").forEach(button => {
    const selected =
      button.dataset.filter.toLowerCase() ===
      activeCategory.toLowerCase();

    button.classList.toggle("active", selected);
  });

  // Update category cards

  document.querySelectorAll("[data-category]").forEach(button => {
    const selected =
      button.dataset.category.toLowerCase() ===
      activeCategory.toLowerCase();

    button.classList.toggle("active", selected);
  });

  renderProducts();
}

// Search products

function handleProductSearch(value) {
  searchKeyword = value || "";
  renderProducts();
}

// Product button events

function initializeProductEvents() {

  // Category filter buttons

  document.querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
      setCategory(button.dataset.filter);
    });
  });

  // Category cards

  document.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;

      setCategory(category);

      const productSection = getElement("#products");

      if (productSection) {
        productSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  // Search input

  const searchInput = getElement("#product-search");

  if (searchInput) {
    searchInput.addEventListener("input", event => {
      handleProductSearch(event.target.value);
    });
  }

  // Add to cart using event delegation

  const productGrid = getElement("#product-grid");

  if (productGrid) {
    productGrid.addEventListener("click", event => {
      const button = event.target.closest("[data-add-cart]");

      if (!button) return;

      const productId = button.dataset.addCart;

      addToCart(productId);
    });
  }
}

// Refresh product list

function refreshProducts() {
  renderProducts();
}

/* =========================================
   PINOY LM SHOP
   FRONTEND DEMO - PART 3 OF 5
   SHOPPING CART
   ========================================= */

// Add product to cart

function addToCart(productId) {
  const product = findProduct(productId);

  if (!product) {
    showToast("Product not found.", "error");
    return;
  }

  if (Number(product.stock) <= 0) {
    showToast("This product is out of stock.", "error");
    return;
  }

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    if (existingItem.quantity >= Number(product.stock)) {
      showToast("Maximum available stock reached.", "error");
      return;
    }

    existingItem.quantity += 1;

  } else {
    cart.push({
      id: productId,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();

  showToast("Product added to cart!", "success");
}

// Remove product from cart

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);

  saveCart();
  updateCartUI();

  showToast("Item removed from cart.");
}

// Change product quantity

function changeCartQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);

  const product = findProduct(productId);

  if (!item || !product) return;

  const newQuantity = item.quantity + change;

  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  if (newQuantity > Number(product.stock)) {
    showToast("Maximum available stock reached.", "error");
    return;
  }

  item.quantity = newQuantity;

  saveCart();
  updateCartUI();
}

// Render cart items

function renderCartItems() {
  const cartContainer = getElement("#cart-items");

  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <div style="font-size:45px;">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add products to get started.</p>
      </div>
    `;

    return;
  }

  cartContainer.innerHTML = cart.map(item => {
    const product = findProduct(item.id);

    if (!product) return "";

    return `
      <div class="cart-item">

        <div class="cart-item-image">
          ${escapeHTML(product.emoji)}
        </div>

        <div class="cart-item-info">

          <h4>${escapeHTML(product.name)}</h4>

          <p>${formatPrice(product.price)}</p>

          <div class="cart-quantity">

            <button
              type="button"
              data-cart-minus="${escapeHTML(product.id)}"
              aria-label="Decrease quantity"
            >−</button>

            <span>${item.quantity}</span>

            <button
              type="button"
              data-cart-plus="${escapeHTML(product.id)}"
              aria-label="Increase quantity"
            >+</button>

          </div>

        </div>

        <div class="cart-item-actions">

          <strong>
            ${formatPrice(product.price * item.quantity)}
          </strong>

          <button
            type="button"
            class="remove-cart-item"
            data-cart-remove="${escapeHTML(product.id)}"
          >
            Remove
          </button>

        </div>

      </div>
    `;
  }).join("");
}

// Update cart count and total

function updateCartUI() {
  const cartCount = getElement("#cart-count");
  const cartTotal = getElement("#cart-total");

  if (cartCount) {
    cartCount.textContent = getCartQuantity();
  }

  if (cartTotal) {
    cartTotal.textContent = formatPrice(getCartTotal());
  }

  renderCartItems();
}

// Open cart modal

function openCart() {
  const modal = getElement("#cart-modal");

  if (!modal) return;

  updateCartUI();

  modal.classList.add("active");
  document.body.classList.add("modal-open");
}

// Close cart modal

function closeCart() {
  const modal = getElement("#cart-modal");

  if (!modal) return;

  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

// Initialize cart events

function initializeCartEvents() {

  // Open cart button

  const cartButton = getElement("#cart-button");

  if (cartButton) {
    cartButton.addEventListener("click", openCart);
  }

  // Cart item controls

  const cartContainer = getElement("#cart-items");

  if (cartContainer) {
    cartContainer.addEventListener("click", event => {

      const minusButton = event.target.closest("[data-cart-minus]");

      const plusButton = event.target.closest("[data-cart-plus]");

      const removeButton = event.target.closest("[data-cart-remove]");

      if (minusButton) {
        changeCartQuantity(minusButton.dataset.cartMinus, -1);
        return;
      }

      if (plusButton) {
        changeCartQuantity(plusButton.dataset.cartPlus, 1);
        return;
      }

      if (removeButton) {
        removeFromCart(removeButton.dataset.cartRemove);
      }

    });
  }

  // Checkout button

  const checkoutButton = getElement("#checkout-button");

  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {

      if (cart.length === 0) {
        showToast("Your cart is empty.", "error");
        return;
      }

      showToast(
        "Cart ready! Real checkout and payment verification will be connected to Supabase later.",
        "info"
      );

    });
  }
}

/* =========================================
   PINOY LM SHOP
   FRONTEND DEMO - PART 4 OF 5
   AUTH MODALS, CALCULATOR, NAVIGATION
   ========================================= */

// Open modal

function openModal(modalId) {
  const modal = getElement(`#${modalId}`);

  if (!modal) return;

  modal.classList.add("active");
  document.body.classList.add("modal-open");
}

// Close modal

function closeModal(modalId) {
  const modal = getElement(`#${modalId}`);

  if (!modal) return;

  modal.classList.remove("active");

  const anotherModalOpen =
    document.querySelector(".modal-overlay.active");

  if (!anotherModalOpen) {
    document.body.classList.remove("modal-open");
  }
}

// Close all modals

function closeAllModals() {
  document.querySelectorAll(".modal-overlay.active").forEach(modal => {
    modal.classList.remove("active");
  });

  document.body.classList.remove("modal-open");
}

// Login and register events

function initializeAuthEvents() {

  const loginButton = getElement("#login-button");

  const loginForm = getElement("#login-form");

  const registerForm = getElement("#register-form");

  const showRegister = getElement("#show-register");

  // Open login modal

  if (loginButton) {
    loginButton.addEventListener("click", () => {
      openModal("login-modal");
    });
  }

  // Switch to register modal

  if (showRegister) {
    showRegister.addEventListener("click", event => {
      event.preventDefault();

      closeModal("login-modal");
      openModal("register-modal");
    });
  }

  // Login form demo

  if (loginForm) {
    loginForm.addEventListener("submit", event => {
      event.preventDefault();

      const email = getElement("#login-email")?.value.trim();

      const password = getElement("#login-password")?.value;

      if (!email || !password) {
        showToast("Please complete all login fields.", "error");
        return;
      }

      showToast(
        "Login will be activated after Supabase integration.",
        "info"
      );
    });
  }

  // Registration form demo

  if (registerForm) {
    registerForm.addEventListener("submit", event => {
      event.preventDefault();

      const name = getElement("#register-name")?.value.trim();

      const email = getElement("#register-email")?.value.trim();

      const password = getElement("#register-password")?.value;

      if (!name || !email || !password) {
        showToast("Please complete all registration fields.", "error");
        return;
      }

      if (password.length < 6) {
        showToast("Password must be at least 6 characters.", "error");
        return;
      }

      showToast(
        "Registration will be activated after Supabase integration.",
        "info"
      );
    });
  }
}

// Modal close buttons and backdrop

function initializeModalEvents() {

  document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => {
      const modal = button.closest(".modal-overlay");

      if (modal) {
        closeModal(modal.id);
      }
    });
  });

  document.querySelectorAll(".modal-overlay").forEach(modal => {

    modal.addEventListener("click", event => {
      if (event.target === modal) {
        closeModal(modal.id);
      }
    });

  });

  // Escape key closes open modals

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeAllModals();
    }
  });
}

// Gems calculator

function calculateGems() {

  const quantityInput = getElement("#gem-quantity");

  const valueInput = getElement("#gem-value");

  const result = getElement("#calculator-result");

  if (!quantityInput || !valueInput || !result) return;

  const quantity = Number(quantityInput.value);

  const gemValue = Number(valueInput.value);

  if (
    !Number.isFinite(quantity) ||
    !Number.isFinite(gemValue) ||
    quantity <= 0 ||
    gemValue <= 0
  ) {
    result.textContent = "Please enter valid numbers.";
    return;
  }

  const total = quantity * gemValue;

  result.textContent =
    `Total: ${formatPrice(total)}`;
}

// Initialize calculator

function initializeCalculator() {

  const calculateButton = getElement("#calculate-gems");

  if (calculateButton) {
    calculateButton.addEventListener("click", calculateGems);
  }

}

// Mobile navigation

function initializeMobileNavigation() {

  const menuButton = getElement("#mobile-menu-button");

  const mobileNav = getElement("#mobile-nav");

  if (!menuButton || !mobileNav) return;

  menuButton.addEventListener("click", () => {

    const isOpen = mobileNav.classList.toggle("active");

    menuButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

  });

  // Close menu after clicking a navigation link

  mobileNav.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      mobileNav.classList.remove("active");

      menuButton.setAttribute("aria-expanded", "false");

    });

  });

}

// Customer support links

function initializeSupportLinks() {

  const whatsappLink = getElement("#whatsapp-link");

  const telegramLink = getElement("#telegram-link");

  if (whatsappLink) {
    // Add your official WhatsApp URL here later.
    whatsappLink.href = "#";

    whatsappLink.addEventListener("click", event => {
      if (whatsappLink.getAttribute("href") === "#") {
        event.preventDefault();

        showToast(
          "WhatsApp support link will be configured.",
          "info"
        );
      }
    });
  }

  if (telegramLink) {
    // Add your official Telegram URL here later.
    telegramLink.href = "#";

    telegramLink.addEventListener("click", event => {
      if (telegramLink.getAttribute("href") === "#") {
        event.preventDefault();

        showToast(
          "Telegram support link will be configured.",
                    "info"
        );
      }
    });
  }

}

/* =========================================
   PINOY LM SHOP
   FRONTEND DEMO - PART 5 OF 5
   INITIALIZATION AND FINAL STARTUP
   ========================================= */

// Update current year in footer

function updateFooterYear() {
  const yearElement = getElement("#current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// Initialize all frontend features

function initializeShop() {

  console.log("PINoy LM Shop starting...");

  // Load saved cart

  loadCart();

  // Product display and filters

  initializeProductEvents();

  renderProducts();

  // Shopping cart

  initializeCartEvents();

  updateCartUI();

  // Login and registration

  initializeAuthEvents();

  // Modal controls

  initializeModalEvents();

  // Gems calculator

  initializeCalculator();

  // Mobile menu

  initializeMobileNavigation();

  // Customer support

  initializeSupportLinks();

  // Footer year

  updateFooterYear();

  console.log("PINoy LM Shop frontend ready!");

  showToast("Welcome to PINoy LM Shop!", "success");
}

// Start only after HTML is ready

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initializeShop,
    { once: true }
  );

} else {

  initializeShop();

}

