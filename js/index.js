
document.addEventListener("DOMContentLoaded", function () {
  // DOM 1: getElementById()
  const heroTitle = document.getElementById("hero-title");
  const btnCariTour = document.getElementById("btn-cari-tour");
  const btnCekArmada = document.getElementById("btn-cek-armada");

  // DOM 2: querySelector()
  const tourDestination = document.querySelector("#panel-tour select");

  // DOM 3: querySelectorAll()
  const navLinks = document.querySelectorAll("nav a[data-path]");

  // DOM tambahan: membuat elemen Toast secara langsung dengan JavaScript.
  const toastContainer = document.getElementById("toast-container");

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `mv-toast mv-toast-${type}`;
    toast.setAttribute("role", "status");
    toast.innerHTML = `
      <span class="mv-toast-icon">${type === "success" ? "✓" : "!"}</span>
      <span>${message}</span>
      <button type="button" class="mv-toast-close" aria-label="Tutup">×</button>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    const closeToast = () => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 250);
    };

    toast.querySelector(".mv-toast-close").addEventListener("click", closeToast);
    setTimeout(closeToast, 3000);
  }

  // Manipulasi DOM dengan getElementById().
  btnCariTour.addEventListener("click", function () {
    const destination = tourDestination.value;
    heroTitle.classList.add("mv-title-pulse");
    setTimeout(() => heroTitle.classList.remove("mv-title-pulse"), 500);
    showToast(`Pencarian paket untuk ${tourDestination.options[tourDestination.selectedIndex].text} siap diproses.`);
  });

  btnCekArmada.addEventListener("click", function () {
    showToast("Pengecekan ketersediaan armada berhasil dijalankan.");
  });

  // Manipulasi DOM dengan querySelector().
  tourDestination.addEventListener("change", function () {
    const selectedText = tourDestination.options[tourDestination.selectedIndex].text;
    heroTitle.dataset.destination = selectedText;
  });

  // Manipulasi DOM dengan querySelectorAll().
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      navLinks.forEach(item => item.classList.remove("mv-nav-active"));
      link.classList.add("mv-nav-active");
      showToast(`Menu ${link.textContent.trim()} dipilih.`);
    });
  });
});
