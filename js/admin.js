// admin-panel-with-pos.js
// Original admin JS with integrated Price Management fixes and POS (ý tưởng A) additions

// ==============================
// 🔹 1. Dữ liệu mẫu & biến toàn cục
// ==============================
let users = JSON.parse(localStorage.getItem("users")) || [
  { id: 1, name: "Nguyen Van A", email: "a@example.com", status: "active" },
  { id: 2, name: "Tran Thi B", email: "b@example.com", status: "inactive" },
];

let products = JSON.parse(localStorage.getItem("products")) || [
  {
    id: 1,
    ma: "SP001",
    name: "Giày thể thao",
    category: "Giày",
    price: 500000,
    stock: 10,
    images: ["https://via.placeholder.com/60"],
    size: "38,39,40",
    brand: "Nike",
    hidden: false,
  },
  {
    id: 2,
    ma: "SP002",
    name: "Áo thun",
    category: "Áo",
    price: 200000,
    stock: 20,
    images: ["https://via.placeholder.com/60"],
    size: "M,L,XL",
    brand: "Adidas",
    hidden: false,
  },
];

let categories = JSON.parse(localStorage.getItem("categories")) || [
  "Giày",
  "Áo",
  "Phụ kiện",
];
let imports = JSON.parse(localStorage.getItem("imports")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];

// ==============================
// 🔹 2. Login Admin
// ==============================
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const username = document.getElementById("admin-user").value.trim();
    const password = document.getElementById("admin-pass").value.trim();
    const msg = document.getElementById("login-msg");

    if (username === "admin" && password === "123") {
      document.getElementById("login-screen").style.display = "none";
      document.getElementById("admin-app").style.display = "flex";
      document.getElementById("admin-name").textContent = "Admin";
      renderDashboard();
      renderUsers();
      renderProducts();
      renderCategories();
      renderOrders();
      populateCategoryFilters();
      populatePricingProducts();
    } else {
      if (msg) msg.textContent = "Sai tên đăng nhập hoặc mật khẩu";
    }
  });
}

const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    document.getElementById("admin-app").style.display = "none";
    document.getElementById("login-screen").style.display = "flex";
  });
}
// Khi nhấn Enter trong ô tên đăng nhập → chuyển sang ô mật khẩu
const userInput = document.getElementById("admin-user");
const passInput = document.getElementById("admin-pass");
if (userInput) {
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (passInput) passInput.focus(); // Chuyển con trỏ sang ô mật khẩu
    }
  });
}

// Khi nhấn Enter trong ô mật khẩu → thực hiện đăng nhập
if (passInput) {
  passInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (loginBtn) loginBtn.click(); // Gọi sự kiện click để đăng nhập
    }
  });
}

// ==============================
// 🔹 3. Sidebar: chuyển section
// ==============================
const navButtons = document.querySelectorAll(".nav-admin button") || [];
navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const sectionId = btn.getAttribute("data-section");
    document
      .querySelectorAll(".section")
      .forEach((s) => s.classList.add("hidden"));
    const sec = document.getElementById(sectionId);
    if (sec) sec.classList.remove("hidden");
    document
      .querySelectorAll(".nav-admin button")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const title = document.getElementById("section-title");
    if (title) title.textContent = btn.textContent;

    if (sectionId === "imports") renderImport && renderImport();
    if (sectionId === "create-order") renderPOS && renderPOS();
  });
});

// ==============================
// 🔹 4. Dashboard
// ==============================
function renderDashboard() {
  document.getElementById("stat-users").textContent = (
    JSON.parse(localStorage.getItem("users")) || users
  ).length;
  document.getElementById("stat-products").textContent = (
    JSON.parse(localStorage.getItem("products")) || products
  ).length;
  document.getElementById("stat-orders").textContent = (
    JSON.parse(localStorage.getItem("orders")) || orders
  ).length;
}

// ==============================
// 🔹 5. Users
// ==============================
function renderUsers() {
  const usersLocal = JSON.parse(localStorage.getItem("users")) || users || [];
  const table = document.getElementById("users-table");
  if (!table) return;

  table.innerHTML = usersLocal
    .map(
      (u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${u.username || u.name || "—"}</td>
      <td>${u.email || "—"}</td>
      <td>${u.password || "—"}</td>
      <td>${u.locked ? "Khóa" : u.status || "Hoạt động"}</td>
      <td>
        <button class="btn small toggle-status" data-id="${u.id}">
          ${u.locked ? "Mở khóa" : "Khóa"}
        </button>
        <button class="btn small danger delete-user" data-id="${
          u.id
        }">Xóa</button>
      </td>
    </tr>
  `
    )
    .join("");

  // Sự kiện (delegate)
  table.removeEventListener("click", table.__handler);
  table.__handler = function (e) {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains("delete-user")) {
      if (confirm("Xóa người dùng này?")) {
        let us = JSON.parse(localStorage.getItem("users")) || users;
        us = us.filter((u) => u.id != id);
        localStorage.setItem("users", JSON.stringify(us));
        renderUsers();
      }
    } else if (btn.classList.contains("toggle-status")) {
      let us = JSON.parse(localStorage.getItem("users")) || users;
      const idx = us.findIndex((u) => String(u.id) == String(id));
      if (idx !== -1) {
        us[idx].locked = !!us[idx].locked ? false : true;
        us[idx].status = us[idx].locked ? "Khóa" : "Hoạt động";
        localStorage.setItem("users", JSON.stringify(us));
        renderUsers();
      }
    }
  };
  table.addEventListener("click", table.__handler);
}

function toggleUserStatus(id) {
  let us = JSON.parse(localStorage.getItem("users")) || users;
  const idx = us.findIndex((u) => String(u.id) === String(id));
  if (idx !== -1) {
    us[idx].locked = !!us[idx].locked ? false : true;
    us[idx].status = us[idx].locked ? "Khóa" : "Hoạt động";
    localStorage.setItem("users", JSON.stringify(us));
    renderUsers();
  }
}

function deleteUser(id) {
  if (confirm("Xác nhận xóa người dùng?")) {
    let us = JSON.parse(localStorage.getItem("users")) || users;
    us = us.filter((u) => String(u.id) !== String(id));
    localStorage.setItem("users", JSON.stringify(us));
    renderUsers();
  }
}

const addUserBtn = document.getElementById("add-user");
if (addUserBtn) {
  addUserBtn.addEventListener("click", () => {
    const name = prompt("Tên người dùng mới:");
    const email = prompt("Email:");
    if (!name || !email) {
      alert("Hủy hoặc thiếu tên/email. Vui lòng thử lại.");
      return;
    }

    // basic email validation
    const emailTrim = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      alert("Email không hợp lệ. Vui lòng nhập email đúng định dạng.");
      return;
    }

    const us = JSON.parse(localStorage.getItem("users")) || users;
    // prevent duplicate email
    if (
      us.some((u) => (u.email || "").toLowerCase() === emailTrim.toLowerCase())
    ) {
      alert("Email này đã tồn tại trong hệ thống.");
      return;
    }

    // derive a username (local-part) if not provided explicitly
    const username =
      emailTrim.split("@")[0] || name.replace(/\s+/g, "").toLowerCase();

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      username: username,
      email: emailTrim,
      password: "user123", // default password as requested
      status: "Hoạt động",
      locked: false,
    };

    us.push(newUser);
    localStorage.setItem("users", JSON.stringify(us));
    renderUsers();
    alert(`Đã tạo người dùng. Mật khẩu mặc định: user123`);
  });
}

// Sync admin user list when `localStorage.users` changes from other tabs
window.addEventListener("storage", (e) => {
  if (e.key === "users") {
    renderUsers();
  }
});

// Also listen for a custom event dispatched from the same tab (profile edits)
window.addEventListener("usersUpdated", () => {
  renderUsers();
});

// ==============================
// 🔹 6. Categories & sản phẩm theo danh mục
// ==============================
function renderCategories() {
  const ul = document.getElementById("category-list");
  const catSelect = document.getElementById("product-category");
  if (!ul || !catSelect) return; // tránh lỗi
  ul.innerHTML = "";
  catSelect.innerHTML = `<option value="">-- Chọn danh mục --</option>`;

  categories.forEach((c, idx) => {
    const li = document.createElement("li");
    li.textContent = `${idx + 1}. ${c} `;
    const btn = document.createElement("button");
    btn.textContent = "Xóa";
    btn.addEventListener("click", () => deleteCategory(c));
    li.appendChild(btn);
    ul.appendChild(li);

    const option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    catSelect.appendChild(option);
  });

  localStorage.setItem("categories", JSON.stringify(categories));
}

const addCatBtn = document.getElementById("add-category");
if (addCatBtn) {
  addCatBtn.addEventListener("click", () => {
    const name = document.getElementById("category-name").value.trim();
    if (!name) {
      alert("Nhập tên danh mục");
      return;
    }
    if (categories.includes(name)) {
      alert("Danh mục đã tồn tại");
      return;
    }
    categories.push(name);
    document.getElementById("category-name").value = "";
    renderCategories();
  });
}

function deleteCategory(name) {
  if (confirm("Xác nhận xóa danh mục?")) {
    categories = categories.filter((c) => c !== name);
    localStorage.setItem("categories", JSON.stringify(categories));
    renderCategories();
  }
}

// ==============================
// 🔹 6.1. Thêm sản phẩm vào danh mục
// ==============================
const addProductForm = document.getElementById("add-product-form");
const previewImage = document.getElementById("preview-product-image");
const productImageInput = document.getElementById("product-image");

if (productImageInput) {
  productImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (previewImage) {
          previewImage.src = ev.target.result;
          previewImage.style.display = "block";
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

if (addProductForm) {
  addProductForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cat = document.getElementById("product-category").value;
    const ma = document.getElementById("product-code").value.trim();
    const name = document.getElementById("product-name").value.trim();
    const desc = document.getElementById("product-desc").value.trim();
    const price = parseFloat(document.getElementById("product-price").value);
    const img =
      (previewImage && previewImage.src) || "https://via.placeholder.com/60";

    if (!cat || !ma || !name || isNaN(price) || price < 0) {
      alert("Vui lòng nhập đủ thông tin và giá >= 0!");
      return;
    }
    let productsLocal =
      JSON.parse(localStorage.getItem("products")) || products;
    const exists = productsLocal.some(
      (p) => p.ma.toLowerCase() === ma.toLowerCase()
    );
    if (exists) {
      alert("Mã sản phẩm đã tồn tại! Vui lòng nhập mã khác.");
      return;
    }

    const newP = {
      id: Date.now(),
      ma,
      name,
      category: cat,
      price,
      description: desc,
      images: [img],
      stock: 0,
      hidden: false,
    };

    productsLocal.push(newP);
    localStorage.setItem("products", JSON.stringify(productsLocal));
    products = productsLocal;
    renderProducts();
    populatePricingProducts();
    addProductForm.reset();
    if (previewImage) previewImage.style.display = "none";
    renderCategoryProducts();
    alert("Đã thêm sản phẩm vào danh mục " + cat);
  });
}

// ==============================
// 🔹 6.2. Hiển thị & chỉnh sửa sản phẩm theo danh mục
// ==============================
function renderCategoryProducts() {
  const tbody = document.getElementById("category-products-table");
  if (!tbody) return;
  const productsLocal =
    JSON.parse(localStorage.getItem("products")) || products;
  tbody.innerHTML = "";

  productsLocal.forEach((p, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
          <td>${idx + 1}</td>
          <td><img src="${
            p.images[0]
          }" width="60" style="border-radius:6px;"></td>
          <td><input value="${p.name}" id="edit-name-${
      p.id
    }" style="width:100px"></td>
          <td>${p.ma}</td>
          <td>${p.category}</td>
          <td><input value="${p.price}" id="edit-price-${
      p.id
    }" type="number" style="width:80px"></td>
          <td><input value="${p.description || ""}" id="edit-desc-${
      p.id
    }" style="width:120px"></td>
          <td>
            <button onclick="saveProduct(${p.id})">Lưu</button>
            <button onclick="deleteProduct(${p.id})">Xóa</button>
          </td>
        `;
    tbody.appendChild(tr);
  });
}

function saveProduct(id) {
  let productsLocal = JSON.parse(localStorage.getItem("products")) || products;
  const p = productsLocal.find((x) => x.id === id);
  if (!p) return;
  const newPrice = parseFloat(
    document.getElementById(`edit-price-${id}`).value
  );
  if (isNaN(newPrice) || newPrice < 0) return alert("Giá phải >= 0");
  p.name = document.getElementById(`edit-name-${id}`).value.trim();
  p.price = newPrice;
  p.description = document.getElementById(`edit-desc-${id}`).value.trim();
  localStorage.setItem("products", JSON.stringify(productsLocal));
  products = productsLocal;
  renderCategoryProducts();
  renderProducts();
  alert("Đã lưu thay đổi sản phẩm");
}

function deleteProduct(id) {
  if (confirm("Bạn có chắc muốn xóa sản phẩm này không?")) {
    let productsLocal =
      JSON.parse(localStorage.getItem("products")) || products;
    productsLocal = productsLocal.filter((p) => p.id !== id);
    localStorage.setItem("products", JSON.stringify(productsLocal));
    products = productsLocal;
    renderCategoryProducts();
    renderProducts();
    alert("Đã xóa sản phẩm thành công!");
  }
}

// ==============================
// 🔹 7. Quản lý sản phẩm (hiển thị, tìm kiếm, ẩn/hiện, sửa, xóa)
// ==============================
function renderProducts(filterText = "") {
  const tbody = document.getElementById("products-table");
  if (!tbody) return;
  const productsLocal =
    JSON.parse(localStorage.getItem("products")) || products;
  tbody.innerHTML = "";

  const filtered = productsLocal.filter(
    (p) =>
      p.name.toLowerCase().includes(filterText.toLowerCase()) ||
      p.ma.toLowerCase().includes(filterText.toLowerCase())
  );

  filtered.forEach((p, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><img src="${
              p.images && p.images[0]
                ? p.images[0]
                : "https://via.placeholder.com/60"
            }" width="60"></td>
            <td>${p.name}</td>
            <td>${p.ma}</td>
            <td>${p.category}</td>
            <td>${p.price.toLocaleString()} VND</td>
            <td>${p.stock}</td>
            <td>${p.hidden ? "Ẩn" : "Hiện"}</td>
            <td>
                <button onclick="toggleProductVisibility(${p.id})">${
      p.hidden ? "Hiện" : "Ẩn"
    }</button>
                <button onclick="editProduct(${p.id})">Sửa</button>
                <button onclick="deleteProduct(${p.id})">Xóa</button>
            </td>
        `;
    tbody.appendChild(tr);
  });

  localStorage.setItem("products", JSON.stringify(productsLocal));
  products = productsLocal;
}

// Ẩn/Hiện sản phẩm
function toggleProductVisibility(id) {
  let productsLocal = JSON.parse(localStorage.getItem("products")) || products;
  const p = productsLocal.find((x) => x.id === id);
  if (!p) return;
  p.hidden = !p.hidden;
  localStorage.setItem("products", JSON.stringify(productsLocal));
  renderProducts();
}

// Sửa sản phẩm qua prompt
function editProduct(id) {
  let productsLocal = JSON.parse(localStorage.getItem("products")) || products;
  const p = productsLocal.find((x) => x.id === id);
  if (!p) return;

  const name = prompt("Tên sản phẩm:", p.name);
  const price = parseFloat(prompt("Giá sản phẩm:", p.price));
  const stock = parseInt(prompt("Tồn kho:", p.stock));

  if (!name || isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
    alert("Thông tin không hợp lệ!");
    return;
  }

  p.name = name;
  p.price = price;
  p.stock = stock;
  localStorage.setItem("products", JSON.stringify(productsLocal));
  renderProducts();
}

// Tìm kiếm sản phẩm
const searchInput = document.getElementById("product-search");
const searchBtn = document.getElementById("search-product-btn");
if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", () => {
    renderProducts(searchInput.value);
  });
  searchInput.addEventListener("input", () => {
    renderProducts(searchInput.value);
  });
}

// ==============================
// 🔹 8. Pricing / Profit (REPLACED & FIXED)
// ==============================
function populateCategoryFilters() {
  const filter = document.getElementById("filter-category");
  const profitCat = document.getElementById("profit-category");
  if (!filter || !profitCat) return;
  filter.innerHTML = `<option value="">Tất cả danh mục</option>`;
  profitCat.innerHTML = `<option value="">Chọn danh mục</option>`;
  categories.forEach((c) => {
    filter.innerHTML += `<option value="${c}">${c}</option>`;
    profitCat.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

const applyProfitBtn = document.getElementById("apply-profit");

if (applyProfitBtn) {
  applyProfitBtn.addEventListener("click", () => {
    const cat = document.getElementById("profit-category").value;
    const percent = parseFloat(document.getElementById("profit-percent").value);

    if (!cat || isNaN(percent))
      return alert("Chọn danh mục và nhập % lợi nhuận hợp lệ");

    let productsLocal =
      JSON.parse(localStorage.getItem("products")) || products;

    productsLocal.forEach((p) => {
      // Gán basePrice đúng tên
      if (p.basePrice === undefined) p.basePrice = p.price;

      // Nếu đúng danh mục thì áp dụng lợi nhuận
      if (p.category === cat) {
        p.price = Math.round(p.basePrice * (1 + percent / 100));
      }
    });

    // Lưu lại sau khi xử lý
    localStorage.setItem("products", JSON.stringify(productsLocal));

    // Render lại giao diện
    renderProducts();

    // LOAD LẠI DANH MỤC (rất quan trọng)
    populateCategoryFilters();

    alert("Đã áp dụng lợi nhuận cho danh mục " + cat);
  });
}

function populatePricingProducts() {
  const select = document.getElementById("product-price-select");
  if (!select) return;
  select.innerHTML = `<option value="">Chọn sản phẩm</option>`;
  let productsLocal = JSON.parse(localStorage.getItem("products")) || products;
  productsLocal.forEach(
    (p) => (select.innerHTML += `<option value="${p.id}">${p.name}</option>`)
  );
}

const saveProductPriceBtn = document.getElementById("save-product-price");
if (saveProductPriceBtn) {
  saveProductPriceBtn.addEventListener("click", () => {
    const id = parseInt(document.getElementById("product-price-select").value);
    const price = parseFloat(
      document.getElementById("product-price-input").value
    );
    if (!id || isNaN(price) || price < 0)
      return alert("Chọn sản phẩm và nhập giá hợp lệ");
    let productsLocal =
      JSON.parse(localStorage.getItem("products")) || products;
    const product = productsLocal.find((p) => p.id === id);
    if (product) {
      product.price = price;
      localStorage.setItem("products", JSON.stringify(productsLocal));
      renderProducts();
      populatePricingProducts();
      alert("Đã lưu giá sản phẩm");
    }
  });
}

// ==============================
// 🛍️ LOAD DANH SÁCH SẢN PHẨM (DATALIST) - REFRESH SAFE
// ==============================
(function refreshDatalistProducts() {
  const datalistProducts = document.getElementById("datalistProducts");
  if (!datalistProducts) return;
  datalistProducts.innerHTML = ""; // clear trước khi append
  const storedProducts =
    JSON.parse(localStorage.getItem("products")) || products || [];
  storedProducts.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = `${p.name} (${p.ma})`;
    datalistProducts.appendChild(opt);
  });
})();

// ==============================
// 🧮 HIỂN THỊ BẢNG GIÁ (REPLACED)
// ==============================
function renderPriceManagement() {
  const storedPrices = JSON.parse(localStorage.getItem("prices")) || [];
  const priceTableContainer = document.getElementById("priceTable");

  if (!priceTableContainer) return;

  if (storedPrices.length === 0) {
    priceTableContainer.innerHTML = "<p>Chưa có dữ liệu giá sản phẩm!</p>";
    return;
  }

  let html = `
    <table border="1" cellspacing="0" cellpadding="6" width="100%">
      <tr style="background:#2f3e46;color:white;">
        <th>Mã sản phẩm</th>
        <th>Tên sản phẩm</th>
        <th>Giá gốc (VNĐ)</th>
        <th>Giảm giá (%)</th>
        <th>Giá cuối (VNĐ)</th>
        <th>Hành động</th>
      </tr>
  `;

  storedPrices.forEach((p, i) => {
    html += `
      <tr>
        <td>${p.ma}</td>
        <td>${p.name}</td>
        <td>${Number(p.price).toLocaleString("vi-VN")}</td>
        <td>${p.saleOff}</td>
        <td>${Number(p.finalPrice).toLocaleString("vi-VN")}</td>
        <td>
          <button class="btnEditPrice" data-index="${i}">Sửa</button>
          <button class="btnDeletePrice" data-index="${i}">Xóa</button>
        </td>
      </tr>
    `;
  });

  html += `</table>`;
  priceTableContainer.innerHTML = html;

  // XÓA GIÁ (robust)
  priceTableContainer.querySelectorAll(".btnDeletePrice").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      if (!Number.isInteger(idx)) return;
      const prices = JSON.parse(localStorage.getItem("prices")) || [];
      if (idx < 0 || idx >= prices.length) return;
      const prodCode = prices[idx].ma;

      // update products: set display price to 0 when removing price entry
      let productsLocal = JSON.parse(localStorage.getItem("products")) || [];
      productsLocal = productsLocal.map((p) =>
        p.ma === prodCode ? { ...p, price: 0 } : p
      );
      localStorage.setItem("products", JSON.stringify(productsLocal));

      prices.splice(idx, 1);
      localStorage.setItem("prices", JSON.stringify(prices));
      renderPriceManagement();
      renderProducts();
      (function refreshDatalist() {
        const dl = document.getElementById("datalistProducts");
        if (dl) {
          dl.innerHTML = "";
          (JSON.parse(localStorage.getItem("products")) || []).forEach((p) => {
            const o = document.createElement("option");
            o.value = `${p.name} (${p.ma})`;
            dl.appendChild(o);
          });
        }
      })();
    });
  });

  // SỬA GIÁ (prompt but robust)
  priceTableContainer.querySelectorAll(".btnEditPrice").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      if (!Number.isInteger(idx)) return;
      const prices = JSON.parse(localStorage.getItem("prices")) || [];
      if (idx < 0 || idx >= prices.length) return;
      const item = prices[idx];

      const rawNewPrice = prompt("Nhập giá mới (VNĐ):", item.price);
      if (rawNewPrice === null) return; // cancel
      const newPrice = parseFloat(rawNewPrice.trim());

      const rawNewSale = prompt("Nhập % giảm giá (0 - 100):", item.saleOff);
      if (rawNewSale === null) return;
      const newSale = parseFloat(rawNewSale.trim());

      if (!Number.isFinite(newPrice) || newPrice <= 0) {
        alert("⚠️ Giá phải là số và lớn hơn 0!");
        return;
      }
      if (!Number.isFinite(newSale) || newSale < 0 || newSale > 100) {
        alert("⚠️ Giảm giá phải nằm trong khoảng 0 - 100%!");
        return;
      }

      const finalPrice = Math.round(newPrice * (1 - newSale / 100));
      item.price = newPrice;
      item.saleOff = newSale;
      item.finalPrice = finalPrice;

      prices[idx] = item;
      localStorage.setItem("prices", JSON.stringify(prices));

      let productsLocal = JSON.parse(localStorage.getItem("products")) || [];
      productsLocal = productsLocal.map((p) =>
        p.ma === item.ma ? { ...p, price: finalPrice } : p
      );
      localStorage.setItem("products", JSON.stringify(productsLocal));

      renderPriceManagement();
      renderProducts();
      (function refreshDatalist() {
        const dl = document.getElementById("datalistProducts");
        if (dl) {
          dl.innerHTML = "";
          (JSON.parse(localStorage.getItem("products")) || []).forEach((p) => {
            const o = document.createElement("option");
            o.value = `${p.name} (${p.ma})`;
            dl.appendChild(o);
          });
        }
      })();
    });
  });
}

// ➕ THÊM / CẬP NHẬT GIÁ (REPLACED)
(function attachAddPriceHandler() {
  const btn = document.getElementById("btnAddPrice");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const inputVal = (
      document.getElementById("inputPriceProduct")?.value || ""
    ).trim();
    const priceRaw = (
      document.getElementById("inputPriceValue")?.value || ""
    ).trim();
    const saleRaw = (
      document.getElementById("inputPriceSale")?.value || ""
    ).trim();

    const priceVal = priceRaw === "" ? NaN : parseFloat(priceRaw);
    const saleVal = saleRaw === "" ? 0 : parseFloat(saleRaw);

    const maMatch = inputVal.match(/\(([^)]+)\)\s*$/);
    const ma = maMatch ? maMatch[1] : null;
    if (!ma) return alert("⚠️ Chọn sản phẩm từ gợi ý!");
    if (!Number.isFinite(priceVal) || priceVal <= 0)
      return alert("⚠️ Giá phải > 0!");
    if (!Number.isFinite(saleVal) || saleVal < 0 || saleVal > 100)
      return alert("⚠️ Giảm giá 0-100%!");

    const finalPrice = Math.round(priceVal * (1 - saleVal / 100));
    let prices = JSON.parse(localStorage.getItem("prices")) || [];
    let productsLocal = JSON.parse(localStorage.getItem("products")) || [];

    const prod = productsLocal.find((p) => p.ma === ma);
    if (!prod) return alert("⚠️ Không tìm thấy sản phẩm!");

    const idx = prices.findIndex((p) => p.ma === ma);
    const priceObj = {
      ma,
      name: prod.name,
      price: priceVal,
      saleOff: saleVal,
      finalPrice,
    };
    if (idx >= 0) prices[idx] = priceObj;
    else prices.push(priceObj);

    localStorage.setItem("prices", JSON.stringify(prices));

    productsLocal = productsLocal.map((p) =>
      p.ma === ma ? { ...p, price: finalPrice } : p
    );
    localStorage.setItem("products", JSON.stringify(productsLocal));

    document.getElementById("inputPriceProduct").value = "";
    document.getElementById("inputPriceValue").value = "";
    document.getElementById("inputPriceSale").value = "";

    renderPriceManagement();
    renderProducts();
    (function refreshDatalist() {
      const dl = document.getElementById("datalistProducts");
      if (dl) {
        dl.innerHTML = "";
        (JSON.parse(localStorage.getItem("products")) || []).forEach((p) => {
          const o = document.createElement("option");
          o.value = `${p.name} (${p.ma})`;
          dl.appendChild(o);
        });
      }
    })();
  });
})();

// Khởi chạy bảng giá
renderPriceManagement();
// ==============================
// 🔹 MODULE TỒN KHO HOÀN CHỈNH (PASTE VÀO CUỐI FILE admin.js)
// ==============================
(function inventoryModule() {
  // safe references
  const ID_CHECK = "inv-check-stock";
  const ID_THRESHOLD = "inv-stock-threshold";
  const ID_RESULT = "inv-stock-result";
  const ID_CAT = "inv-stock-category";
  const ID_PROD = "inv-stock-product";
  const ID_SEARCH_BTN = "inv-btn-search-stock";
  const ID_SEARCH_RESULT = "inv-stock-search-result";
  const ID_FROM = "inv-date-from";
  const ID_TO = "inv-date-to";
  const ID_STATS_BTN = "inv-btn-stock-stats";
  const ID_STATS_RESULT = "inv-stock-stats";

  // helper: format iso date yyyy-mm-dd
  function formatISO(d) {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return "" + d;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // read localStorage safe
  function readLS(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  // populate filters (callable)
  function populateInventoryFilters() {
    const catSelect = document.getElementById(ID_CAT);
    const prodSelect = document.getElementById(ID_PROD);
    if (!catSelect || !prodSelect) return;

    const cats = readLS("categories", []);
    const prods = readLS("products", []);

    catSelect.innerHTML = `<option value="">-- Tất cả danh mục --</option>`;
    cats.forEach(
      (c) => (catSelect.innerHTML += `<option value="${c}">${c}</option>`)
    );

    prodSelect.innerHTML = `<option value="">-- Chọn sản phẩm --</option>`;
    prods.forEach((p) => {
      const id = p.id ?? p.ma ?? p.code ?? "";
      prodSelect.innerHTML += `<option value="${id}">${p.name || id} ${
        p.ma ? "(" + p.ma + ")" : ""
      }</option>`;
    });
  }

  // 1. cảnh báo theo ngưỡng
  function canhBaoTheoNguong() {
    const res = document.getElementById(ID_RESULT);
    if (!res) return;
    const prods = readLS("products", []);
    const raw = document.getElementById(ID_THRESHOLD)?.value;
    const threshold = isNaN(Number(raw)) ? 20 : Number(raw);

    if (prods.length === 0) {
      res.innerHTML = `<div>Chưa có sản phẩm nào!</div>`;
      return;
    }

    let html = `<h4>⚠️ Kiểm tra tồn kho (ngưỡng ${threshold})</h4><ul>`;
    prods.forEach((p) => {
      const stock = Number(p.stock ?? p.quantity ?? 0);
      let color = "green",
        msg = `✅ Hàng đủ (Tồn ${stock})`;
      if (stock < 5) {
        color = "red";
        msg = `🚨 Cần nhập gấp! (Tồn ${stock})`;
      } else if (stock < threshold) {
        color = "orange";
        msg = `⚠️ Nên nhập thêm (Tồn ${stock})`;
      }
      html += `<li style="color:${color}"><b>${p.name}</b> — ${msg}</li>`;
    });
    html += "</ul>";
    res.innerHTML = html;
  }

  // 2. tra cứu tồn kho theo sản phẩm / danh mục
  function traCuuTonKho() {
    const res = document.getElementById(ID_SEARCH_RESULT);
    if (!res) return;
    const prods = readLS("products", []);
    const prodId = document.getElementById(ID_PROD)?.value;
    const cat = document.getElementById(ID_CAT)?.value;

    let list = prods;
    if (prodId)
      list = list.filter(
        (p) =>
          String(p.id) === String(prodId) || String(p.ma) === String(prodId)
      );
    else if (cat) list = list.filter((p) => p.category === cat);

    if (!list || list.length === 0) {
      res.innerHTML = "<div>Không tìm thấy sản phẩm phù hợp</div>";
      return;
    }

    res.innerHTML = list
      .map((p) => {
        const stock = Number(p.stock ?? p.quantity ?? 0);
        return `<div><b>${p.name}</b> ${
          p.ma ? "(" + p.ma + ")" : ""
        } — <b>${stock}</b> tồn</div>`;
      })
      .join("");
  }

  // Helper: build date array inclusive
  function getDatesInRange(fromISO, toISO) {
    const a = new Date(fromISO);
    a.setHours(0, 0, 0, 0);
    const b = new Date(toISO);
    b.setHours(0, 0, 0, 0);
    const list = [];
    for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) {
      list.push(new Date(d));
    }
    return list;
  }

  // tinh ton dau ky: tổng (nhập trước from) - (xuất trước from)
  // expects phieuNhap items: { importDate or date or dateStr, items: [{productId, qty}] }
  // expects phieuXuat items: same structure (you may store exports in 'phieuXuat' or in 'orders')
  function tinhTonDauKy(products, phieuNhap, phieuXuat, fromDateISO) {
    const from = new Date(fromDateISO);
    from.setHours(0, 0, 0, 0);
    const map = {};
    (products || []).forEach(
      (p) => (map[p.id] = Number(p.stock ?? p.quantity ?? 0))
    ); // start with current product stock as base (safer)

    // subtract movements BEFORE fromDate to calculate stock at (from - 1)
    // We'll compute starting from zero to avoid double counting: better approach is compute cumulative from historical receipts/orders.
    // Reset to 0 then add historical movements before from:
    Object.keys(map).forEach((k) => (map[k] = 0));

    (phieuNhap || []).forEach((r) => {
      const d = new Date(
        r.importDate ?? r.date ?? r.dateStr ?? r.createdAt ?? ""
      );
      if (isNaN(d)) return;
      if (d < from) {
        (r.items || []).forEach((it) => {
          const id = it.productId ?? it.id ?? it.prodId ?? it.product;
          map[id] = (map[id] || 0) + Number(it.qty || it.quantity || 0);
        });
      }
    });

    (phieuXuat || []).forEach((r) => {
      const d = new Date(
        r.date ?? r.exportDate ?? r.createdAt ?? r.orderDate ?? ""
      );
      if (isNaN(d)) return;
      if (d < from) {
        (r.items || []).forEach((it) => {
          const id = it.productId ?? it.id ?? it.prodId ?? it.product;
          map[id] = (map[id] || 0) - Number(it.qty || it.quantity || 0);
        });
      }
    });

    return map; // may contain undefined keys for some ids -> treated as 0
  }

  function thongKeTheoNgay(
    products,
    phieuNhap,
    phieuXuat,
    stockPrevMap,
    fromISO,
    toISO
  ) {
    const dates = getDatesInRange(fromISO, toISO);
    let html = "";

    dates.forEach((d) => {
      const dayStr = formatISO(d);

      // ===== kiểm tra ngày có nhập thực sự (ít nhất 1 item qty>0) =====
      const hasImport = (phieuNhap || []).some((r) => {
        const d2 = formatISO(r.importDate ?? r.date ?? r.createdAt ?? "");
        if (d2 !== dayStr) return false;
        return (r.items || []).some(
          (it) => Number(it.qty || it.quantity || 0) > 0
        );
      });

      // ===== kiểm tra ngày có xuất thực sự (ít nhất 1 item qty>0) =====
      const hasExport = (phieuXuat || []).some((r) => {
        const d2 = formatISO(
          r.date ?? r.exportDate ?? r.createdAt ?? r.orderDate ?? ""
        );
        if (d2 !== dayStr) return false;
        return (r.items || []).some(
          (it) => Number(it.qty || it.quantity || 0) > 0
        );
      });

      // nếu không có nhập và không có xuất → bỏ qua ngày này
      if (!hasImport && !hasExport) return;

      // build danh sách sản phẩm thực sự có phát sinh trong ngày (loại bỏ sản phẩm có nhap=xuat=0)
      const rows = [];
      (products || []).forEach((p) => {
        const nhapQty = (phieuNhap || []).reduce((s, r) => {
          const d2 = formatISO(r.importDate ?? r.date ?? r.createdAt ?? "");
          if (d2 !== dayStr) return s;
          const it = (r.items || []).find(
            (it) => String(it.productId ?? it.id ?? "") === String(p.id)
          );
          return s + (it ? Number(it.qty || it.quantity || 0) : 0);
        }, 0);

        const xuatQty = (phieuXuat || []).reduce((s, r) => {
          const d2 = formatISO(r.date ?? r.exportDate ?? r.createdAt ?? "");
          if (d2 !== dayStr) return s;
          const it = (r.items || []).find(
            (it) => String(it.productId ?? it.id ?? "") === String(p.id)
          );
          return s + (it ? Number(it.qty || it.quantity || 0) : 0);
        }, 0);

        if (nhapQty > 0 || xuatQty > 0) {
          rows.push({ product: p, nhapQty, xuatQty });
        }
      });

      // nếu sau khi lọc không còn sản phẩm → bỏ ngày (phòng trường hợp phiếu rỗng)
      if (rows.length === 0) return;

      // tạo HTML cho ngày này
      html += `<h4>Ngày ${dayStr}</h4>`;
      html += `<table border="1" cellpadding="5" cellspacing="0" style="width:100%;margin-bottom:12px">
              <tr><th>Sản phẩm</th><th>Nhập</th><th>Xuất</th><th>Tồn cuối</th></tr>`;

      rows.forEach((r) => {
        const prev = Number(stockPrevMap[r.product.id] || 0);
        const stockCuoi = prev + r.nhapQty - r.xuatQty;
        stockPrevMap[r.product.id] = stockCuoi;

        html += `<tr>
        <td>${r.product.name || r.product.ma || r.product.id}</td>
        <td style="text-align:right">${r.nhapQty}</td>
        <td style="text-align:right">${r.xuatQty}</td>
        <td style="text-align:right">${stockCuoi}</td>
      </tr>`;
      });

      html += `</table>`;
    });

    return html;
  }

  // main coordinator
  function thongKeNhapXuatTheoNgay(fromISO, toISO) {
    const res = document.getElementById(ID_STATS_RESULT);
    if (!res) return;
    if (!fromISO || !toISO) {
      alert("Vui lòng chọn đầy đủ ngày");
      return;
    }

    const products = readLS("products", []);
    // phieuNhap stored under 'purchaseReceipts' or 'phieuNhap' — support both
    const phieuNhap = readLS("purchaseReceipts", readLS("phieuNhap", []));
    // phieuXuat stored under 'phieuXuat' or built from 'orders' — support both
    const phieuXuat = readLS(
      "phieuXuat",
      readLS("exports", readLS("orders", []))
    );

    const dateFrom = new Date(fromISO);
    const dateTo = new Date(toISO);
    if (isNaN(dateFrom) || isNaN(dateTo) || dateFrom > dateTo) {
      alert("Khoảng ngày không hợp lệ");
      return;
    }

    const diffDays = Math.floor((dateTo - dateFrom) / (1000 * 60 * 60 * 24));
    const groupByMonth = diffDays > 60;

    // compute stock at start (before from)
    const stockPrevMap = tinhTonDauKy(products, phieuNhap, phieuXuat, fromISO);

    let html = `<h3>📦 Thống kê nhập–xuất từ ${formatISO(
      fromISO
    )} đến ${formatISO(toISO)}</h3>`;
    html += groupByMonth
      ? thongKeTheoThang(
          products,
          phieuNhap,
          phieuXuat,
          stockPrevMap,
          fromISO,
          toISO
        )
      : thongKeTheoNgay(
          products,
          phieuNhap,
          phieuXuat,
          stockPrevMap,
          fromISO,
          toISO
        );

    res.innerHTML = html;
  }

  // attach listeners safely (remove previous to avoid double)
  function attachListeners() {
    // populate filters on load or when product list changes
    populateInventoryFilters();

    const btnCheck = document.getElementById(ID_CHECK);
    if (btnCheck) {
      btnCheck.removeEventListener("click", canhBaoTheoNguong);
      btnCheck.addEventListener("click", canhBaoTheoNguong);
    }

    const btnSearch = document.getElementById(ID_SEARCH_BTN);
    if (btnSearch) {
      btnSearch.removeEventListener("click", traCuuTonKho);
      btnSearch.addEventListener("click", traCuuTonKho);
    }

    const btnStats = document.getElementById(ID_STATS_BTN);
    if (btnStats) {
      // remove any direct listener that calls thongKeNhapXuatTheoNgay without params
      btnStats.replaceWith(btnStats.cloneNode(true)); // quick reset
      const newBtn = document.getElementById(ID_STATS_BTN);
      if (newBtn) {
        newBtn.addEventListener("click", () => {
          const from = document.getElementById(ID_FROM)?.value;
          const to = document.getElementById(ID_TO)?.value;
          if (!from || !to) {
            alert("Vui lòng chọn khoảng thời gian");
            return;
          }
          thongKeNhapXuatTheoNgay(from, to);
        });
      }
    }
  }

  // observe localStorage-like changes by wrapping setItem? (limited). Simple approach: re-populate on DOMContentLoaded and when renderProducts/renderCategories called elsewhere.
  // Call populateInventoryFilters whenever DOM ready and when products/categories likely change.
  document.addEventListener("DOMContentLoaded", () => {
    attachListeners();
  });

  // expose some functions globally if needed
  window.populateInventoryFilters = populateInventoryFilters;
  window.canhBaoTheoNguong = canhBaoTheoNguong;
  window.traCuuTonKho = traCuuTonKho;
  window.thongKeNhapXuatTheoNgay = thongKeNhapXuatTheoNgay;
})();

// ==============================
// 6️⃣ Đồng bộ sau khi thêm sản phẩm/danh mục
// ==============================
if (typeof renderCategories === "function") {
  const oldRenderCategories = renderCategories;
  renderCategories = function (...args) {
    oldRenderCategories(...args);
    populateInventoryFilters();
  };
}

if (typeof renderProducts === "function") {
  const oldRenderProducts = renderProducts;
  renderProducts = function (...args) {
    oldRenderProducts(...args);
    populateInventoryFilters();
  };
}

// ==============================
// 7️⃣ Xóa nội dung khi rời khỏi mục kho
// ==============================
window.addEventListener("click", (e) => {
  const inventory = document.getElementById("inventory");
  if (inventory && !inventory.contains(e.target)) {
    document.getElementById("inv-stock-result").innerHTML = "";
    document.getElementById("inv-stock-search-result").innerHTML = "";
    document.getElementById("inv-stock-stats").innerHTML = "";
  }
});
// ====================== QUẢN LÝ ĐƠN HÀNG ======================

// Hiển thị danh sách đơn hàng
function renderOrders(filterStatus = "", startDate = "", endDate = "") {
  const tbody = document.getElementById("orders-table");
  tbody.innerHTML = "";

  const orders = read("orders") || [];

  orders
    .filter((o) => {
      if (filterStatus && o.status !== filterStatus) return false;
      const orderDate = new Date(o.date);
      if (startDate && orderDate < new Date(startDate)) return false;
      if (endDate && orderDate > new Date(endDate)) return false;
      return true;
    })
    .forEach((o, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${o.date}</td>
        <td>${o.customerName || "Chưa có"}</td>
        <td>${o.status || "Chưa có"}</td>
        <td>${formatVND(o.total || 0)}</td>
        <td>
          <button class="btn" onclick="viewOrder('${o.id}')">Xem</button>
          <button class="btn" onclick="updateOrderStatus('${
            o.id
          }')">Cập nhật</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
}

// Xem chi tiết đơn hàng
window.viewOrder = function (id) {
  const orders = read("orders") || [];
  const order = orders.find((o) => o.id === id);
  if (!order) return alert("Không tìm thấy đơn hàng!");

  const address = order.address || {};
  let content = `Đơn hàng: ${order.id}
Khách hàng: ${order.customerName}
Email: ${order.email}
Số điện thoại: ${address.phone || "Chưa cập nhật"}
Ngày: ${order.date}
Địa chỉ: ${address.address || "Chưa cập nhật"}
Ghi chú: ${address.note || "Không có"}
Trạng thái: ${order.status}

Sản phẩm:\n`;

  order.items.forEach((item, i) => {
    content += `${i + 1}. ${item.name} | Size: ${item.size} | Số lượng: ${
      item.qty
    } | Giá: ${formatVND(item.price)} | Thành tiền: ${formatVND(
      item.qty * item.price
    )}\n`;
  });

  content += `\nTổng tiền: ${formatVND(order.total)}`;
  alert(content);
};

// Cập nhật trạng thái đơn hàng
window.updateOrderStatus = function (id) {
  const statuses = ["new", "processing", "shipped", "cancelled"];
  const orders = read("orders") || [];
  const order = orders.find((o) => o.id === id);
  if (!order) return alert("Không tìm thấy đơn hàng!");

  const s = prompt(
    "Trạng thái mới (new, processing, shipped, cancelled):",
    order.status
  );
  if (!s || !statuses.includes(s)) return alert("Trạng thái không hợp lệ!");

  order.status = s;
  write("orders", orders);
  renderOrders(
    document.getElementById("order-filter").value,
    document.getElementById("order-start-date")?.value,
    document.getElementById("order-end-date")?.value
  );
};

// Lọc theo trạng thái
document.getElementById("order-filter").addEventListener("change", (e) => {
  renderOrders(
    e.target.value,
    document.getElementById("order-start-date")?.value,
    document.getElementById("order-end-date")?.value
  );
});

// Lọc theo khoảng ngày
document.getElementById("order-filter-date").addEventListener("click", () => {
  renderOrders(
    document.getElementById("order-filter").value,
    document.getElementById("order-start-date").value,
    document.getElementById("order-end-date").value
  );
});
function formatVND(n) {
  return Number(n).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}

// Hiển thị lần đầu
renderOrders();

// ==============================
// 🔹 11. Orders (Admin table)
// ==============================
function renderOrders() {
  let ordersLocal = JSON.parse(localStorage.getItem("orders")) || orders;
  const tbody = document.getElementById("orders-table");
  if (!tbody) return;
  tbody.innerHTML = "";
  ordersLocal.forEach((o, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${o.date || ""}</td>
            <td>${o.customer || ""}</td>
            <td>${o.paymentLabel || o.paymentMethod || ""}</td>
            <td>${(o.total || 0).toLocaleString()} VND</td>
            <td><button class="delete-order" data-id="${o.id}">Xóa</button></td>
        `;
    tbody.appendChild(tr);
  });
  // delegate delete
  tbody.removeEventListener("click", tbody.__handler);
  tbody.__handler = function (e) {
    const btn = e.target.closest("button.delete-order");
    if (!btn) return;
    const id = btn.dataset.id;
    if (confirm("Xác nhận xóa đơn hàng?")) {
      let ordersLocal2 = JSON.parse(localStorage.getItem("orders")) || orders;
      ordersLocal2 = ordersLocal2.filter((o) => o.id != id);
      localStorage.setItem("orders", JSON.stringify(ordersLocal2));
      renderOrders();
      renderDashboard();
    }
  };
  tbody.addEventListener("click", tbody.__handler);
}

function deleteOrder(id) {
  if (confirm("Xác nhận xóa đơn hàng?")) {
    let ordersLocal = JSON.parse(localStorage.getItem("orders")) || orders;
    ordersLocal = ordersLocal.filter((o) => o.id !== id);
    localStorage.setItem("orders", JSON.stringify(ordersLocal));
    renderOrders();
    renderDashboard();
  }
}

// ====== PHIẾU NHẬP HÀNG
let purchaseReceipts =
  JSON.parse(localStorage.getItem("purchaseReceipts")) || [];
let currentReceiptItems = []; // dùng tạm nếu muốn thêm nhiều item trước khi lưu (không bắt buộc)
let editingImportId = null;

function vndFormat(n) {
  try {
    return Number(n).toLocaleString("vi-VN") + " ₫";
  } catch (e) {
    return n;
  }
}
function formatDMY(iso) {
  if (!iso) return "";
  // iso may be yyyy-mm-dd or other; if contains '-', assume yyyy-mm-dd
  if (iso.includes("-")) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }
  return iso;
}

function initImportProductOptions() {
  const sel = document.getElementById("import-product");
  const editSel = document.getElementById("edit-import-product");
  if (!sel) return;
  sel.innerHTML = `<option value="">-- Chọn sản phẩm --</option>`;
  if (editSel)
    editSel.innerHTML = `<option value="">-- Chọn sản phẩm --</option>`;
  const productsLocal = JSON.parse(localStorage.getItem("products")) || [];
  productsLocal.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id || p.ma || p.maCode || JSON.stringify(p.ma || p.id);
    opt.textContent = `${p.ma || p.id} - ${p.name || p.title || p.ma}`;
    sel.appendChild(opt);
    if (editSel) {
      const opt2 = opt.cloneNode(true);
      editSel.appendChild(opt2);
    }
  });
}

// Ghi nhận 1 phiếu (mỗi submit của import-form sẽ tạo 1 phiếu nhập có 1 item)
document
  .getElementById("import-form")
  ?.addEventListener("submit", function (e) {
    e.preventDefault();
    const date = document.getElementById("import-date")?.value;
    const productId = document.getElementById("import-product")?.value;
    const price = Number(document.getElementById("import-price")?.value);
    const qty = Number(document.getElementById("import-qty")?.value);

    if (!date) return alert("Vui lòng chọn ngày nhập");
    if (!productId) return alert("Vui lòng chọn sản phẩm");
    if (!price || price < 0) return alert("Giá nhập không hợp lệ");
    if (!qty || qty <= 0) return alert("Số lượng không hợp lệ");

    const productsLocal = JSON.parse(localStorage.getItem("products")) || [];
    const prod = productsLocal.find(
      (p) =>
        String(p.id) === String(productId) || String(p.ma) === String(productId)
    );
    const name = prod ? prod.name : productId;

    const newId =
      purchaseReceipts.length > 0
        ? Math.max(...purchaseReceipts.map((r) => r.id)) + 1
        : 1;
    const newReceipt = {
      id: newId,
      importDate: date,
      status: "Nháp",
      items: [
        {
          productId: productId,
          productName: name,
          importPrice: price,
          qty: qty,
        },
      ],
    };
    purchaseReceipts.push(newReceipt);
    localStorage.setItem("purchaseReceipts", JSON.stringify(purchaseReceipts));

    // ẩn form input container
    document.getElementById("import-add-container")?.classList.add("hidden");
    // reset form
    document.getElementById("import-form")?.reset();
    renderImports();
    alert("Đã tạo phiếu nhập (trạng thái: Nháp).");
  });

// Lưu thay đổi khi sửa phiếu (edit-import-form)
document
  .getElementById("edit-import-form")
  ?.addEventListener("submit", function (e) {
    e.preventDefault();
    const id = Number(document.getElementById("edit-import-id")?.value);
    const price = Number(document.getElementById("edit-import-price")?.value);
    const qty = Number(document.getElementById("edit-import-qty")?.value);
    if (!id) return alert("ID phiếu không hợp lệ");
    const idx = purchaseReceipts.findIndex((r) => r.id === id);
    if (idx === -1) return alert("Không tìm thấy phiếu");
    if (purchaseReceipts[idx].status === "Hoàn thành")
      return alert("Phiếu đã hoàn thành, không thể sửa");

    // phiếu mẫu ở đây chỉ có 1 item (theo cấu trúc form), ta cập nhật item[0]
    purchaseReceipts[idx].items = [
      {
        productId: purchaseReceipts[idx].items[0].productId,
        productName: purchaseReceipts[idx].items[0].productName,
        importPrice: price,
        qty: qty,
      },
    ];
    localStorage.setItem("purchaseReceipts", JSON.stringify(purchaseReceipts));
    document.getElementById("import-edit-container")?.classList.add("hidden");
    renderImports();
    alert("Đã lưu thay đổi phiếu nhập.");
  });

// Hiển thị danh sách phiếu nhập
function renderImports() {
  const tbody = document.getElementById("imports-table");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (!purchaseReceipts || purchaseReceipts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center">Chưa có phiếu nhập nào.</td></tr>`;
    return;
  }
  purchaseReceipts.forEach((r, idx) => {
    const it = (r.items && r.items[0]) || {};
    const total = (it.importPrice || 0) * (it.qty || 0);
    // find current stock
    const productsLocal = JSON.parse(localStorage.getItem("products")) || [];
    const p = productsLocal.find(
      (pp) =>
        String(pp.id) === String(it.productId) ||
        String(pp.ma) === String(it.productId)
    );
    const stock = p ? p.stock ?? p.quantity ?? 0 : "—";
    tbody.innerHTML += `
      <tr>
        <td>${idx + 1}</td>
        <td>PN${String(r.id).padStart(3, "0")}</td>
        <td>${formatDMY(r.importDate)}</td>
        <td>${it.productName || it.productId}</td>
        <td>${it.qty || 0}</td>
        <td>${stock}</td>
        <td>${r.status}</td>
        <td>${vndFormat(total)}</td>
        <td>
          <button onclick="editImport(${r.id})">Sửa</button>
          <button onclick="completeImport(${r.id})">Hoàn thành</button>
          <button onclick="deleteImport(${r.id})">Xóa</button>
        </td>
      </tr>
    `;
  });
}

// Sửa: load vào import-edit-container
function editImport(id) {
  const r = purchaseReceipts.find((x) => x.id === id);
  if (!r) return alert("Phiếu không tồn tại");
  if (r.status === "Hoàn thành")
    return alert("Phiếu đã hoàn thành, không thể sửa");
  document.getElementById("edit-import-id").value = r.id;
  const it = (r.items && r.items[0]) || {};
  document.getElementById("edit-import-product").value = it.productId || "";
  document.getElementById("edit-import-price").value = it.importPrice || "";
  document.getElementById("edit-import-qty").value = it.qty || "";
  document.getElementById("import-edit-container")?.classList.remove("hidden");
  // scroll to edit box (optional)
  document
    .getElementById("import-edit-container")
    ?.scrollIntoView({ behavior: "smooth" });
}

// Hoàn thành phiếu và cập nhật tồn kho
function completeImport(id) {
  const idx = purchaseReceipts.findIndex((x) => x.id === id);
  if (idx === -1) return alert("Phiếu không tồn tại");
  const r = purchaseReceipts[idx];
  if (r.status === "Hoàn thành") return alert("Phiếu đã hoàn thành");
  if (
    !confirm(
      "Hoàn thành phiếu nhập này? (Hành động sẽ cộng tồn kho theo số lượng nhập)"
    )
  )
    return;
  // cập nhật tồn kho
  const productsLocal = JSON.parse(localStorage.getItem("products")) || [];
  (r.items || []).forEach((it) => {
    const prod = productsLocal.find(
      (p) =>
        String(p.id) === String(it.productId) ||
        String(p.ma) === String(it.productId)
    );
    if (prod) {
      // dùng stock hoặc quantity
      if (typeof prod.stock !== "undefined")
        prod.stock = Number(prod.stock || 0) + Number(it.qty || 0);
      else if (typeof prod.quantity !== "undefined")
        prod.quantity = Number(prod.quantity || 0) + Number(it.qty || 0);
      else prod.stock = Number(it.qty || 0);
    }
  });
  // lưu products
  localStorage.setItem("products", JSON.stringify(productsLocal));
  // cập nhật trạng thái phiếu
  r.status = "Hoàn thành";
  localStorage.setItem("purchaseReceipts", JSON.stringify(purchaseReceipts));
  renderImports();
  // nếu bạn có renderProducts(), gọi để cập nhật hiển thị tồn
  if (typeof renderProducts === "function") renderProducts();
  alert("Phiếu đã hoàn thành và cập nhật tồn kho.");
}

// Xóa phiếu
function deleteImport(id) {
  const idx = purchaseReceipts.findIndex((x) => x.id === id);
  if (idx === -1) return alert("Phiếu không tồn tại");
  if (!confirm("Xóa phiếu nhập này?")) return;
  purchaseReceipts.splice(idx, 1);
  localStorage.setItem("purchaseReceipts", JSON.stringify(purchaseReceipts));
  renderImports();
}

// Tìm kiếm phiếu
document
  .getElementById("search-import-btn")
  ?.addEventListener("click", function () {
    const term = (document.getElementById("import-search")?.value || "")
      .trim()
      .toLowerCase();
    if (!term) {
      renderImports();
      return;
    }
    const filtered = purchaseReceipts.filter((r) => {
      const idStr = `pn${String(r.id).padStart(3, "0")}`.toLowerCase();
      const dateStr = (r.importDate || "").toLowerCase();
      return idStr.includes(term) || dateStr.includes(term);
    });
    // render filtered
    const tbody = document.getElementById("imports-table");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center">Không tìm thấy</td></tr>`;
      return;
    }
    filtered.forEach((r, idx) => {
      const it = (r.items && r.items[0]) || {};
      const total = (it.importPrice || 0) * (it.qty || 0);
      tbody.innerHTML += `
      <tr>
        <td>${idx + 1}</td>
        <td>PN${String(r.id).padStart(3, "0")}</td>
        <td>${formatDMY(r.importDate)}</td>
        <td>${it.productName || it.productId}</td>
        <td>${it.qty || 0}</td>
        <td>—</td>
        <td>${r.status}</td>
        <td>${vndFormat(total)}</td>
        <td>
          <button onclick="editImport(${r.id})">Sửa</button>
          <button onclick="completeImport(${r.id})">Hoàn thành</button>
          <button onclick="deleteImport(${r.id})">Xóa</button>
        </td>
      </tr>
    `;
    });
  });

// Mở/đóng vùng tạo phiếu
document.getElementById("add-import")?.addEventListener("click", function () {
  const box = document.getElementById("import-add-container");
  if (!box) return;
  box.classList.toggle("hidden");
  if (!box.classList.contains("hidden")) {
    // init options mỗi khi mở
    initImportProductOptions();
    document.getElementById("import-form")?.reset();
  }
});

// nút hủy trong HTML dùng reference importAddContainer/importEditContainer? để an toàn, thêm selector fallback
const importAddContainer = document.getElementById("import-add-container");
const importEditContainer = document.getElementById("import-edit-container");

// Khởi tạo khi DOM sẵn sàng (an toàn để thêm dù file đã có DOMContentLoaded khác)
document.addEventListener("DOMContentLoaded", function () {
  initImportProductOptions();
  renderImports();
});

// ==============================
// 🔹 12. POS / Tạo đơn hàng (ý tưởng A)
// ==============================
function renderPOS(containerId = "contentArea") {
  const contentArea = document.getElementById(containerId);
  if (!contentArea) return;
  contentArea.innerHTML = `
    <h3>🛒 Tạo đơn hàng</h3>
    <div class="stock-inputs">
      <label>Tên sản phẩm:</label>
      <input type="text" id="pos-searchProduct" placeholder="Nhập tên sản phẩm..." autocomplete="off" list="datalistProducts">
      <div id="pos-suggestions" class="suggestion-box" style="display:none;position:absolute;background:#fff;border:1px solid #ccc;z-index:999;max-height:200px;overflow:auto;"></div>
      <input type="number" id="pos-productQty" min="1" placeholder="Số lượng">
      <button id="pos-addToCart"> + Thêm vào giỏ</button>
    </div>

    <h4>🧺 Giỏ hàng</h4>
    <table id="pos-cartTable" border="1" cellspacing="0" cellpadding="6" width="100%">
      <thead>
        <tr style="background:#2f3e46;color:white;">
          <th>Tên sản phẩm</th>
          <th>Giá (VNĐ)</th>
          <th>Số lượng</th>
          <th>Tạm tính</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>

    <h4>🚚 Thông tin giao hàng</h4>
    <input type="text" id="pos-orderAddress" placeholder="Nhập địa chỉ giao hàng" style="width:100%;padding:5px;">

    <h4>💳 Phương thức thanh toán</h4>
    <select id="pos-paymentMethod">
      <option value="cash" selected>Tiền mặt khi nhận hàng</option>
      <option value="transfer">Chuyển khoản ngân hàng</option>
      <option value="online">Thanh toán trực tuyến</option>
    </select>

    <div id="pos-qrSection" style="margin-top:10px; display:none;">
      <p>Vui lòng quét mã QR để thanh toán:</p>
      <img src="qr.png" alt="QR thanh toán" width="200">
    </div>

    <div id="pos-onlineSection" style="margin-top:10px; display:none;">
      <p>💡 Thanh toán trực tuyến mô phỏng — chưa kết nối cổng thanh toán.</p>
    </div>

    <h3 id="pos-totalPrice" style="margin-top:20px;">Tổng tiền: 0 VNĐ</h3>
    <button id="pos-confirmOrder">✅ Xác nhận đơn hàng</button>

    <div id="pos-orderResult" style="margin-top:20px;"></div>
  `;

  let cart = [];
  const posSearch = document.getElementById("pos-searchProduct");
  const posQty = document.getElementById("pos-productQty");
  const posSuggestions = document.getElementById("pos-suggestions");
  const payment = document.getElementById("pos-paymentMethod");

  let debounce;
  posSearch.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const kw = (posSearch.value || "").toLowerCase().trim();
      posSuggestions.innerHTML = "";
      if (!kw) {
        posSuggestions.style.display = "none";
        return;
      }
      const matches = (
        JSON.parse(localStorage.getItem("products")) || []
      ).filter((p) => (p.name || "").toLowerCase().includes(kw));
      if (matches.length === 0) {
        posSuggestions.style.display = "none";
        return;
      }
      matches.slice(0, 20).forEach((p) => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.style.padding = "6px 10px";
        div.style.cursor = "pointer";
        div.textContent = `${p.name} (${Number(p.price || 0).toLocaleString(
          "vi-VN"
        )} VNĐ)`;
        div.addEventListener("click", () => {
          posSearch.value = p.name;
          posSearch.dataset.selectedId = p.id;
          posSuggestions.style.display = "none";
        });
        posSuggestions.appendChild(div);
      });
      posSuggestions.style.display = "block";
    }, 120);
  });

  document.addEventListener("click", (e) => {
    if (
      !e.target.closest("#pos-searchProduct") &&
      !e.target.closest("#pos-suggestions")
    )
      posSuggestions.style.display = "none";
  });

  function renderCart() {
    const tbody = document.querySelector("#pos-cartTable tbody");
    tbody.innerHTML = "";
    let total = 0;
    cart.forEach((item, idx) => {
      const subtotal = (item.price || 0) * item.qty;
      total += subtotal;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.name}</td>
        <td>${Number(item.price || 0).toLocaleString("vi-VN")}</td>
        <td>${item.qty}</td>
        <td>${Number(subtotal).toLocaleString("vi-VN")}</td>
        <td><button class="pos-remove" data-idx="${idx}">❌ Xóa</button></td>
      `;
      tbody.appendChild(tr);
    });
    document.getElementById(
      "pos-totalPrice"
    ).textContent = `Tổng tiền: ${Number(total).toLocaleString("vi-VN")} VNĐ`;
    tbody.querySelectorAll(".pos-remove").forEach((btn) =>
      btn.addEventListener("click", () => {
        cart.splice(Number(btn.dataset.idx), 1);
        renderCart();
      })
    );
  }

  document.getElementById("pos-addToCart").addEventListener("click", () => {
    const selectedId = Number(posSearch.dataset.selectedId);
    const qty = Number(posQty.value);
    if (!selectedId) return alert("⚠️ Vui lòng chọn sản phẩm từ gợi ý!");
    if (!Number.isInteger(qty) || qty <= 0)
      return alert("⚠️ Số lượng không hợp lệ!");
    const prod = (JSON.parse(localStorage.getItem("products")) || []).find(
      (p) => p.id === selectedId
    );
    if (!prod) return alert("⚠️ Không tìm thấy sản phẩm!");
    const existing = cart.find((i) => i.ma === prod.ma);
    if (existing) existing.qty += qty;
    else
      cart.push({
        ma: prod.ma,
        maId: prod.id,
        name: prod.name,
        price: prod.price || 0,
        qty,
      });
    renderCart();
    posSearch.value = "";
    posSearch.dataset.selectedId = "";
    posQty.value = "";
  });

  payment.addEventListener("change", () => {
    document.getElementById("pos-qrSection").style.display =
      payment.value === "transfer" ? "block" : "none";
    document.getElementById("pos-onlineSection").style.display =
      payment.value === "online" ? "block" : "none";
  });

  document.getElementById("pos-confirmOrder").addEventListener("click", () => {
    if (cart.length === 0) return alert("⚠️ Giỏ hàng trống!");
    const address = (
      document.getElementById("pos-orderAddress")?.value || ""
    ).trim();
    if (!address) return alert("⚠️ Vui lòng nhập địa chỉ giao hàng!");
    const total = cart.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
    const method = payment.options[payment.selectedIndex].text;
    let ordersLocal = JSON.parse(localStorage.getItem("orders")) || [];
    const newOrder = {
      id: Date.now(),
      date: new Date().toLocaleString("vi-VN"),
      customer: "Khách lẻ",
      address,
      paymentMethod: payment.value,
      paymentLabel: method,
      items: cart.map((i) => ({
        ma: i.ma,
        name: i.name,
        price: i.price,
        qty: i.qty,
      })),
      total,
    };
    ordersLocal.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(ordersLocal));

    document.getElementById(
      "pos-orderResult"
    ).innerHTML = `\n      <h4>🎉 Đơn hàng đã tạo thành công!</h4>\n      <p><b>Mã đơn:</b> ${
      newOrder.id
    }</p>\n      <p><b>Địa chỉ giao hàng:</b> ${
      newOrder.address
    }</p>\n      <p><b>Phương thức thanh toán:</b> ${
      newOrder.paymentLabel
    }</p>\n      <p><b>Tổng tiền:</b> ${Number(newOrder.total).toLocaleString(
      "vi-VN"
    )} VNĐ</p>\n      <h4>Chi tiết sản phẩm:</h4>\n      <ul>${newOrder.items
      .map((i) => `<li>${i.name} - SL: ${i.qty}</li>`)
      .join("")}</ul>\n    `;

    cart = [];
    renderCart();
    renderOrders();
    renderDashboard();
  });
}

// ==============================
// Initialize some UI on load
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
  renderUsers();
  renderProducts();
  renderCategories();
  renderCategoryProducts();
  renderProductOptions && renderProductOptions();
  renderImports && renderImports();
  renderPriceManagement && renderPriceManagement();
  renderOrders && renderOrders();
});

// Expose POS function globally for manual call
window.renderPOS = renderPOS;

// End of file
