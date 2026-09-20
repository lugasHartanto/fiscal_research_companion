(function () {
  "use strict";

  const shortModel = {
    TWO_WAY_FE: "Two-way FE",
    FIRST_DIFFERENCE: "First Difference",
    CORRELATED_RANDOM_EFFECTS_MUNDLAK: "Mundlak",
    COUNTRY_FE_PRECOVID: "Pra-COVID",
    COUNTRY_FE_NO_CONTROL: "Tanpa kontrol"
  };

  function coefficientChart(container, items, options = {}) {
    const U = FiscalUtils, C = RESEARCH_COMPANION, chart = U.chart(container);
    if (!chart) return null;
    const showLabels = options.showLabels !== false;
    const bounds = options.bounds || (() => {
      const values = items.flatMap(item => [item.low, item.high, 0]);
      const min = Math.min(...values), max = Math.max(...values), pad = (max - min) * 0.08;
      return [min - pad, max + pad];
    })();
    chart.setOption({
      animationDuration: 350,
      grid: { left: showLabels ? 206 : 14, right: 28, top: 18, bottom: 42, containLabel: false },
      tooltip: { ...U.baseTooltip, formatter: params => {
        const row = items[params.dataIndex];
        return `<b>${row.label}</b><br>β: ${U.formatCoefficient(row.est)}<br>95% CI: ${U.formatCI(row.low, row.high)}${row.se != null ? `<br>SE: ${U.formatCoefficient(row.se)}` : ""}${row.n ? `<br>N: ${row.n}` : ""}${row.note ? `<br>${row.note}` : ""}`;
      } },
      xAxis: { type: "value", min: bounds[0], max: bounds[1], interval: options.interval, axisLabel: { formatter: value => U.formatAxisValue(value) }, splitLine: { lineStyle: { color: "#eeeae4" } } },
      yAxis: {
        type: "category", inverse: true, data: items.map(item => item.label),
        axisLabel: {
          show: showLabels, width: 184, overflow: "truncate", align: "right", margin: 14,
          formatter: (value, index) => {
            const item = items[index];
            return item.groupLabel ? `{group|${item.groupLabel}}\n{label|${item.label}}` : `{label|${item.label}}`;
          },
          rich: { group: { color: C.colors.accent, fontSize: 9, fontWeight: 700, lineHeight: 17 }, label: { color: C.colors.muted, fontSize: 10, lineHeight: 15 } }
        },
        axisTick: { show: false }, axisLine: { show: false }
      },
      series: [{
        type: "custom",
        renderItem(params, api) {
          const low = api.coord([api.value(0), api.value(3)]), high = api.coord([api.value(2), api.value(3)]), mid = api.coord([api.value(1), api.value(3)]);
          return { type: "group", children: [
            { type: "line", shape: { x1: low[0], y1: low[1], x2: high[0], y2: high[1] }, style: { stroke: C.colors.muted, lineWidth: 2 } },
            { type: "line", shape: { x1: low[0], y1: low[1] - 4, x2: low[0], y2: low[1] + 4 }, style: { stroke: C.colors.muted } },
            { type: "line", shape: { x1: high[0], y1: high[1] - 4, x2: high[0], y2: high[1] + 4 }, style: { stroke: C.colors.muted } },
            { type: "circle", shape: { cx: mid[0], cy: mid[1], r: params.dataIndex === 0 ? 6 : 5 }, style: { fill: params.dataIndex === 0 ? C.colors.accent : C.colors.ink } }
          ] };
        },
        data: items.map((item, index) => [item.low, item.est, item.high, index]),
        markLine: { silent: true, symbol: "none", data: [{ xAxis: 0 }], lineStyle: { color: "#777", type: "dashed" }, label: { show: false } }
      }]
    }, true);
    return chart;
  }

  window.FRFCharts = {
    baseline(container, row) {
      return coefficientChart(container, [{ label: "Baseline", est: row.lag1_debt_estimate, low: row.lag1_debt_ci_lower, high: row.lag1_debt_ci_upper, se: row.lag1_debt_se, n: row.nobs }], { showLabels: false, bounds: [-0.12, 0.01], interval: 0.03 });
    },
    forest(container, base, robust) {
      const items = [
        { groupLabel: "UTAMA", label: "Baseline", est: base.lag1_debt_estimate, low: base.lag1_debt_ci_lower, high: base.lag1_debt_ci_upper, se: base.lag1_debt_se, n: base.nobs, note: "Country Fixed Effects" },
        ...robust.leave_one_country_out.map((row, index) => ({ groupLabel: index === 0 ? "LEAVE-ONE-COUNTRY-OUT" : "", label: `Tanpa ${row.omitted_country}`, est: row.lag1_debt_estimate, low: row.lag1_debt_ci_lower, high: row.lag1_debt_ci_upper, se: row.lag1_debt_std_error, n: row.nobs, note: row.notes })),
        ...robust.covariance_alternatives.slice(1).map((row, index) => ({ groupLabel: index === 0 ? "KOVARIANS" : "", label: row.covariance_type === "DRISCOLL_KRAAY_BARTLETT_BW2" ? "Driscoll–Kraay" : "Cluster negara", est: row.lag1_debt_estimate, low: row.lag1_debt_ci_lower, high: row.lag1_debt_ci_upper, se: row.lag1_debt_std_error, n: 50, note: row.small_sample_caution })),
        ...robust.model_and_period_sensitivity.map((row, index) => ({ groupLabel: index === 0 ? "SENSITIVITAS MODEL / PERIODE" : "", label: shortModel[row.model_family] || row.model_family, est: row.lag1_debt_estimate, low: row.lag1_debt_ci_lower, high: row.lag1_debt_ci_upper, se: row.lag1_debt_std_error, n: row.nobs, note: row.small_sample_caution }))
      ];
      coefficientChart(container, items, { bounds: [-0.4, 0.5], interval: 0.2 });
      return items;
    }
  };
})();
