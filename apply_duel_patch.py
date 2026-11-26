import re, sys, shutil
path = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
src = open(path, encoding='utf-8', newline='').read().replace('\r\n', '\n')
s = src

def rep(old, new, name):
    global s
    if s.count(old) != 1:
        sys.exit(f'FAILED at "{name}" (found {s.count(old)} matches). Nothing was changed.')
    s = s.replace(old, new)

def rx(pattern, new, name):
    global s
    s, n = re.subn(pattern, lambda m: new if '\\1' not in new else new.replace('\\1', m.group(1)), s, count=1, flags=re.S)
    if n != 1:
        sys.exit(f'FAILED at "{name}". Nothing was changed.')

rep(r'''function duSecs(d, side) {
  const mine = (side === 'c' ? d.challenger_id : d.opponent_id) === user.id;
  return mine ? myStopSecs(d.duel_date) : (+d[side === 'c' ? 'challenger_secs' : 'opponent_secs'] || 0);
}''', r'''function duSecs(d, side) {
  if (d.finished_at) return +d[side === 'c' ? 'fin_c' : 'fin_o'] || 0;
  if (d.duel_date < todayK()) return +d[side === 'c' ? 'challenger_secs' : 'opponent_secs'] || 0;
  const mine = (side === 'c' ? d.challenger_id : d.opponent_id) === user.id;
  return mine ? myStopSecs(d.duel_date) : (+d[side === 'c' ? 'challenger_secs' : 'opponent_secs'] || 0);
}
const duDone = d => !!d.finished_at || d.duel_date < todayK();
const duEnd = d => { if (d.finished_at) return new Date(d.finished_at); const x = ymd(d.duel_date); x.setDate(x.getDate() + 1); x.setHours(DAY_CUT, 0, 0, 0); return x; };
const duRecent = d => d.status === 'accepted' && duDone(d) && Date.now() - duEnd(d) < 12 * 3600e3;''', 'duSecs')

rep("if (d.status === 'accepted' && d.duel_date === t) { s.add", "if (d.status === 'accepted' && d.duel_date === t && !d.finished_at) { s.add", 'duelIds')
rep("x.status === 'accepted' && x.duel_date === t && (x.challenger_id === uid", "x.status === 'accepted' && x.duel_date === t && !x.finished_at && (x.challenger_id === uid", 'duelInfo')
rep("over = d.duel_date < t, lead = leadOf(d)", "over = d.duel_date < t || !!d.finished_at, lead = leadOf(d)", 'duelRow')
rep("list.map(d => d.id + d.status + leadOf(d)).join(',')", "list.map(d => d.id + d.status + leadOf(d) + (d.finished_at ? 1 : 0) + (duRecent(d) ? 1 : 0)).join(',')", 'sig')
rep("const now = acc.filter(d => d.duel_date === t), up = acc.filter(d => d.duel_date > t), done = acc.filter(d => d.duel_date < t);",
    "const now = acc.filter(d => d.duel_date === t && !d.finished_at), up = acc.filter(d => d.duel_date > t), done = acc.filter(duRecent);", 'sections')
rep("sec('Yesterday', done, duelRow)", "sec('🏆 Result (12 h)', done, duelRow)", 'title')

NEW_PUSH = r'''async function duelsPush() {                                 // write MY seconds (and "I finished") into my side of each accepted duel
  const t = todayK(), y = toYMD(addDays(logicalNow(), -1));
  for (const d of DU) {
    if (d.status !== 'accepted' || !duMine(d) || d.finished_at || d.duel_date > t || d.duel_date < y) continue;
    const c = d.challenger_id === user.id, col = c ? 'challenger_secs' : 'opponent_secs', dc = c ? 'c_done' : 'o_done';
    const v = Math.round(myStopSecs(d.duel_date)), done = d.duel_date === t && !running && !base && !remote && v > 0, upd = {};
    if (d.duel_date < t) { if (v > (+d[col] || 0)) upd[col] = v; }          // after 3 AM never lower the recorded time
    else { if (v !== (+d[col] || 0)) upd[col] = v; if (done !== !!d[dc]) upd[dc] = done; }
    const sig = JSON.stringify(upd);
    if (sig === '{}' || duelPushed[d.id] === sig) continue;
    duelPushed[d.id] = sig;
    const { error } = await sb.from('duels').update(upd).eq('id', d.id);
    if (error) { console.error('duel push', error); delete duelPushed[d.id]; continue; }
    Object.assign(d, upd);
    if (done && (c ? d.o_done : d.c_done)) {                                  // both finished: lock the result now
      const fin = { finished_at: new Date().toISOString(), fin_c: c ? v : +d.challenger_secs || 0, fin_o: c ? +d.opponent_secs || 0 : v };
      const r = await sb.from('duels').update(fin).eq('id', d.id).is('finished_at', null);
      if (!r.error) Object.assign(d, fin);
    }
  }
}
async function duelUsers() {'''
s, n = re.subn(r'async function duelsPush\(\) \{.*?\n\}\nasync function duelUsers\(\) \{', lambda m: NEW_PUSH, s, count=1, flags=re.S)
if n != 1: sys.exit('FAILED at "duelsPush". Nothing was changed.')

rx(r'<div class="flex justify-between items-center mb-3 gap-2">\s*(<h4 class="text-sm font-semibold text-amber-400">.*?</h4>)\s*</div>\s*<div id="lbList" class="space-y-2"></div>',
   '\\1\n        <div id="lbList" class="space-y-2 mt-3"></div>', 'leaderboard')
rep('<meta name="build" content="20261125-4">', '<meta name="build" content="20261126-1">', 'build')

shutil.copy(path, path + '.bak')
open(path, 'w', encoding='utf-8', newline='').write(s)
print('OK: patched', path, '(backup:', path + '.bak)')
