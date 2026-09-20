(function () {
  "use strict";
  window.PositionChart = {
    render(container, rows, position, indicator, period, source) {
      const U = FiscalUtils, C = RESEARCH_COMPANION;
      if (!rows.length) return U.empty(container);
      const chart = U.chart(container);
      if (!chart) return null;
      const info = C.indicatorMap[indicator];
      const data = rows.filter(row => row[info.field] != null).map(row => ({
        name: row.country_name,
        value: [row[info.field], row.country_name],
        code: row.country_code,
        itemStyle: { color: row.country_code === "IDN" ? C.colors.accent : "#aaa7a1" },
        symbolSize: row.country_code === "IDN" ? 16 : 9
      })).sort((a, b) => a.value[0] - b.value[0]);
      chart.setOption({
        animationDuration: 350,
        grid: { left: 105, right: 34, top: 18, bottom: 50, containLabel: true },
        tooltip: { ...U.baseTooltip, formatter: p => `<b>${p.data.name}</b><br>${info.label}: ${U.formatPercentGDP(p.value[0])}<br>${period}<br>Sumber: ${source}` },
        xAxis: { type: "value", name: "% PDB", nameLocation: "middle", nameGap: 34, axisLabel: { formatter: value => U.formatAxisValue(value) }, splitLine: { lineStyle: { color: "#eeeae4" } } },
        yAxis: { type: "category", data: data.map(item => item.name), axisLabel: { formatter: value => value === "Indonesia" ? `{idn|${value}}` : value, rich: { idn: { color: C.colors.accent, fontWeight: 700 } }, fontSize: 10 }, axisTick: { show: false }, axisLine: { show: false } },
        series: [{ type: "scatter", data, markLine: { silent: true, symbol: "none", lineStyle: { color: "#777", type: "dashed" }, data: [{ xAxis: position.rata_panel, label: { formatter: "Rata-rata" } }, ...(["nlb", "saldo_primer"].includes(indicator) ? [{ xAxis: 0, label: { formatter: "0" } }] : [])] } }]
      }, true);
      return chart;
    }
  };
})();
