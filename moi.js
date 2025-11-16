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
    if (name && email) {
      const us = JSON.parse(localStorage.getItem("users")) || users;
      const username =
        (email || "").split("@")[0] || name.replace(/\s+/g, "").toLowerCase();
      us.push({
        id: Date.now(),
        name,
        username,
        email,
        password: "user123",
        status: "Hoạt động",
        locked: false,
      });
      localStorage.setItem("users", JSON.stringify(us));
      renderUsers();
    }
  });
}

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
      if (p.category === cat)
        p.price = Math.round(p.price * (1 + percent / 100));
    });
    localStorage.setItem("products", JSON.stringify(productsLocal));
    renderProducts();
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
/* =========================
   IMPORTS (Phiếu nhập) + Profit-by-date feature
   Paste this at the end of admin.js
   ========================= */

/* -- Utility: parse nhiều định dạng ngày an toàn -- */
function parseDateSafe(s) {
  if (!s) return null;
  if (s instanceof Date) {
    if (!isNaN(s)) return new Date(s.getFullYear(), s.getMonth(), s.getDate());
    return null;
  }
  // Try Date() directly (ISO or other recognized)
  const dDirect = new Date(s);
  if (!isNaN(dDirect))
    return new Date(
      dDirect.getFullYear(),
      dDirect.getMonth(),
      dDirect.getDate()
    );

  // yyyy-mm-dd
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));

  // dd/mm/yyyy or mm/dd/yyyy fallback
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const a = Number(m[1]),
      b = Number(m[2]),
      y = Number(m[3]);
    // heuristic: if first part >12 -> dd/mm
    if (a > 12 && b <= 12) return new Date(y, b - 1, a);
    // otherwise treat as dd/mm (VN) preferentially
    return new Date(y, b - 1, a);
  }

  return null;
}

/* Format D/M/Y from input string/date */
function formatDMYFromAny(s) {
  const d = parseDateSafe(s);
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

/* -------------------------
   IMPORTS: create / edit / render
   ------------------------- */
let importsLocal = JSON.parse(localStorage.getItem("imports")) || imports || []; // fallback to top-level imports var

function saveImportsToStorage() {
  localStorage.setItem("imports", JSON.stringify(importsLocal));
}

function populateImportProductOptions() {
  const sel = document.getElementById("import-product");
  const editSel = document.getElementById("edit-import-product");
  if (!sel) return;
  sel.innerHTML = `<option value="">-- Chọn sản phẩm --</option>`;
  (JSON.parse(localStorage.getItem("products")) || products || []).forEach(
    (p) => {
      const opt = document.createElement("option");
      opt.value = p.id || p.ma || p.id;
      opt.textContent = `${p.ma || p.id} - ${p.name}`;
      sel.appendChild(opt);
    }
  );
  if (editSel) {
    editSel.innerHTML = `<option value="">-- Chọn sản phẩm --</option>`;
    (JSON.parse(localStorage.getItem("products")) || products || []).forEach(
      (p) => {
        const opt = document.createElement("option");
        opt.value = p.id || p.ma || p.id;
        opt.textContent = `${p.ma || p.id} - ${p.name}`;
        editSel.appendChild(opt);
      }
    );
  }
}

/* Render imports table */
function renderImportTable() {
  const tbody = document.getElementById("imports-table");
  if (!tbody) return;
  importsLocal = JSON.parse(localStorage.getItem("imports")) || importsLocal;
  tbody.innerHTML = "";
  if (importsLocal.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center">Chưa có phiếu nhập nào.</td></tr>`;
    return;
  }
  importsLocal.forEach((imp, idx) => {
    const prod =
      (JSON.parse(localStorage.getItem("products")) || products || []).find(
        (p) => String(p.id) === String(imp.productId) || p.ma === imp.productId
      ) || {};
    const stock = prod.stock != null ? prod.stock : prod.quantity || 0;
    const totalMoney = Number(imp.price || 0) * Number(imp.qty || 0);
    tbody.innerHTML += `
      <tr>
        <td>${idx + 1}</td>
        <td>${imp.id}</td>
        <td>${formatDMYFromAny(imp.date)}</td>
        <td>${prod.name || imp.productName || imp.productId}</td>
        <td>${imp.qty}</td>
        <td>${stock}</td>
        <td>${imp.status || "Hoàn thành"}</td>
        <td>${Number(totalMoney).toLocaleString("vi-VN")} VND</td>
        <td>
          <button class="btn-edit" onclick="editImport('${
            imp.id
          }')">Sửa</button>
          <button class="btn-delete" onclick="deleteImport('${
            imp.id
          }')">Xóa</button>
        </td>
      </tr>
    `;
  });
}

/* Add new import record (from form) */
function addImportFromForm(evt) {
  evt && evt.preventDefault && evt.preventDefault();
  const date = document.getElementById("import-date").value;
  const productId = document.getElementById("import-product").value;
  const price = Number(document.getElementById("import-price").value);
  const qty = Number(document.getElementById("import-qty").value);

  if (!date || !productId || !price || !qty)
    return alert("Vui lòng nhập đầy đủ ngày, sản phẩm, giá và số lượng.");

  // id: unique string
  const id = "IMP" + Date.now();

  const prod = (
    JSON.parse(localStorage.getItem("products")) ||
    products ||
    []
  ).find((p) => String(p.id) === String(productId) || p.ma === productId);

  const record = {
    id,
    date,
    productId: prod ? prod.id || prod.ma : productId,
    productName: prod ? prod.name : productId,
    price,
    qty,
    status: "Hoàn thành",
  };

  importsLocal.push(record);
  saveImportsToStorage();

  // update product stock and optionally set "cost" or track last import cost
  let productsLocal =
    JSON.parse(localStorage.getItem("products")) || products || [];
  const idx = productsLocal.findIndex(
    (p) => String(p.id) === String(productId) || p.ma === productId
  );
  if (idx !== -1) {
    productsLocal[idx].stock = Number(productsLocal[idx].stock || 0) + qty;
    // store lastImportPrice for use as fallback COGS if needed
    productsLocal[idx].lastImportPrice = price;
    // optionally maintain a running average cost:
    const prevQty = Number(productsLocal[idx].importedQty || 0);
    const prevCostTotal = Number(productsLocal[idx].importedCostTotal || 0);
    productsLocal[idx].importedQty = prevQty + qty;
    productsLocal[idx].importedCostTotal = prevCostTotal + price * qty;
    productsLocal[idx].avgImportCost = productsLocal[idx].importedQty
      ? Math.round(
          productsLocal[idx].importedCostTotal / productsLocal[idx].importedQty
        )
      : price;
    localStorage.setItem("products", JSON.stringify(productsLocal));
  }

  // UI update
  renderImportTable();
  renderProducts && renderProducts();
  alert("Đã thêm phiếu nhập và cập nhật tồn kho.");
  // hide form
  const addContainer = document.getElementById("import-add-container");
  if (addContainer) addContainer.classList.add("hidden");
  // reset form
  document.getElementById("import-form").reset();
}

/* Edit import: fill edit form */
function editImport(id) {
  const rec = importsLocal.find((r) => String(r.id) === String(id));
  if (!rec) return alert("Không tìm thấy phiếu nhập này.");
  const editContainer = document.getElementById("import-edit-container");
  if (!editContainer) return;
  document.getElementById("edit-import-id").value = rec.id;
  document.getElementById("edit-import-product").value = rec.productId;
  document.getElementById("edit-import-price").value = rec.price;
  document.getElementById("edit-import-qty").value = rec.qty;
  editContainer.classList.remove("hidden");
}

/* Save edit from edit form */
function saveEditImport(evt) {
  evt && evt.preventDefault && evt.preventDefault();
  const id = document.getElementById("edit-import-id").value;
  const price = Number(document.getElementById("edit-import-price").value);
  const qty = Number(document.getElementById("edit-import-qty").value);
  if (!id || !price || !qty) return alert("Thông tin sửa không hợp lệ.");
  const idx = importsLocal.findIndex((r) => String(r.id) === String(id));
  if (idx === -1) return alert("Không tìm thấy phiếu.");
  // revert previous stock change, then apply new (simpler approach)
  const old = importsLocal[idx];
  // find product and update stock difference
  let productsLocal =
    JSON.parse(localStorage.getItem("products")) || products || [];
  const pidx = productsLocal.findIndex(
    (p) => String(p.id) === String(old.productId) || p.ma === old.productId
  );
  if (pidx !== -1) {
    productsLocal[pidx].stock =
      Number(productsLocal[pidx].stock || 0) - Number(old.qty || 0) + qty;
  }

  // update import record
  importsLocal[idx].price = price;
  importsLocal[idx].qty = qty;
  saveImportsToStorage();
  localStorage.setItem("products", JSON.stringify(productsLocal));
  renderImportTable();
  renderProducts && renderProducts();
  document.getElementById("edit-import-form").reset();
  document.getElementById("import-edit-container").classList.add("hidden");
  alert("Đã lưu thay đổi phiếu nhập.");
}

/* Delete import */
function deleteImport(id) {
  if (!confirm("Xóa phiếu nhập này?")) return;
  const idx = importsLocal.findIndex((r) => String(r.id) === String(id));
  if (idx === -1) return;
  const rec = importsLocal[idx];
  // revert stock
  let productsLocal =
    JSON.parse(localStorage.getItem("products")) || products || [];
  const pidx = productsLocal.findIndex(
    (p) => String(p.id) === String(rec.productId) || p.ma === rec.productId
  );
  if (pidx !== -1) {
    productsLocal[pidx].stock = Math.max(
      0,
      Number(productsLocal[pidx].stock || 0) - Number(rec.qty || 0)
    );
  }
  importsLocal.splice(idx, 1);
  saveImportsToStorage();
  localStorage.setItem("products", JSON.stringify(productsLocal));
  renderImportTable();
  renderProducts && renderProducts();
  alert("Đã xóa phiếu nhập.");
}

/* Init imports UI handlers */
function initImportsFeature() {
  importsLocal = JSON.parse(localStorage.getItem("imports")) || importsLocal;
  const addBtn = document.getElementById("add-import");
  const addContainer = document.getElementById("import-add-container");
  const importForm = document.getElementById("import-form");
  const editForm = document.getElementById("edit-import-form");

  if (addBtn && addContainer) {
    addBtn.addEventListener("click", () => {
      addContainer.classList.toggle("hidden");
      // ensure options are populated
      populateImportProductOptions();
    });
  }
  if (importForm) importForm.addEventListener("submit", addImportFromForm);
  if (editForm) editForm.addEventListener("submit", saveEditImport);

  // search imports
  const searchBtn = document.getElementById("search-import-btn");
  const searchInput = document.getElementById("import-search");
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const term = (searchInput.value || "").trim().toLowerCase();
      if (!term) {
        renderImportTable();
        return;
      }
      const filtered = (importsLocal || []).filter(
        (r) =>
          String(r.id).toLowerCase().includes(term) ||
          formatDMYFromAny(r.date).includes(term)
      );
      const tbody = document.getElementById("imports-table");
      if (!tbody) return;
      tbody.innerHTML = "";
      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center">Không tìm thấy.</td></tr>`;
        return;
      }
      filtered.forEach((imp, idx) => {
        const prod =
          (JSON.parse(localStorage.getItem("products")) || products || []).find(
            (p) =>
              String(p.id) === String(imp.productId) || p.ma === imp.productId
          ) || {};
        const stock = prod.stock != null ? prod.stock : prod.quantity || 0;
        const totalMoney = Number(imp.price || 0) * Number(imp.qty || 0);
        tbody.innerHTML += `
          <tr>
            <td>${idx + 1}</td>
            <td>${imp.id}</td>
            <td>${formatDMYFromAny(imp.date)}</td>
            <td>${prod.name || imp.productName || imp.productId}</td>
            <td>${imp.qty}</td>
            <td>${stock}</td>
            <td>${imp.status || "Hoàn thành"}</td>
            <td>${Number(totalMoney).toLocaleString("vi-VN")} VND</td>
            <td>
              <button class="btn-edit" onclick="editImport('${
                imp.id
              }')">Sửa</button>
              <button class="btn-delete" onclick="deleteImport('${
                imp.id
              }')">Xóa</button>
            </td>
          </tr>
        `;
      });
    });
  }

  // initial render & populate
  populateImportProductOptions();
  renderImportTable();
}

/* -------------------------
   PROFIT BY DATE (pricing)
   ------------------------- */

/* Helper: get average import cost per unit for a product up to a date (fallback to lastImportPrice or product.avgImportCost) */
function getAvgCostForProductUpTo(productId, upToDate) {
  const importsArr =
    JSON.parse(localStorage.getItem("imports")) || importsLocal || [];
  const target = parseDateSafe(upToDate) || new Date();
  // filter imports for that product up to date (inclusive)
  const relevant = importsArr.filter(
    (r) =>
      (String(r.productId) === String(productId) ||
        r.productId === productId) &&
      parseDateSafe(r.date) &&
      parseDateSafe(r.date) <= target
  );
  if (relevant.length === 0) {
    // fallback to product.avgImportCost or lastImportPrice
    const prod =
      (JSON.parse(localStorage.getItem("products")) || products || []).find(
        (p) => String(p.id) === String(productId) || p.ma === productId
      ) || {};
    if (prod.avgImportCost) return Number(prod.avgImportCost);
    if (prod.lastImportPrice) return Number(prod.lastImportPrice);
    // if still unknown, fallback to product.price * 0.6 (assume 40% markup) — conservative fallback
    if (prod.price) return Math.round(Number(prod.price) * 0.6);
    return 0;
  }
  // compute weighted average cost
  let totalQty = 0,
    totalCost = 0;
  relevant.forEach((r) => {
    const q = Number(r.qty || 0);
    const c = Number(r.price || 0);
    totalQty += q;
    totalCost += q * c;
  });
  return totalQty ? Math.round(totalCost / totalQty) : 0;
}

/* Compute profit data for date range (inclusive)
   - orders: parsed from localStorage 'orders' (items should have price and qty)
   - cogs: for each order item, use avg import cost up to that order date
   returns: { totalRevenue, totalCOGS, totalProfit, byProduct: { productId: {name, revenue, cogs, profit, qty} } }
*/
function computeProfitForRange(fromIsoOrAny, toIsoOrAny) {
  const from = parseDateSafe(fromIsoOrAny);
  const to = parseDateSafe(toIsoOrAny);
  if (!from || !to) return null;
  // normalize begin = start of day, end = end of day
  const start = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate(),
    0,
    0,
    0
  );
  const end = new Date(
    to.getFullYear(),
    to.getMonth(),
    to.getDate(),
    23,
    59,
    59
  );

  const ordersArr = JSON.parse(localStorage.getItem("orders")) || orders || [];
  let totalRevenue = 0,
    totalCogs = 0;
  const byProduct = {}; // keyed by product id or ma

  ordersArr.forEach((o) => {
    // try to parse order date - orders may have 'date' or 'orderDate'
    const dateStr =
      o.orderDate ||
      o.date ||
      o.order_date ||
      o.createdAt ||
      o.orderAt ||
      o.timestamp ||
      o.orderTime ||
      o.order;
    const orderDate = parseDateSafe(dateStr || o.orderDate || o.date);
    if (!orderDate) return; // skip if no date
    if (orderDate < start || orderDate > end) return;
    (o.items || []).forEach((it) => {
      const pid =
        it.productId ||
        it.ma ||
        it.productId ||
        it.id ||
        it.product ||
        it.productCode;
      const name =
        it.productName ||
        it.name ||
        it.productName ||
        it.title ||
        it.product ||
        "Unknown";
      const price = Number(it.price || it.unitPrice || it.salePrice || 0);
      const qty = Number(it.qty || it.quantity || 0);
      const rev = price * qty;
      // COGS per unit: average imports up to orderDate
      const costPerUnit = getAvgCostForProductUpTo(pid, orderDate);
      const cogs = costPerUnit * qty;

      totalRevenue += rev;
      totalCogs += cogs;

      const key = String(pid);
      if (!byProduct[key])
        byProduct[key] = {
          productId: pid,
          name,
          revenue: 0,
          cogs: 0,
          profit: 0,
          qty: 0,
          costPerUnit,
        };
      byProduct[key].revenue += rev;
      byProduct[key].cogs += cogs;
      byProduct[key].qty += qty;
      byProduct[key].profit = byProduct[key].revenue - byProduct[key].cogs;
    });
  });

  const totalProfit = totalRevenue - totalCogs;
  return {
    totalRevenue,
    totalCogs,
    totalProfit,
    byProduct,
    from: start,
    to: end,
  };
}

/* Render result into pricing section - add these IDs into the HTML pricing area:
  - profit-start (input date), profit-end (input date),
  - btn-view-profit-range, btn-export-profit-csv, profit-result (div)
  We'll attach handlers in initProfitFeature()
*/
function renderProfitRangeResult(fromVal, toVal) {
  const out = document.getElementById("profit-result");
  if (!out) return;
  const data = computeProfitForRange(fromVal, toVal);
  if (!data) {
    out.innerHTML = `<div class="small">Ngày không hợp lệ.</div>`;
    return;
  }

  // If no transactions
  if (Object.keys(data.byProduct).length === 0) {
    out.innerHTML = `<div class="small">Không có giao dịch trong khoảng ${formatDMYFromAny(
      fromVal
    )} → ${formatDMYFromAny(toVal)}.</div>`;
    return;
  }

  let html = `<h4>Kết quả từ ${formatDMYFromAny(fromVal)} → ${formatDMYFromAny(
    toVal
  )}</h4>`;
  html += `<div><strong>Doanh thu:</strong> ${Number(
    data.totalRevenue
  ).toLocaleString("vi-VN")} VND</div>`;
  html += `<div><strong>Giá vốn (COGS):</strong> ${Number(
    data.totalCogs
  ).toLocaleString("vi-VN")} VND</div>`;
  html += `<div><strong>Lợi nhuận:</strong> ${Number(
    data.totalProfit
  ).toLocaleString("vi-VN")} VND</div>`;

  html += `<hr><table style="width:100%;"><thead><tr><th>Mã/SP</th><th>Tên</th><th>SL bán</th><th>Doanh thu</th><th>Giá vốn</th><th>Lợi nhuận</th></tr></thead><tbody>`;
  Object.values(data.byProduct).forEach((p) => {
    html += `<tr>
      <td>${p.productId}</td>
      <td>${p.name}</td>
      <td>${p.qty}</td>
      <td>${Number(p.revenue).toLocaleString("vi-VN")}</td>
      <td>${Number(p.cogs).toLocaleString("vi-VN")}</td>
      <td>${Number(p.profit).toLocaleString("vi-VN")}</td>
    </tr>`;
  });
  html += `</tbody></table>`;
  out.innerHTML = html;
}

/* Export CSV for the range: produce rows for overall and per product */
function exportProfitRangeCSV(fromVal, toVal) {
  const data = computeProfitForRange(fromVal, toVal);
  if (!data) return alert("Không thể tạo CSV (ngày không hợp lệ).");
  if (Object.keys(data.byProduct).length === 0)
    return alert("Không có giao dịch để export.");

  let csv = "Type,ProductId,ProductName,Quantity,Revenue,COGS,Profit\n";
  csv += `Summary,ALL,ALL,${Object.values(data.byProduct).reduce(
    (s, p) => s + p.qty,
    0
  )},${data.totalRevenue},${data.totalCogs},${data.totalProfit}\n`;
  Object.values(data.byProduct).forEach((p) => {
    csv += `Product,${p.productId},"${(p.name || "").replace(/"/g, '""')}",${
      p.qty
    },${p.revenue},${p.cogs},${p.profit}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  const fname = `profit_${formatDMYFromAny(fromVal).replace(
    /\//g,
    "-"
  )}_to_${formatDMYFromAny(toVal).replace(/\//g, "-")}.csv`;
  link.setAttribute("download", fname);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* Init UI: attach to elements in pricing area */
function initProfitFeature() {
  // create UI inside pricing section if not present
  const pricingSection = document.getElementById("pricing");
  if (!pricingSection) return;

  // ensure container for profit UI exists (insert at top)
  if (!document.getElementById("profit-range-container")) {
    const container = document.createElement("div");
    container.id = "profit-range-container";
    container.className = "card";
    container.style.margin = "12px 0";
    container.innerHTML = `
      <h4>Lợi nhuận theo khoảng ngày</h4>
      <div style="display:flex;gap:8px;align-items:center;">
        <div>
          <div class="small">From:</div>
          <input type="date" id="profit-start">
          <div class="small" id="profit-start-label" style="color:#66788a"></div>
        </div>
        <div>
          <div class="small">To:</div>
          <input type="date" id="profit-end">
          <div class="small" id="profit-end-label" style="color:#66788a"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <button id="btn-view-profit-range" class="btn primary" style="height:38px;">Xem</button>
          <button id="btn-export-profit-csv" class="btn" style="height:38px;">Export CSV</button>
        </div>
      </div>
      <div id="profit-result" style="margin-top:12px;"></div>
    `;
    // insert at top of pricing section
    pricingSection.insertBefore(container, pricingSection.firstChild);
  }

  const startInput = document.getElementById("profit-start");
  const endInput = document.getElementById("profit-end");
  const btnView = document.getElementById("btn-view-profit-range");
  const btnExport = document.getElementById("btn-export-profit-csv");

  // default to last 7 days
  const today = new Date();
  const toIso = today.toISOString().slice(0, 10);
  const last7 = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 6
  );
  const fromIso = last7.toISOString().slice(0, 10);
  startInput.value = startInput.value || fromIso;
  endInput.value = endInput.value || toIso;

  // show dd/mm label below date (for user clarity)
  function updateLabels() {
    document.getElementById("profit-start-label").textContent = startInput.value
      ? `Hiển thị: ${formatDMYFromAny(startInput.value)}`
      : "";
    document.getElementById("profit-end-label").textContent = endInput.value
      ? `Hiển thị: ${formatDMYFromAny(endInput.value)}`
      : "";
  }
  startInput.addEventListener("change", updateLabels);
  endInput.addEventListener("change", updateLabels);
  updateLabels();

  btnView.addEventListener("click", () => {
    if (!startInput.value || !endInput.value)
      return alert("Vui lòng chọn cả From và To.");
    renderProfitRangeResult(startInput.value, endInput.value);
  });
  btnExport.addEventListener("click", () => {
    if (!startInput.value || !endInput.value)
      return alert("Vui lòng chọn cả From và To.");
    exportProfitRangeCSV(startInput.value, endInput.value);
  });

  // initial render
  renderProfitRangeResult(startInput.value, endInput.value);
}

/* -------------------------
   Hook into DOMContentLoaded
   ------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // ensure imports data & UI ready
  try {
    initImportsFeature();
  } catch (e) {
    console.warn("initImportsFeature error", e);
  }

  try {
    initProfitFeature();
  } catch (e) {
    console.warn("initProfitFeature error", e);
  }

  // also ensure product options for imports are fresh whenever products change
  // (if you have functions that add products, call populateImportProductOptions() afterwards)
});

// Đảm bảo dữ liệu sản phẩm và phiếu nhập có trong localStorage
let productsData = JSON.parse(localStorage.getItem("products")) || [];
let phieuNhapData = JSON.parse(localStorage.getItem("phieuNhap")) || [];
let phieuXuatData = JSON.parse(localStorage.getItem("phieuXuat")) || []; // nếu bạn có phiếu xuất

// ==============================
// 1️⃣ Tra cứu tồn của 1 sản phẩm hoặc theo danh mục
// ==============================
function traCuuTon() {
  const productId = document.getElementById("stock-product").value;
  const category = document.getElementById("stock-category").value;
  const resultDiv = document.getElementById("inventory-result");

  let list = productsData;

  if (productId) list = list.filter((p) => p.id == productId);
  else if (category) list = list.filter((p) => p.category === category);

  if (list.length === 0) {
    resultDiv.innerHTML = "<div>Không tìm thấy sản phẩm phù hợp</div>";
    return;
  }

  resultDiv.innerHTML = list
    .map(
      (p) =>
        `<div>${p.name} (${p.category}) — <b>${p.stock}</b> sản phẩm tồn</div>`
    )
    .join("");
}
// ==============================
// 🔹 9. Quản lý cảnh báo tồn kho (nâng cao)
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const checkStockBtn = document.getElementById("check-stock");
  const thresholdInput = document.getElementById("stock-threshold");
  const resultDiv = document.getElementById("inventory-result");

  if (!checkStockBtn || !thresholdInput || !resultDiv) return;

  checkStockBtn.addEventListener("click", () => {
    const threshold = parseInt(thresholdInput.value.trim());
    if (isNaN(threshold) || threshold < 0) {
      alert("⚠️ Vui lòng nhập ngưỡng cảnh báo hợp lệ (ví dụ: 5)");
      return;
    }

    const products = JSON.parse(localStorage.getItem("products")) || [];

    if (products.length === 0) {
      resultDiv.innerHTML = `<div style="color:gray">❌ Chưa có dữ liệu sản phẩm.</div>`;
      return;
    }

    let html = `<h4>📦 Kết quả kiểm tra tồn kho:</h4><ul style="list-style:none;padding-left:0;">`;
    let alertCount = 0;

    products.forEach((p) => {
      const stock = Number(p.stock ?? 0);
      let status = "";
      let color = "";

      if (stock === 0) {
        status = "🔴 <b>Hết hàng – cần nhập gấp!</b>";
        color = "red";
        alertCount++;
      } else if (stock <= threshold) {
        status = "🟠 <b>Sắp hết – nên nhập thêm</b>";
        color = "orange";
        alertCount++;
      } else {
        status = "🟢 Còn đủ hàng";
        color = "green";
      }

      html += `
        <li style="margin:6px 0; color:${color}">
          <b>${
            p.name || "Không tên"
          }</b> — còn <b>${stock}</b> sản phẩm → ${status}
        </li>`;
    });

    html += `</ul>`;

    if (alertCount === 0) {
      html += `<div style="margin-top:10px;color:green;">✅ Tất cả sản phẩm đều trên ngưỡng cảnh báo (${threshold})</div>`;
    }

    resultDiv.innerHTML = html;
  });
});

// ==============================
// 🔹 Đồng bộ danh mục & sản phẩm vào phần tồn kho
// ==============================

function populateInventoryFilters() {
  const catSelect = document.getElementById("stock-category");
  const prodSelect = document.getElementById("stock-product");

  if (!catSelect || !prodSelect) return; // kiểm tra an toàn

  // Đọc dữ liệu mới nhất
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  const products = JSON.parse(localStorage.getItem("products")) || [];

  // Làm mới danh mục
  catSelect.innerHTML = `<option value="">-- Tất cả danh mục --</option>`;
  categories.forEach((c) => {
    catSelect.innerHTML += `<option value="${c}">${c}</option>`;
  });

  // Làm mới danh sách sản phẩm
  prodSelect.innerHTML = `<option value="">-- Chọn sản phẩm --</option>`;
  products.forEach((p) => {
    prodSelect.innerHTML += `<option value="${p.id}">${p.name} (${p.ma})</option>`;
  });
}

// Gọi hàm mỗi khi trang load
window.addEventListener("DOMContentLoaded", populateInventoryFilters);

// Gọi lại mỗi khi danh mục hoặc sản phẩm thay đổi
// (ví dụ sau khi thêm danh mục hoặc thêm sản phẩm)
if (typeof renderCategories === "function") {
  const oldRenderCategories = renderCategories;
  renderCategories = function (...args) {
    oldRenderCategories(...args);
    populateInventoryFilters(); // đồng bộ lại tồn kho
  };
}

if (typeof renderProducts === "function") {
  const oldRenderProducts = renderProducts;
  renderProducts = function (...args) {
    oldRenderProducts(...args);
    populateInventoryFilters(); // đồng bộ lại tồn kho
  };
}

// ==============================
// 4️⃣ Gắn sự kiện cho các nút
// ==============================
document
  .getElementById("btn-check-stock")
  ?.addEventListener("click", traCuuTon);
document
  .getElementById("btn-stock-warning")
  ?.addEventListener("click", canhBaoHetHang);
document
  .getElementById("btn-stock-stats")
  ?.addEventListener("click", thongKeNhapXuatTon);

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

// ====== PHIẾU NHẬP HÀNG - TƯƠNG THÍCH VỚI HTML (id: import-*) ======
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
