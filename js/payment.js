document.addEventListener("DOMContentLoaded", () => {
  // ===== SELECTOR =====
  const paymentPage = document.querySelector(".payment");
  const paymentBackBtn = paymentPage?.querySelector(".back-btn");
  const payBtn = paymentPage?.querySelector(".submit-btn");
  const savedInfo = document.getElementById("saved-address-info");
  const newForm = document.getElementById("new-address-form");
  const termsCheckbox = document.getElementById("terms");

  // ===== MỞ / ĐÓNG THANH TOÁN =====
  const openPayment = () => {
    if (!paymentPage) return;
    paymentPage.style.display = "block";
    document.body.style.overflow = "hidden";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const closePayment = () => {
    paymentPage.style.display = "none";
    document.body.style.overflow = "auto";
    if (typeof updateMiniCart === "function") updateMiniCart();
    if (typeof updateCartDetail === "function") updateCartDetail();
  };
  paymentBackBtn?.addEventListener("click", closePayment);

  // ===== GIỎ HÀNG THEO USER =====
  const loadCart = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return [];
    return JSON.parse(localStorage.getItem("cart_" + user.email)) || [];
  };
  const saveCart = (cart) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    localStorage.setItem("cart_" + user.email, JSON.stringify(cart));
  };

  // ===== QUẢN LÝ ĐỊA CHỈ =====
  const loadSavedAddress = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return null;
    return JSON.parse(localStorage.getItem("address_" + user.email)) || null;
  };
  const saveAddress = (address) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    localStorage.setItem("address_" + user.email, JSON.stringify(address));
  };

  // ===== TOGGLE FORM ĐỊA CHỈ =====
  function toggleAddressForm() {
    const savedRadio = document.getElementById("saved-address");
    const newRadio = document.getElementById("new-address");
    if (!savedRadio || !newRadio) return;

    if (savedRadio.checked) {
      const user = JSON.parse(localStorage.getItem("user"));
      const address = loadSavedAddress();
      if (savedInfo) {
        const nameEl = savedInfo.querySelector(
          ".saved-info-box p:nth-child(1) strong"
        );
        const phoneEl = savedInfo.querySelector(
          ".saved-info-box p:nth-child(2)"
        );
        const emailEl = savedInfo.querySelector(
          ".saved-info-box p:nth-child(3)"
        );
        const addressEl = savedInfo.querySelector(
          ".saved-info-box p:nth-child(4)"
        );

        // Lấy tên từ address nếu có, không thì lấy từ user
        if (nameEl)
          nameEl.textContent =
            address?.name || user?.username || "Chưa cập nhật";
        if (phoneEl)
          phoneEl.textContent =
            "Số điện thoại: " + (address?.phone || "Chưa cập nhật");
        // Email LUÔN lấy từ user đang đăng nhập
        if (emailEl)
          emailEl.textContent = "Email: " + (user?.email || "Chưa cập nhật");
        if (addressEl)
          addressEl.textContent =
            "Địa chỉ: " +
            (address?.address || address?.detail || "Chưa cập nhật");
      }
      savedInfo.style.display = "block";
      newForm.style.display = "none";
    } else {
      savedInfo.style.display = "none";
      newForm.style.display = "block";
    }
  }

  // ===== CẬP NHẬT TỔNG TIỀN =====
  const updateTotal = () => {
    const items = document.querySelectorAll(".payment-item");
    let total = 0;
    items.forEach((item) => {
      const price = parseInt(
        item.querySelector(".item-price")?.dataset.price || "0"
      );
      const qty = parseInt(item.querySelector(".qty-input")?.value) || 1;
      total += price * qty;
    });
    const totalAmount = document.querySelector(".total-amount");
    if (totalAmount)
      totalAmount.textContent = total.toLocaleString("vi-VN") + "₫";
  };

  // ===== HIỂN THỊ SẢN PHẨM THANH TOÁN =====
  const displayPaymentItems = (items) => {
    const table = document.querySelector(".payment-table");
    if (!table) return;
    table.querySelectorAll(".payment-item").forEach((el) => el.remove());
    items.forEach((item) => {
      const priceValue =
        parseInt(item.price.toString().replace(/[^\d]/g, "")) || 0;
      const div = document.createElement("div");
      div.className = "payment-item";
      div.dataset.id = item.id || item.name + "-" + item.size;
      div.innerHTML = `
        <div class="item-image"><img src="${item.img}" alt="${item.name}"></div>
        <div class="item-info">
          <h3>${item.name}</h3>
          <p class="item-size">Kích thước: <strong>${
            item.size || ""
          }</strong></p>
        </div>
        <div class="quantity-control">
          <input type="text" class="qty-input" value="${item.qty}" min="1">
        </div>
        <div class="item-price" data-price="${priceValue}">${priceValue.toLocaleString(
        "vi-VN"
      )}₫</div>
        <div class="item-close"><button class="close-btn">Xóa</button></div>
      `;
      table.insertBefore(div, table.querySelector(".payment-total"));
    });
    updateTotal();
  };

  // ===== MỞ THANH TOÁN TỪ CART =====
  const bindPaymentButtons = () => {
    document.querySelectorAll(".btn-pay, .checkout-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user)
          return alert("Vui lòng đăng nhập để thực hiện hành động này!!");
        const cartItems = loadCart();
        if (!cartItems.length) return alert("Giỏ hàng trống!");
        displayPaymentItems(cartItems);
        toggleAddressForm();
        openPayment();
      });
    });
  };
  bindPaymentButtons();

  // ===== MUA NGAY =====
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("buy-now")) return;
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Vui lòng đăng nhập để thực hiện hành động này!!");
    const product = e.target.closest(".product-detail");
    if (!product) return;
    const priceText =
      product.querySelector(".price-current")?.textContent || "0";
    const item = [
      {
        id: Date.now(),
        name: product.querySelector(".product-name")?.textContent || "",
        price: priceText,
        img: product.querySelector("img")?.src || "",
        qty: parseInt(product.querySelector(".quantity")?.value) || 1,
        size: product.querySelector(".size")?.value || "",
      },
    ];
    displayPaymentItems(item);
    toggleAddressForm();
    product.style.display = "none";
    openPayment();
  });

  // ===== XOÁ SẢN PHẨM =====
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("close-btn")) return;
    const itemDiv = e.target.closest(".payment-item");
    const id = itemDiv.dataset.id;
    let cart = loadCart();
    cart = cart.filter(
      (item) => (item.id || item.name + "-" + item.size) != id
    );
    saveCart(cart);
    itemDiv.remove();
    updateTotal();
  });

  // ===== CẬP NHẬT SỐ LƯỢNG =====
  document.addEventListener("input", (e) => {
    if (e.target.classList.contains("qty-input")) updateTotal();
  });

  // ===== THANH TOÁN =====
  payBtn?.addEventListener("click", () => {
    if (!termsCheckbox.checked)
      return alert("Vui lòng đồng ý điều kiện giao dịch.");
    const items = document.querySelectorAll(".payment-item");
    if (!items.length) return alert("Không có sản phẩm để thanh toán.");

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Vui lòng đăng nhập để thực hiện hành động này!!");

    const savedRadio = document.getElementById("saved-address");
    const newRadio = document.getElementById("new-address");

    if (savedRadio.checked) {
      const address = loadSavedAddress();
      if (!address || !address.name || !address.phone || !address.address) {
        return alert(
          "Vui lòng cập nhật đầy đủ thông tin địa chỉ trong tài khoản trước khi thanh toán!"
        );
      }
    }

    if (newRadio.checked) {
      const name = newForm.querySelector('input[name="name"]').value.trim();
      const phone = newForm.querySelector('input[name="phone"]').value.trim();
      const email = newForm.querySelector('input[name="email"]').value.trim();
      const detail = newForm.querySelector('input[name="detail"]').value.trim();
      const note = newForm.querySelector("textarea")?.value.trim() || "";

      if (!name || !phone || !detail)
        return alert("Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ!");
      const newAddress = { name, phone, email, address: detail, note };
      saveAddress(newAddress); // Lưu vào localStorage
    }

    // ===== TẠO ĐƠN HÀNG CHO ADMIN =====
    const orderId = "o" + Date.now();
    const orderItems = Array.from(
      document.querySelectorAll(".payment-item")
    ).map((item) => ({
      id: item.dataset.id,
      name: item.querySelector(".item-info h3").textContent,
      size: item.querySelector(".item-size strong")?.textContent || "",
      qty: parseInt(item.querySelector(".qty-input")?.value) || 1,
      price: parseInt(item.querySelector(".item-price").dataset.price || "0"),
    }));
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );

    // Lấy địa chỉ từ saved hoặc mới
    let addressData;
    if (document.getElementById("saved-address").checked) {
      addressData =
        JSON.parse(localStorage.getItem("address_" + user.email)) || {};
    } else {
      const name = document
        .querySelector('#new-address-form input[name="name"]')
        .value.trim();
      const phone = document
        .querySelector('#new-address-form input[name="phone"]')
        .value.trim();
      const emailInput = document
        .querySelector('#new-address-form input[name="email"]')
        .value.trim();
      const detail = document
        .querySelector('#new-address-form input[name="detail"]')
        .value.trim();
      const note =
        document.querySelector("#new-address-form textarea")?.value.trim() ||
        "";
      addressData = { name, phone, email: emailInput, address: detail, note };
      localStorage.setItem(
        "address_" + user.email,
        JSON.stringify(addressData)
      );
    }

    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push({
      id: orderId,
      customerName: user.name,
      email: user.email,
      date: new Date().toLocaleString(),
      items: orderItems,
      total: totalAmount,
      status: "new",
      address: addressData, // Lưu địa chỉ vào đơn hàng
    });
    localStorage.setItem("orders", JSON.stringify(orders));

    // ===============================================

    saveCart([]); // Xóa giỏ hàng
    if (typeof updateMiniCart === "function") updateMiniCart();
    if (typeof updateCartDetail === "function") updateCartDetail();

    alert("Thanh toán thành công! Cảm ơn bạn đã mua hàng tại StepLab");
    closePayment();
    updateTotal();
  });

  // ===== HIỂN THỊ FORM ĐỊA CHỈ KHI LOAD =====
  const cart = loadCart();
  const savedRadio = document.getElementById("saved-address");
  const newRadio = document.getElementById("new-address");
  if (!cart.length) {
    savedInfo.style.display = "none";
    newForm.style.display = "block";
  } else {
    const address = loadSavedAddress();
    if (address && savedRadio) savedRadio.checked = true;
    else if (newRadio) newRadio.checked = true;
    toggleAddressForm();
  }

  savedRadio?.addEventListener("change", toggleAddressForm);
  newRadio?.addEventListener("change", toggleAddressForm);
});
