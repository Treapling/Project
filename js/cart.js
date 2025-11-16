// ================== GIỎ HÀNG ==================
const cartIcon = document.querySelector(".fa-cart-shopping");
const cartBox = document.querySelector(".header-cart-list");
const cartIconNotice = document.querySelector(".icon-notice");
const cartText = document.querySelector("#action-btn");
const totalLabel = document.querySelector(".cart-total label");
const noCartImg = document.querySelector(".header-no-cart-img");
const noCartMsg = document.querySelector(".header-no-cart-msg");

const cartDetail = document.querySelector(".cart-detail");
const cartDetailTableBody = document.querySelector(".cart-detail-table tbody");
const cartDetailTotalPrice = document.querySelector(".cart-detail-total-price");
const btnViewCart = document.querySelector(".btn-view");
const btnBackCart = document.querySelector(".back-btn");

// --- LẤY / LƯU GIỎ HÀNG THEO USER ---
function getCart() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return [];
  return JSON.parse(localStorage.getItem("cart_" + user.email)) || [];
}

function saveCart(cart) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;
  localStorage.setItem("cart_" + user.email, JSON.stringify(cart));
}

// ================== CẬP NHẬT MINI CART ==================
function updateMiniCart() {
  const cart = getCart();
  cartBox.querySelectorAll(".header-cart-list-item").forEach((e) => e.remove());

  if (cart.length === 0) {
    cartIconNotice.textContent = 0;
    noCartImg.style.display = "block";
    noCartMsg.style.display = "block";
    totalLabel.textContent = "0₫";
    return;
  }

  let total = 0;
  cartIconNotice.textContent = cart.length;
  noCartImg.style.display = "none";
  noCartMsg.style.display = "none";

  cart.forEach((item, idx) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    const div = document.createElement("div");
    div.className = "header-cart-list-item";
    div.innerHTML = `
                <img src="${item.img}" class="header-cart-list-img">
                <div class="header-cart-info">
                    <p class="header-cart-name">${item.name}</p>
                    <p class="header-cart-size">Size: ${item.size}</p>
                    <div class="header-cart-price">
                        <input type="text" value="${
                          item.qty
                        }" min="1" class="header-cart-qty" data-index="${idx}">
                        <span class="header-cart-item-price" data-price="${itemTotal}">${itemTotal.toLocaleString(
      "vi-VN"
    )}₫</span>
                    </div>
                </div>
                <span class="header-cart-remove" data-index="${idx}">×</span>
            `;
    cartBox.insertBefore(div, cartBox.querySelector(".cart-total"));
  });

  totalLabel.textContent = total.toLocaleString("vi-VN") + "₫";
  bindMiniCartEvents();
}

// ================== CẬP NHẬT CART DETAIL ==================
function updateCartDetail() {
  const cart = getCart();
  cartDetailTableBody.innerHTML = "";
  let total = 0;

  cart.forEach((item, idx) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
                <td><button class="cart-detail-remove-btn" data-index="${idx}">×</button></td>
                <td><img src="${item.img}" alt="${
      item.name
    }" class="cart-detail-product-img"></td>
                <td><div class="cart-detail-product-name">${
                  item.name
                }</div></td>
                <td class="cart-detail-price" data-price="${
                  item.price
                }">${item.price.toLocaleString("vi-VN")}₫</td>
                <td class="cart-detail-quantity"><input type="text" min="1" value="${
                  item.qty
                }" data-index="${idx}"></td>
                <td class="cart-detail-price" data-price="${itemTotal}">${itemTotal.toLocaleString(
      "vi-VN"
    )}₫</td>
            `;
    cartDetailTableBody.appendChild(tr);
  });

  cartDetailTotalPrice.textContent = total.toLocaleString("vi-VN") + "₫";
  bindCartDetailEvents();
}

// ================== MINI CART EVENTS ==================
function bindMiniCartEvents() {
  document.querySelectorAll(".header-cart-remove").forEach((btn) => {
    btn.onclick = () => {
      const cart = getCart();
      cart.splice(btn.dataset.index, 1);
      saveCart(cart);
      updateMiniCart();
      updateCartDetail();
    };
  });

  document.querySelectorAll(".header-cart-qty").forEach((input) => {
    input.onchange = () => {
      const cart = getCart();
      const idx = input.dataset.index;
      const val = parseInt(input.value);
      if (val > 0) {
        cart[idx].qty = val;
        saveCart(cart);
        updateMiniCart();
        updateCartDetail();
      }
    };
  });
}

// ================== CART DETAIL EVENTS ==================
function bindCartDetailEvents() {
  document.querySelectorAll(".cart-detail-remove-btn").forEach((btn) => {
    btn.onclick = () => {
      const cart = getCart();
      const idx = btn.dataset.index;

      if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        cart.splice(idx, 1);
        saveCart(cart);
        updateMiniCart();
        updateCartDetail();
      }
    };
  });

  document.querySelectorAll(".cart-detail-quantity input").forEach((input) => {
    input.onchange = () => {
      const cart = getCart();
      const idx = input.dataset.index;
      const val = parseInt(input.value);
      if (val > 0) {
        cart[idx].qty = val;
        saveCart(cart);
        updateMiniCart();
        updateCartDetail();
      }
    };
  });
}

// ================== THÊM SẢN PHẨM VÀO GIỎ ==================
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-cart")) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Vui lòng đăng nhập để thực hiện hành động này!!");

    const container = e.target.closest(".product-detail");
    const name = container.querySelector(".product-name").textContent.trim();
    const img = container.querySelector("img").src;
    const size = container.querySelector(".size").value;
    const qty = parseInt(container.querySelector(".quantity").value);
    const price = parseInt(
      container
        .querySelector(".price-current")
        .textContent.replace(/[^\d]/g, "")
    );

    const cart = getCart();
    const existing = cart.find((p) => p.name === name && p.size === size);
    if (existing) existing.qty += qty;
    else cart.push({ name, img, size, qty, price });

    saveCart(cart);
    updateMiniCart();
    updateCartDetail();
    alert("Đã thêm vào giỏ hàng!");
  }
});

// ================== HIỂN THỊ / ẨN GIỎ HÀNG MINI ==================
[cartIcon, cartIconNotice, cartText].forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Vui lòng đăng nhập để thực hiện hành động này!!");
    cartBox.style.display =
      cartBox.style.display === "block" ? "none" : "block";
  });
});

// ================== HIỂN THỊ / ẨN CART DETAIL ==================
btnViewCart.addEventListener("click", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Vui lòng đăng nhập để thực hiện hành động này!!");
  cartDetail.style.display = "block";
  document.body.classList.add("no-scroll");
});
btnBackCart.addEventListener("click", () => {
  cartDetail.style.display = "none";
  document.body.classList.remove("no-scroll");
});

// Ẩn mini cart khi click ra ngoài
document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".header-cart") &&
    !e.target.closest(".fa-cart-shopping") &&
    !e.target.closest(".icon-notice") &&
    !e.target.closest("#action-btn") &&
    !e.target.classList.contains("header-cart-remove")
  ) {
    cartBox.style.display = "none";
  }
});

// ================== LOAD TRANG ==================
document.addEventListener("DOMContentLoaded", () => {
  updateMiniCart();
  updateCartDetail();
});
