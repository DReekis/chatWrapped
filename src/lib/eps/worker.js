/**
 * Emotional Possibility Score engine (Web Worker).
 * Fully offline, behavior-based, and language-agnostic.
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const WEIGHTS = {
  MI: 0.25,
  RR: 0.2,
  RG: 0.15,
  VF: 0.15,
  RS: 0.15,
  PB: 0.1,
};

const BANDS = [
  { max: 30, label: 'Low emotional alignment' },
  { max: 55, label: 'One-sided or unstable' },
  { max: 70, label: 'Mixed / developing' },
  { max: 85, label: 'Mutual emotional potential' },
  { max: 100, label: 'Strong emotional reciprocity' },
];

self.onmessage = (event) => {
  try {
    const lines = Array.isArray(event.data?.lines) ? event.data.lines : [];
    const parsed = parseLines(lines);
    const result = computeResult(parsed);
    self.postMessage({ ok: true, result });
  } catch (err) {
    self.postMessage({
      ok: false,
      error: err instanceof Error ? err.message : 'Worker failed',
    });
  }
};

function computeResult(parsed) {
  const { events, senderNames } = parsed;
  if (events.length === 0) {
    throw new Error('No valid messages found in chat export');
  }

  const latest = events[events.length - 1].t;
  const rStart = latest - 21 * DAY;
  const bStart = latest - 84 * DAY;
  const bEnd = latest - 21 * DAY;

  const recentEvents = filterByRange(events, rStart, latest + 1);
  const baseEvents = filterByRange(events, bStart, bEnd);

  const recentWeekly = computeWindowWithWeeklySmoothing(recentEvents, rStart, latest + 1);
  const baseWeekly = computeWindowWithWeeklySmoothing(baseEvents, bStart, bEnd);

  const baselineMissing = baseEvents.length === 0 || !baseWeekly.hasAnyComponent;

  const comp = {
    MI: combineWindowValues(recentWeekly.components.MI, baseWeekly.components.MI, baselineMissing),
    RR: combineWindowValues(recentWeekly.components.RR, baseWeekly.components.RR, baselineMissing),
    RG: combineWindowValues(recentWeekly.components.RG, baseWeekly.components.RG, baselineMissing),
    VF: combineWindowValues(recentWeekly.components.VF, baseWeekly.components.VF, baselineMissing),
    RS: combineWindowValues(recentWeekly.components.RS, baseWeekly.components.RS, baselineMissing),
    PB: combineWindowValues(recentWeekly.components.PB, baseWeekly.components.PB, baselineMissing),
  };

  let epsRaw =
    WEIGHTS.MI * comp.MI +
    WEIGHTS.RR * comp.RR +
    WEIGHTS.RG * comp.RG +
    WEIGHTS.VF * comp.VF +
    WEIGHTS.RS * comp.RS +
    WEIGHTS.PB * comp.PB;
  epsRaw = Math.round(clamp(epsRaw, 0, 100));

  const capsTriggered = [];
  let eps = epsRaw;

  // Guardrails
  if (recentWeekly.meta.initiationMajorShare > 0.75) {
    eps = Math.min(eps, 55);
    capsTriggered.push('INITIATION_75_25');
  }

  if (recentWeekly.meta.rrUserScores[0] < 30 || recentWeekly.meta.rrUserScores[1] < 30) {
    eps = Math.min(eps, 50);
    capsTriggered.push('RR_BELOW_30');
  }

  if (recentWeekly.meta.gapCount >= 5 && recentWeekly.meta.rgScore < 40) {
    eps = Math.min(eps, 45);
    capsTriggered.push('HIGH_GAPS_LOW_RETURN');
  }

  const stats = computeDatasetStats(events);
  const marginalData = !isRobustData(stats);
  if (marginalData && stats.meetsMinimum) {
    eps = Math.min(eps, 70);
    capsTriggered.push('MARGINAL_DATA_CAP');
  }

  if (eps > 85) {
    const canExceed85 =
      recentWeekly.components.MI >= 65 &&
      recentWeekly.components.RR >= 65 &&
      recentWeekly.components.RG >= 60 &&
      capsTriggered.length === 0;
    if (!canExceed85) {
      eps = 85;
      capsTriggered.push('HIGH_SCORE_GUARD');
    }
  }

  const band = mapBand(eps);
  const confidence = computeConfidence(stats, comp, baselineMissing);

  const supportingInsights = buildSupportingInsights(
    recentWeekly,
    baseWeekly,
    comp,
    senderNames,
    baselineMissing
  );

  const anchorInsight = buildAnchorInsight(eps, supportingInsights, confidence);

  return {
    EPS: eps,
    band,
    confidence,
    supportingInsights,
    anchorInsight,
    capsTriggered,
  };
}

function parseLines(lines) {
  const events = [];
  const senderToId = new Map();
  const senderNames = ['Person 1', 'Person 2'];

  let pending = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const row = parseWhatsAppLine(line);

    if (row) {
      if (pending) {
        maybePushPending(pending, events, senderToId, senderNames);
      }
      pending = row;
      continue;
    }

    // Continuation line: append only length, never retain text.
    if (pending) {
      pending.len += line.length + 1;
    }
  }

  if (pending) {
    maybePushPending(pending, events, senderToId, senderNames);
  }

  events.sort((a, b) => a.t - b.t);
  return { events, senderNames };
}

function maybePushPending(pending, events, senderToId, senderNames) {
  if (!pending || !pending.sender || pending.sender.length === 0) return;

  let sid = senderToId.get(pending.sender);
  if (sid === undefined) {
    if (senderToId.size >= 2) return;
    sid = senderToId.size;
    senderToId.set(pending.sender, sid);
    senderNames[sid] = pending.sender;
  }

  events.push({ t: pending.t, s: sid, len: pending.len });
}

function parseWhatsAppLine(line) {
  if (!line || line.length < 8) return null;
  const trimmed = line.trim();
  if (!trimmed) return null;

  if (trimmed[0] === '[') {
    const close = trimmed.indexOf(']');
    if (close < 0) return null;
    const inside = trimmed.slice(1, close);
    const rest = trimmed.slice(close + 1).trim();
    const sep = rest.indexOf(': ');
    if (sep <= 0) return null;

    const sender = rest.slice(0, sep).trim();
    const msg = rest.slice(sep + 2);
    const dt = parseDateTimeChunk(inside);
    if (!dt) return null;
    return { t: dt, sender, len: msg.length };
  }

  const dash = trimmed.indexOf(' - ');
  if (dash <= 0) return null;
  const prefix = trimmed.slice(0, dash);
  const rest = trimmed.slice(dash + 3);
  const sep = rest.indexOf(': ');
  if (sep <= 0) return null;

  const sender = rest.slice(0, sep).trim();
  const msg = rest.slice(sep + 2);
  const dt = parseDateTimeChunk(prefix);
  if (!dt) return null;
  return { t: dt, sender, len: msg.length };
}

function parseDateTimeChunk(chunk) {
  // Expected: d/m/yy, h:mm AM   or   d/m/yyyy, h:mm:ss PM
  const comma = chunk.indexOf(',');
  if (comma < 0) return null;
  const datePart = chunk.slice(0, comma).trim();
  const timePart = chunk.slice(comma + 1).trim();

  const dSplit = datePart.split('/');
  if (dSplit.length !== 3) return null;
  let day = toInt(dSplit[0]);
  let month = toInt(dSplit[1]);
  let year = toInt(dSplit[2]);
  if (!isFiniteNumber(day) || !isFiniteNumber(month) || !isFiniteNumber(year)) return null;
  if (year < 100) year += 2000;

  const tParts = timePart.split(' ');
  const hhmmss = tParts[0] || '';
  const ampm = (tParts[1] || '').toLowerCase();
  const hSplit = hhmmss.split(':');
  if (hSplit.length < 2) return null;

  let hour = toInt(hSplit[0]);
  const minute = toInt(hSplit[1]);
  const second = hSplit.length > 2 ? toInt(hSplit[2]) : 0;
  if (!isFiniteNumber(hour) || !isFiniteNumber(minute) || !isFiniteNumber(second)) return null;

  if (ampm === 'pm' && hour !== 12) hour += 12;
  if (ampm === 'am' && hour === 12) hour = 0;

  const dt = new Date(year, month - 1, day, hour, minute, second, 0).getTime();
  return Number.isNaN(dt) ? null : dt;
}

function computeWindowWithWeeklySmoothing(events, start, end) {
  const ranges = getWeekRanges(start, end);
  const weekly = { MI: [], RR: [], RG: [], VF: [], RS: [], PB: [] };
  const lastWeekMeta = {
    initiationMajorShare: 0.5,
    initiationShare0: 0.5,
    rrUserScores: [50, 50],
    gapCount: 0,
    rgScore: 50,
  };

  for (let i = 0; i < ranges.length; i += 1) {
    const [wStart, wEnd] = ranges[i];
    const subset = filterByRange(events, wStart, wEnd);
    const calc = computeWindowComponents(subset);

    if (calc.valid) {
      weekly.MI.push(calc.components.MI);
      weekly.RR.push(calc.components.RR);
      weekly.RG.push(calc.components.RG);
      weekly.VF.push(calc.components.VF);
      weekly.RS.push(calc.components.RS);
      weekly.PB.push(calc.components.PB);
      lastWeekMeta.initiationMajorShare = calc.meta.initiationMajorShare;
      lastWeekMeta.initiationShare0 = calc.meta.initiationShare0;
      lastWeekMeta.rrUserScores = calc.meta.rrUserScores;
      lastWeekMeta.gapCount = calc.meta.gapCount;
      lastWeekMeta.rgScore = calc.meta.rgScore;
    }
  }

  const components = {
    MI: medianOrDefault(weekly.MI, 50),
    RR: medianOrDefault(weekly.RR, 50),
    RG: medianOrDefault(weekly.RG, 50),
    VF: medianOrDefault(weekly.VF, 50),
    RS: medianOrDefault(weekly.RS, 50),
    PB: medianOrDefault(weekly.PB, 50),
  };

  return {
    components,
    meta: lastWeekMeta,
    hasAnyComponent: weekly.MI.length > 0,
  };
}

function computeWindowComponents(events) {
  if (events.length < 8) {
    return {
      valid: false,
      components: { MI: 50, RR: 50, RG: 50, VF: 50, RS: 50, PB: 50 },
      meta: {
        initiationMajorShare: 0.5,
        initiationShare0: 0.5,
        rrUserScores: [50, 50],
        gapCount: 0,
        rgScore: 50,
      },
    };
  }

  const turns = buildTurns(events);

  const mi = computeMI(events);
  const rr = computeRR(events);
  const rg = computeRG(turns);
  const vf = computeVF(turns);
  const rs = computeRS(turns);
  const pb = computePB(events);

  return {
    valid: true,
    components: {
      MI: mi.score,
      RR: rr.score,
      RG: rg.score,
      VF: vf.score,
      RS: rs.score,
      PB: pb.score,
    },
    meta: {
      initiationMajorShare: mi.majorShare,
      initiationShare0: mi.share0,
      rrUserScores: rr.userScores,
      gapCount: rg.gapCount,
      rgScore: rg.score,
    },
  };
}

function computeMI(events) {
  let sessions = 0;
  const init = [0, 0];

  if (events.length > 0) {
    sessions += 1;
    init[events[0].s] += 1;
  }

  for (let i = 1; i < events.length; i += 1) {
    if (events[i].t - events[i - 1].t >= 6 * HOUR) {
      sessions += 1;
      init[events[i].s] += 1;
    }
  }

  const total = Math.max(1, sessions);
  const share0 = init[0] / total;
  const balance = 100 - Math.abs(share0 - 0.5) * 200;

  const days = [new Set(), new Set()];
  for (let i = 0; i < events.length; i += 1) {
    const d = Math.floor(events[i].t / DAY);
    days[events[i].s].add(d);
  }
  const d0 = days[0].size;
  const d1 = days[1].size;
  const activeBalance = d0 + d1 > 0 ? 100 - (Math.abs(d0 - d1) / (d0 + d1)) * 100 : 50;

  const score = clamp(0.8 * balance + 0.2 * activeBalance, 0, 100);
  const majorShare = Math.max(share0, 1 - share0);
  return { score, majorShare, share0 };
}

function computeRR(events) {
  const times = [[], []];
  for (let i = 1; i < events.length; i += 1) {
    if (events[i].s !== events[i - 1].s) {
      const dt = events[i].t - events[i - 1].t;
      if (dt > 0 && dt <= 24 * HOUR) {
        times[events[i].s].push(dt);
      }
    }
  }

  const userScores = [50, 50];
  for (let s = 0; s < 2; s += 1) {
    const arr = times[s];
    if (arr.length >= 3) {
      const med = median(arr);
      const low = med * 0.5;
      const high = med * 2;
      let within = 0;
      for (let i = 0; i < arr.length; i += 1) {
        if (arr[i] >= low && arr[i] <= high) within += 1;
      }
      userScores[s] = clamp((within / arr.length) * 100, 0, 100);
    }
  }

  return {
    score: (userScores[0] + userScores[1]) / 2,
    userScores,
  };
}

function computeRG(turns) {
  let gaps = 0;
  let success = 0;

  for (let i = 0; i < turns.length; i += 1) {
    const cur = turns[i];
    const next = turns[i + 1];
    const unanswered = !next || next.start - cur.end > 24 * HOUR;
    if (!unanswered) continue;

    gaps += 1;
    const restart = next;
    if (!restart) continue;
    if (restart.start - cur.end > 72 * HOUR) continue;

    const alternations = alternationsAfterTurn(turns, i + 1, restart.start + 24 * HOUR);
    if (alternations >= 4) success += 1;
  }

  if (gaps === 0) {
    return { score: 100, gapCount: 0 };
  }
  return { score: clamp((success / gaps) * 100, 0, 100), gapCount: gaps };
}

function computeVF(turns) {
  const bySenderLens = [[], []];
  for (let i = 0; i < turns.length; i += 1) {
    bySenderLens[turns[i].s].push(turns[i].len);
  }

  const med = [medianOrDefault(bySenderLens[0], 0), medianOrDefault(bySenderLens[1], 0)];
  const p90 = [percentileOrDefault(bySenderLens[0], 0.9, 0), percentileOrDefault(bySenderLens[1], 0.9, 0)];

  let candidates = 0;
  let success = 0;

  for (let i = 0; i < turns.length - 1; i += 1) {
    const turn = turns[i];
    const sender = turn.s;
    const threshold = Math.max(med[sender] * 2, p90[sender]);
    if (turn.len < threshold || threshold <= 0) continue;

    candidates += 1;
    const reply = turns[i + 1];
    if (reply.s === sender) continue;
    if (reply.start - turn.end > 12 * HOUR) continue;

    const alternations = alternationsAfterTurn(turns, i, turn.end + 24 * HOUR);
    if (alternations >= 2) success += 1;
  }

  if (candidates === 0) return { score: 50 };
  return { score: clamp((success / candidates) * 100, 0, 100) };
}

function computeRS(turns) {
  let tensionEvents = 0;
  let repaired = 0;

  for (let i = 3; i < turns.length - 1; i += 1) {
    const cur = turns[i];
    const next = turns[i + 1];
    const silence = next.start - cur.end;
    if (silence <= 12 * HOUR) continue;

    // Active exchange proxy in prior 2h: at least 4 turns.
    let activeCount = 0;
    const activeStart = cur.end - 2 * HOUR;
    for (let j = i; j >= 0; j -= 1) {
      if (turns[j].start < activeStart) break;
      activeCount += 1;
    }
    if (activeCount < 4) continue;

    tensionEvents += 1;
    if (next.start - cur.end > 72 * HOUR) continue;

    const alternations = alternationsAfterTurn(turns, i + 1, next.start + 24 * HOUR);
    if (alternations >= 4) repaired += 1;
  }

  if (tensionEvents === 0) return { score: 80 };
  return { score: clamp((repaired / tensionEvents) * 100, 0, 100) };
}

function computePB(events) {
  const responses = [[], []];

  for (let i = 1; i < events.length; i += 1) {
    if (events[i].s === events[i - 1].s) continue;
    const responder = events[i].s;
    const dt = events[i].t - events[i - 1].t;
    if (dt <= 0 || dt > 24 * HOUR) continue;
    responses[responder].push({ dt, h: new Date(events[i].t).getHours() });
  }

  const userScores = [50, 50];

  for (let s = 0; s < 2; s += 1) {
    const arr = responses[s];
    if (arr.length < 6) continue;

    const dts = arr.map((r) => r.dt);
    const baseline = median(dts);
    const q75 = percentileOrDefault(dts, 0.75, baseline);

    const busyHours = new Set();
    for (let i = 0; i < arr.length; i += 1) {
      if (arr[i].dt >= q75) busyHours.add(arr[i].h);
    }

    let busyTotal = 0;
    let busyResponsive = 0;
    let nonTotal = 0;
    let nonResponsive = 0;

    for (let i = 0; i < arr.length; i += 1) {
      const isResponsive = arr[i].dt <= baseline * 1.5;
      if (busyHours.has(arr[i].h)) {
        busyTotal += 1;
        if (isResponsive) busyResponsive += 1;
      } else {
        nonTotal += 1;
        if (isResponsive) nonResponsive += 1;
      }
    }

    const busyRate = busyTotal > 0 ? busyResponsive / busyTotal : 0;
    const nonRate = nonTotal > 0 ? nonResponsive / nonTotal : 1;
    const ratio = nonRate > 0 ? busyRate / nonRate : 1;
    userScores[s] = clamp(ratio * 100, 0, 100);
  }

  return { score: (userScores[0] + userScores[1]) / 2 };
}

function buildTurns(events) {
  const turns = [];
  for (let i = 0; i < events.length; i += 1) {
    const ev = events[i];
    const last = turns[turns.length - 1];
    if (!last || last.s !== ev.s) {
      turns.push({ s: ev.s, start: ev.t, end: ev.t, len: ev.len });
    } else {
      last.end = ev.t;
      last.len += ev.len;
    }
  }
  return turns;
}

function alternationsAfterTurn(turns, startIndex, untilTs) {
  let count = 0;
  for (let i = startIndex; i < turns.length - 1; i += 1) {
    if (turns[i + 1].start > untilTs) break;
    if (turns[i + 1].s !== turns[i].s) count += 1;
  }
  return count;
}

function computeDatasetStats(events) {
  const totalMessages = events.length;
  const bySender = [0, 0];
  const activeDays = new Set();
  let sessions = 0;

  for (let i = 0; i < events.length; i += 1) {
    bySender[events[i].s] += 1;
    activeDays.add(Math.floor(events[i].t / DAY));
    if (i === 0 || events[i].t - events[i - 1].t >= 6 * HOUR) sessions += 1;
  }

  const meetsMinimum =
    totalMessages >= 120 &&
    activeDays.size >= 14 &&
    sessions >= 10 &&
    bySender[0] >= 25 &&
    bySender[1] >= 25;

  return {
    totalMessages,
    bySender,
    activeDays: activeDays.size,
    sessions,
    meetsMinimum,
  };
}

function isRobustData(stats) {
  return stats.totalMessages >= 300 && stats.activeDays >= 28;
}

function computeConfidence(stats, comp, baselineMissing) {
  if (!stats.meetsMinimum) return 'insufficient';

  const vals = [comp.MI, comp.RR, comp.RG, comp.VF, comp.RS, comp.PB];
  const spread = Math.max(...vals) - Math.min(...vals);
  const coherent = spread <= 35;

  let tier = coherent && isRobustData(stats) ? 'clear' : 'mixed';
  if (baselineMissing && tier === 'clear') tier = 'mixed';
  return tier;
}

function buildSupportingInsights(recentWeekly, baseWeekly, comp, senderNames, baselineMissing) {
  const nameA = senderNames[0] || 'Person 1';
  const nameB = senderNames[1] || 'Person 2';

  const initShare0 = recentWeekly.meta.initiationShare0;
  const initMajorShare = recentWeekly.meta.initiationMajorShare;
  let investmentDirection = 'balanced';
  let investmentExplanation = 'Right now, emotional effort appears reasonably balanced between both of you.';
  if (initMajorShare > 0.58) {
    const majorSender = initShare0 >= 0.5 ? nameA : nameB;
    investmentDirection = majorSender === nameA ? 'person1_more' : 'person2_more';
    investmentExplanation = `Right now, emotional effort appears slightly more carried by ${majorSender}, mainly through more frequent initiation and follow-up.`;
  }

  const recentEPS =
    WEIGHTS.MI * recentWeekly.components.MI +
    WEIGHTS.RR * recentWeekly.components.RR +
    WEIGHTS.RG * recentWeekly.components.RG +
    WEIGHTS.VF * recentWeekly.components.VF +
    WEIGHTS.RS * recentWeekly.components.RS +
    WEIGHTS.PB * recentWeekly.components.PB;
  const baseEPS =
    WEIGHTS.MI * baseWeekly.components.MI +
    WEIGHTS.RR * baseWeekly.components.RR +
    WEIGHTS.RG * baseWeekly.components.RG +
    WEIGHTS.VF * baseWeekly.components.VF +
    WEIGHTS.RS * baseWeekly.components.RS +
    WEIGHTS.PB * baseWeekly.components.PB;

  let trend = 'stable';
  let trendExplanation = 'The connection pattern looks fairly stable across recent and earlier weeks.';
  if (baselineMissing) {
    trend = 'unclear';
    trendExplanation = 'There is not enough earlier pattern to confidently describe direction yet.';
  } else {
    const delta = recentEPS - baseEPS;
    if (delta >= 6) {
      trend = 'growing';
      trendExplanation = 'Recent consistency is higher than earlier weeks, suggesting the connection is growing.';
    } else if (delta <= -6) {
      trend = 'fading';
      trendExplanation = 'Recent consistency is lower than earlier weeks, suggesting momentum may be slowing.';
    }
  }

  const reliabilityComposite = (0.65 * comp.RR + 0.35 * comp.RG);
  let reliabilityLevel = 'moderate';
  let reliabilityExplanation = 'Your connection reliability is moderate right now, with mixed follow-through patterns.';
  if (reliabilityComposite >= 70) {
    reliabilityLevel = 'high';
    reliabilityExplanation = 'Your connection reliability is high right now, based on consistent responses and returns after pauses.';
  } else if (reliabilityComposite < 45) {
    reliabilityLevel = 'low';
    reliabilityExplanation = 'Your connection reliability is low right now, with frequent delays or weak return patterns.';
  }

  return {
    investmentBalance: { direction: investmentDirection, explanation: investmentExplanation },
    connectionDirection: { trend, explanation: trendExplanation },
    reliability: { level: reliabilityLevel, explanation: reliabilityExplanation },
  };
}

function buildAnchorInsight(eps, supportingInsights, confidence) {
  if (confidence === 'insufficient') {
    return 'There is not enough stable interaction yet to make a reliable call.';
  }
  if (eps >= 71 && supportingInsights.reliability.level !== 'low') {
    return 'There is consistent mutual effort here, which usually supports real emotional possibility.';
  }
  if (eps <= 55 && supportingInsights.investmentBalance.direction !== 'balanced') {
    return 'Effort appears meaningfully imbalanced right now, which can feel one-sided over time.';
  }
  return 'Signals are mixed right now, so clarity may come more from direct conversation than waiting.';
}

function combineWindowValues(r, b, baselineMissing) {
  if (baselineMissing || b === null || b === undefined) return round2(r);
  return round2(0.7 * r + 0.3 * b);
}

function mapBand(eps) {
  for (let i = 0; i < BANDS.length; i += 1) {
    if (eps <= BANDS[i].max) return BANDS[i].label;
  }
  return BANDS[BANDS.length - 1].label;
}

function getWeekRanges(start, end) {
  const ranges = [];
  let cursor = end;
  while (cursor > start) {
    const wStart = Math.max(start, cursor - WEEK);
    ranges.push([wStart, cursor]);
    cursor = wStart;
  }
  return ranges;
}

function filterByRange(events, start, end) {
  const out = [];
  for (let i = 0; i < events.length; i += 1) {
    const t = events[i].t;
    if (t >= start && t < end) out.push(events[i]);
  }
  return out;
}

function medianOrDefault(arr, def) {
  if (!arr || arr.length === 0) return def;
  return median(arr);
}

function percentileOrDefault(arr, p, def) {
  if (!arr || arr.length === 0) return def;
  return percentile(arr, p);
}

function median(arr) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function percentile(arr, p) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function toInt(v) {
  return Number.parseInt(v, 10);
}

function isFiniteNumber(v) {
  return Number.isFinite(v);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function round2(v) {
  return Math.round(v * 100) / 100;
}
