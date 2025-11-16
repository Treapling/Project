document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("orders-container");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Vui lòng đăng nhập để thực hiện hành động này!!");
    window.location.href = "index.html";
    return;
  }

  const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  const myOrders = allOrders.filter((o) => o.email === user.email);

  if (!myOrders.length) {
    container.innerHTML = '<div class="card">Bạn chưa có đơn hàng nào.</div>';
    return;
  }

  function formatVND(n) {
    return new Intl.NumberFormat("vi-VN").format(n) + "₫";
  }

  const list = document.createElement("div");
  myOrders.forEach((order) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.marginBottom = "12px";
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong>Đơn hàng #${order.id}</strong>
          <div style="color:#666">${order.date}</div>
        </div>
        <div style="text-align:right">
          <div><strong>${formatVND(order.total)}</strong></div>
          <div style="margin-top:6px">Trạng thái: <span class="order-status">${
            order.status
          }</span></div>
        </div>
      </div>
      <div style="margin-top:10px">
        <button class="btn view-details">Xem chi tiết</button>
        <div class="order-detail" style="display:none;margin-top:8px">
          <div><strong>Người nhận:</strong> ${order.customerName}</div>
          <div><strong>Email:</strong> ${order.email}</div>
          <div><strong>Địa chỉ:</strong> ${
            order.address
              ? order.address.address || order.address.detail || ""
              : ""
          }</div>
          <div style="margin-top:8px"><strong>Sản phẩm:</strong></div>
          <ul class="order-items" style="margin-left:18px">
            ${order.items
              .map(
                (i) =>
                  `<li>${i.name} - Số lượng: ${i.qty} - Giá: ${formatVND(
                    i.price
                  )}</li>`
              )
              .join("")}
          </ul>
          <div style="margin-top:8px"><strong>Ghi chú:</strong> ${
            order.address && order.address.note ? order.address.note : ""
          }</div>
        </div>
      </div>
    `;

    // toggle details
    card.querySelector(".view-details").addEventListener("click", (e) => {
      const det = card.querySelector(".order-detail");
      det.style.display = det.style.display === "none" ? "block" : "none";
    });

    list.appendChild(card);
  });

  container.appendChild(list);
});
