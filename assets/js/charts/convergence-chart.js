(function () {
  "use strict";
  window.ConvergenceCharts = {
    sigma(container, rows, indicator) {
      const U = FiscalUtils, C = RESEARCH_COMPANION, chart = U.chart(container);
      if (!chart) return null;
      const info = C.indicatorMap[indicator];
      chart.setOption({
        animationDuration: 350,
        tooltip: { ...U.baseTooltip, trigger: "axis", formatter: params => `${params[0].axisValue}<br><b>SD: ${U.formatNumber(params[0].value)}</b>` },
        grid: { left: 16, right: 18, top: 30, bottom: 48, containLabel: true },
        xAxis: { type: "category", data: rows.map(row => row.tahun), boundaryGap: false },
        yAxis: { type: "value", name: "SD", min: 0, axisLabel: { formatter: value => U.formatAxisValue(value) }, splitLine: { lineStyle: { color: C.colors.line } } },
        series: [{ type: "line", data: rows.map(row => row[info.sigma]), symbolSize: 7, lineStyle: { width: 3, color: C.colors.accent }, itemStyle: { color: C.colors.accent }, markArea: { silent: true, itemStyle: { color: "rgba(100,100,100,.08)" }, data: [[{ xAxis: 2020, name: "Pandemi" }, { xAxis: 2021 }]] } }]
      }, true);
      return chart;
    },
    beta(container, row, selectedIndicator) {
      const U = FiscalUtils, C = RESEARCH_COMPANION, chart = U.chart(container);
      if (!chart) return null;
      if (row.indikator !== selectedIndicator) console.warn("Beta record tidak cocok dengan indikator terpilih", { selectedIndicator, record: row.indikator });
      // Interval visual mempertahankan implementasi Stage 02: estimasi ± 1,96 SE beku.
      const low = row.beta - 1.96 * row.se_beta, high = row.beta + 1.96 * row.se_beta;
      const span = Math.max(Math.abs(low), Math.abs(high), 0.05), pad = span * 0.18;
      chart.setOption({
        animationDuration: 350,
        tooltip: { ...U.baseTooltip, formatter: () => `β: ${U.formatCoefficient(row.beta)}<br>95% CI visual: ${U.formatCI(low, high)}<br>N: ${row.n}` },
        grid: { left: 14, right: 14, top: 30, bottom: 42, containLabel: true },
        xAxis: { type: "value", min: Math.min(low, 0) - pad, max: Math.max(high, 0) + pad, axisLabel: { formatter: value => U.formatAxisValue(value) }, splitLine: { lineStyle: { color: "#eeeae4" } } },
        yAxis: { type: "category", data: [""], axisLabel: { show: false }, axisTick: { show: false }, axisLine: { show: false } },
        series: [{
          type: "custom",
          renderItem(params, api) {
            const lo = api.coord([api.value(0), 0]), hi = api.coord([api.value(2), 0]), mid = api.coord([api.value(1), 0]);
            return { type: "group", children: [
              { type: "line", shape: { x1: lo[0], y1: lo[1], x2: hi[0], y2: hi[1] }, style: { stroke: C.colors.ink, lineWidth: 2 } },
              { type: "line", shape: { x1: lo[0], y1: lo[1] - 7, x2: lo[0], y2: lo[1] + 7 }, style: { stroke: C.colors.ink } },
              { type: "line", shape: { x1: hi[0], y1: hi[1] - 7, x2: hi[0], y2: hi[1] + 7 }, style: { stroke: C.colors.ink } },
              { type: "circle", shape: { cx: mid[0], cy: mid[1], r: 7 }, style: { fill: C.colors.accent } }
            ] };
          },
          data: [[low, row.beta, high]],
          markLine: { silent: true, symbol: "none", data: [{ xAxis: 0 }], lineStyle: { color: "#777", type: "dashed" }, label: { show: false } }
        }]
      }, true);
      return chart;
    }
  };
})();
