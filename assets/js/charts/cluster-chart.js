(function () {
  "use strict";
  window.ClusterChart = {
    render(container, rows, onSelect) {
      const U = FiscalUtils, C = RESEARCH_COMPANION;
      if (!rows.length) return U.empty(container);
      const chart = U.chart(container);
      if (!chart) return null;
      const shapes = ["circle", "rect", "diamond", "triangle"];
      const shades = ["#77736c", "#aaa7a1", "#565b5d", "#c2beb6"];
      const clusters = [...new Set(rows.map(row => row.cluster_id))].sort();
      chart.setOption({
        animationDuration: 350,
        legend: { top: 0, type: "scroll", data: clusters, itemGap: 18 },
        grid: { left: 18, right: 24, top: 54, bottom: 20, containLabel: true },
        tooltip: { ...U.baseTooltip, formatter: p => `<b>${p.data.raw.country_name}</b><br>${p.data.raw.period_label}<br>Klaster ${p.data.raw.cluster_id}<br>Pendapatan: ${U.formatPercentGDP(p.value[0])}<br>Utang bruto: ${U.formatPercentGDP(p.value[1])}` },
        xAxis: { type: "value", name: "Pendapatan (% PDB)", nameLocation: "middle", nameGap: 34, axisLabel: { formatter: value => U.formatAxisValue(value) }, splitLine: { lineStyle: { color: "#eeeae4" } } },
        yAxis: { type: "value", name: "Utang Bruto (% PDB)", nameLocation: "middle", nameGap: 48, axisLabel: { formatter: value => U.formatAxisValue(value, 0) }, splitLine: { lineStyle: { color: "#eeeae4" } } },
        series: clusters.map((cluster, index) => ({
          name: cluster,
          type: "scatter",
          symbol: shapes[index % shapes.length],
          symbolSize: value => value[2] === "IDN" ? 18 : 11,
          itemStyle: { color: params => params.data.raw.country_code === "IDN" ? C.colors.accent : shades[index] },
          label: {
            show: true,
            position: "right",
            distance: 6,
            formatter: params => ["IDN", "SGP", "MNG", "LKA", "BGD"].includes(params.data.raw.country_code) ? params.data.raw.country_name : "",
            color: params => params.data.raw.country_code === "IDN" ? C.colors.accent : C.colors.ink,
            fontWeight: params => params.data.raw.country_code === "IDN" ? 700 : 400,
            fontSize: 10
          },
          data: rows.filter(row => row.cluster_id === cluster).map(row => ({ value: [row.revenue, row.debt, row.country_code], raw: row }))
        }))
      }, true);
      chart.off("click");
      chart.on("click", params => params.data && onSelect(params.data.raw));
      return chart;
    }
  };
})();
