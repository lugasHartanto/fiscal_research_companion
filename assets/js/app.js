(function () {
  "use strict";
  const C = RESEARCH_COMPANION, U = FiscalUtils;
  const state = { positionIndicator: "pendapatan", positionPeriod: "keseluruhan (2014–2024)", trajectoryIndicator: "pendapatan", profilePeriod: "pra_covid" };
  const data = {};
  const element = id => document.getElementById(id);
  const periodMap = { "keseluruhan (2014–2024)": null, "Pra-COVID (2014–2019)": "pra_covid", "Pandemi (2020–2021)": "pandemi", "Pasca-COVID (2022–2024)": "pasca_covid" };

  function indicatorButtons(id, active, callback) {
    U.buttons(element(id), C.indicators.map(value => ({ value, label: C.indicatorMap[value].label })), active, callback);
  }

  function renderPosition() {
    indicatorButtons("position-indicators", state.positionIndicator, value => { state.positionIndicator = value; renderPosition(); });
    const position = data.position.find(row => row.indikator === state.positionIndicator && row.subperiode === state.positionPeriod);
    if (!position) return U.empty(element("position-chart"));
    const periodKey = periodMap[state.positionPeriod], info = C.indicatorMap[state.positionIndicator], grouped = new Map(), rows = [];
    data.regional.filter(row => !periodKey || row.period === periodKey).forEach(row => {
      if (row[info.field] == null) return;
      const aggregate = grouped.get(row.country_code) || { ...row, total: 0, count: 0 };
      aggregate.total += row[info.field]; aggregate.count += 1; grouped.set(row.country_code, aggregate);
    });
    grouped.forEach(row => rows.push({ ...row, [info.field]: row.total / row.count }));
    const source = data.metadata.sources[info.source];
    PositionChart.render(element("position-chart"), rows, position, state.positionIndicator, state.positionPeriod, source);
    element("position-value").textContent = U.formatPercentGDP(position.nilai_idn).replace(" PDB", "");
    element("position-rank").textContent = `Ke-${position.ranking_asc} terendah`;
    element("position-denominator").textContent = `dari ${position.n_negara} ekonomi`;
    element("position-average").textContent = U.formatPercentGDP(position.rata_panel);
    element("position-source").textContent = `Sumber: ${source}, diolah.`;
    element("position-summary").textContent = `Indonesia ${U.formatPercentGDP(position.nilai_idn)}, peringkat menaik ke-${position.ranking_asc} dari ${position.n_negara} ekonomi pada ${state.positionPeriod}.`;
  }

  function renderTrajectory() {
    indicatorButtons("trajectory-indicators", state.trajectoryIndicator, value => { state.trajectoryIndicator = value; renderTrajectory(); });
    const beta = data.beta.cross_section.find(row => row.indikator === state.trajectoryIndicator);
    const trend = data.sigma.frozen_trend_results.find(row => row.indikator === state.trajectoryIndicator);
    if (!beta || !trend) return U.empty(element("beta-chart"));
    ConvergenceCharts.sigma(element("sigma-chart"), data.sigma.annual_dispersion, state.trajectoryIndicator);
    ConvergenceCharts.beta(element("beta-chart"), beta, state.trajectoryIndicator);
    element("beta-meta").innerHTML = `<span><b>Estimasi β</b><i>${U.formatCoefficient(beta.beta)}</i></span><span><b>N</b><i>${beta.n}</i></span><span><b>Status beku</b><i>${beta.simpulan_beta_cs}</i></span><span><b>Tren sigma</b><i>${trend.arah}; ${trend.simpulan_sigma_conv}</i></span>`;
    element("sigma-summary").textContent = `Dispersi ${C.indicatorMap[state.trajectoryIndicator].label} tersedia untuk 2014–2024. Estimasi beta ${U.formatCoefficient(beta.beta)} dengan status ${beta.simpulan_beta_cs}; simpulan sigma ${trend.simpulan_sigma_conv}.`;
  }

  function renderCountryDetail(row) {
    element("country-detail").innerHTML = `<span class="metric-kicker">${row.period_label}</span><h3>${row.country_name}</h3><p>Klaster <strong>${row.cluster_id}</strong></p><dl><div><dt>Pendapatan</dt><dd>${U.formatPercentGDP(row.revenue)}</dd></div><div><dt>Utang bruto</dt><dd>${U.formatPercentGDP(row.debt)}</dd></div></dl><p class="microcopy">Keanggotaan menunjukkan kemiripan statistik pada periode ini.</p>`;
  }

  function renderProfile() {
    U.buttons(element("profile-periods"), Object.entries(C.periods).map(([value, label]) => ({ value, label })), state.profilePeriod, value => { state.profilePeriod = value; renderProfile(); });
    const rows = data.clusters.filter(row => row.period === state.profilePeriod);
    if (!rows.length) return U.empty(element("cluster-chart"));
    ClusterChart.render(element("cluster-chart"), rows, renderCountryDetail);
    const indonesia = rows.find(row => row.country_code === "IDN") || rows[0];
    renderCountryDetail(indonesia);
    element("cluster-summary").textContent = `Pada ${indonesia.period_label}, Indonesia berada di klaster ${indonesia.cluster_id}, dengan pendapatan ${U.formatPercentGDP(indonesia.revenue)} dan utang ${U.formatPercentGDP(indonesia.debt)}.`;
  }

  function renderFRF() {
    const baseline = data.frf[0];
    element("frf-estimate").textContent = U.formatCoefficient(baseline.lag1_debt_estimate, 3);
    element("frf-ci").textContent = `95% CI: ${U.formatCI(baseline.lag1_debt_ci_lower, baseline.lag1_debt_ci_upper)}`;
    element("frf-n").textContent = baseline.nobs;
    element("frf-model").textContent = baseline.model_family.replaceAll("_", " ");
    FRFCharts.baseline(element("frf-baseline-chart"), baseline);
    const items = FRFCharts.forest(element("frf-chart"), baseline, data.robust);
    element("frf-summary").textContent = `Forest plot memuat ${items.length} spesifikasi beku. Baseline beta ${U.formatCoefficient(baseline.lag1_debt_estimate)} dengan interval kepercayaan ${U.formatCI(baseline.lag1_debt_ci_lower, baseline.lag1_debt_ci_upper)}. Hasil bersifat asosiatif dan sensitif terhadap sampel, kovarians, serta periode.`;
  }

  async function init() {
    const names = { regional: "regional_panel.json", position: "indonesia_position.json", sigma: "convergence_sigma.json", beta: "convergence_beta.json", clusters: "cluster_periods.json", profiles: "cluster_profiles.json", frf: "frf_baseline.json", robust: "frf_robustness.json", countries: "countries.json", metadata: "research_metadata.json" };
    try {
      const values = await Promise.all(Object.values(names).map(loadResearchData));
      Object.keys(names).forEach((key, index) => { data[key] = values[index]; });
      element("hero-economies").textContent = data.countries.length;
      const select = element("position-period");
      [...new Set(data.position.map(row => row.subperiode))].forEach(period => select.add(new Option(period, period)));
      select.value = state.positionPeriod;
      select.addEventListener("change", () => { state.positionPeriod = select.value; renderPosition(); });
      renderPosition(); renderTrajectory(); renderProfile(); renderFRF();
    } catch (error) {
      document.querySelectorAll(".loading").forEach(node => U.error(node.parentElement, error.message));
    }
  }
  document.addEventListener("DOMContentLoaded", init);
})();
