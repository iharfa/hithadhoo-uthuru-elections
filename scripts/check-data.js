import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('src-static/data/elections.json', 'utf8'));
const elections = data.elections;
if (!Array.isArray(elections) || elections.length !== 3) throw new Error('Expected exactly 3 elections.');
for (const row of elections) {
  const sum = row.parties.MDP + row.parties.PNC + row.parties.Democrats + row.parties.Independent;
  if (Math.abs(sum - 100) > 0.15) throw new Error(`Party shares do not total 100 for ${row.election}: ${sum}`);
  if (!row.eligibleVoters || !row.turnoutPct) throw new Error(`Missing turnout fields for ${row.election}`);
}
console.log('Data checks passed');
