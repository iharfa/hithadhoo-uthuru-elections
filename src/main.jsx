import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ReactECharts from 'echarts-for-react';
import './styles.css';

const elections = [
  {
    id: '2019',
    label: '2019 Parliamentary',
    date: '6 Apr 2019',
    eligible: 3849,
    validVotes: 2852,
    invalidVotes: 49,
    totalVoted: 2901,
    turnout: 75.37,
    winner: 'Mohamed Aslam',
    winnerParty: 'MDP',
    winnerVotes: 1184,
    winnerShare: 41.51,
    runnerUp: 'Ahmed Mohamed',
    runnerUpParty: 'Independent',
    runnerUpVotes: 761,
    runnerUpShare: 26.68,
    margin: 423,
    parties: { MDP: 41.51, PNC: 4.98, Democrats: 0, Independent: 53.51 }
  },
  {
    id: '2024',
    label: '2024 Parliamentary',
    date: '21 Apr 2024',
    eligible: 4028,
    validVotes: 2763,
    invalidVotes: 29,
    totalVoted: 2792,
    turnout: 69.31,
    winner: 'Mohamed Sinan',
    winnerParty: 'PNC',
    winnerVotes: 1079,
    winnerShare: 39.05,
    runnerUp: 'Mohamed Aslam',
    runnerUpParty: 'MDP',
    runnerUpVotes: 838,
    runnerUpShare: 30.33,
    margin: 241,
    parties: { MDP: 30.33, PNC: 39.05, Democrats: 2.71, Independent: 27.9 }
  },
  {
    id: '2026',
    label: '2026 By-election',
    date: '6 Jun 2026',
    eligible: 4121,
    validVotes: 2688,
    invalidVotes: 42,
    totalVoted: 2730,
    turnout: 66.25,
    winner: 'Abdulla Sodig',
    winnerParty: 'MDP',
    winnerVotes: 1375,
    winnerShare: 51.15,
    runnerUp: 'Ahmed Saeed',
    runnerUpParty: 'PNC',
    runnerUpVotes: 1313,
    runnerUpShare: 48.85,
    margin: 62,
    parties: { MDP: 51.15, PNC: 48.85, Democrats: 0, Independent: 0 }
  }
];

const partyColors = {
  MDP: '#ffd400',
  PNC: '#00a6a6',
  Democrats: '#2f6bff',
  Independent: '#ffffff'
};

const parties = ['MDP', 'PNC', 'Democrats', 'Independent'];

function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(n);
}

function deltaText(current, previous, suffix = '') {
  if (previous === null || previous === undefined) return { text: 'Baseline', className: 'neutral', arrow: '•' };
  const delta = current - previous;
  const sign = delta > 0 ? '+' : '';
  const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '•';
  const className = delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral';
  return { text: `${sign}${suffix === '%' ? delta.toFixed(2) : formatNumber(delta)}${suffix}`, className, arrow };
}

function SummaryCard({ title, value, previous, suffix = '', helper, inverse = false }) {
  const d = deltaText(value, previous, suffix);
  let cls = d.className;
  if (inverse && cls === 'positive') cls = 'negative';
  else if (inverse && cls === 'negative') cls = 'positive';
  return (
    <div className="card summary-card">
      <div className="card-label">{title}</div>
      <div className="metric-row">
        <div className="metric-value">{suffix === '%' ? value.toFixed(2) : formatNumber(value)}{suffix}</div>
        <div className={`delta ${cls}`}>{d.arrow} {d.text}</div>
      </div>
      <div className="previous">Previous: {previous === null || previous === undefined ? 'None' : `${suffix === '%' ? previous.toFixed(2) : formatNumber(previous)}${suffix}`}</div>
      <div className="helper">{helper}</div>
    </div>
  );
}

function Controls({ selectedParties, setSelectedParties, range, setRange, showLabels, setShowLabels, showValid, setShowValid }) {
  const toggleParty = (party) => {
    setSelectedParties((prev) => ({ ...prev, [party]: !prev[party] }));
  };

  return (
    <div className="card controls">
      <div>
        <h2>Controls</h2>
        <p>Change what appears in the charts.</p>
      </div>

      <div className="control-group">
        <div className="control-title">Election range</div>
        <input
          type="range"
          min="0"
          max="2"
          value={range[0]}
          onChange={(e) => setRange([Math.min(Number(e.target.value), range[1]), range[1]])}
        />
        <input
          type="range"
          min="0"
          max="2"
          value={range[1]}
          onChange={(e) => setRange([range[0], Math.max(Number(e.target.value), range[0])])}
        />
        <div className="range-label">{elections[range[0]].label} to {elections[range[1]].label}</div>
      </div>

      <div className="control-group">
        <div className="control-title">Party visibility</div>
        <div className="chips">
          {parties.map((party) => (
            <button
              key={party}
              className={`chip ${selectedParties[party] ? 'active' : ''}`}
              onClick={() => toggleParty(party)}
              style={{ '--chip-color': partyColors[party] }}
            >
              {party}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group switches">
        <label><input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} /> Show chart labels</label>
        <label><input type="checkbox" checked={showValid} onChange={(e) => setShowValid(e.target.checked)} /> Show valid votes</label>
      </div>
    </div>
  );
}

function VoteShareChart({ data, selectedParties, showLabels }) {
  const series = parties
    .filter((party) => selectedParties[party])
    .map((party) => ({
      name: party,
      type: 'line',
      smooth: true,
      symbolSize: 10,
      lineStyle: { width: 4 },
      itemStyle: { color: partyColors[party], borderColor: party === 'Independent' ? '#111827' : partyColors[party], borderWidth: party === 'Independent' ? 2 : 0 },
      label: { show: showLabels, formatter: '{c}%', position: 'top', hideOverlap: true },
      emphasis: { focus: 'series' },
      data: data.map((e) => e.parties[party])
    }));

  return {
    backgroundColor: 'transparent',
    color: parties.map((p) => partyColors[p]),
    tooltip: { trigger: 'axis', valueFormatter: (v) => `${v}%` },
    legend: { top: 0, textStyle: { color: '#e5e7eb' } },
    grid: { left: 48, right: 24, top: 56, bottom: 72 },
    xAxis: { type: 'category', data: data.map((e) => e.label), axisLabel: { color: '#cbd5e1', interval: 0, rotate: 0 }, axisLine: { lineStyle: { color: '#334155' } } },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%', color: '#cbd5e1' }, splitLine: { lineStyle: { color: '#1f2937' } } },
    dataZoom: [{ type: 'slider', bottom: 18, height: 24, start: 0, end: 100 }, { type: 'inside' }],
    series
  };
}

function EligibleTurnoutChart({ data, showLabels, showValid }) {
  const series = [
    {
      name: 'Eligible voters',
      type: 'bar',
      yAxisIndex: 0,
      barWidth: 34,
      itemStyle: { color: '#94a3b8', borderRadius: [8, 8, 0, 0] },
      label: { show: showLabels, position: 'top', formatter: (p) => formatNumber(p.value), hideOverlap: true },
      data: data.map((e) => e.eligible)
    },
    {
      name: 'Turnout',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      symbolSize: 10,
      lineStyle: { width: 4, color: '#f97316' },
      itemStyle: { color: '#f97316' },
      label: { show: showLabels, formatter: '{c}%', position: 'top', hideOverlap: true },
      data: data.map((e) => e.turnout)
    }
  ];

  if (showValid) {
    series.splice(1, 0, {
      name: 'Valid votes',
      type: 'bar',
      yAxisIndex: 0,
      barWidth: 34,
      itemStyle: { color: '#475569', borderRadius: [8, 8, 0, 0] },
      label: { show: showLabels, position: 'top', formatter: (p) => formatNumber(p.value), hideOverlap: true },
      data: data.map((e) => e.validVotes)
    });
  }

  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: { top: 0, textStyle: { color: '#e5e7eb' } },
    grid: { left: 56, right: 56, top: 56, bottom: 72 },
    xAxis: { type: 'category', data: data.map((e) => e.label), axisLabel: { color: '#cbd5e1', interval: 0 }, axisLine: { lineStyle: { color: '#334155' } } },
    yAxis: [
      { type: 'value', name: 'Voters', axisLabel: { color: '#cbd5e1' }, nameTextStyle: { color: '#cbd5e1' }, splitLine: { lineStyle: { color: '#1f2937' } } },
      { type: 'value', name: 'Turnout', min: 0, max: 100, axisLabel: { formatter: '{value}%', color: '#cbd5e1' }, nameTextStyle: { color: '#cbd5e1' }, splitLine: { show: false } }
    ],
    dataZoom: [{ type: 'slider', bottom: 18, height: 24, start: 0, end: 100 }, { type: 'inside' }],
    series
  };
}

function MarginChart({ data, showLabels }) {
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: 52, right: 24, top: 32, bottom: 72 },
    xAxis: { type: 'category', data: data.map((e) => e.label), axisLabel: { color: '#cbd5e1', interval: 0 }, axisLine: { lineStyle: { color: '#334155' } } },
    yAxis: { type: 'value', axisLabel: { color: '#cbd5e1' }, splitLine: { lineStyle: { color: '#1f2937' } } },
    dataZoom: [{ type: 'slider', bottom: 18, height: 24, start: 0, end: 100 }, { type: 'inside' }],
    series: [{
      name: 'Winning margin',
      type: 'bar',
      barWidth: 40,
      itemStyle: { color: '#ef4444', borderRadius: [8, 8, 0, 0] },
      label: { show: showLabels, position: 'top', formatter: (p) => formatNumber(p.value), hideOverlap: true },
      data: data.map((e) => e.margin)
    }]
  };
}

function App() {
  const [selectedParties, setSelectedParties] = useState({ MDP: true, PNC: true, Democrats: true, Independent: true });
  const [range, setRange] = useState([0, 2]);
  const [showLabels, setShowLabels] = useState(true);
  const [showValid, setShowValid] = useState(false);

  const visibleData = useMemo(() => elections.slice(range[0], range[1] + 1), [range]);
  const latest = visibleData[visibleData.length - 1];
  const previous = visibleData.length > 1 ? visibleData[visibleData.length - 2] : null;

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Hithadhoo Uthuru election data</p>
          <h1>Voting trends across 2019, 2024, and the 2026 by-election</h1>
          <p className="lead">The constituency has grown in eligible voters, while turnout and winning margins have fallen. The 2026 by-election became a tight MDP and PNC contest.</p>
        </div>
        <div className="hero-card">
          <div className="hero-number">62</div>
          <div>vote margin in 2026</div>
        </div>
      </section>

      <Controls
        selectedParties={selectedParties}
        setSelectedParties={setSelectedParties}
        range={range}
        setRange={setRange}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
        showValid={showValid}
        setShowValid={setShowValid}
      />

      <section className="summary-grid">
        <SummaryCard title="Eligible voters" value={latest.eligible} previous={previous?.eligible} helper="Voter eligibility has increased over the selected period." />
        <SummaryCard title="Turnout" value={latest.turnout} previous={previous?.turnout} suffix="%" helper="Lower turnout is highlighted as a decline." inverse />
        <SummaryCard title="Winning margin" value={latest.margin} previous={previous?.margin} helper="A smaller margin means a more competitive race." inverse />
        <SummaryCard title="Valid votes" value={latest.validVotes} previous={previous?.validVotes} helper="Valid candidate votes counted in the selected latest election." />
      </section>

      <section className="chart-grid">
        <div className="card chart-card wide">
          <div className="chart-header"><h2>Party vote share</h2><p>Use the party chips and slider controls to focus the chart.</p></div>
          <ReactECharts option={VoteShareChart({ data: visibleData, selectedParties, showLabels })} style={{ height: 430 }} notMerge />
        </div>

        <div className="card chart-card wide">
          <div className="chart-header"><h2>Eligible voters and turnout</h2><p>Bars show voter eligibility. The line shows turnout rate.</p></div>
          <ReactECharts option={EligibleTurnoutChart({ data: visibleData, showLabels, showValid })} style={{ height: 430 }} notMerge />
        </div>

        <div className="card chart-card wide">
          <div className="chart-header"><h2>Winning margin</h2><p>The race tightened from 423 votes in 2019 to 62 votes in 2026.</p></div>
          <ReactECharts option={MarginChart({ data: visibleData, showLabels })} style={{ height: 360 }} notMerge />
        </div>
      </section>

      <section className="card table-card">
        <h2>Election summary</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Election</th><th>Winner</th><th>Winner votes</th><th>Runner-up</th><th>Runner-up votes</th><th>Eligible</th><th>Turnout</th><th>Margin</th></tr></thead>
            <tbody>
              {elections.map((e) => (
                <tr key={e.id}>
                  <td>{e.label}</td><td>{e.winner} ({e.winnerParty})</td><td>{formatNumber(e.winnerVotes)}</td><td>{e.runnerUp} ({e.runnerUpParty})</td><td>{formatNumber(e.runnerUpVotes)}</td><td>{formatNumber(e.eligible)}</td><td>{e.turnout.toFixed(2)}%</td><td>{formatNumber(e.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card references">
        <h2>References</h2>
        <ol>
          <li>Elections Commission of Maldives, Parliamentary Election 2019 statistics page.</li>
          <li>Elections Commission of Maldives, Parliamentary Election 2024 statistics and candidate result materials.</li>
          <li>Elections Commission of Maldives, 2026 Hithadhoo Uthuru by-election result dashboard.</li>
          <li>Mihaaru and Dhauru reports were used only to support the 2024 turnout reconstruction where the extracted EC result lines did not expose a clean constituency turnout summary.</li>
        </ol>
      </section>

      <footer className="footer">
        <img src="https://what-da-moody.vercel.app/assets/cog-logo.svg" alt="Coalition for Open Governance logo" />
        <div>
          <h2>Civic data for public accountability</h2>
          <p>The Coalition for Open Governance operates under the umbrella of the Raajje Coalition for Good Governance. Its mandate focuses on open governance and supports collective civil society engagement, advocacy, participation, and capacity building to strengthen transparency, human rights, democracy, and civic influence in public policy in the Maldives.</p>
        </div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
