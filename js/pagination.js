// === CẤU HÌNH PHÂN TRANG ===
let currentPage = 1;
let itemsPerPage = 15;
let totalPages = 1;
let filteredProducts = [];

// === LẤY DANH SÁCH SẢN PHẨM ĐÃ LỌC ===
function getFilteredProducts() {
  filteredProducts = [...document.querySelectorAll('.product-list')]
    .filter(product => product.getAttribute('data-filtered') !== 'hidden');
  return filteredProducts;
}

// === TÍNH TỔNG SỐ TRANG ===
function calculateTotalPages() {
  getFilteredProducts();
  totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  return totalPages;
}

// === HIỂN THỊ SẢN PHẨM THEO TRANG ===
function displayProducts(page) {
  getFilteredProducts();
  filteredProducts.forEach(product => product.style.display = 'none');

  const start = (page - 1) * itemsPerPage;
  filteredProducts.slice(start, start + itemsPerPage)
    .forEach(product => product.style.display = 'block');
}

// === TẠO NÚT PHÂN TRANG ===
function createPagination() {
  const container = document.getElementById('pagination');
  if (!container) return;
  container.innerHTML = '';
  if (totalPages <= 1) { container.style.display = 'none'; return; }
  container.style.display = 'flex';

  // Previous
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-btn';
  prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; updatePagination(); } };
  container.appendChild(prevBtn);

  // Logic hiển thị số trang
  let startPage = 1, endPage = totalPages;
  if (totalPages > 5) {
    if (currentPage <= 3) endPage = 5;
    else if (currentPage >= totalPages - 2) startPage = totalPages - 4;
    else { startPage = currentPage - 2; endPage = currentPage + 2; }
  }

  // Trang đầu và dấu ...
  if (startPage > 1) {
    container.appendChild(createPageButton(1));
    if (startPage > 2) container.appendChild(createDots());
  }

  // Các trang ở giữa
  for (let i = startPage; i <= endPage; i++) {
    container.appendChild(createPageButton(i));
  }

  // Dấu ... và trang cuối
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) container.appendChild(createDots());
    container.appendChild(createPageButton(totalPages));
  }

  // Next
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-btn';
  nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; updatePagination(); } };
  container.appendChild(nextBtn);
}

function createPageButton(pageNum) {
  const btn = document.createElement('button');
  btn.className = 'pagination-number';
  btn.textContent = pageNum;
  if (pageNum === currentPage) btn.classList.add('active');
  btn.onclick = () => { currentPage = pageNum; updatePagination(); };
  return btn;
}

function createDots() {
  const span = document.createElement('span');
  span.className = 'pagination-dots';
  span.textContent = '...';
  return span;
}

// === CẬP NHẬT PHÂN TRANG ===
function updatePagination() {
  displayProducts(currentPage);
  createPagination();

  const titleElement = document.querySelector('.container-title');
  if (titleElement) {
    window.scrollTo({ top: titleElement.offsetTop - 620, behavior: 'smooth' });
  }
}

// === RESET VỀ TRANG 1 ===
function resetPagination() {
  currentPage = 1;
  calculateTotalPages();
  updatePagination();
}

// === KHỞI TẠO ===
function initPagination() {
  const checkProducts = setInterval(() => {
    const products = document.querySelectorAll('.product-list');
    if (products.length > 0) {
      clearInterval(checkProducts);
      products.forEach(product => product.setAttribute('data-filtered', 'visible'));
      calculateTotalPages();
      updatePagination();
    }
  }, 100);

  setTimeout(() => clearInterval(checkProducts), 5000);
}

// === TÍCH HỢP VỚI BỘ LỌC ===
const originalFilterProducts = window.filterProducts;
window.filterProducts = function() {
  if (originalFilterProducts) originalFilterProducts();
  document.querySelectorAll('.product-list').forEach(product => {
    const style = window.getComputedStyle(product);
    product.setAttribute('data-filtered', style.display === 'none' ? 'hidden' : 'visible');
  });
  resetPagination();
};

// Theo dõi thay đổi filter
document.addEventListener('change', e => {
  if (e.target.type === 'checkbox' && e.target.closest('.search-filter-item')) {
    setTimeout(resetPagination, 50);
  }
});

// DOM Ready
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPagination);
else initPagination();

// Export
window.resetPagination = resetPagination;
window.updatePagination = updatePagination;