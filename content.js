// InfoSci MS plan of study checker — content.js v1.0

(function () {
  'use strict';

  // CURRICULUM DATA
  const PROGRAMS = {
    msds: {
      name: 'MS Data Science',
      core: [
        { code: 'INFO 502', title: 'Data Ethics' },
        { code: 'INFO 511', title: 'Foundations of Data Science' },
        { code: 'INFO 523', title: 'Data Mining and Discovery' },
        { code: 'INFO 526', title: 'Data Analysis and Visualization' }
      ],
      experiential: [
        { code: 'INFO 693', title: 'Internship' },
        { code: 'INFO 698', title: 'Capstone Project' }
      ],
      notes: 'Core: 12 units. Electives: 15 units (INFO 500-590 or 600-690 or approved). ' +
             'Experiential: 3 units required — INFO 693 (Internship) or INFO 698 (Capstone). ' +
             'Up to 6 experiential units may count toward graduation.'
    },
    'msis-ml': {
      name: 'MS Information Science — Machine Learning',
      core: [
        { code: 'INFO 505', title: 'Foundations of Information' },
        { code: 'INFO 521', title: 'Introduction to Machine Learning' },
        { code: 'INFO 526', title: 'Data Analysis and Visualization' }
      ],
      subplanElectives: [
        { code: 'INFO 510', title: 'Bayesian Modeling and Inference' },
        { code: 'INFO 523', title: 'Data Mining and Discovery' },
        { code: 'INFO 539', title: 'Statistical Natural Language Processing' },
        { code: 'INFO 550', title: 'Artificial Intelligence' },
        { code: 'INFO 555', title: 'Applied Natural Language Processing' },
        { code: 'INFO 556', title: 'Text Retrieval and Web Search' },
        { code: 'INFO 557', title: 'Neural Networks' }
      ],
      subplanMinCourses: 3,
      experiential: [
        { code: 'INFO 693', title: 'Internship' },
        { code: 'INFO 698', title: 'Capstone Project' }
      ],
      notes: 'Core: 9 units. Subplan electives: min 3 courses (9 units). General electives: 9 units. ' +
             'Experiential: 3 units required — INFO 693 (Internship) or INFO 698 (Capstone). ' +
             'Up to 6 experiential units may count toward graduation.'
    },
    'msis-hcc': {
      name: 'MS Information Science — Human-Centered Computing',
      core: [
        { code: 'INFO 505', title: 'Foundations of Information' },
        { code: 'INFO 516', title: 'Introduction to Human Computer Interaction' },
        { code: 'INFO 526', title: 'Data Analysis and Visualization' }
      ],
      subplanElectives: [
        { code: 'INFO 501', title: 'Designing an Installation' },
        { code: 'INFO 524', title: 'Virtual Reality' },
        { code: 'INFO 525', title: 'Algorithms for Games' },
        { code: 'INFO 551', title: 'Game Development' },
        { code: 'INFO 552', title: 'Advanced Game Development' },
        { code: 'INFO 560', title: 'Serious STEM Games' },
        { code: 'INFO 575', title: 'User Interface and Website Design' }
      ],
      subplanMinCourses: 3,
      experiential: [
        { code: 'INFO 693', title: 'Internship' },
        { code: 'INFO 698', title: 'Capstone Project' }
      ],
      notes: 'Core: 9 units. Subplan electives: min 3 courses (9 units). General electives: 9 units. ' +
             'Experiential: 3 units required — INFO 693 (Internship) or INFO 698 (Capstone). ' +
             'Up to 6 experiential units may count toward graduation.'
    }
  };

  const EQUIVALENTS = {
    'INFO 510': ['ISTA 510', 'ISTA 410'],
    'ISTA 510': ['INFO 510'],
    'ISTA 410': ['INFO 510'],
    'INFO 539': ['LING 539', 'CSC 539'],
    'LING 539': ['INFO 539'],
    'CSC 539':  ['INFO 539']
  };

  function normCode(s) {
    return s.toUpperCase().replace(/\s+/g, ' ').trim();
  }
  function codesMatch(a, b) {
    if (normCode(a) === normCode(b)) return true;
    const ea = (EQUIVALENTS[normCode(a)] || []).map(normCode);
    const eb = (EQUIVALENTS[normCode(b)] || []).map(normCode);
    return ea.includes(normCode(b)) || eb.includes(normCode(a));
  }

  // PROGRAM DETECTION

  function detectProgram(programStr, degreeStr, subplanStr, rawText) {
    const clean = s => (s || '').toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
    const p = clean(programStr);
    const rt = (rawText || '').toLowerCase().replace(/[-_]/g, ' ');

    // Step 1: identify the degree from the program name or raw text
    const isMSDS = /data\s*science/.test(p) || /master of science in data science/.test(rt);
    const isMSIS = /information\s*science/.test(p) || /master of science in information science/.test(rt);

    // Step 2: MSDS has no subplan — return immediately
    if (isMSDS) return 'msds';

    // Step 3: MSIS — now check the subplan to pick the right track
    if (isMSIS) {
      const s = clean(subplanStr);
      if (/machine\s*learning/.test(s) || /machine\s*learning/.test(rt.substring(0, 600))) return 'msis-ml';
      if (/human\s*centered|hcc/.test(s) || /human\s*centered/.test(rt.substring(0, 600))) return 'msis-hcc';
      // MSIS but subplan unreadable — default to ML
      return 'msis-ml';
    }

    return null;
  }

  // FIELD EXTRACTION FROM RAW TEXT
  // For MSDS (no subplan value)
 
  const UI_CHROME = /^(coursework|plan of study|select all|deselect|save for later|min units|total|details|term|subj\.|catg|grade|units|letter)/i;

  function extractFieldsFromText(rawText) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const fields = { program: null, degree: null, subplan: null };
    const labelMap = {
      'major': 'program',
      'program': 'program',
      'degree': 'degree',
      'subplan': 'subplan',
      'sub-plan': 'subplan',
      'sub plan': 'subplan'
    };

    for (let i = 0; i < lines.length - 1; i++) {
      const lower = lines[i].toLowerCase();
      if (!labelMap[lower]) continue;
      const val = lines[i + 1];
      const valLower = val.toLowerCase();
      // Skip if value is itself a label
      if (labelMap[valLower]) continue;
      // Skip if value is UI chrome
      if (UI_CHROME.test(val)) continue;
      // Skip implausibly long values
      if (val.length > 80) continue;
      fields[labelMap[lower]] = val;
    }
    return fields;
  }

  // COURSE EXTRACTION
  function parseCoursesFromDoc(doc) {
    const result = { program: null, degree: null, subplan: null, courses: [], rawText: '' };
    if (!doc || !doc.body) return result;

    result.rawText = doc.body.innerText || '';

    // Extract program fields from raw text (most reliable for PeopleSoft)
    const fields = extractFieldsFromText(result.rawText);
    result.program = fields.program;
    result.degree  = fields.degree;
    result.subplan = fields.subplan;

    // Course rows
    // PeopleSoft table columns: Term | Subj | CatgNbr | Course Title | Grade | Units | LetterGrade | Details
    const rows = Array.from(doc.querySelectorAll('table tr'));
    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length < 3) continue;
      const texts = cells.map(c => c.innerText.trim());
      const rowJoined = texts.join(' ');

      // Skip header/footer rows
      if (/^\s*(term|subj|catg|course\s*title|total|select\s*all|deselect|min\s*units)/i.test(rowJoined)) continue;
      if (/total\s+\d{2,}\.\d+/i.test(rowJoined)) continue;

      let subj = null, catg = null, title = null, grade = null, units = null;

      // Strategy 1: two adjacent cells — "INFO" then "511"
      for (let i = 0; i < texts.length - 1; i++) {
        if (/^[A-Z]{2,5}$/.test(texts[i]) && /^\d{3,4}[A-Z]?$/.test(texts[i + 1])) {
          subj = texts[i];
          catg = texts[i + 1];

          // Title: first subsequent cell that looks like a course name
          for (let j = i + 2; j < texts.length; j++) {
            const t = texts[j];
            if (t.length > 3 &&
                !/^\d+(\.\d+)?$/.test(t) &&
                !/^[ABCDF][+-]?$/.test(t) &&
                !/^(ENRL|enrl)$/.test(t) &&
                !/^(Spring|Fall|Summer)\s+\d{4}$/i.test(t) &&
                !/^(Min\s*Units|Save|Select|Deselect)/i.test(t)) {
              title = t; break;
            }
          }

          // Grade: single letter
          for (const t of texts) {
            if (/^[ABCDF][+-]?$/.test(t)) { grade = t; break; }
          }

          // Units: valid per-course range only (avoids picking up Total 30.000)
          for (const t of texts) {
            const u = parseFloat(t);
            if (/^\d+\.\d+$/.test(t) && u >= 0.5 && u <= 9.0) { units = t; break; }
          }
          break;
        }
      }

      // Strategy 2: single combined cell "INFO 511 Course Title"
      if (!subj) {
        for (const t of texts) {
          const m = t.match(/^([A-Z]{2,5})\s+(\d{3,4}[A-Z]?)\b(.*)$/);
          if (m) {
            subj = m[1]; catg = m[2];
            const rest = m[3].trim();
            if (rest.length > 3) title = rest;
            for (const u of texts) { if (/^[ABCDF][+-]?$/.test(u)) grade = u; }
            for (const u of texts) {
              const n = parseFloat(u);
              if (/^\d+\.\d+$/.test(u) && n >= 0.5 && n <= 9.0) { units = u; break; }
            }
            break;
          }
        }
      }

      if (subj && catg) {
        result.courses.push({
          subject: subj,
          catalog: catg,
          code: `${subj} ${catg}`,
          title: title || '',
          grade: grade || '',
          units: units || '3.00'
        });
      }
    }

    // Deduplicate
    const seen = new Set();
    result.courses = result.courses.filter(c => {
      if (seen.has(c.code)) return false;
      seen.add(c.code); return true;
    });

    return result;
  }

  // ANALYSIS
  function analyzePOS(posData, programKey) {
    const program = PROGRAMS[programKey];
    const findCourse = code => posData.courses.find(c => codesMatch(c.code, code));

    // Core courses
    const coreResults = program.core.map(req => {
      const found = findCourse(req.code);
      return { ...req, found: !!found, enrolledCourse: found || null };
    });
    const coreOk = coreResults.every(r => r.found);

    // Experiential
    // - Met: at least one of INFO 693 / INFO 698 is on the POS
    // - Over-enrolled: BOTH are on the POS (note only, not a hard error)
    const expResults = program.experiential.map(req => {
      const found = findCourse(req.code);
      return { ...req, found: !!found, enrolledCourse: found || null };
    });
    const expEnrolledList = expResults.filter(r => r.found);
    const expMet = expEnrolledList.length > 0;
    const expBothEnrolled = expEnrolledList.length > 1;
    const expUnits = expEnrolledList.reduce((s, r) => s + (parseFloat(r.enrolledCourse.units) || 3), 0);
    // Only flag over-enrollment when both courses are present AND total exceeds 3
    const expOverEnrolled = expBothEnrolled && expUnits > 3;

    // Subplan electives (MSIS only)
    let subplanResults = [];
    let subplanFulfilled = 0;
    if (program.subplanElectives) {
      subplanResults = program.subplanElectives.map(req => {
        const found = findCourse(req.code);
        if (found) subplanFulfilled++;
        return { ...req, found: !!found, enrolledCourse: found || null };
      });
    }
    const subplanOk = !program.subplanElectives || subplanFulfilled >= (program.subplanMinCourses || 3);

    // Other courses (not core, not experiential)
    const generalElectives = posData.courses.filter(c =>
      !program.core.some(r => codesMatch(r.code, c.code)) &&
      !program.experiential.some(r => codesMatch(r.code, c.code))
    );

    const allClear = coreOk && expMet && !expOverEnrolled && subplanOk;

    return {
      program, programKey,
      coreResults, coreOk,
      expResults, expMet, expUnits, expOverEnrolled, expBothEnrolled,
      subplanResults, subplanFulfilled, subplanOk,
      generalElectives,
      allClear
    };
  }

  // PANEL RENDERING
  const PANEL_ID = 'infosci-pos-checker-panel';

  function removePanel(doc) {
    const el = (doc || document).getElementById(PANEL_ID);
    if (el) el.remove();
  }

  function injectPanel(doc, posData, programKey) {
    removePanel(doc);
    const analysis = analyzePOS(posData, programKey);
    const prog = PROGRAMS[programKey];

    function makeRow(code, titleHtml, status) {
      const cfg = {
        complete: { bg: '#f0fdf4', fg: '#166534', badge: 'OK',      bbg: '#dcfce7' },
        missing:  { bg: '#fef2f2', fg: '#991b1b', badge: 'MISSING', bbg: '#fee2e2' },
        warning:  { bg: '#fffbeb', fg: '#92400e', badge: 'NOTE',    bbg: '#fef3c7' },
        neutral:  { bg: '#f9fafb', fg: '#374151', badge: '',        bbg: 'transparent' }
      }[status];
      const badgeHtml = cfg.badge
        ? `<span style="display:inline-block;padding:1px 7px;border-radius:10px;` +
          `background:${cfg.bbg};color:${cfg.fg};font-size:10px;font-weight:700;">${cfg.badge}</span>`
        : '';
      return `<tr style="background:${cfg.bg};border-bottom:1px solid #e5e7eb;">
        <td style="padding:6px 10px;font-weight:700;font-size:12px;color:${cfg.fg};white-space:nowrap;width:82px;">${code}</td>
        <td style="padding:6px 10px;font-size:12px;color:#374151;line-height:1.3;">${titleHtml}</td>
        <td style="padding:6px 10px;text-align:right;white-space:nowrap;">${badgeHtml}</td>
      </tr>`;
    }

    let secIdx = 0;
    function makeSection(title, rowsHtml, headFg, badgeText, badgeBg) {
      const i = secIdx++;
      return `<div class="pos-sec" style="border-bottom:1px solid #e5e7eb;">
        <div class="pos-sec-hdr" data-idx="${i}"
             style="padding:8px 14px;display:flex;justify-content:space-between;align-items:center;
                    background:#f9fafb;cursor:pointer;user-select:none;">
          <span style="font-weight:700;font-size:12px;color:#1f2937;">
            ${title}
            <span class="pos-arr-${i}" style="font-size:10px;color:#9ca3af;margin-left:4px;">&#9660;</span>
          </span>
          <span style="display:inline-block;padding:2px 9px;border-radius:10px;
                       background:${badgeBg};color:${headFg};font-size:11px;font-weight:700;">
            ${badgeText}
          </span>
        </div>
        <div class="pos-sec-body-${i}">
          <table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
        </div>
      </div>`;
    }

    let sectionsHtml = '';

    // Core
    const coreDone = analysis.coreResults.filter(r => r.found).length;
    sectionsHtml += makeSection(
      'Core Courses',
      analysis.coreResults.map(r => makeRow(
        r.code,
        r.title + (r.enrolledCourse?.grade
          ? ` <span style="color:#6b7280;font-size:11px;">(${r.enrolledCourse.grade})</span>` : ''),
        r.found ? 'complete' : 'missing'
      )).join(''),
      analysis.coreOk ? '#166534' : '#991b1b',
      `${coreDone} / ${analysis.coreResults.length}`,
      analysis.coreOk ? '#dcfce7' : '#fee2e2'
    );

    // Subplan electives (MSIS)
    if (prog.subplanElectives) {
      sectionsHtml += makeSection(
        'Subplan Electives',
        analysis.subplanResults.map(r => makeRow(
          r.code,
          r.title + (r.enrolledCourse?.grade
            ? ` <span style="color:#6b7280;font-size:11px;">(${r.enrolledCourse.grade})</span>` : ''),
          r.found ? 'complete' : 'neutral'
        )).join(''),
        analysis.subplanOk ? '#166534' : '#991b1b',
        `${analysis.subplanFulfilled} of ${prog.subplanMinCourses} min`,
        analysis.subplanOk ? '#dcfce7' : '#fee2e2'
      );
    }

    // Experiential
    let expRows = analysis.expResults.map(r => makeRow(
      r.code,
      r.title + (r.enrolledCourse
        ? ` <span style="color:#6b7280;font-size:11px;">(${r.enrolledCourse.units} units)</span>` : ''),
      r.found ? 'complete' : 'neutral'
    )).join('');
    if (analysis.expOverEnrolled) {
      expRows += makeRow('',
        `Both courses enrolled — ${analysis.expUnits} units total. ` +
        `Only 3 are required; up to 6 may count toward graduation.`,
        'warning');
    }
    sectionsHtml += makeSection(
      'Experiential (Internship / Capstone)',
      expRows,
      !analysis.expMet ? '#991b1b' : analysis.expOverEnrolled ? '#92400e' : '#166534',
      !analysis.expMet ? 'Not enrolled' : analysis.expOverEnrolled ? `${analysis.expUnits} units — review` : 'Enrolled',
      !analysis.expMet ? '#fee2e2' : analysis.expOverEnrolled ? '#fef3c7' : '#dcfce7'
    );

    // Other courses
    if (analysis.generalElectives.length > 0) {
      sectionsHtml += makeSection(
        'Other Enrolled Courses',
        analysis.generalElectives.map(c => makeRow(
          c.code,
          c.title + (c.grade ? ` <span style="color:#6b7280;font-size:11px;">(${c.grade})</span>` : ''),
          'neutral'
        )).join(''),
        '#374151',
        `${analysis.generalElectives.length} course(s)`,
        '#e5e7eb'
      );
    }

    // Overall status
    const overallOk = analysis.allClear;
    const overallBg = overallOk ? '#f0fdf4' : '#fef2f2';
    const overallFg = overallOk ? '#166534' : '#991b1b';
    const overallText = overallOk ? 'All required categories met.' : [
      !analysis.coreOk
        ? `${analysis.coreResults.filter(r => !r.found).length} core course(s) missing` : '',
      !analysis.expMet ? 'Experiential requirement not yet enrolled' : '',
      analysis.expOverEnrolled ? 'Both experiential courses enrolled — review units' : '',
      prog.subplanElectives && !analysis.subplanOk
        ? `Subplan: ${analysis.subplanFulfilled} of ${prog.subplanMinCourses} min courses` : ''
    ].filter(Boolean).join('  |  ');

    const panel = doc.createElement('div');
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <style>
        #${PANEL_ID} {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 440px;
          max-height: 82vh;
          overflow-y: auto;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          z-index: 2147483647;
          font-size: 13px;
          color: #111827;
          line-height: 1.4;
        }
        #${PANEL_ID} * { box-sizing: border-box; }
        #${PANEL_ID} table { border-collapse: collapse; }
        #${PANEL_ID} .pos-sec-hdr:hover { background: #f3f4f6 !important; }
        #${PANEL_ID} button { cursor: pointer; border: none; background: none; font-family: inherit; }
      </style>

      <div style="background:#003366;color:#fff;padding:11px 15px;border-radius:9px 9px 0 0;
                  display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-weight:700;font-size:13px;">InfoSci Plan of Study Checker</div>
          <div style="font-size:11px;opacity:.75;margin-top:2px;">${prog.name}</div>
        </div>
        <button id="pos-close-btn" style="color:#fff;font-size:20px;line-height:1;padding:0 4px;opacity:.8;"
                title="Close">&#x2715;</button>
      </div>

      <div style="padding:8px 15px;font-size:12px;font-weight:600;
                  background:${overallBg};color:${overallFg};border-bottom:1px solid #e5e7eb;">
        ${overallText}
      </div>

      <div style="padding:6px 15px;font-size:11px;color:#4b5563;
                  border-bottom:1px solid #e5e7eb;background:#fff;">
        <span style="font-weight:600;color:#003366;">Program:</span> ${posData.program || 'N/A'}
        &nbsp;&nbsp;
        <span style="font-weight:600;color:#003366;">Subplan:</span> ${posData.subplan || 'N/A'}
        &nbsp;&nbsp;
        <span style="font-weight:600;color:#003366;">Courses:</span> ${posData.courses.length}
      </div>

      ${sectionsHtml}

      <div style="padding:8px 15px;font-size:11px;color:#6b7280;background:#f9fafb;
                  border-radius:0 0 9px 9px;line-height:1.5;">
        ${prog.notes}
      </div>`;

    doc.body.appendChild(panel);
    panel.querySelector('#pos-close-btn').addEventListener('click', () => panel.remove());
    panel.querySelectorAll('.pos-sec-hdr').forEach(hdr => {
      hdr.addEventListener('click', () => {
        const idx = hdr.getAttribute('data-idx');
        const body  = panel.querySelector(`.pos-sec-body-${idx}`);
        const arrow = panel.querySelector(`.pos-arr-${idx}`);
        if (!body) return;
        const hidden = body.style.display === 'none';
        body.style.display = hidden ? '' : 'none';
        if (arrow) arrow.innerHTML = hidden ? '&#9660;' : '&#9654;';
      });
    });
  }

  function injectFallbackBanner(doc, posData) {
    if (doc.getElementById(PANEL_ID)) return;
    // Show what we DID detect so the user can pick the right override
    const detected = [
      posData.program ? `Program: "${posData.program}"` : '',
      posData.degree  ? `Degree: "${posData.degree}"` : '',
      posData.subplan ? `Subplan: "${posData.subplan}"` : ''
    ].filter(Boolean).join(', ');

    const banner = doc.createElement('div');
    banner.id = PANEL_ID;
    banner.innerHTML = `
      <style>
        #${PANEL_ID} { all:initial; font-family:sans-serif; position:fixed; bottom:24px; right:24px;
          width:400px; background:#fff; border:1px solid #d1d5db; border-radius:10px;
          box-shadow:0 8px 30px rgba(0,0,0,0.15); z-index:2147483647; font-size:13px; color:#111; }
        #${PANEL_ID} * { box-sizing:border-box; }
      </style>
      <div style="background:#003366;color:#fff;padding:11px 15px;border-radius:9px 9px 0 0;
                  display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:700;font-size:13px;">InfoSci Plan of Study Checker</div>
        <button onclick="this.closest('#${PANEL_ID}').remove()"
                style="color:#fff;font-size:20px;line-height:1;background:none;border:none;
                       cursor:pointer;padding:0 4px;">&#x2715;</button>
      </div>
      <div style="padding:13px 15px;font-size:12px;color:#374151;line-height:1.7;">
        Plan of Study detected but program could not be identified automatically.<br>
        ${detected ? `<span style="color:#6b7280;">Detected: ${detected}</span><br>` : ''}
        <br>Use the extension toolbar button to select the program manually and re-run.
      </div>`;
    doc.body.appendChild(banner);
  }

  // CORE RUNNER
  function tryRun(doc, overrideProgram) {
    if (!doc || !doc.body) return;
    const text = doc.body.innerText || '';

    // Only run on POS pages
    if (!/coursework.*for.*major|plan\s+of\s+study/i.test(text)) return;
    if (doc.getElementById(PANEL_ID)) return;

    const posData = parseCoursesFromDoc(doc);
    if (posData.courses.length === 0 && !posData.program && !posData.subplan) return;

    const programKey = overrideProgram
      || detectProgram(posData.program, posData.degree, posData.subplan, posData.rawText);

    if (!programKey) {
      injectFallbackBanner(doc, posData);
      return;
    }
    injectPanel(doc, posData, programKey);
  }

  // Run immediately on this document (works when script is injected into the iframe)
  tryRun(document);

  // Also attempt via parent's iframe list after a delay (catches dynamic loads)
  setTimeout(() => {
    if (!document.getElementById(PANEL_ID)) tryRun(document);
    // If we are the top frame, check child iframes too
    try {
      Array.from(document.querySelectorAll('iframe')).forEach(frame => {
        let fd;
        try { fd = frame.contentDocument || frame.contentWindow.document; } catch (e) { return; }
        tryRun(fd);
      });
    } catch (e) { /* cross-origin, ignore */ }
  }, 2000);

  // POPUP MESSAGES
  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'runWithProgram') {
      const key = msg.programKey || null;

      // First try the current document (we may be inside the iframe already)
      const pd = parseCoursesFromDoc(document);
      if (pd.courses.length > 0) {
        removePanel(document);
        const pk = key || detectProgram(pd.program, pd.degree, pd.subplan, pd.rawText);
        if (pk) { injectPanel(document, pd, pk); return; }
        else { injectFallbackBanner(document, pd); return; }
      }

      // Fallback: check child iframes
      let ran = false;
      Array.from(document.querySelectorAll('iframe')).forEach(frame => {
        let fd;
        try { fd = frame.contentDocument || frame.contentWindow.document; } catch (e) { return; }
        if (!fd || !fd.body) return;
        const fpd = parseCoursesFromDoc(fd);
        if (fpd.courses.length > 0) {
          removePanel(fd);
          const pk = key || detectProgram(fpd.program, fpd.degree, fpd.subplan, fpd.rawText);
          if (pk) injectPanel(fd, fpd, pk);
          else injectFallbackBanner(fd, fpd);
          ran = true;
        }
      });
    }

    if (msg.action === 'closePanel') {
      removePanel(document);
      try {
        Array.from(document.querySelectorAll('iframe')).forEach(frame => {
          let fd;
          try { fd = frame.contentDocument || frame.contentWindow.document; } catch (e) { return; }
          removePanel(fd);
        });
      } catch (e) { /* ignore */ }
    }
  });

})();
