
"use strict";

/* =========================================
   PINOY LM SHOP
   ADMIN JAVASCRIPT - PART 1 OF 3
   DASHBOARD, NAVIGATION & PRODUCTS
   ========================================= */

/* DEMO MODE
   Local browser storage only.
   Supabase integration will follow.
*/

const ADMIN_STORAGE = {
  products: "pinoy_lm_admin_products",
  categories: "pinoy_lm_admin_categories",
  orders: "pinoy_lm_admin_orders",
  customers: "pinoy_lm_admin_customers",
  transactions: "pinoy_lm_admin_transactions",
  wallet: "pinoy_lm_admin_wallet",
  inventory: "pinoy_lm_admin_inventory",
  subscriptions: "pinoy_lm_admin_subscriptions",
  suppliers: "pinoy_lm_admin_suppliers",
  settings: "pinoy_lm_admin_settings"
};

/* HELPERS */

const adminGet = (selector) =>
  document.querySelector(selector);

const adminGetAll = (selector) =>
  document.querySelectorAll(selector);

function adminFormatPrice(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(Number(amount) || 0);
}

function adminEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function adminLoad(key, fallback = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error("Storage read error:", error);
    return fallback;
  }
}

function adminSave(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function adminId(prefix = "PLM") {
  return prefix + "-" + Date.now() + "-" +
    Math.random().toString(36).slice(2, 7).toUpperCase();
}

/* INITIAL DEMO DATA */

const defaultAdminProducts = [
  {
    id: "RSS001",
    name: "RSS Full Bank Code",
    category: "RSS",
    description: "Complete RSS code package",
    cost: 2,
    price: 550,
    stock: 20,
    emoji: "📦",
    active: true
  },
  {
    id: "RSS002",
    name: "RSS Full Bank Manual",
    category: "RSS",
    description: "Manual RSS package",
    cost: 1,
    price: 59,
    stock: 50,
    emoji: "📚",
    active: true
  },
  {
    id: "BOT001",
    name: "Farm Bot",
    category: "Bot",
    description: "Farm bot subscription",
    cost: 3,
    price: 150,
    stock: 100,
    emoji: "🤖",
    active: true
  },
  {
    id: "BOT002",
    name: "New Bot Complete Feature",
    category: "Bot",
    description: "Complete feature bot subscription",
    cost: 4,
    price: 200,
    stock: 100,
    emoji: "⚙️",
    active: true
  },
  {
    id: "TRK001",
    name: "Kingdom Tracker",
    category: "Tracker",
    description: "Kingdom tracking service",
    cost: 1,
    price: 100,
    stock: 20,
    emoji: "🔎",
    active: true
  },
  {
    id: "GEM001",
    name: "Gem Package",
    category: "Gems",
    description: "Gem package listing",
    cost: 5,
    price: 300,
    stock: 10,
    emoji: "💎",
    active: true
  }
];

let adminProducts = adminLoad(
  ADMIN_STORAGE.products,
  defaultAdminProducts
);

let adminCategories = adminLoad(
  ADMIN_STORAGE.categories,
  ["RSS", "Bot", "Tracker", "Gems", "Other Products"]
);

let adminOrders = adminLoad(ADMIN_STORAGE.orders);
let adminCustomers = adminLoad(ADMIN_STORAGE.customers);
let adminTransactions = adminLoad(ADMIN_STORAGE.transactions);
let adminWallet = adminLoad(ADMIN_STORAGE.wallet);
let adminInventory = adminLoad(ADMIN_STORAGE.inventory);
let adminSubscriptions = adminLoad(ADMIN_STORAGE.subscriptions);
let adminSuppliers = adminLoad(ADMIN_STORAGE.suppliers);

adminSave(ADMIN_STORAGE.products, adminProducts);
adminSave(ADMIN_STORAGE.categories, adminCategories);

/* TOAST */

function adminToast(message, type = "success") {
  const container = adminGet("#admin-toast-container");

  if (!container) {
    alert(message);
    return;
  }

  const toast = document.createElement("div");
  toast.className = `admin-toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

/* NAVIGATION */

const adminPageTitles = {
  dashboard: "Dashboard",
  products: "Products",
  categories: "Categories",
  orders: "Orders",
  customers: "Customers",
  wallet: "Wallet Top-ups",
  transactions: "Transactions",
  reports: "Reports & Profit",
  inventory: "RSS Inventory",
  subscriptions: "Subscriptions",
  suppliers: "Suppliers & API",
  settings: "Shop Settings"
};

function adminOpenPage(page) {
  const target = adminGet("#page-" + page);

  if (!target) return;

  adminGetAll(".admin-page").forEach(section => {
    section.classList.remove("active");
  });

  target.classList.add("active");

  adminGetAll("[data-page]").forEach(link => {
    link.classList.toggle(
      "active",
      link.dataset.page === page
    );
  });

  const title = adminGet("#page-title");

  if (title) {
    title.textContent = adminPageTitles[page] || "Admin";
  }

  const sidebar = adminGet("#admin-sidebar");

  if (sidebar) {
    sidebar.classList.remove("open");
  }

  if (page === "dashboard") renderAdminDashboard();
  if (page === "products") renderAdminProducts();
  if (page === "categories") renderAdminCategories();
}

function initializeAdminNavigation() {
  adminGetAll("[data-page]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      adminOpenPage(link.dataset.page);
    });
  });

  adminGetAll("[data-open-page]").forEach(button => {
    button.addEventListener("click", () => {
      adminOpenPage(button.dataset.openPage);
    });
  });

  const toggle = adminGet("#sidebar-toggle");

  if (toggle) {
    toggle.addEventListener("click", () => {
      adminGet("#admin-sidebar")?.classList.toggle("open");
    });
  }
}

/* DASHBOARD */

function renderAdminDashboard() {
  const totalSales = adminOrders.reduce(
    (sum, order) => sum +
      (order.status === "completed" ? Number(order.total || 0) : 0),
    0
  );

  const totalProfit = adminOrders.reduce(
    (sum, order) => sum +
      (order.status === "completed" ? Number(order.profit || 0) : 0),
    0
  );

  const pendingOrders = adminOrders.filter(
    order => order.status === "pending"
  ).length;

  const stats = {
    "#stat-sales": adminFormatPrice(totalSales),
    "#stat-orders": adminOrders.length,
    "#stat-customers": adminCustomers.length,
    "#stat-products": adminProducts.length,
    "#stat-profit": adminFormatPrice(totalProfit),
    "#stat-pending": pendingOrders
  };

  Object.entries(stats).forEach(([selector, value]) => {
    const element = adminGet(selector);
    if (element) element.textContent = value;
  });

  renderRecentAdminOrders();
}

function renderRecentAdminOrders() {
  const container = adminGet("#dashboard-recent-orders");

  if (!container) return;

  const recent = [...adminOrders].slice(-5).reverse();

  if (!recent.length) {
    container.innerHTML =
      '<p class="empty-message">No orders yet.</p>';
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${recent.map(order => `
            <tr>
              <td>${adminEscape(order.id)}</td>
              <td>${adminEscape(order.customer || "Customer")}</td>
              <td>${adminFormatPrice(order.total)}</td>
              <td>
                <span class="status-badge ${adminEscape(order.status)}">
                  ${adminEscape(order.status)}
                </span>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

/* PRODUCTS */

function renderAdminProducts() {
  const tbody = adminGet("#admin-products-table");

  if (!tbody) return;

  const keyword = (
    adminGet("#product-search")?.value || ""
  ).toLowerCase();

  const category = adminGet(
    "#product-category-filter"
  )?.value || "";

  const filtered = adminProducts.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(keyword) ||
      product.id.toLowerCase().includes(keyword);

    const matchesCategory =
      !category || product.category === category;

    return matchesSearch && matchesCategory;
  });

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-message">
          No products found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(product => `
    <tr>
      <td>${adminEscape(product.id)}</td>
      <td>
        ${adminEscape(product.emoji || "📦")}
        ${adminEscape(product.name)}
      </td>
      <td>${adminEscape(product.category)}</td>
      <td>${adminFormatPrice(product.cost)}</td>
      <td>${adminFormatPrice(product.price)}</td>
      <td>${Number(product.stock || 0)}</td>
      <td>
        <span class="status-badge ${product.active ? "active" : "suspended"}">
          ${product.active ? "Active" : "Inactive"}
        </span>
        <button
          class="table-action"
          data-edit-product="${adminEscape(product.id)}"
          type="button"
        >Edit</button>
        <button
          class="table-action danger"
          data-delete-product="${adminEscape(product.id)}"
          type="button"
        >Delete</button>
      </td>
    </tr>
  `).join("");
}

function renderAdminCategories() {
  const container = adminGet("#admin-category-list");

  if (!container) return;

  if (!adminCategories.length) {
    container.innerHTML =
      '<p class="empty-message">No categories yet.</p>';
    return;
  }

  container.innerHTML = adminCategories.map(category => {
    const count = adminProducts.filter(
      product => product.category === category
    ).length;

    return `
      <div class="admin-card">
        <span>📁</span>
        <h3>${adminEscape(category)}</h3>
        <p>${count} products</p>
        <button
          class="table-action danger"
          data-delete-category="${adminEscape(category)}"
          type="button"
        >Delete</button>
      </div>
    `;
  }).join("");
}

function initializeProductSearch() {
  adminGet("#product-search")?.addEventListener(
    "input",
    renderAdminProducts
  );

  adminGet("#product-category-filter")?.addEventListener(
    "change",
    renderAdminProducts
  );
}

/* PRODUCT FORM */

function openAdminProductModal(productId = null) {
  const modal = adminGet("#product-modal");
  const form = adminGet("#admin-product-form");

  if (!modal || !form) return;

  form.reset();

  const product = productId
    ? adminProducts.find(item => item.id === productId)
    : null;

  adminGet("#edit-product-id").value = product?.id || "";
  adminGet("#admin-product-name").value = product?.name || "";
  adminGet("#admin-product-category").value =
    product?.category || "RSS";
  adminGet("#admin-product-description").value =
    product?.description || "";
  adminGet("#admin-product-cost").value = product?.cost ?? "";
  adminGet("#admin-product-price").value = product?.price ?? "";
  adminGet("#admin-product-stock").value = product?.stock ?? 0;
  adminGet("#admin-product-emoji").value =
    product?.emoji || "📦";
  adminGet("#admin-product-active").checked =
    product ? Boolean(product.active) : true;

  modal.classList.add("active");
}

function saveAdminProduct(event) {
  event.preventDefault();

  const id = adminGet("#edit-product-id").value;

  const product = {
    id: id || adminId("PRODUCT"),
    name: adminGet("#admin-product-name").value.trim(),
    category: adminGet("#admin-product-category").value,
    description: adminGet("#admin-product-description").value.trim(),
    cost: Number(adminGet("#admin-product-cost").value || 0),
    price: Number(adminGet("#admin-product-price").value || 0),
    stock: Number(adminGet("#admin-product-stock").value || 0),
    emoji: adminGet("#admin-product-emoji").value.trim() || "📦",
    active: adminGet("#admin-product-active").checked
  };

  if (!product.name) {
    adminToast("Please enter a product name.", "error");
    return;
  }

  if (product.price < 0 || product.cost < 0 || product.stock < 0) {
    adminToast("Prices and stock cannot be negative.", "error");
    return;
  }

  if (id) {
    const index = adminProducts.findIndex(item => item.id === id);

    if (index !== -1) {
      adminProducts[index] = product;
    }
  } else {
    adminProducts.push(product);
  }

  adminSave(ADMIN_STORAGE.products, adminProducts);

  adminGet("#product-modal")?.classList.remove("active");

  renderAdminProducts();
  renderAdminDashboard();

  adminToast(id ? "Product updated." : "Product added.");
}

function deleteAdminProduct(productId) {
  const product = adminProducts.find(
    item => item.id === productId
  );

  if (!product) return;

  if (!confirm(`Delete "${product.name}"?`)) return;

  adminProducts = adminProducts.filter(
    item => item.id !== productId
  );

  adminSave(ADMIN_STORAGE.products, adminProducts);

  renderAdminProducts();
  renderAdminDashboard();

  adminToast("Product deleted.");
}

function initializeProductManagement() {
  adminGet("#add-product-button")?.addEventListener(
    "click",
    () => openAdminProductModal()
  );

  adminGet("#admin-product-form")?.addEventListener(
    "submit",
    saveAdminProduct
  );

  adminGet("#admin-products-table")?.addEventListener(
    "click",
    event => {
      const editButton = event.target.closest("[data-edit-product]");
      const deleteButton = event.target.closest("[data-delete-product]");

      if (editButton) {
        openAdminProductModal(editButton.dataset.editProduct);
      }

      if (deleteButton) {
        deleteAdminProduct(deleteButton.dataset.deleteProduct);
      }
    }
  );
}

/* END OF PART 1 */

/* =========================================
   PINOY LM SHOP
   ADMIN JAVASCRIPT - PART 2 OF 3
   ORDERS, CUSTOMERS, WALLET & REPORTS
   ========================================= */

/* ORDERS */

function renderAdminOrders() {
  const tbody = adminGet("#admin-orders-table");
  if (!tbody) return;

  const keyword = (
    adminGet("#order-search")?.value || ""
  ).toLowerCase();

  const status = adminGet("#order-status-filter")?.value || "";

  const filtered = adminOrders.filter(order => {
    const matchesSearch =
      String(order.id || "").toLowerCase().includes(keyword) ||
      String(order.customer || "").toLowerCase().includes(keyword);

    return matchesSearch && (!status || order.status === status);
  });

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr><td colspan="6" class="empty-message">No orders found.</td></tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(order => `
    <tr>
      <td>${adminEscape(order.id)}</td>
      <td>${adminEscape(order.customer || "Customer")}</td>
      <td>${adminFormatPrice(order.total)}</td>
      <td>${adminEscape(order.date || "—")}</td>
      <td>
        <span class="status-badge ${adminEscape(order.status)}">
          ${adminEscape(order.status)}
        </span>
      </td>
      <td>
        <select data-order-status="${adminEscape(order.id)}">
          ${["pending", "processing", "completed", "cancelled"].map(value => `
            <option value="${value}" ${order.status === value ? "selected" : ""}>
              ${value}
            </option>
          `).join("")}
        </select>
      </td>
    </tr>
  `).join("");
}

function updateAdminOrderStatus(orderId, status) {
  const order = adminOrders.find(item => item.id === orderId);
  if (!order) return;

  order.status = status;

  adminSave(ADMIN_STORAGE.orders, adminOrders);

  renderAdminOrders();
  renderAdminDashboard();
  renderAdminReports();

  adminToast("Order status updated.");
}

function initializeAdminOrders() {
  adminGet("#order-search")?.addEventListener(
    "input",
    renderAdminOrders
  );

  adminGet("#order-status-filter")?.addEventListener(
    "change",
    renderAdminOrders
  );

  adminGet("#admin-orders-table")?.addEventListener(
    "change",
    event => {
      const select = event.target.closest("[data-order-status]");
      if (!select) return;

      updateAdminOrderStatus(
        select.dataset.orderStatus,
        select.value
      );
    }
  );
}

/* CUSTOMERS */

function renderAdminCustomers() {
  const tbody = adminGet("#admin-customers-table");
  if (!tbody) return;

  const keyword = (
    adminGet("#customer-search")?.value || ""
  ).toLowerCase();

  const status = adminGet("#customer-status-filter")?.value || "";

  const filtered = adminCustomers.filter(customer => {
    const matchesSearch =
      String(customer.id || "").toLowerCase().includes(keyword) ||
      String(customer.name || "").toLowerCase().includes(keyword) ||
      String(customer.email || "").toLowerCase().includes(keyword);

    return matchesSearch &&
      (!status || customer.status === status);
  });

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr><td colspan="5" class="empty-message">No customers found.</td></tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(customer => `
    <tr>
      <td>${adminEscape(customer.id)}</td>
      <td>${adminEscape(customer.name || "Customer")}</td>
      <td>${adminEscape(customer.email || "—")}</td>
      <td>${adminFormatPrice(customer.balance || 0)}</td>
      <td>
        <span class="status-badge ${adminEscape(customer.status || "active")}">
          ${adminEscape(customer.status || "active")}
        </span>
        <button
          class="table-action"
          data-view-customer="${adminEscape(customer.id)}"
          type="button"
        >View</button>
      </td>
    </tr>
  `).join("");
}

function openAdminCustomerDetails(customerId) {
  const customer = adminCustomers.find(
    item => item.id === customerId
  );

  const panel = adminGet("#customer-details");
  const content = adminGet("#customer-profile-content");

  if (!customer || !panel || !content) return;

  content.innerHTML = `
    <div class="customer-details-card">
      <h3>${adminEscape(customer.name || "Customer")}</h3>
      <p><strong>Customer ID:</strong> ${adminEscape(customer.id)}</p>
      <p><strong>Email:</strong> ${adminEscape(customer.email || "—")}</p>
      <p><strong>Wallet:</strong> ${adminFormatPrice(customer.balance || 0)}</p>
      <p><strong>Status:</strong> ${adminEscape(customer.status || "active")}</p>

      <label for="customer-new-status">Account Status</label>
      <select id="customer-new-status">
        <option value="active" ${customer.status === "active" ? "selected" : ""}>Active</option>
        <option value="suspended" ${customer.status === "suspended" ? "selected" : ""}>Suspended</option>
      </select>

      <button
        class="primary-button"
        id="save-customer-status"
        type="button"
      >Save Status</button>
    </div>
  `;

  panel.hidden = false;

  adminGet("#save-customer-status")?.addEventListener(
    "click",
    () => {
      const newStatus = adminGet("#customer-new-status").value;
      customer.status = newStatus;

      adminSave(ADMIN_STORAGE.customers, adminCustomers);

      renderAdminCustomers();
      adminToast("Customer status updated.");
    }
  );
}

function initializeAdminCustomers() {
  adminGet("#customer-search")?.addEventListener(
    "input",
    renderAdminCustomers
  );

  adminGet("#customer-status-filter")?.addEventListener(
    "change",
    renderAdminCustomers
  );

  adminGet("#admin-customers-table")?.addEventListener(
    "click",
    event => {
      const button = event.target.closest("[data-view-customer]");
      if (!button) return;

      openAdminCustomerDetails(button.dataset.viewCustomer);
    }
  );

  adminGet("#close-customer-details")?.addEventListener(
    "click",
    () => {
      const panel = adminGet("#customer-details");
      if (panel) panel.hidden = true;
    }
  );
}

/* WALLET TOP-UPS */

function renderAdminWallet() {
  const tbody = adminGet("#admin-wallet-table");
  if (!tbody) return;

  const pending = adminWallet.filter(
    item => item.status === "pending"
  );

  if (!adminWallet.length) {
    tbody.innerHTML = `
      <tr><td colspan="6" class="empty-message">No wallet requests yet.</td></tr>
    `;
    return;
  }

  tbody.innerHTML = adminWallet.map(item => `
    <tr>
      <td>${adminEscape(item.id)}</td>
      <td>${adminEscape(item.customer || "Customer")}</td>
      <td>${adminFormatPrice(item.amount)}</td>
      <td>${adminEscape(item.sender || "—")}</td>
      <td>
        <span class="status-badge ${adminEscape(item.status)}">
          ${adminEscape(item.status)}
        </span>
      </td>
      <td>
        ${item.status === "pending" ? `
          <button
            class="table-action"
            data-wallet-approve="${adminEscape(item.id)}"
            type="button"
          >Approve</button>
          <button
            class="table-action danger"
            data-wallet-reject="${adminEscape(item.id)}"
            type="button"
          >Reject</button>
        ` : "—"}
      </td>
    </tr>
  `).join("");
}

function updateAdminWalletRequest(requestId, decision) {
  const request = adminWallet.find(item => item.id === requestId);

  if (!request || request.status !== "pending") return;

  if (decision === "approve") {
    const customer = adminCustomers.find(
      item => item.id === request.customerId
    );

    if (!customer) {
      adminToast(
        "Customer record not found. Request not approved.",
        "error"
      );
      return;
    }

    customer.balance =
      Number(customer.balance || 0) + Number(request.amount || 0);

    request.status = "approved";

    adminTransactions.push({
      id: adminId("TXN"),
      customerId: customer.id,
      customer: customer.name,
      type: "wallet_topup",
      amount: Number(request.amount || 0),
      date: new Date().toISOString(),
      status: "completed"
    });

    adminSave(ADMIN_STORAGE.customers, adminCustomers);
    adminSave(ADMIN_STORAGE.transactions, adminTransactions);

    adminToast("Demo top-up approved.");
  } else {
    request.status = "rejected";
    adminToast("Demo top-up rejected.", "warning");
  }

  adminSave(ADMIN_STORAGE.wallet, adminWallet);

  renderAdminWallet();
  renderAdminCustomers();
  renderAdminTransactions();
}

/* TRANSACTIONS */

function renderAdminTransactions() {
  const tbody = adminGet("#admin-transactions-table");
  if (!tbody) return;

  const keyword = (
    adminGet("#transaction-search")?.value || ""
  ).toLowerCase();

  const type = adminGet("#transaction-type-filter")?.value || "";

  const filtered = adminTransactions.filter(transaction => {
    const matchesSearch =
      String(transaction.id || "").toLowerCase().includes(keyword) ||
      String(transaction.customer || "").toLowerCase().includes(keyword);

    return matchesSearch &&
      (!type || transaction.type === type);
  });

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr><td colspan="5" class="empty-message">No transactions found.</td></tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(transaction => `
    <tr>
      <td>${adminEscape(transaction.id)}</td>
      <td>${adminEscape(transaction.customer || "Customer")}</td>
      <td>${adminEscape(transaction.type)}</td>
      <td>${adminFormatPrice(transaction.amount)}</td>
      <td>${adminEscape(transaction.status || "completed")}</td>
    </tr>
  `).join("");
}

function initializeAdminTransactions() {
  adminGet("#transaction-search")?.addEventListener(
    "input",
    renderAdminTransactions
  );

  adminGet("#transaction-type-filter")?.addEventListener(
    "change",
    renderAdminTransactions
  );

  adminGet("#admin-wallet-table")?.addEventListener(
    "click",
    event => {
      const approve = event.target.closest("[data-wallet-approve]");
      const reject = event.target.closest("[data-wallet-reject]");

      if (approve) {
        updateAdminWalletRequest(
          approve.dataset.walletApprove,
          "approve"
        );
      }

      if (reject) {
        updateAdminWalletRequest(
          reject.dataset.walletReject,
          "reject"
        );
      }
    }
  );
}

/* REPORTS & PROFIT */

function renderAdminReports() {
  const completedOrders = adminOrders.filter(
    order => order.status === "completed"
  );

  const revenue = completedOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const expenses = completedOrders.reduce(
    (sum, order) => sum + Number(order.cost || 0),
    0
  );

  const profit = completedOrders.reduce(
    (sum, order) => sum +
      Number(
        order.profit ??
        (Number(order.total || 0) - Number(order.cost || 0))
      ),
    0
  );

  const reportValues = {
    "#report-revenue": adminFormatPrice(revenue),
    "#report-expenses": adminFormatPrice(expenses),
    "#report-profit": adminFormatPrice(profit)
  };

  Object.entries(reportValues).forEach(([selector, value]) => {
    const element = adminGet(selector);
    if (element) element.textContent = value;
  });

  const details = adminGet("#profit-report-details");

  if (details) {
    details.innerHTML = `
      <p>Completed orders: ${completedOrders.length}</p>
      <p>Total revenue: ${adminFormatPrice(revenue)}</p>
      <p>Total expenses: ${adminFormatPrice(expenses)}</p>
      <p><strong>Net profit: ${adminFormatPrice(profit)}</strong></p>
      <small class="form-note">
        Demo calculation based on recorded completed orders.
      </small>
    `;
  }
}

/* CATEGORY MANAGEMENT */

function initializeAdminCategories() {
  adminGet("#add-category-button")?.addEventListener(
    "click",
    () => {
      const name = prompt("Enter new category name:");

      if (!name || !name.trim()) return;

      const cleanName = name.trim();

      if (adminCategories.some(
        category => category.toLowerCase() === cleanName.toLowerCase()
      )) {
        adminToast("Category already exists.", "warning");
        return;
      }

      adminCategories.push(cleanName);

      adminSave(ADMIN_STORAGE.categories, adminCategories);

      renderAdminCategories();
      adminToast("Category added.");
    }
  );

  adminGet("#admin-category-list")?.addEventListener(
    "click",
    event => {
      const button = event.target.closest("[data-delete-category]");
      if (!button) return;

      const category = button.dataset.deleteCategory;

      const hasProducts = adminProducts.some(
        product => product.category === category
      );

      if (hasProducts) {
        adminToast(
          "Move or delete its products before deleting this category.",
          "warning"
        );
        return;
      }

      if (!confirm(`Delete category "${category}"?`)) return;

      adminCategories = adminCategories.filter(
        item => item !== category
      );

      adminSave(ADMIN_STORAGE.categories, adminCategories);

      renderAdminCategories();
      adminToast("Category deleted.");
    }
  );
}

/* END OF PART 2 */

/* =========================================
   PINOY LM SHOP
   ADMIN JAVASCRIPT - PART 3 OF 3
   INVENTORY, SUBSCRIPTIONS, SUPPLIERS,
   SETTINGS, MODALS AND STARTUP
   ========================================= */

/* RSS INVENTORY */

function renderAdminInventory() {
  const tbody = adminGet("#admin-rss-table");
  if (!tbody) return;

  const keyword = (
    adminGet("#rss-search")?.value || ""
  ).toLowerCase();

  const category = adminGet("#rss-category-filter")?.value || "";

  const filtered = adminInventory.filter(item => {
    const matchesSearch =
      String(item.code || "").toLowerCase().includes(keyword) ||
      String(item.kingdom || "").toLowerCase().includes(keyword);

    return matchesSearch &&
      (!category || item.category === category);
  });

  const total = adminInventory.length;
  const available = adminInventory.filter(
    item => item.status === "available"
  ).length;
  const sold = adminInventory.filter(
    item => item.status === "sold"
  ).length;

  if (adminGet("#rss-total")) {
    adminGet("#rss-total").textContent = total;
  }

  if (adminGet("#rss-available")) {
    adminGet("#rss-available").textContent = available;
  }

  if (adminGet("#rss-sold")) {
    adminGet("#rss-sold").textContent = sold;
  }

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr><td colspan="5" class="empty-message">No RSS inventory found.</td></tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => `
    <tr>
      <td>${adminEscape(item.code)}</td>
      <td>${adminEscape(item.kingdom || "—")}</td>
      <td>${adminEscape(item.category || "—")}</td>
      <td>
        <span class="status-badge ${item.status === "available" ? "active" : "pending"}">
          ${adminEscape(item.status)}
        </span>
      </td>
      <td>
        <button
          class="table-action"
          data-rss-status="${adminEscape(item.id)}"
          type="button"
        >Change Status</button>
      </td>
    </tr>
  `).join("");
}

function importAdminRSS(event) {
  event.preventDefault();

  const category = adminGet("#rss-import-category")?.value;
  const fileInput = adminGet("#rss-import-file");
  const file = fileInput?.files?.[0];

  if (!file) {
    adminToast("Please select a CSV or TXT file.", "error");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const lines = String(reader.result || "")
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    let imported = 0;

    lines.forEach((line, index) => {
      if (index === 0 && /code|kingdom/i.test(line)) return;

      const columns = line.split(",");
      const code = (columns[0] || "").trim();

      if (!code) return;

      const exists = adminInventory.some(
        item => item.code === code
      );

      if (exists) return;

      adminInventory.push({
        id: adminId("RSS"),
        code,
        kingdom: (columns[1] || "").trim(),
        category,
        status: "available"
      });

      imported++;
    });

    adminSave(ADMIN_STORAGE.inventory, adminInventory);

    renderAdminInventory();
    fileInput.value = "";

    adminToast(`${imported} RSS records imported.`);
  };

  reader.onerror = () => {
    adminToast("Unable to read the selected file.", "error");
  };

  reader.readAsText(file);
}

function initializeAdminInventory() {
  adminGet("#import-rss-button")?.addEventListener(
    "click",
    () => adminGet("#rss-modal")?.classList.add("active")
  );

  adminGet("#rss-import-form")?.addEventListener(
    "submit",
    importAdminRSS
  );

  adminGet("#rss-search")?.addEventListener(
    "input",
    renderAdminInventory
  );

  adminGet("#rss-category-filter")?.addEventListener(
    "change",
    renderAdminInventory
  );

  adminGet("#admin-rss-table")?.addEventListener(
    "click",
    event => {
      const button = event.target.closest("[data-rss-status]");
      if (!button) return;

      const item = adminInventory.find(
        record => record.id === button.dataset.rssStatus
      );

      if (!item) return;

      item.status = item.status === "available"
        ? "sold"
        : "available";

      adminSave(ADMIN_STORAGE.inventory, adminInventory);

      renderAdminInventory();
      adminToast("RSS status updated.");
    }
  );
}

/* SUBSCRIPTIONS */

function renderAdminSubscriptions() {
  const tbody = adminGet("#admin-subscriptions-table");
  if (!tbody) return;

  const keyword = (
    adminGet("#subscription-search")?.value || ""
  ).toLowerCase();

  const status = (
    adminGet("#subscription-status-filter")?.value || ""
  );

  const filtered = adminSubscriptions.filter(subscription => {
    const matchesSearch =
      String(subscription.id || "").toLowerCase().includes(keyword) ||
      String(subscription.customer || "").toLowerCase().includes(keyword) ||
      String(subscription.product || "").toLowerCase().includes(keyword);

    return matchesSearch &&
      (!status || subscription.status === status);
  });

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr><td colspan="5" class="empty-message">No subscriptions found.</td></tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(subscription => `
    <tr>
      <td>${adminEscape(subscription.id)}</td>
      <td>${adminEscape(subscription.customer || "Customer")}</td>
      <td>${adminEscape(subscription.product || "Bot")}</td>
      <td>${adminEscape(subscription.expiry || "—")}</td>
      <td>
        <span class="status-badge ${adminEscape(subscription.status)}">
          ${adminEscape(subscription.status)}
        </span>
      </td>
    </tr>
  `).join("");
}

function initializeAdminSubscriptions() {
  adminGet("#subscription-search")?.addEventListener(
    "input",
    renderAdminSubscriptions
  );

  adminGet("#subscription-status-filter")?.addEventListener(
    "change",
    renderAdminSubscriptions
  );
}

/* SUPPLIERS */

function renderAdminSuppliers() {
  const tbody = adminGet("#admin-suppliers-table");
  if (!tbody) return;

  const supplierCount = adminGet("#supplier-count");
  const supplierBalance = adminGet("#supplier-balance");

  if (supplierCount) {
    supplierCount.textContent = adminSuppliers.length;
  }

  const totalBalance = adminSuppliers.reduce(
    (sum, supplier) => sum + Number(supplier.balance || 0),
    0
  );

  if (supplierBalance) {
    supplierBalance.textContent = adminFormatPrice(totalBalance);
  }

  if (!adminSuppliers.length) {
    tbody.innerHTML = `
      <tr><td colspan="5" class="empty-message">No suppliers added.</td></tr>
    `;
    return;
  }

  tbody.innerHTML = adminSuppliers.map(supplier => `
    <tr>
      <td>${adminEscape(supplier.name)}</td>
      <td>${adminEscape(supplier.type || "General")}</td>
      <td>${adminEscape(supplier.currency || "USD")}</td>
      <td>${Number(supplier.balance || 0).toFixed(2)}</td>
      <td>
        <button
          class="table-action danger"
          data-delete-supplier="${adminEscape(supplier.id)}"
          type="button"
        >Delete</button>
      </td>
    </tr>
  `).join("");
}

function initializeAdminSuppliers() {
  adminGet("#add-supplier-button")?.addEventListener(
    "click",
    () => {
      const name = prompt("Enter supplier name:");
      if (!name || !name.trim()) return;

      const type = prompt("Enter supplier type:", "API") || "API";

      adminSuppliers.push({
        id: adminId("SUP"),
        name: name.trim(),
        type: type.trim(),
        currency: "USD",
        balance: 0
      });

      adminSave(ADMIN_STORAGE.suppliers, adminSuppliers);

      renderAdminSuppliers();
      adminToast("Supplier added.");
    }
  );

  adminGet("#admin-suppliers-table")?.addEventListener(
    "click",
    event => {
      const button = event.target.closest("[data-delete-supplier]");
      if (!button) return;

      if (!confirm("Delete this supplier?")) return;

      adminSuppliers = adminSuppliers.filter(
        item => item.id !== button.dataset.deleteSupplier
      );

      adminSave(ADMIN_STORAGE.suppliers, adminSuppliers);

      renderAdminSuppliers();
      adminToast("Supplier deleted.");
    }
  );

  adminGet("#exchange-rate-form")?.addEventListener(
    "submit",
    event => {
      event.preventDefault();

      const rate = Number(adminGet("#usd-rate")?.value);

      if (!Number.isFinite(rate) || rate <= 0) {
        adminToast("Enter a valid exchange rate.", "error");
        return;
      }

      const settings = adminLoad(ADMIN_STORAGE.settings, {});
      settings.usdRate = rate;

      adminSave(ADMIN_STORAGE.settings, settings);

      adminToast("Exchange rate saved.");
    }
  );

  const settings = adminLoad(ADMIN_STORAGE.settings, {});

  if (settings.usdRate && adminGet("#usd-rate")) {
    adminGet("#usd-rate").value = settings.usdRate;
  }
}

/* SHOP SETTINGS */

function initializeAdminSettings() {
  const settings = adminLoad(ADMIN_STORAGE.settings, {});

  if (adminGet("#shop-name")) {
    adminGet("#shop-name").value = settings.shopName || "PINOY LM SHOP";
  }

  if (adminGet("#shop-description")) {
    adminGet("#shop-description").value = settings.description || "";
  }

  if (adminGet("#shop-whatsapp")) {
    adminGet("#shop-whatsapp").value = settings.whatsapp || "";
  }

  if (adminGet("#shop-telegram")) {
    adminGet("#shop-telegram").value = settings.telegram || "";
  }

  adminGet("#shop-settings-form")?.addEventListener(
    "submit",
    event => {
      event.preventDefault();

      const updated = adminLoad(ADMIN_STORAGE.settings, {});

      updated.shopName = adminGet("#shop-name").value.trim();
      updated.description = adminGet("#shop-description").value.trim();
      updated.whatsapp = adminGet("#shop-whatsapp").value.trim();
      updated.telegram = adminGet("#shop-telegram").value.trim();

      adminSave(ADMIN_STORAGE.settings, updated);

      adminToast("Shop settings saved.");
    }
  );

  adminGet("#announcement-form")?.addEventListener(
    "submit",
    event => {
      event.preventDefault();

      const updated = adminLoad(ADMIN_STORAGE.settings, {});

      updated.announcement = {
        title: adminGet("#announcement-title").value.trim(),
        message: adminGet("#announcement-message").value.trim(),
        active: adminGet("#announcement-active").checked
      };

      adminSave(ADMIN_STORAGE.settings, updated);

      adminToast("Announcement saved.");
    }
  );
}

/* MODALS */

function initializeAdminModals() {
  adminGetAll("[data-close-admin]").forEach(button => {
    button.addEventListener("click", () => {
      const modalId = button.dataset.closeAdmin;
      adminGet("#" + modalId)?.classList.remove("active");
    });
  });

  adminGetAll(".admin-modal").forEach(modal => {
    modal.addEventListener("click", event => {
      if (event.target === modal) {
        modal.classList.remove("active");
      }
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      adminGetAll(".admin-modal").forEach(modal => {
        modal.classList.remove("active");
      });

      adminGet("#admin-sidebar")?.classList.remove("open");
    }
  });
}

/* LOGOUT PLACEHOLDER */

function initializeAdminLogout() {
  adminGet("#admin-logout")?.addEventListener(
    "click",
    () => {
      alert(
        "This is currently a frontend demo. Real admin authentication and logout will be connected through Supabase."
      );
    }
  );
}

/* REFRESH ALL ADMIN DATA */

function renderAllAdminPages() {
  renderAdminDashboard();
  renderAdminProducts();
  renderAdminCategories();
  renderAdminOrders();
  renderAdminCustomers();
  renderAdminWallet();
  renderAdminTransactions();
  renderAdminReports();
  renderAdminInventory();
  renderAdminSubscriptions();
  renderAdminSuppliers();
}

/* STARTUP */

function initializeAdmin() {
  initializeAdminNavigation();
  initializeProductSearch();
  initializeProductManagement();
  initializeAdminOrders();
  initializeAdminCustomers();
  initializeAdminTransactions();
  initializeAdminCategories();
  initializeAdminInventory();
  initializeAdminSubscriptions();
  initializeAdminSuppliers();
  initializeAdminSettings();
  initializeAdminModals();
  initializeAdminLogout();

  renderAllAdminPages();

  adminOpenPage("dashboard");

  console.log("PINOY LM SHOP ADMIN DEMO INITIALIZED");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAdmin);
} else {
  initializeAdmin();
}

/* END OF ADMIN.JS */
