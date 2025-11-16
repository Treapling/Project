// ================== QUẢN LÝ TÀI KHOẢN ==================
const loginForm = document.getElementById("login");
const registerForm = document.getElementById("register");
const customerInfo = document.getElementById("customer-info");
const loginBtn = document.querySelectorAll(".action .btn")[0];
const registerBtn = document.querySelectorAll(".action .btn")[1];
const userIcon = document.querySelector(".action .icon");
const userNameDisplay = document.getElementById("user-name");
const containerLoginRegister = document.querySelectorAll(
  ".container-login-register"
);

// --- Hàm tạo ID ngẫu nhiên (giống admin) ---
function uid(prefix = "id") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

// --- Hiển thị / Ẩn form ---
function showLoginForm() {
  loginForm.style.display = "block";
  registerForm.style.display = "none";
  customerInfo.style.display = "none";
}
function showRegisterForm() {
  registerForm.style.display = "block";
  loginForm.style.display = "none";
  customerInfo.style.display = "none";
}
function hideAllForms() {
  [loginForm, registerForm, customerInfo].forEach(
    (f) => (f.style.display = "none")
  );
}

// --- Sự kiện click ---
loginBtn.onclick = (e) => {
  e.preventDefault();
  showLoginForm();
};
registerBtn.onclick = (e) => {
  e.preventDefault();
  showRegisterForm();
};

userIcon.onclick = (e) => {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.name) showCustomerInfo(user);
  else showLoginForm();
};

// --- Link chuyển form ---
document.querySelector("#login-form p a").onclick = (e) => {
  e.preventDefault();
  showRegisterForm();
};
document.querySelector("#register-form p a").onclick = (e) => {
  e.preventDefault();
  showLoginForm();
};

// --- Click ra ngoài form ---
containerLoginRegister.forEach(
  (c) =>
    (c.onclick = (e) => {
      if (e.target === c) hideAllForms();
    })
);

// --- Đăng ký ---
const formRegister = document.getElementById("form-2");
formRegister.onsubmit = (e) => {
  e.preventDefault();
  const { username, email, password } = formRegister;
  if (!username.value.trim() || !email.value.trim() || !password.value.trim())
    return alert("Vui lòng điền đầy đủ thông tin!");

  // ĐỌC TỪ 'users' (dùng chung với admin)
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Kiểm tra email đã tồn tại
  if (users.some((c) => c.email === email.value.trim()))
    return alert("Email này đã được sử dụng!");

  // Thêm user mới với cấu trúc giống admin
  const newUser = {
    id: uid("u"),
    name: username.value.trim(),
    email: email.value.trim(),
    password: password.value.trim(),
    locked: false,
  };
  users.push(newUser);

  // LƯU VÀO 'users' (dùng chung với admin)
  localStorage.setItem("users", JSON.stringify(users));

  // XÓA 'customers' cũ nếu còn tồn tại (để tránh xung đột)
  localStorage.removeItem("customers");

  alert("Đăng ký thành công!");
  formRegister.reset();
  showLoginForm();
};

// --- Đăng nhập ---
const formLogin = document.getElementById("form-1");
formLogin.onsubmit = (e) => {
  e.preventDefault();
  const { email, password } = formLogin;

  // ĐỌC TỪ 'users' (dùng chung với admin)
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(
    (c) =>
      c.email === email.value.trim() && c.password === password.value.trim()
  );

  if (!user) return alert("Email hoặc mật khẩu không chính xác!");

  if (user.status === "Khóa")
    return alert("Tài khoản đã bị khóa! Liên hệ admin.");

  localStorage.setItem("user", JSON.stringify(user));
  alert("Đăng nhập thành công!");
  hideAllForms();
  showUserName(user.name);
  formLogin.reset();

  // --- CẬP NHẬT GIỎ HÀNG NGAY SAU ĐĂNG NHẬP ---
  if (typeof updateMiniCart === "function") updateMiniCart();
  if (typeof updateCartDetail === "function") updateCartDetail();
};

// --- Hiển thị tên người dùng ---
function showUserName(name) {
  loginBtn.style.display = "none";
  registerBtn.style.display = "none";
  userIcon.style.display = "inline-block";
  userNameDisplay.textContent = name;
  userNameDisplay.style.display = "inline-block";
}

// --- Thông tin người dùng ---
userNameDisplay.onclick = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) showCustomerInfo(user);
};
function showCustomerInfo(user) {
  ["info-name", "info-email", "info-password"].forEach((id, i) => {
    const fields = [user.name, user.email, user.password];
    document.getElementById(id).value = fields[i];
  });
  customerInfo.style.display = "block";
  loginForm.style.display = registerForm.style.display = "none";
}

// --- Nút Sửa / Lưu / Đăng xuất ---
document.getElementById("edit-btn").onclick = () => {
  ["info-name", "info-email", "info-password"].forEach(
    (id) => (document.getElementById(id).disabled = false)
  );
};

document.getElementById("save-btn").onclick = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const oldEmail = currentUser.email;
  const updatedUser = {
    id: currentUser.id, // Giữ nguyên ID
    name: document.getElementById("info-name").value,
    email: document.getElementById("info-email").value,
    password: document.getElementById("info-password").value,
    locked: currentUser.locked || false, // Giữ nguyên trạng thái locked
  };
  // 1. Cập nhật user hiện tại
  localStorage.setItem("user", JSON.stringify(updatedUser));
  // 2. Cập nhật luôn trong danh sách users (dùng chung với admin)
  let users = JSON.parse(localStorage.getItem("users")) || [];
  const index = users.findIndex(
    (c) => c.id === updatedUser.id || c.email === oldEmail
  );
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem("users", JSON.stringify(users));
  }
  // 3. Thông báo và disable input
  alert("Cập nhật thông tin thành công!");
  ["info-name", "info-email", "info-password"].forEach(
    (id) => (document.getElementById(id).disabled = true)
  );
  // 4. Cập nhật hiển thị tên
  showUserName(updatedUser.name);
};

document.getElementById("logout-btn").onclick = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  // 1. Xóa user
  localStorage.removeItem("user");
  // 2. Xóa giỏ hàng của user này
  if (user && user.email) {
    localStorage.removeItem("cart_" + user.email);
  }
  localStorage.removeItem("cart"); // Xóa cả cart cũ nếu có
  if (typeof updateMiniCart === "function") updateMiniCart();
  if (typeof updateCartDetail === "function") updateCartDetail();
  // 3. Ẩn tất cả form
  hideAllForms();
  // 4. Reset hiển thị login/register
  [loginBtn, registerBtn, userIcon].forEach(
    (b) => (b.style.display = "inline-block")
  );
  userNameDisplay.style.display = "none";
  // 5. Reset về trang chủ
  showHome();
  // 6. Reset tìm kiếm
  const searchInput = document.getElementById("basic-search");
  if (searchInput) searchInput.value = "";
  // 7. Reset tất cả checkbox / radio
  document
    .querySelectorAll(
      '.category input[type="checkbox"], .category input[type="radio"]'
    )
    .forEach((i) => (i.checked = false));
  // 8. Reset phân trang
  if (typeof window.resetPagination === "function") {
    setTimeout(() => {
      window.resetPagination();
    }, 50);
  }
  // 9. Reset slider về slide đầu
  index = 0;
  showSlide(index);

  alert("Bạn đã đăng xuất!");
};

// --- Hỗ trợ: đăng xuất cưỡng bức khi tài khoản bị khóa từ tab/phiên khác ---
function performForcedLogout(message) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.email) {
    localStorage.removeItem("user");
    localStorage.removeItem("cart_" + user.email);
  } else {
    localStorage.removeItem("user");
  }
  localStorage.removeItem("cart");
  if (typeof updateMiniCart === "function") updateMiniCart();
  if (typeof updateCartDetail === "function") updateCartDetail();
  hideAllForms();
  [loginBtn, registerBtn, userIcon].forEach(
    (b) => (b.style.display = "inline-block")
  );
  userNameDisplay.style.display = "none";
  showHome();
  const searchInput = document.getElementById("basic-search");
  if (searchInput) searchInput.value = "";
  document
    .querySelectorAll(
      '.category input[type="checkbox"], .category input[type="radio"]'
    )
    .forEach((i) => (i.checked = false));
  if (typeof window.resetPagination === "function") {
    setTimeout(() => {
      window.resetPagination();
    }, 50);
  }
  index = 0;
  showSlide(index);
  if (message) alert(message);
}

// Lắng nghe thay đổi 'users' trên localStorage từ các tab khác để xử lý khóa tài khoản ngay lập tức
window.addEventListener("storage", (e) => {
  if (!e.key) return;
  if (e.key === "users") {
    try {
      const users = JSON.parse(e.newValue) || [];
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;
      const current = users.find(
        (u) => u.id === user.id || u.email === user.email
      );
      // Nếu user không còn trong danh sách users => đã bị xóa
      if (!current) {
        performForcedLogout(
          "Tài khoản hiện tại của bạn đã bị xóa bởi Admin, vui lòng liên hệ để biết thêm chi tiết."
        );
        showLoginForm();
        return;
      }
      // Nếu user vẫn tồn tại nhưng bị đánh dấu locked
      if (current && current.locked) {
        performForcedLogout("Tài khoản của bạn đã bị khóa bởi quản trị viên!");
        showLoginForm();
      }
    } catch (err) {
      // ignore parse errors
    }
  }
});

// --- Giữ trạng thái khi reload ---
window.onload = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    // Kiểm tra xem tài khoản có bị khóa không
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = users.find(
      (u) => u.id === user.id || u.email === user.email
    );
    if (currentUser && currentUser.locked) {
      // Nếu bị khóa, tự động đăng xuất
      localStorage.removeItem("user");
      alert("Tài khoản của bạn đã bị khóa!");
      showLoginForm();
    } else {
      showUserName(user.name);
    }
  }
};

// // ================== MENU MOBILE ==================
// const navBars = document.querySelector('.nav_bars a');
// const nav = document.querySelector('.nav');
// navBars.onclick = e => {
//     e.preventDefault();
//     nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
// };

// ================== HEADER NAV ==================
const homeLink = document.getElementById("home-link");
const productLink = document.getElementById("product-link");
const containerLeft = document.querySelector(".container-left");
const slider = document.querySelector(".slider");
const title = document.querySelector(".container-title");

function showHome(e) {
  if (e) e.preventDefault();
  containerLeft.style.display = "none";
  slider.style.display = "block";
  title.style.visibility = "visible";
  title.style.height = "auto";
  homeLink.classList.add("active");
  productLink.classList.remove("active");

  // --- Reset lọc sản phẩm ---
  const productLists = document.querySelectorAll(".product-list");
  productLists.forEach((p) => {
    p.style.display = "block";
    p.setAttribute("data-filtered", "visible");
  });

  const noProductDiv = document.querySelector(".container-right .no-product");
  if (noProductDiv) noProductDiv.style.display = "none";

  // Reset tất cả checkbox
  document
    .querySelectorAll(
      '.category input[type="checkbox"], .category input[type="radio"]'
    )
    .forEach((i) => (i.checked = false));

  // Reset search input
  const searchInput = document.getElementById("basic-search");
  if (searchInput) searchInput.value = "";

  // Reset phân trang
  if (typeof window.resetPagination === "function") {
    setTimeout(() => {
      window.resetPagination();
    }, 50);
  }
}

function showProduct(e) {
  if (e) e.preventDefault();
  containerLeft.style.display = "block";
  slider.style.display = "none";
  title.style.visibility = "hidden";
  title.style.height = "0";
  productLink.classList.add("active");
  homeLink.classList.remove("active");

  // Reset lọc sản phẩm
  const productLists = document.querySelectorAll(".product-list");
  productLists.forEach((p) => {
    p.style.display = "block";
    p.setAttribute("data-filtered", "visible");
  });

  const noProductDiv = document.querySelector(".container-right .no-product");
  if (noProductDiv) noProductDiv.style.display = "none";

  // Reset tất cả checkbox
  document
    .querySelectorAll(
      '.category input[type="checkbox"], .category input[type="radio"]'
    )
    .forEach((i) => (i.checked = false));

  // Reset search input
  const searchInput = document.getElementById("basic-search");
  if (searchInput) searchInput.value = "";

  // Reset phân trang
  if (typeof window.resetPagination === "function") {
    setTimeout(() => {
      window.resetPagination();
    }, 50);
  }
}

homeLink.onclick = showHome;
productLink.onclick = showProduct;
window.addEventListener("load", showHome);

// ================== SLIDER ==================
const sliderContent = document.querySelector(".slider-content");
const slides = document.querySelectorAll(".slider-item");
const prev = document.querySelector(".fa-chevron-left");
const next = document.querySelector(".fa-chevron-right");
let index = 0,
  interval;

const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);
sliderContent.append(firstClone);
sliderContent.prepend(lastClone);
sliderContent.style.transform = "translateX(-100%)";

function showSlide(i) {
  sliderContent.style.transition = "transform 0.5s ease-in-out";
  sliderContent.style.transform = `translateX(${-100 * (i + 1)}%)`;
}
function startInterval() {
  interval = setInterval(() => {
    index++;
    showSlide(index);
  }, 5000);
}
function resetInterval() {
  clearInterval(interval);
  startInterval();
}
next.onclick = () => {
  index++;
  showSlide(index);
  resetInterval();
};
prev.onclick = () => {
  index--;
  showSlide(index);
  resetInterval();
};

sliderContent.addEventListener("transitionend", () => {
  if (index >= slides.length) {
    sliderContent.style.transition = "none";
    index = 0;
    sliderContent.style.transform = "translateX(-100%)";
  }
  if (index < 0) {
    sliderContent.style.transition = "none";
    index = slides.length - 1;
    sliderContent.style.transform = `translateX(${-100 * slides.length}%)`;
  }
});
document.querySelector(".slider-container").onmouseenter = () =>
  clearInterval(interval);
document.querySelector(".slider-container").onmouseleave = startInterval;
showSlide(index);
startInterval();

// ================== TÌM KIẾM SẢN PHẨM ==================
const searchInput = document.getElementById("basic-search");
const searchBtn = document.querySelector(".basic-btn");

function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function searchProducts() {
  const keyword = removeVietnameseTones(searchInput.value.trim().toLowerCase());
  const productLists = document.querySelectorAll(".product-list");
  let visibleCount = 0;

  productLists.forEach((p) => {
    const name = removeVietnameseTones(
      p.querySelector(".product-name").textContent.toLowerCase()
    );
    const company = removeVietnameseTones(
      p.querySelector(".product-company").textContent.toLowerCase()
    );
    const show = name.includes(keyword) || company.includes(keyword);
    p.style.display = show ? "block" : "none";
    p.setAttribute("data-filtered", show ? "visible" : "hidden");
    if (show) visibleCount++;
  });

  const noProductDiv = document.querySelector(".container-right .no-product");
  if (noProductDiv)
    noProductDiv.style.display = visibleCount === 0 ? "block" : "none";

  // Reset phân trang sau khi tìm kiếm
  if (typeof window.resetPagination === "function") {
    setTimeout(() => {
      window.resetPagination();
    }, 50);
  }
}

searchBtn.onclick = searchProducts;
searchInput.onkeypress = (e) => {
  if (e.key === "Enter") searchProducts();
};

// Liên Hệ
const aboutLink = document.getElementById("about-link");
if (aboutLink) {
  aboutLink.addEventListener("click", (e) => {
    e.preventDefault(); // tránh reload
    const footer = document.getElementById("contact");
    if (footer) footer.scrollIntoView({ behavior: "smooth" });
  });
}
