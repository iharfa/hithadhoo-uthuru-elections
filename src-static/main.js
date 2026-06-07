const partyColors = {
  MDP: '#ffd400',
  PNC: '#00a3a3',
  Democrats: '#2563eb',
  Independent: '#ffffff'
};

const labelStyle = {
  show: true,
  formatter: (p) => `${Number(p.value).toFixed(2)}%`,
  color: '#f8fafc',
  fontSize: 12,
  backgroundColor: 'rgba(11,16,32,0.84)',
  borderRadius: 6,
  padding: [3, 5]
};

const safeLabelLayout = {
  hideOverlap: true,
  moveOverlap: 'shiftY'
};

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value);

async function loadData() {
  const response = await fetch('/data/elections.json');
  return response.json();
}

function renderCards(elections) {
  const latest = elections.at(-1);
  const first = elections[0];
  const cards = [
    ['Eligible voters, 2026', formatNumber(latest.eligibleVoters)],
    ['Turnout, 2026', `${latest.turnoutPct.toFixed(2)}%`],
    ['Winning margin, 2026', `${formatNumber(latest.margin)} votes`],
    ['Eligible voter growth', `+${formatNumber(latest.eligibleVoters - first.eligibleVoters)}`]
  ];
  document.getElementById('summary-cards').innerHTML = cards.map(([label, value]) => `<article class="card"><span>${label}</span><strong>${value}</strong></article>`).join('');
}

function renderVoteShareChart(elections) {
  const chart = echarts.init(document.getElementById('voteShareChart'), null, { renderer: 'svg' });
  const electionLabels = elections.map(row => row.election.replace(' Parliamentary', '').replace(' By-election', ' by-election'));
  const parties = ['MDP', 'PNC', 'Democrats', 'Independent'];

  chart.setOption({
    backgroundColor: 'transparent',
    color: parties.map(p => partyColors[p]),
    tooltip: { trigger: 'axis', valueFormatter: value => `${Number(value).toFixed(2)}%` },
    legend: { top: 0, textStyle: { color: '#cbd5e1' } },
    grid: { left: 60, right: 28, top: 64, bottom: 46, containLabel: true },
    xAxis: {
      type: 'category',
      data: electionLabels,
      axisLabel: { color: '#cbd5e1' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { color: '#cbd5e1', formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.10)' } }
    },
    series: parties.map(party => ({
      name: party,
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 9,
      lineStyle: { width: 4 },
      itemStyle: {
        color: partyColors[party],
        borderColor: party === 'Independent' ? '#0b1020' : partyColors[party],
        borderWidth: party === 'Independent' ? 2 : 0
      },
      label: labelStyle,
      labelLayout: safeLabelLayout,
      emphasis: { focus: 'series' },
      data: elections.map(row => row.parties[party])
    }))
  });

  window.addEventListener('resize', () => chart.resize());
}

function renderTurnoutChart(elections) {
  const chart = echarts.init(document.getElementById('turnoutChart'), null, { renderer: 'svg' });
  const electionLabels = elections.map(row => row.election.replace(' Parliamentary', '').replace(' By-election', ' by-election'));

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: { top: 0, textStyle: { color: '#cbd5e1' } },
    grid: { left: 70, right: 70, top: 64, bottom: 46, containLabel: true },
    xAxis: {
      type: 'category',
      data: electionLabels,
      axisLabel: { color: '#cbd5e1' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.25)' } }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Eligible voters',
        min: 0,
        axisLabel: { color: '#cbd5e1', formatter: value => formatNumber(value) },
        nameTextStyle: { color: '#cbd5e1' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.10)' } }
      },
      {
        type: 'value',
        name: 'Turnout',
        min: 0,
        max: 100,
        axisLabel: { color: '#cbd5e1', formatter: '{value}%' },
        nameTextStyle: { color: '#cbd5e1' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Eligible voters',
        type: 'bar',
        barWidth: '48%',
        itemStyle: { color: '#94a3b8', borderRadius: [10, 10, 0, 0] },
        label: {
          show: true,
          position: 'top',
          color: '#f8fafc',
          formatter: p => formatNumber(p.value),
          backgroundColor: 'rgba(11,16,32,0.84)',
          borderRadius: 6,
          padding: [3, 5]
        },
        labelLayout: safeLabelLayout,
        data: elections.map(row => row.eligibleVoters)
      },
      {
        name: 'Turnout %',
        type: 'line',
        yAxisIndex: 1,
        symbolSize: 9,
        lineStyle: { width: 4, color: '#f8fafc' },
        itemStyle: { color: '#f8fafc' },
        label: labelStyle,
        labelLayout: safeLabelLayout,
        data: elections.map(row => row.turnoutPct)
      }
    ]
  });

  window.addEventListener('resize', () => chart.resize());
}

function renderTable(elections) {
  document.getElementById('resultRows').innerHTML = elections.map(row => `
    <tr>
      <td>${row.election}</td>
      <td>${row.winner}, ${row.winningParty}</td>
      <td>${formatNumber(row.winnerVotes)} (${row.winnerShare.toFixed(2)}%)</td>
      <td>${row.runnerUp}, ${row.runnerUpParty}</td>
      <td>${formatNumber(row.eligibleVoters)}</td>
      <td>${row.turnoutPct.toFixed(2)}%</td>
      <td>${formatNumber(row.margin)}</td>
    </tr>
  `).join('');
}

function renderSources(sources) {
  document.getElementById('sources').innerHTML = sources.map(source => `<li><a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a></li>`).join('');
}

loadData().then(({ elections, sources }) => {
  renderCards(elections);
  renderVoteShareChart(elections);
  renderTurnoutChart(elections);
  renderTable(elections);
  renderSources(sources);
});
