(function () {
  "use strict";

  const chartInstances = new Set();
  const resizeObservers = new WeakMap();
  const minus = "−";

  function normalize(value, threshold = 0.0000001) {
    const number = Number(value);
    return Math.abs(number) < threshold ? 0 : number;
  }

  function localized(value, minimumFractionDigits, maximumFractionDigits) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    const number = normalize(value);
    const formatted = Math.abs(number).toLocaleString("id-ID", {
      minimumFractionDigits,
      maximumFractionDigits
    });
    return number < 0 ? `${minus}${formatted}` : formatted;
  }

  function chart(container) {
    if (!window.echarts) {
      window.FiscalUtils.error(container, "Pustaka visualisasi tidak tersedia. Periksa koneksi CDN atau sediakan ECharts secara lokal.");
      return null;
    }
    const existing = echarts.getInstanceByDom(container);
    if (existing) return existing;
    container.innerHTML = "";
    const instance = echarts.init(container, null, { renderer: "svg" });
    chartInstances.add(instance);
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(() => instance.resize());
      observer.observe(container);
      resizeObservers.set(container, observer);
    }
    return instance;
  }

  window.FiscalUtils = {
    formatNumber(value, digits = 2) { return localized(value, digits, digits); },
    formatPercentGDP(value, digits = 2) { return `${localized(value, digits, digits)}% PDB`; },
    formatCoefficient(value, digits = 4) { return localized(value, digits, digits); },
    formatAxisValue(value, digits = 2) {
      if (normalize(value) === 0) return "0";
      return localized(value, 0, digits);
    },
    formatCI(lower, upper, digits = 4) {
      return `[${localized(lower, digits, digits)}, ${localized(upper, digits, digits)}]`;
    },
    format(value, digits = 2) { return localized(value, digits, digits); },
    error(container, message) { container.innerHTML = `<div class="error" role="alert">${message}</div>`; },
    empty(container) { container.innerHTML = '<div class="empty">Observasi tidak tersedia untuk kombinasi ini.</div>'; },
    buttons(container, items, active, onChange) {
      container.innerHTML = "";
      items.forEach(item => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = item.label;
        button.dataset.value = item.value;
        button.setAttribute("aria-pressed", String(item.value === active));
        button.addEventListener("click", () => onChange(item.value));
        container.appendChild(button);
      });
    },
    chart,
    resizeAll() { chartInstances.forEach(instance => instance.resize()); },
    baseTooltip: {
      backgroundColor: "#1b1b1a",
      borderWidth: 0,
      textStyle: { color: "#fff", fontFamily: "system-ui", fontSize: 12 },
      padding: 12
    }
  };
  window.formatResearchNumber = window.FiscalUtils.formatNumber;
  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => window.FiscalUtils.resizeAll());
  }, { passive: true });
})();
