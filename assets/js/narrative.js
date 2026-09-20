(function () {
  "use strict";
  const bridges = [
    ["position", "trajectory", "Posisi hanyalah satu bagian dari cerita.", "Pertanyaan berikutnya adalah bagaimana perbedaan fiskal antarnegara berkembang sepanjang waktu.", "Lanjut ke Trajektori →"],
    ["trajectory", "profile", "Jarak dapat berubah tanpa membuat profil fiskal menjadi sama.", "Karena itu, analisis berikutnya melihat kelompok ekonomi yang memiliki karakteristik fiskal serupa.", "Lihat Profil →"],
    ["profile", "response", "Kemiripan profil belum menjawab bagaimana kebijakan fiskal merespons utang.", "Untuk itu, analisis beralih dari perbandingan regional menuju panel General Government yang lebih ketat.", "Lihat Respons →"],
    ["response", "integrated", "Tidak satu pun dimensi berdiri sendiri.", "Posisi, trajektori, profil, dan respons memberikan bukti yang saling melengkapi.", "Satukan bukti →"]
  ];
  document.addEventListener("DOMContentLoaded", () => {
    bridges.forEach(([afterId, targetId, title, text, link]) => {
      const bridge = document.createElement("aside");
      bridge.className = `narrative-bridge${afterId === "response" ? " narrative-bridge-dark" : ""}`;
      bridge.setAttribute("aria-label", `Transisi menuju ${targetId}`);
      bridge.innerHTML = `<div class="shell"><span class="bridge-label">Berikutnya</span><strong>${title}</strong><p>${text}</p><a href="#${targetId}">${link}</a></div>`;
      document.getElementById(afterId).after(bridge);
    });
    const flowText = document.querySelectorAll(".evidence-flow span");
    if (flowText.length === 4) {
      flowText[1].textContent = "Bagaimana perbedaan berkembang?";
      flowText[2].textContent = "Ekonomi mana yang memiliki profil serupa?";
    }
    const boundary = document.querySelector(".boundary");
    if (boundary) boundary.innerHTML = "Bukan formal Debt Sustainability Analysis (DSA). <span>·</span> Bukan klasifikasi biner sustainable/unsustainable.";
    const chartLabels = {
      "sigma-chart": "Dispersi fiskal lintas negara per tahun",
      "beta-chart": "Koefisien beta convergence dan interval visual",
      "cluster-chart": "Profil klaster pendapatan dan utang bruto",
      "frf-baseline-chart": "Koefisien baseline respons fiskal",
      "frf-chart": "Forest plot sensitivitas Fiscal Reaction Function"
    };
    Object.entries(chartLabels).forEach(([id, label]) => {
      const chart = document.getElementById(id);
      chart.setAttribute("role", "img");
      chart.setAttribute("aria-label", label);
    });
    [...document.querySelectorAll("a")].filter(link => link.textContent.trim() === "Kamus data").forEach(link => link.setAttribute("href", "#data-dictionary"));
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) window.setTimeout(() => target.scrollIntoView({ behavior: "auto", block: "start" }), 120);
    }
  });
})();
