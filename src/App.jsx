// ─────────────────────────────────────────────────────────────────────────────
//  FinTrack — Desktop-Optimised Personal Finance & Friend Split Tracker
//  Firebase Firestore · Real-time · Desktop-first + Mobile responsive
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, getDocs, onSnapshot,
  addDoc, updateDoc, deleteDoc, query, where,
} from 'firebase/firestore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { db } from './firebase';

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cal+Sans&display=swap');
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

:root {
  --sidebar-w: 260px;

  /* ── Core Palette ── */
  --bg:     #f4f6f9;
  --bg2:    #eaecf2;
  --card:   #ffffff;
  --border: #e2e5ee;
  --border2:#cdd1de;

  /* ── Text ── */
  --ink:    #0f1117;
  --ink2:   #2a2d3e;
  --ink3:   #717693;
  --ink4:   #b0b5cc;

  /* ── Brand Teal ── */
  --t:       #0891b2;
  --t-light: #22d3ee;
  --t-dark:  #0e7490;
  --tbg:     #ecfeff;
  --tbrd:    rgba(8,145,178,0.18);

  /* ── Sidebar ── */
  --sid:     #0f1117;
  --sid-text:rgba(255,255,255,0.55);
  --sid-hover:rgba(255,255,255,0.06);
  --sid-active:rgba(8,145,178,0.18);

  /* ── Semantic ── */
  --green:   #10b981;
  --greenbg: #f0fdf4;
  --greenbrd:#6ee7b7;
  --red:     #ef4444;
  --redbg:   #fff1f2;
  --redbrd:  #fca5a5;
  --amber:   #f59e0b;
  --amberbg: #fffbeb;
  --amberbrd:#fcd34d;

  /* ── Settlement Violet ── */
  --ind:     #8b5cf6;
  --indbg:   #f5f3ff;
  --indbrd:  #c4b5fd;
  --ind-dark:#7c3aed;

  /* ── Layout ── */
  --r:    18px;
  --r-sm: 12px;
  --r-xs: 8px;

  /* ── Shadows ── */
  --s1: 0 1px 2px rgba(15,17,23,0.04), 0 2px 6px rgba(15,17,23,0.03);
  --s2: 0 4px 16px rgba(15,17,23,0.07), 0 1px 4px rgba(15,17,23,0.04);
  --s3: 0 12px 40px rgba(15,17,23,0.12), 0 2px 8px rgba(15,17,23,0.06);
  --sg: 0 0 0 1px rgba(8,145,178,0.12), 0 4px 20px rgba(8,145,178,0.15);

  /* ── Gradients ── */
  --g-brand:  linear-gradient(135deg, #0891b2 0%, #22d3ee 100%);
  --g-hero:   linear-gradient(140deg, #060810 0%, #0e3a4a 45%, #0891b2 100%);
  --g-card:   linear-gradient(145deg, #ffffff 0%, #f8faff 100%);
  --g-settle: linear-gradient(135deg, #1e1035 0%, #8b5cf6 100%);
  --g-green:  linear-gradient(135deg, #064e3b 0%, #10b981 100%);

  --fh: 'DM Sans', system-ui, sans-serif;
  --fb: 'DM Sans', system-ui, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  font-family: var(--fb);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--ink4); }

/* ═══ LAYOUT ═══ */
.ft-app { min-height: 100vh; }

/* ─── SIDEBAR ─── */
.sidebar {
  position: fixed; top: 0; left: 0; bottom: 0; width: var(--sidebar-w);
  background: var(--sid);
  z-index: 200; display: flex; flex-direction: column;
  border-right: 1px solid rgba(255,255,255,0.05);
  background-image: radial-gradient(ellipse at 30% 20%, rgba(8,145,178,0.08) 0%, transparent 60%);
}
.sid-logo {
  padding: 26px 22px 22px;
  display: flex; align-items: center; gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sid-logo-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: var(--g-brand);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
  box-shadow: 0 0 20px rgba(8,145,178,0.5), 0 4px 12px rgba(8,145,178,0.3);
}
.sid-logo-name {
  font-size: 20px; font-weight: 800;
  color: white; letter-spacing: -0.5px;
}
.sid-logo-sub { font-size: 10px; color: var(--sid-text); margin-top: 2px; letter-spacing: 0.04em; }

.sid-nav { flex: 1; padding: 14px 12px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }

.sid-section-label {
  font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.25);
  letter-spacing: 0.12em; text-transform: uppercase;
  padding: 10px 12px 6px;
}
.sid-item {
  display: flex; align-items: center; gap: 11px;
  padding: 10px 12px; border-radius: 11px; cursor: pointer;
  background: none; border: none; width: 100%; text-align: left;
  color: var(--sid-text); font-size: 13.5px; font-weight: 500;
  transition: all 0.15s; -webkit-tap-highlight-color: transparent;
  position: relative;
}
.sid-item:hover { background: var(--sid-hover); color: rgba(255,255,255,0.85); }
.sid-item.active {
  background: var(--sid-active); color: var(--t-light);
  font-weight: 700;
  box-shadow: inset 1px 0 0 var(--t);
}
.sid-item.active .sid-ico-wrap { background: rgba(8,145,178,0.3); color: var(--t-light); }
.sid-ico-wrap {
  width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; background: rgba(255,255,255,0.06);
  transition: all 0.15s;
}
.sid-label { flex: 1; }
.sid-badge {
  background: var(--t); color: white; border-radius: 20px;
  font-size: 10px; font-weight: 800; padding: 2px 8px; min-width: 20px; text-align: center;
  box-shadow: 0 0 8px rgba(8,145,178,0.5);
}
.sid-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 6px 12px; }

/* Quick action items */
.sid-item.action { color: rgba(255,255,255,0.7); }
.sid-item.action:hover { background: rgba(8,145,178,0.12); color: var(--t-light); }
.sid-item.action-purple:hover { background: rgba(139,92,246,0.12); color: #c4b5fd; }

.sid-user {
  padding: 14px 16px; border-top: 1px solid rgba(255,255,255,0.06);
  display: flex; align-items: center; gap: 11px;
  background: rgba(255,255,255,0.02);
}
.sid-user-av {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: var(--g-brand);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: white;
  box-shadow: 0 0 12px rgba(8,145,178,0.4);
}
.sid-user-name { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.9); }
.sid-user-sub  { font-size: 11px; color: var(--sid-text); margin-top: 1px; }
.sid-logout {
  margin-left: auto; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.08);
  color: var(--sid-text); border-radius: 8px; padding: 5px 10px;
  font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.15s;
}
.sid-logout:hover { background: rgba(239,68,68,0.2); color: #fca5a5; border-color: rgba(239,68,68,0.3); }

/* Mobile toggle */
.mob-topbar {
  display: none; position: fixed; top: 0; left: 0; right: 0; z-index: 150;
  height: 56px; background: var(--sid);
  align-items: center; padding: 0 16px; gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.mob-toggle {
  background: none; border: none; color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 9px; transition: background 0.15s;
}
.mob-toggle:hover { background: var(--sid-hover); }
.mob-brand { font-size: 17px; font-weight: 800; color: white; }
.sid-overlay {
  display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  z-index: 190; backdrop-filter: blur(4px);
}

/* ─── MAIN ─── */
.app-body { margin-left: var(--sidebar-w); min-height: 100vh; }
.page-content { padding: 36px 40px; max-width: 1440px; }

.page-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
.page-title { font-size: 28px; font-weight: 800; color: var(--ink); line-height: 1; letter-spacing: -0.5px; }
.page-sub   { font-size: 13px; color: var(--ink3); margin-top: 5px; }
.page-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

/* ─── STAT CARDS ─── */
.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 32px; }
.stat-card {
  background: var(--card); border-radius: var(--r); padding: 22px 24px;
  border: 1px solid var(--border); box-shadow: var(--s1);
  display: flex; flex-direction: column; gap: 12px;
  transition: box-shadow 0.2s, transform 0.2s; position: relative; overflow: hidden;
}
.stat-card::after { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:var(--g-brand); opacity:0; transition:opacity 0.2s; }
.stat-card:hover { box-shadow: var(--s2); transform: translateY(-2px); }
.stat-card:hover::after { opacity: 1; }
.stat-card-top { display: flex; align-items: center; justify-content: space-between; }
.stat-ico { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.stat-label { font-size: 11px; font-weight: 600; color: var(--ink3); letter-spacing: 0.06em; text-transform: uppercase; }
.stat-value { font-size: 28px; font-weight: 800; color: var(--ink); line-height: 1; letter-spacing: -0.5px; }
.stat-value.green { color: var(--green); }
.stat-value.red   { color: var(--red); }
.stat-value.amber { color: var(--amber); }
.stat-value.teal  { color: var(--t); }
.stat-trend { font-size: 12px; color: var(--ink3); }

/* ─── HERO BANNER ─── */
.hero-banner {
  background: var(--g-hero); border-radius: 22px; padding: 32px 36px;
  margin-bottom: 32px; position: relative; overflow: hidden;
  box-shadow: 0 8px 32px rgba(8,145,178,0.2), 0 2px 8px rgba(0,0,0,0.15);
  display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 32px;
}
.hero-banner::before { content:''; position:absolute; width:500px; height:500px; border-radius:50%; top:-200px; right:-120px; background:radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%); pointer-events:none; }
.hero-greeting { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
.hero-name { font-size: 30px; font-weight: 800; color: white; margin-bottom: 5px; letter-spacing: -0.5px; }
.hero-sub  { font-size: 13px; color: rgba(255,255,255,0.4); }
.hero-right { display: flex; gap: 12px; flex-shrink: 0; flex-wrap: wrap; }
.hero-mini { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 16px 22px; min-width: 130px; backdrop-filter: blur(8px); transition: background 0.2s; }
.hero-mini:hover { background: rgba(255,255,255,0.13); }
.hero-mini-label { font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 7px; }
.hero-mini-value { font-size: 22px; font-weight: 800; color: white; letter-spacing: -0.3px; }

/* ─── DASHBOARD GRID ─── */
.dash-grid { display: grid; grid-template-columns: 1fr 380px; gap: 26px; }
.sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.sec-title { font-size: 15px; font-weight: 700; color: var(--ink); }
.sec-more { font-size: 12px; font-weight: 600; color: var(--t); cursor: pointer; background: none; border: none; padding: 5px 12px; border-radius: 8px; transition: all 0.14s; }
.sec-more:hover { background: var(--tbg); }

/* ─── ACTIVITY ─── */
.activity-card { background: var(--card); border-radius: var(--r); border: 1px solid var(--border); box-shadow: var(--s1); overflow: hidden; }
.activity-row { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-bottom: 1px solid var(--border); transition: background 0.12s; }
.activity-row:last-child { border-bottom: none; }
.activity-row:hover { background: var(--bg); }
.act-ico  { width: 42px; height: 42px; border-radius: 13px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.act-body { flex: 1; min-width: 0; }
.act-title { font-size: 14px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.act-sub   { font-size: 12px; color: var(--ink3); margin-top: 3px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.act-dot   { width: 3px; height: 3px; border-radius: 50%; background: var(--border2); }
.act-amt   { font-size: 15px; font-weight: 700; flex-shrink: 0; }

/* ─── FRIENDS LIST ─── */
.friends-list { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--s1); overflow: hidden; }
.fl-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 140px; padding: 11px 22px; background: var(--bg); border-bottom: 1px solid var(--border); }
.fl-header-cell { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink4); }
.fl-row-wrap { border-bottom: 1px solid var(--border); }
.fl-row-wrap:last-child { border-bottom: none; }
.fl-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 140px; align-items: center; padding: 16px 22px; cursor: pointer; transition: background 0.14s; user-select: none; }
.fl-row:hover { background: #fafbff; }
.fl-row.open  { background: var(--tbg); }
.fl-identity { display: flex; align-items: center; gap: 14px; }
.fl-av   { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.fl-name { font-size: 14px; font-weight: 700; color: var(--ink); }
.fl-phone{ font-size: 12px; color: var(--ink3); margin-top: 2px; }
.fl-cell          { font-size: 14px; font-weight: 700; }
.fl-cell.given    { color: var(--red); }
.fl-cell.recvd    { color: var(--green); }
.fl-cell.bal-pos  { color: var(--red); }
.fl-cell.bal-neg  { color: var(--green); }
.fl-cell.bal-zero { color: var(--ink4); font-size: 13px; font-weight: 500; }
.fl-actions { display: flex; align-items: center; gap: 6px; justify-content: flex-end; }
.fl-expand-btn { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: var(--t); background: var(--tbg); border: 1px solid var(--tbrd); border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.fl-expand-btn:hover { background: var(--t); color: white; border-color: var(--t); }

.fl-detail { background: #f8faff; border-top: 1px solid var(--border); animation: slideDown 0.22s cubic-bezier(0.22,1,0.36,1); }
@keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
.fl-detail-inner { padding: 24px 26px 28px; }
.fl-summary { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 22px; }
.fl-sum-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 16px 18px; box-shadow: var(--s1); }
.fl-sum-lbl { font-size: 10px; font-weight: 600; color: var(--ink3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 7px; }
.fl-sum-val { font-size: 22px; font-weight: 800; color: var(--ink); letter-spacing: -0.3px; }
.fl-sum-val.red   { color: var(--red); }
.fl-sum-val.green { color: var(--green); }
.fl-acc-strip { display: flex; gap: 10px; margin-bottom: 22px; flex-wrap: wrap; }
.fl-acc-pill { display: flex; align-items: center; gap: 8px; background: var(--card); border: 1px solid var(--border); border-radius: 11px; padding: 9px 15px; font-size: 13px; font-weight: 600; box-shadow: var(--s1); transition: box-shadow 0.15s; }
.fl-acc-pill:hover { box-shadow: var(--s2); }
.fl-acc-pill-name { color: var(--ink2); }
.fl-acc-pill-amt  { font-weight: 700; color: var(--red); }
.fl-acc-pill-recv { color: var(--green); font-weight: 700; }
.fl-txn-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.fl-txn-table thead tr { background: var(--bg); }
.fl-txn-table th { padding: 10px 15px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--ink4); border-bottom: 1px solid var(--border); white-space: nowrap; }
.fl-txn-table td { padding: 13px 15px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.fl-txn-table tr:last-child td { border-bottom: none; }
.fl-txn-table tr:hover td { background: #fafbff; }
.fl-txn-wrap { background: var(--card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; box-shadow: var(--s1); }

/* ─── ACCOUNT CARDS ─── */
.accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px; }
.account-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--s1); overflow: hidden; transition: box-shadow 0.2s, transform 0.2s; }
.account-card:hover { box-shadow: var(--s2); transform: translateY(-1px); }
.acc-stripe { height: 3px; }
.acc-stripe.cc   { background: linear-gradient(90deg, var(--t-dark), var(--t-light)); }
.acc-stripe.bank { background: var(--g-green); }
.acc-body { padding: 20px; }
.acc-chip { display: inline-flex; align-items: center; gap: 5px; border-radius: 20px; padding: 3px 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 12px; }
.acc-chip.cc   { background: var(--tbg); color: var(--t); border: 1px solid var(--tbrd); }
.acc-chip.bank { background: var(--greenbg); color: var(--green); border: 1px solid var(--greenbrd); }
.acc-name { font-size: 20px; font-weight: 800; color: var(--ink); margin-bottom: 3px; letter-spacing: -0.3px; }
.acc-sub  { font-size: 12px; color: var(--ink3); margin-bottom: 18px; }
.acc-big  { font-size: 32px; font-weight: 800; color: var(--ink); letter-spacing: -0.5px; }
.bar-track { background: var(--bg2); border-radius: 6px; height: 6px; overflow: hidden; margin: 10px 0 5px; }
.bar-fill  { height: 100%; border-radius: 6px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
.bar-fill.cc     { background: linear-gradient(90deg, var(--t-dark), var(--t-light)); }
.bar-fill.bank   { background: var(--g-green); }
.bar-fill.warn   { background: linear-gradient(90deg, #b45309, #fbbf24); }
.bar-fill.danger { background: linear-gradient(90deg, #b91c1c, #f87171); }
.bar-row   { display: flex; justify-content: space-between; font-size: 12px; color: var(--ink3); }
.bar-avail { font-size: 13px; font-weight: 700; }
.acc-actions { display: flex; border-top: 1px solid var(--border); background: var(--bg); }
.acc-btn { flex: 1; padding: 12px 8px; background: none; border: none; color: var(--ink3); cursor: pointer; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 5px; border-right: 1px solid var(--border); transition: all 0.13s; }
.acc-btn:last-child { border-right: none; }
.acc-btn:hover { background: var(--card); color: var(--ink); }

.bkd-panel { background: #f8faff; border-top: 1px solid var(--border); }
.bkd-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.bkd-table th { padding: 10px 18px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink4); background: var(--bg); border-bottom: 1px solid var(--border); }
.bkd-table td { padding: 13px 18px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.bkd-table tr:last-child td { border-bottom: none; }
.bkd-table tr:hover td { background: #fafbff; }

.acc-ledger { border-top: 2px solid var(--border); background: #f8faff; animation: slideDown 0.22s cubic-bezier(0.22,1,0.36,1); }
.acc-ledger-header { padding: 20px 24px 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.acc-ledger-title { font-size: 15px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 9px; }
.acc-ledger-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; padding: 0 24px 18px; }
.als-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 14px 16px; box-shadow: var(--s1); }
.als-lbl  { font-size: 10px; font-weight: 600; color: var(--ink3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
.als-val  { font-size: 20px; font-weight: 800; color: var(--ink); letter-spacing: -0.3px; }
.als-val.red   { color: var(--red); }
.als-val.green { color: var(--green); }
.als-val.ind   { color: var(--ind); }
.als-val.teal  { color: var(--t); }
.ledger-settle-row td { background: #faf5ff !important; }
.ledger-settle-row:hover td { background: #f3e8ff !important; }

.acc-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
.acc-tab { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 22px; cursor: pointer; background: var(--card); border: 1.5px solid var(--border); font-size: 13px; font-weight: 600; color: var(--ink2); transition: all 0.15s; white-space: nowrap; }
.acc-tab:hover { border-color: var(--t); color: var(--t); background: var(--tbg); }
.acc-tab.active { background: var(--t); border-color: var(--t); color: white; font-weight: 700; }
.acc-tab-count { border-radius: 20px; font-size: 10px; font-weight: 700; padding: 2px 8px; background: var(--bg2); color: var(--ink3); }
.acc-tab.active .acc-tab-count { background: rgba(255,255,255,0.22); color: white; }

/* ─── BUTTONS ─── */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 22px; border-radius: var(--r-sm); font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.15s; border: none; white-space: nowrap; -webkit-tap-highlight-color: transparent; letter-spacing: -0.1px; }
.btn-primary { background: var(--t); color: white; box-shadow: 0 2px 10px rgba(8,145,178,0.3); }
.btn-primary:hover  { background: var(--t-dark); box-shadow: 0 4px 16px rgba(8,145,178,0.4); }
.btn-primary:active { transform: scale(0.97); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-ghost  { background: var(--card); color: var(--ink2); border: 1.5px solid var(--border); }
.btn-ghost:hover { background: var(--bg); border-color: var(--border2); }
.btn-danger { background: var(--redbg); color: var(--red); border: 1px solid var(--redbrd); }
.btn-danger:hover { background: #ffe4e6; }
.btn-sm   { padding: 7px 14px; font-size: 12px; border-radius: var(--r-xs); }
.btn-icon { padding: 8px; border-radius: 10px; }
.btn-full { width: 100%; }

/* ─── FORM ─── */
.form-section { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 26px; box-shadow: var(--s1); margin-bottom: 24px; }
.form-title   { font-size: 19px; font-weight: 800; color: var(--ink); margin-bottom: 4px; letter-spacing: -0.3px; }
.form-sub     { font-size: 13px; color: var(--ink3); margin-bottom: 22px; }
.form-row     { display: grid; gap: 14px; margin-bottom: 14px; }
.form-row.g2  { grid-template-columns: 1fr 1fr; }
.form-row.g3  { grid-template-columns: 1fr 1fr 1fr; }
.field        { display: flex; flex-direction: column; gap: 6px; }
.field-label  { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink3); }
.field-input  { background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--r-sm); padding: 11px 14px; font-size: 14px; color: var(--ink); transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; outline: none; width: 100%; }
.field-input:focus { border-color: var(--t); box-shadow: 0 0 0 3px rgba(8,145,178,0.1); background: white; }
.field-input::placeholder { color: var(--ink4); }
select.field-input { cursor: pointer; }
.input-wrap  { position: relative; }
.input-wrap .field-input { padding-right: 44px; }
.eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--ink4); padding: 4px; display: flex; align-items: center; }

/* ─── TABLE ─── */
.tbl-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--s1); overflow: hidden; }
.tbl-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
thead tr { background: var(--bg); }
th { padding: 12px 18px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink4); border-bottom: 1px solid var(--border); white-space: nowrap; }
td { padding: 14px 18px; font-size: 13px; border-bottom: 1px solid var(--border); vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: #fafbff; }
.td-bold  { font-weight: 700; color: var(--ink); }
.td-muted { color: var(--ink3); font-size: 12px; }
.td-green { color: var(--green); font-weight: 700; }
.td-red   { color: var(--red);   font-weight: 700; }
.td-teal  { color: var(--t);     font-weight: 700; }
.td-amber { color: var(--amber); font-weight: 700; }

/* ─── BADGES ─── */
.badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge-green  { background: var(--greenbg); color: var(--green); border: 1px solid var(--greenbrd); }
.badge-red    { background: var(--redbg);   color: var(--red);   border: 1px solid var(--redbrd); }
.badge-teal   { background: var(--tbg);     color: var(--t);     border: 1px solid var(--tbrd); }
.badge-amber  { background: var(--amberbg); color: var(--amber); border: 1px solid var(--amberbrd); }
.badge-gray   { background: var(--bg2);     color: var(--ink3);  border: 1px solid var(--border2); }
.txn-expense  { background: var(--redbg);   color: var(--red);   border: 1px solid var(--redbrd);   border-radius: 6px; padding: 3px 10px; font-size: 11px; font-weight: 700; }
.txn-payment  { background: var(--greenbg); color: var(--green); border: 1px solid var(--greenbrd); border-radius: 6px; padding: 3px 10px; font-size: 11px; font-weight: 700; }
.txn-personal { background: var(--amberbg); color: var(--amber); border: 1px solid var(--amberbrd); border-radius: 6px; padding: 3px 10px; font-size: 11px; font-weight: 700; }
.txn-settle   { background: var(--indbg);   color: var(--ind);   border: 1px solid var(--indbrd);   border-radius: 6px; padding: 3px 10px; font-size: 11px; font-weight: 700; }
.badge-indigo { background: var(--indbg); color: var(--ind); border: 1px solid var(--indbrd); }

/* ─── SETTLEMENT ─── */
.settle-hero { background: var(--g-settle); border-radius: 22px; padding: 30px 36px; margin-bottom: 28px; position: relative; overflow: hidden; box-shadow: 0 8px 32px rgba(139,92,246,0.3); display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 24px; }
.settle-hero::before { content:''; position:absolute; width:300px; height:300px; border-radius:50%; top:-100px; right:-80px; background:radial-gradient(circle, rgba(196,181,253,0.12) 0%, transparent 70%); pointer-events:none; }
.settle-hero-title { font-size: 26px; font-weight: 800; color: white; margin-bottom: 4px; letter-spacing: -0.4px; }
.settle-hero-sub   { font-size: 13px; color: rgba(255,255,255,0.5); }
.settle-stats { display: flex; gap: 12px; flex-shrink: 0; flex-wrap: wrap; }
.settle-stat { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 14px 20px; min-width: 120px; backdrop-filter: blur(8px); transition: background 0.2s; }
.settle-stat:hover { background: rgba(255,255,255,0.15); }
.settle-stat-lbl { font-size: 10px; color: rgba(255,255,255,0.45); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 5px; }
.settle-stat-val { font-size: 22px; font-weight: 800; color: white; letter-spacing: -0.3px; }

.flow-pill { display: inline-flex; align-items: center; gap: 7px; background: var(--indbg); border: 1px solid var(--indbrd); border-radius: 20px; padding: 5px 13px; font-size: 12px; font-weight: 700; color: var(--ind); white-space: nowrap; }
.flow-arrow { color: var(--ind); font-size: 14px; }
.modal-settle { max-width: 600px; }
.method-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; }
.method-btn { display: flex; flex-direction: column; align-items: center; gap: 7px; padding: 16px 12px; border-radius: 13px; cursor: pointer; background: var(--bg); border: 2px solid var(--border); transition: all 0.15s; }
.method-btn:hover { background: var(--indbg); border-color: var(--indbrd); }
.method-btn.active { background: var(--indbg); border-color: var(--ind); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
.method-btn-ico  { font-size: 24px; }
.method-btn-lbl  { font-size: 12px; font-weight: 700; color: var(--ink2); text-align: center; }
.method-btn.active .method-btn-lbl { color: var(--ind); }

/* ─── FILTER ─── */
.filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
.filter-select { background: var(--card); border: 1.5px solid var(--border); border-radius: 22px; padding: 8px 16px; font-size: 13px; font-weight: 500; color: var(--ink2); outline: none; cursor: pointer; flex-shrink: 0; transition: border-color 0.15s; }
.filter-select:focus { border-color: var(--t); }
.filter-date { padding: 8px 13px; }
.filter-clear { font-size: 13px; color: var(--ink3); cursor: pointer; background: none; border: none; font-weight: 600; padding: 6px 10px; border-radius: 8px; transition: all 0.14s; }
.filter-clear:hover { background: var(--redbg); color: var(--red); }
.filter-count { font-size: 12px; color: var(--ink3); margin-left: auto; }

/* ─── MODAL ─── */
.modal-overlay { position: fixed; inset: 0; background: rgba(5,8,20,0.65); backdrop-filter: blur(10px); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 24px; }
.modal { background: var(--card); border-radius: 22px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; box-shadow: 0 32px 80px rgba(5,8,20,0.35), 0 0 0 1px var(--border); animation: modalIn 0.22s cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
.modal-body   { padding: 30px 32px 34px; }
.modal-title  { font-size: 22px; font-weight: 800; color: var(--ink); margin-bottom: 4px; letter-spacing: -0.3px; }
.modal-sub    { font-size: 13px; color: var(--ink3); margin-bottom: 24px; }
.modal-actions{ display: flex; gap: 10px; margin-top: 22px; }

/* ─── CHARTS ─── */
.chart-card  { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 24px; box-shadow: var(--s1); }
.chart-title { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 20px; }
.charts-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

/* ─── STATEMENT ─── */
.stmt-header { border-radius: var(--r); padding: 26px 30px; color: white; margin-bottom: 22px; box-shadow: var(--s2); }
.stmt-header.cc   { background: var(--g-hero); }
.stmt-header.bank { background: var(--g-green); }
.stmt-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-top: 18px; }
.stmt-box { background: rgba(255,255,255,0.1); border-radius: 13px; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.1); }
.stmt-box-lbl { font-size: 9px; opacity: 0.55; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 5px; }
.stmt-box-val { font-size: 20px; font-weight: 800; }

/* ─── EMPTY ─── */
.empty { padding: 72px 24px; text-align: center; }
.empty-icon  { font-size: 52px; margin-bottom: 16px; opacity: 0.15; }
.empty-title { font-size: 16px; color: var(--ink3); font-weight: 700; }
.empty-sub   { font-size: 13px; color: var(--ink4); margin-top: 6px; }

/* ─── TOAST ─── */
.toast { position: fixed; bottom: 28px; left: calc(var(--sidebar-w) + 24px); z-index: 9999; background: var(--ink); color: white; border-radius: 13px; padding: 13px 20px; font-size: 13.5px; font-weight: 600; box-shadow: var(--s3); display: flex; align-items: center; gap: 9px; animation: toastIn 0.24s cubic-bezier(0.22,1,0.36,1); border: 1px solid rgba(255,255,255,0.1); }
.toast.success { background: #052e16; border-color: rgba(16,185,129,0.2); }
.toast.error   { background: #450a0a; border-color: rgba(239,68,68,0.2); }
@keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

/* ─── LOADER ─── */
.loader { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; min-height: 100vh; color: var(--ink3); font-size: 14px; font-weight: 500; }
.spinner { width: 28px; height: 28px; border: 2px solid var(--border); border-top-color: var(--t); border-radius: 50%; animation: spin 0.65s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── LOGIN ─── */
.login-wrap { min-height: 100vh; display: grid; grid-template-columns: 1.1fr 0.9fr; }
.login-left { background: var(--g-hero); display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: 72px; position: relative; overflow: hidden; }
.login-left::before { content:''; position:absolute; width:500px; height:500px; border-radius:50%; top:-200px; right:-150px; background:radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%); pointer-events:none; }
.login-left::after  { content:''; position:absolute; width:300px; height:300px; border-radius:50%; bottom:-100px; left:-80px; background:radial-gradient(circle, rgba(8,145,178,0.06) 0%, transparent 70%); pointer-events:none; }
.login-hero-icon  { width: 72px; height: 72px; border-radius: 22px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 38px; margin-bottom: 30px; }
.login-hero-title { font-size: 44px; font-weight: 800; color: white; line-height: 1.1; margin-bottom: 16px; letter-spacing: -1px; }
.login-hero-sub   { font-size: 16px; color: rgba(255,255,255,0.5); line-height: 1.7; max-width: 380px; }
.login-features   { margin-top: 44px; display: flex; flex-direction: column; gap: 14px; }
.login-feat       { display: flex; align-items: center; gap: 13px; color: rgba(255,255,255,0.75); font-size: 14px; font-weight: 500; }
.login-feat-ico   { width: 36px; height: 36px; border-radius: 11px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
.login-right      { display: flex; align-items: center; justify-content: center; padding: 48px; background: var(--bg); }
.login-card       { background: var(--card); border: 1px solid var(--border); border-radius: 24px; padding: 44px 42px; width: 100%; max-width: 420px; box-shadow: var(--s3); }
.login-card-title { font-size: 28px; font-weight: 800; color: var(--ink); margin-bottom: 6px; letter-spacing: -0.5px; }
.login-card-sub   { font-size: 14px; color: var(--ink3); margin-bottom: 30px; }
.login-error      { background: var(--redbg); border: 1px solid var(--redbrd); border-radius: 11px; padding: 12px 15px; font-size: 13px; color: var(--red); margin-bottom: 16px; font-weight: 600; }

/* ─── WHO OWES ─── */
.owes-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--s1); overflow: hidden; margin-bottom: 22px; }
.owes-row  { display: flex; align-items: center; gap: 13px; padding: 13px 18px; border-bottom: 1px solid var(--border); transition: background 0.12s; }
.owes-row:last-child { border-bottom: none; }
.owes-row:hover { background: var(--bg); }
.owes-av   { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
.owes-name { flex: 1; font-size: 14px; font-weight: 600; color: var(--ink); }
.owes-amt  { font-size: 14px; font-weight: 700; color: var(--red); }

.insight-row { display: flex; align-items: center; justify-content: space-between; padding: 13px 20px; border-bottom: 1px solid var(--border); }
.insight-row:last-child { border-bottom: none; }

/* ─── RESPONSIVE ─── */
@media (max-width: 1200px) {
  .dash-grid { grid-template-columns: 1fr; }
  .dash-side { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
  .stat-row  { grid-template-columns: repeat(2, 1fr); }
  .stmt-stats { grid-template-columns: repeat(2, 1fr); }
  .charts-row { grid-template-columns: 1fr; }
}
@media (max-width: 900px) {
  .hero-banner { grid-template-columns: 1fr; }
  .hero-right  { flex-wrap: wrap; }
  .accounts-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  :root { --sidebar-w: 0px; }
  .sidebar { transform: translateX(-260px); transition: transform 0.26s cubic-bezier(0.4,0,0.2,1); width: 260px; }
  .sidebar.open { transform: translateX(0); }
  .app-body { margin-left: 0; }
  .mob-topbar { display: flex; }
  .sid-overlay { display: block; }
  .sid-overlay.visible { opacity: 1; pointer-events: auto; }
  .sid-overlay:not(.visible) { opacity: 0; pointer-events: none; }
  .page-content { padding: 76px 16px 24px; }
  .stat-row { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .login-wrap { grid-template-columns: 1fr; }
  .login-left { display: none; }
  .login-right { padding: 24px 20px; }
  .toast { left: 16px; bottom: 20px; }
  .modal-overlay { align-items: flex-end; padding: 0; }
  .modal { border-radius: 22px 22px 0 0; max-width: 100%; }
  .form-row.g2, .form-row.g3 { grid-template-columns: 1fr; }
  .fl-header { display: none; }
  .fl-row { grid-template-columns: 1fr auto; }
  .fl-cell, .fl-actions { display: none; }
  .settle-hero { grid-template-columns: 1fr; }
  .dash-side { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .stat-row { grid-template-columns: 1fr 1fr; }
}
`;
// ─── HELPERS ─────────────────────────────────────────────────────────────────
const injectCSS = () => {
  if (document.getElementById('ft-css')) return;
  const el = document.createElement('style');
  el.id = 'ft-css'; el.textContent = CSS;
  document.head.appendChild(el);
};

const fmt = n => '₹' + Number(n||0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtDate = d => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};
const today   = () => new Date().toISOString().split('T')[0];
const initials = (n='') => n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()||'?';

const PALETTE = ['#0a7268','#2563eb','#7c3aed','#db2777','#ea580c','#16a34a','#0891b2','#d97706','#dc2626','#059669'];
const colorFor = (s='') => PALETTE[s.split('').reduce((a,c)=>a+c.charCodeAt(0),0) % PALETTE.length];

function useToast() {
  const [t, setT] = useState(null);
  const show = useCallback((msg, type='success') => setT({msg, type, id: Date.now()}), []);
  function Toast({ msg, type, onDone }) {
    useEffect(() => { const x = setTimeout(onDone,3200); return ()=>clearTimeout(x); }, [onDone]);
    return <div className={`toast ${type}`}>{type==='success'?'✓':type==='error'?'✕':'ℹ'} {msg}</div>;
  }
  const el = t ? <Toast key={t.id} msg={t.msg} type={t.type} onDone={()=>setT(null)}/> : null;
  return [show, el];
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Ico = ({d, size=15}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const IcoTrash   = () => <Ico d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></>}/>;
const IcoEdit    = () => <Ico d={<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>;
const IcoPlus    = () => <Ico d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/>;
const IcoEye     = () => <Ico d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}/>;
const IcoEyeOff  = () => <Ico d={<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}/>;
const IcoHistory = () => <Ico d={<><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 106 5.3L3 8"/><path d="M12 7v5l4 2"/></>}/>;
const IcoMenu    = () => <Ico d={<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>} size={20}/>;
const IcoX       = () => <Ico d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} size={20}/>;
const IcoCaret   = ({up}) => <Ico d={up ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>} size={14}/>;

// ─── SEED ────────────────────────────────────────────────────────────────────
async function seedIfEmpty(userId) {
  const snap = await getDocs(query(collection(db,'friends'),where('userId','==',userId)));
  if (!snap.empty) return;
  const f1 = await addDoc(collection(db,'friends'),{userId,name:'Amit Sharma',phone:'9876543001',color:PALETTE[0]});
  const f2 = await addDoc(collection(db,'friends'),{userId,name:'Priya Patel',phone:'9876543002',color:PALETTE[2]});
  const a1 = await addDoc(collection(db,'accounts'),{userId,name:'HDFC Credit Card',type:'credit_card',color:PALETTE[1],limit:100000});
  const a2 = await addDoc(collection(db,'accounts'),{userId,name:'SBI Savings',type:'bank_account',color:PALETTE[3],balance:50000});
  const txns = [
    {userId,friendId:f1.id,accountId:a1.id,type:'expense',amount:3200,date:'2026-01-15',note:'Dinner at Mainland China'},
    {userId,friendId:f1.id,accountId:a2.id,type:'expense',amount:1500,date:'2026-02-10',note:'Movie tickets'},
    {userId,friendId:f1.id,accountId:a1.id,type:'payment',amount:2000,date:'2026-03-01',note:'Partial repayment'},
    {userId,friendId:f2.id,accountId:a1.id,type:'expense',amount:5800,date:'2026-01-22',note:'Flight tickets booking'},
    {userId,friendId:f2.id,accountId:a2.id,type:'expense',amount:2200,date:'2026-02-18',note:'Hotel split'},
    {userId,friendId:f2.id,accountId:a1.id,type:'payment',amount:5800,date:'2026-03-05',note:'Full payment received'},
  ];
  for (const t of txns) await addDoc(collection(db,'transactions'),t);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── LOGIN ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [phone,setPhone] = useState('');
  const [pass,setPass]   = useState('');
  const [showP,setShowP] = useState(false);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);
  const [reg,setReg]     = useState(false);
  const [name,setName]   = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!phone||!pass){setError('Please fill all fields.');return;}
    setLoading(true);setError('');
    try {
      if (reg) {
        const q=query(collection(db,'users'),where('phone','==',phone));
        const ex=await getDocs(q);
        if(!ex.empty){setError('Phone already registered.');setLoading(false);return;}
        const ref=await addDoc(collection(db,'users'),{name:name||'User',phone,password:pass});
        await seedIfEmpty(ref.id);
        onLogin({id:ref.id,name:name||'User',phone});
      } else {
        const q=query(collection(db,'users'),where('phone','==',phone));
        const snap=await getDocs(q);
        if(snap.empty){setError('Phone not found. Please register.');setLoading(false);return;}
        const u=snap.docs[0];
        if(u.data().password!==pass){setError('Incorrect password.');setLoading(false);return;}
        onLogin({id:u.id,...u.data()});
      }
    } catch(err){setError('Connection error. Check Firebase config.');console.error(err);}
    finally{setLoading(false);}
  };

  return (
    <div className="login-wrap">
      <div className="login-left">
        <div className="login-hero-icon">💸</div>
        <div className="login-hero-title">Track Every<br/>Split, Instantly.</div>
        <div className="login-hero-sub">Know exactly who owes what, from which account, on which date — all in one place.</div>
        <div className="login-features">
          {[['📊','Real-time balance tracking'],['👥','Per-friend transaction history'],['🏦','Credit card & bank account support'],['📋','Detailed account statements']].map(([ico,txt])=>(
            <div key={txt} className="login-feat"><div className="login-feat-ico">{ico}</div>{txt}</div>
          ))}
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-title">{reg ? 'Create account' : 'Welcome back'}</div>
          <div className="login-card-sub">{reg ? 'Start tracking your splits today' : 'Sign in to your FinTrack'}</div>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={submit}>
            {reg && (
              <div className="form-row" style={{marginBottom:14}}>
                <div className="field">
                  <label className="field-label">Full Name</label>
                  <input className="field-input" placeholder="e.g. Rahul Verma" value={name} onChange={e=>setName(e.target.value)}/>
                </div>
              </div>
            )}
            <div className="form-row" style={{marginBottom:14}}>
              <div className="field">
                <label className="field-label">Phone Number</label>
                <input className="field-input" type="tel" placeholder="10-digit mobile number"
                  value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}/>
              </div>
            </div>
            <div className="form-row" style={{marginBottom:24}}>
              <div className="field">
                <label className="field-label">Password</label>
                <div className="input-wrap">
                  <input className="field-input" type={showP?'text':'password'} placeholder="Enter password"
                    value={pass} onChange={e=>setPass(e.target.value)}/>
                  <button type="button" className="eye-btn" onClick={()=>setShowP(v=>!v)}>
                    {showP?<IcoEyeOff/>:<IcoEye/>}
                  </button>
                </div>
              </div>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{height:46,fontSize:15}}>
              {loading?'Please wait…':reg?'Create Account':'Sign In'}
            </button>
          </form>
          <div style={{marginTop:22,textAlign:'center',fontSize:13,color:'var(--ink3)',fontWeight:500}}>
            {reg?'Already have an account? ':"Don't have an account? "}
            <button onClick={()=>{setReg(v=>!v);setError('');}}
              style={{background:'none',border:'none',color:'var(--t)',fontWeight:700,cursor:'pointer',fontFamily:'var(--fb)',fontSize:13}}>
              {reg?'Sign In':'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CHART TOOLTIP ───────────────────────────────────────────────────────────
const ChartTip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:'#0c1c19',color:'white',padding:'10px 15px',borderRadius:11,fontSize:13}}>
      <div style={{fontSize:11,opacity:0.55,marginBottom:4}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{fontWeight:700,color:p.color||'white'}}>{p.name}: {fmt(p.value)}</div>)}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── APP SHELL ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AppShell({ user, onLogout }) {
  const [tab,setTab]           = useState('dashboard');
  const [friends,setFriends]   = useState([]);
  const [accounts,setAccounts] = useState([]);
  const [transactions,setTxns] = useState([]);
  const [settlements,setSettlements] = useState([]);
  const [showTxnForm,setTxnForm] = useState(false);
  const [showSettleForm,setSettleForm] = useState(false);
  const [mobOpen,setMobOpen]   = useState(false);
  const [showToast,toastEl]    = useToast();

  useEffect(()=>{
    const qF=query(collection(db,'friends'),where('userId','==',user.id));
    const qA=query(collection(db,'accounts'),where('userId','==',user.id));
    const qT=query(collection(db,'transactions'),where('userId','==',user.id));
    const qS=query(collection(db,'settlements'),where('userId','==',user.id));
    const u1=onSnapshot(qF,s=>setFriends(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(qA,s=>setAccounts(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u3=onSnapshot(qT,s=>setTxns(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u4=onSnapshot(qS,s=>setSettlements(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{u1();u2();u3();u4();};
  },[user.id]);

  const pending = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
                - transactions.filter(t=>t.type==='payment').reduce((s,t)=>s+Number(t.amount),0);

  const navItems = [
    {id:'dashboard',   label:'Dashboard',   icon:'🏠'},
    {id:'transactions',label:'Transactions',icon:'💳'},
    {id:'friends',     label:'Friends',     icon:'👥', badge: friends.filter(f=>{
      const bal=transactions.filter(t=>t.friendId===f.id&&t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
              - transactions.filter(t=>t.friendId===f.id&&t.type==='payment').reduce((s,t)=>s+Number(t.amount),0);
      return bal>0;
    }).length||null},
    {id:'accounts',    label:'Accounts',    icon:'🏦'},
    {id:'settlements', label:'Settlements', icon:'🔄'},
    {id:'statement',   label:'Statement',   icon:'📋'},
    {id:'insights',    label:'Insights',    icon:'📊'},
  ];

  const navigate = (id) => { setTab(id); setMobOpen(false); };

  return (
    <div className="ft-app">
      {toastEl}

      {/* Sidebar */}
      <aside className={`sidebar ${mobOpen?'open':''}`}>
        <div className="sid-logo">
          <div className="sid-logo-icon">💸</div>
          <div>
            <div className="sid-logo-name">FinTrack</div>
            <div className="sid-logo-sub">Split & Track Money</div>
          </div>
        </div>

        <nav className="sid-nav">
          {navItems.map(item=>(
            <button key={item.id} className={`sid-item ${tab===item.id?'active':''}`} onClick={()=>navigate(item.id)}>
              <div className="sid-ico-wrap">{item.icon}</div>
              <span className="sid-label">{item.label}</span>
              {item.badge ? <span className="sid-badge">{item.badge}</span> : null}
            </button>
          ))}

          <div className="sid-divider"/>

          <button className="sid-item" onClick={()=>setTxnForm(true)}>
            <div className="sid-ico-wrap" style={{background:'var(--t)'}}>➕</div>
            <span className="sid-label">Add Transaction</span>
          </button>
          <button className="sid-item" onClick={()=>setSettleForm(true)}>
            <div className="sid-ico-wrap" style={{background:'var(--ind)'}}>🔄</div>
            <span className="sid-label">Record Settlement</span>
          </button>
        </nav>

        <div className="sid-user">
          <div className="sid-user-av">{initials(user.name)}</div>
          <div>
            <div className="sid-user-name">{user.name}</div>
            <div className="sid-user-sub">{user.phone}</div>
          </div>
          <button className="sid-logout" onClick={onLogout}>Sign out</button>
        </div>
      </aside>

      {/* Mobile overlay */}
      <div className={`sid-overlay ${mobOpen?'visible':''}`} onClick={()=>setMobOpen(false)}/>

      {/* Mobile top bar */}
      <div className="mob-topbar">
        <button className="mob-toggle" onClick={()=>setMobOpen(v=>!v)}>
          {mobOpen ? <IcoX/> : <IcoMenu/>}
        </button>
        <div className="mob-brand">FinTrack</div>
      </div>

      {/* Main content */}
      <div className="app-body">
        <div className="page-content">
          {tab==='dashboard'    && <Dashboard    user={user} friends={friends} accounts={accounts} transactions={transactions} settlements={settlements} setTab={setTab}/>}
          {tab==='transactions' && <Transactions user={user} friends={friends} accounts={accounts} transactions={transactions} settlements={settlements} showToast={showToast}/>}
          {tab==='friends'      && <Friends      user={user} friends={friends} accounts={accounts} transactions={transactions} showToast={showToast}/>}
          {tab==='accounts'     && <Accounts     user={user} accounts={accounts} transactions={transactions} settlements={settlements} friends={friends} showToast={showToast}/>}
          {tab==='settlements'  && <SettlementsPage user={user} accounts={accounts} settlements={settlements} showToast={showToast} onNew={()=>setSettleForm(true)}/>}
          {tab==='statement'    && <AccountStatement accounts={accounts} transactions={transactions} friends={friends}/>}
          {tab==='insights'     && <Insights     friends={friends} accounts={accounts} transactions={transactions}/>}
        </div>
      </div>

      {showTxnForm && (
        <TxnModal userId={user.id} friends={friends} accounts={accounts} existing={null}
          onClose={()=>setTxnForm(false)}
          onSaved={msg=>{setTxnForm(false);showToast(msg);}}/>
      )}
      {showSettleForm && (
        <SettlementModal userId={user.id} accounts={accounts}
          onClose={()=>setSettleForm(false)}
          onSaved={msg=>{setSettleForm(false);showToast(msg);}}/>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DASHBOARD ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ user, friends, accounts, transactions, settlements, setTab }) {
  const totalGiven    = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
  const totalPersonal = transactions.filter(t=>t.type==='personal').reduce((s,t)=>s+Number(t.amount),0);
  const totalReceived = transactions.filter(t=>t.type==='payment').reduce((s,t)=>s+Number(t.amount),0);
  const totalPending  = Math.max(0,totalGiven-totalReceived);

  const friendMap  = Object.fromEntries(friends.map(f=>[f.id,f]));
  const accountMap = Object.fromEntries(accounts.map(a=>[a.id,a]));

  const topOwing = friends.map(f=>({
    ...f,
    balance: transactions.filter(t=>t.friendId===f.id&&t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
           - transactions.filter(t=>t.friendId===f.id&&t.type==='payment').reduce((s,t)=>s+Number(t.amount),0)
  })).filter(f=>f.balance>0).sort((a,b)=>b.balance-a.balance);

  const recent = [...transactions].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,8);

  const hour = new Date().getHours();
  const greeting = hour<12?'Good morning':'hour'<17?'Good afternoon':'Good evening';

  return (
    <div>
      {/* Hero banner */}
      <div className="hero-banner">
        <div className="hero-left">
          <div className="hero-greeting">{greeting},</div>
          <div className="hero-name">{user.name.split(' ')[0]} 👋</div>
          <div className="hero-sub">Here's your financial snapshot</div>
        </div>
        <div className="hero-right">
          <div className="hero-mini">
            <div className="hero-mini-label">🔄 Settled</div>
            <div className="hero-mini-value">{fmt(settlements.reduce((s,t)=>s+Number(t.amount),0))}</div>
          </div>
          <div className="hero-mini">
            <div className="hero-mini-label">💸 Total Given</div>
            <div className="hero-mini-value">{fmt(totalGiven)}</div>
          </div>
          <div className="hero-mini">
            <div className="hero-mini-label">💰 Received Back</div>
            <div className="hero-mini-value">{fmt(totalReceived)}</div>
          </div>
          <div className="hero-mini" style={{background:'rgba(255,255,255,0.18)',border:'1px solid rgba(255,255,255,0.2)'}}>
            <div className="hero-mini-label">⏳ Pending</div>
            <div className="hero-mini-value">{fmt(totalPending)}</div>
          </div>
          <div className="hero-mini">
            <div className="hero-mini-label">🧾 Personal</div>
            <div className="hero-mini-value">{fmt(totalPersonal)}</div>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-card-top">
            <div style={{fontSize:13,fontWeight:700,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em',fontSize:11}}>Friends</div>
            <div className="stat-ico" style={{background:'var(--tbg)',fontSize:18}}>👥</div>
          </div>
          <div className="stat-value teal">{friends.length}</div>
          <div className="stat-trend">{topOwing.length} with pending balance</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div style={{fontSize:11,fontWeight:700,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Accounts</div>
            <div className="stat-ico" style={{background:'var(--greenbg)',fontSize:18}}>🏦</div>
          </div>
          <div className="stat-value">{accounts.length}</div>
          <div className="stat-trend">{accounts.filter(a=>a.type==='credit_card').length} credit · {accounts.filter(a=>a.type==='bank_account').length} savings</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div style={{fontSize:11,fontWeight:700,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Transactions</div>
            <div className="stat-ico" style={{background:'var(--amberbg)',fontSize:18}}>📈</div>
          </div>
          <div className="stat-value">{transactions.length}</div>
          <div className="stat-trend">{transactions.filter(t=>t.date?.startsWith(new Date().toISOString().slice(0,7))).length} this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div style={{fontSize:11,fontWeight:700,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.05em'}}>You're Owed</div>
            <div className="stat-ico" style={{background:'var(--redbg)',fontSize:18}}>💸</div>
          </div>
          <div className="stat-value red">{fmt(totalPending)}</div>
          <div className="stat-trend">Across {topOwing.length} friend{topOwing.length!==1?'s':''}</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="dash-grid">
        <div className="dash-main">
          {/* Account pills */}
          {accounts.length>0 && (
            <div style={{marginBottom:24}}>
              <div className="sec-head">
                <div className="sec-title">Accounts Overview</div>
                <button className="sec-more" onClick={()=>setTab('accounts')}>View all →</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
                {accounts.map(a=>{
                  const spent=transactions.filter(t=>t.accountId===a.id&&t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
                  const recv=transactions.filter(t=>t.accountId===a.id&&t.type==='payment').reduce((s,t)=>s+Number(t.amount),0);
                  const net=spent-recv;
                  const isCC=a.type==='credit_card';
                  const lim=isCC?a.limit:a.balance;
                  const pct=lim?Math.min(100,(net/lim)*100):0;
                  const barCls=pct>=90?'danger':pct>=70?'warn':isCC?'cc':'bank';
                  return (
                    <div key={a.id} style={{background:'var(--card)',borderRadius:14,padding:'16px 18px',border:'1px solid var(--border)',boxShadow:'var(--s1)',position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:isCC?'linear-gradient(90deg,#065c53,#14a898)':'linear-gradient(90deg,#14532d,#22c55e)'}}/>
                      <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',color:isCC?'var(--t)':'var(--green)',marginTop:6,marginBottom:4}}>{isCC?'💳 Credit':'🏦 Savings'}</div>
                      <div style={{fontFamily:'var(--fh)',fontSize:14,fontWeight:900,color:'var(--ink)',marginBottom:10,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.name}</div>
                      {lim?(
                        <>
                          <div className="bar-track" style={{marginBottom:6}}>
                            <div className={`bar-fill ${barCls}`} style={{width:`${pct}%`}}/>
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--ink3)',fontWeight:500}}>
                            <span>{Math.round(pct)}% used</span>
                            <span style={{fontWeight:700,color:lim-net<0?'var(--red)':'var(--green)'}}>{fmt(Math.max(0,lim-net))} free</span>
                          </div>
                        </>
                      ):(
                        <div style={{fontFamily:'var(--fh)',fontSize:18,fontWeight:900,color:'var(--ink)'}}>{fmt(net)} <span style={{fontSize:11,color:'var(--ink3)',fontFamily:'var(--fb)',fontWeight:500}}>spent</span></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent activity */}
          <div>
            <div className="sec-head">
              <div className="sec-title">Recent Transactions</div>
              <button className="sec-more" onClick={()=>setTab('transactions')}>View all →</button>
            </div>
            {recent.length===0?(
              <div className="activity-card"><div className="empty" style={{padding:'40px 24px'}}><div className="empty-icon">💳</div><div className="empty-title">No transactions yet</div><div className="empty-sub">Use the sidebar to add your first one</div></div></div>
            ):(
              <div className="activity-card">
                {recent.map(t=>{
                  const f=friendMap[t.friendId];
                  const a=accountMap[t.accountId];
                  const isPay=t.type==='payment', isPer=t.type==='personal';
                  return (
                    <div key={t.id} className="activity-row">
                      <div className="act-ico" style={{background:isPer?'var(--amberbg)':isPay?'var(--greenbg)':'var(--redbg)'}}>
                        <span style={{fontSize:18}}>{isPer?'🧾':isPay?'💰':'💸'}</span>
                      </div>
                      <div className="act-body">
                        <div className="act-title">{t.note||(isPer?'Personal expense':isPay?'Payment received':'Expense')}</div>
                        <div className="act-sub">
                          {isPer?'Self':f?.name||'—'}
                          <span className="act-dot"/>
                          {a?.name||'—'}
                          <span className="act-dot"/>
                          {fmtDate(t.date)}
                        </div>
                      </div>
                      <div className="act-amt" style={{color:isPay?'var(--green)':isPer?'var(--amber)':'var(--red)'}}>
                        {isPay?'+':'-'}{fmt(t.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="dash-side">
          {topOwing.length>0 && (
            <div>
              <div className="sec-head">
                <div className="sec-title">Who Owes You</div>
                <button className="sec-more" onClick={()=>setTab('friends')}>All →</button>
              </div>
              <div className="owes-card">
                {topOwing.map(f=>(
                  <div key={f.id} className="owes-row">
                    <div className="owes-av" style={{background:f.color||colorFor(f.name)}}>{initials(f.name)}</div>
                    <div className="owes-name">{f.name}</div>
                    <div className="owes-amt">{fmt(f.balance)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="sec-head"><div className="sec-title">Quick Stats</div></div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[
                {lbl:'Total transactions',val:transactions.length,ico:'📊'},
                {lbl:'Friend expenses',val:fmt(totalGiven),ico:'💸'},
                {lbl:'Payments received',val:fmt(totalReceived),ico:'💰'},
                {lbl:'Personal spend',val:fmt(totalPersonal),ico:'🧾'},
              ].map(({lbl,val,ico})=>(
                <div key={lbl} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,boxShadow:'var(--s1)'}}>
                  <span style={{fontSize:20}}>{ico}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:'var(--ink3)',fontWeight:600,marginBottom:2}}>{lbl}</div>
                    <div style={{fontFamily:'var(--fh)',fontSize:16,fontWeight:900,color:'var(--ink)'}}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Transactions({ user, friends, accounts, transactions, settlements, showToast }) {
  const [showForm,setShowForm] = useState(false);
  const [editTxn,setEditTxn]   = useState(null);
  const [ff,setFF]  = useState('all');
  const [fa,setFA]  = useState('all');
  const [ft,setFT]  = useState('all');
  const [from,setFrom] = useState('');
  const [to,setTo]     = useState('');

  const fMap = Object.fromEntries(friends.map(f=>[f.id,f]));
  const aMap = Object.fromEntries(accounts.map(a=>[a.id,a]));

  // Merge transactions + settlements into a unified list
  const allRows = [
    ...transactions.map(t => ({
      ...t, _kind: 'txn',
      _date: t.date || '',
      _sortAmt: t.type === 'payment' ? Number(t.amount) : -Number(t.amount),
    })),
    ...(settlements||[]).map(s => ({
      ...s, _kind: 'settle',
      _date: s.date || '',
      _sortAmt: 0, // settlements are internal transfers; net 0 for global balance
      type: 'settlement',
    })),
  ];

  // Apply filters (settlements only filtered by date + account; hidden when friend filter active)
  let rows = allRows.filter(r => {
    if (r._kind === 'settle' && ff !== 'all') return false; // hide settlements when filtering by friend
    if (ft !== 'all' && r._kind === 'settle') return false; // hide settlements when type filter active
    if (ft !== 'all' && r._kind === 'txn' && r.type !== ft) return false;
    if (ff !== 'all' && r._kind === 'txn' && r.friendId !== ff) return false;
    if (fa !== 'all') {
      if (r._kind === 'txn' && r.accountId !== fa) return false;
      if (r._kind === 'settle' && r.fromAccountId !== fa && r.toAccountId !== fa) return false;
    }
    if (from && r._date < from) return false;
    if (to   && r._date > to)   return false;
    return true;
  });

  // ── Pre-compute per-account remaining balance after every entry ──────────
  // ── Stable sort helper: date asc, then doc ID asc (consistent tiebreaker) ──
  const stableAsc  = (a, b) => a._date.localeCompare(b._date) || (a._id||'').localeCompare(b._id||'');
  const stableDesc = (a, b) => b._date.localeCompare(a._date) || (b._id||'').localeCompare(a._id||'');

  // ── Per-account remaining balance after every entry ──────────────────────
  // Sort ALL entries for an account oldest→newest (same stable key as display),
  // then track capacity - cumulative debits + credits at each point.
  const remainingMap = {}; // key: txnId or "settleId__accId" → { rem, capacity, accType, accName }
  accounts.forEach(acc => {
    const capacity = acc.type === 'credit_card' ? (acc.limit || 0) : (acc.balance || 0);
    const accEntries = [
      ...transactions.filter(t => t.accountId === acc.id).map(t => ({
        key: t.id, _id: t.id, _date: t.date || '',
        // credit card: spending = reduces available credit; payment back = restores it
        // bank account: spending = reduces balance; incoming payment = adds to balance
        delta: t.type === 'payment' ? Number(t.amount) : -Number(t.amount),
      })),
      ...(settlements||[])
        .filter(s => s.fromAccountId === acc.id || s.toAccountId === acc.id)
        .map(s => ({
          key: s.id + '__' + acc.id, _id: s.id, _date: s.date || '',
          delta: s.toAccountId === acc.id ? Number(s.amount) : -Number(s.amount),
        })),
    ].sort(stableAsc); // ← same stable key used for display

    let rem = capacity;
    accEntries.forEach(entry => {
      rem += entry.delta;
      remainingMap[entry.key] = { rem, capacity, accType: acc.type, accName: acc.name };
    });
  });

  // Display newest first — SAME stable sort, reversed, so remainingMap keys align
  const displayRows = [...rows]
    .map(r => ({ ...r, _id: r.id })) // ensure _id exists for stable sort
    .sort(stableDesc);

  const clear = () => { setFF('all'); setFA('all'); setFT('all'); setFrom(''); setTo(''); };
  const hasFilter = ff !== 'all' || fa !== 'all' || ft !== 'all' || from || to;
  const totalTxns = transactions.length + (settlements||[]).length;

  const del = async(id) => {
    if(!window.confirm('Delete this transaction?')) return;
    try{ await deleteDoc(doc(db,'transactions',id)); showToast('Transaction deleted'); }
    catch{ showToast('Delete failed','error'); }
  };

  const delSettle = async(id) => {
    if(!window.confirm('Delete this settlement?')) return;
    try{ await deleteDoc(doc(db,'settlements',id)); showToast('Settlement deleted'); }
    catch{ showToast('Delete failed','error'); }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Transactions</div>
          <div className="page-sub">{displayRows.length} of {totalTxns} records</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={()=>{setEditTxn(null);setShowForm(true);}}>
            <IcoPlus/> Add Transaction
          </button>
        </div>
      </div>

      {/* Account quick-filter tabs */}
      <div className="acc-tabs">
        <button className={`acc-tab ${fa==='all'?'active':''}`} onClick={()=>setFA('all')}>
          🏦 All Accounts
          <span className="acc-tab-count">{totalTxns}</span>
        </button>
        {accounts.map(a=>{
          const cnt = transactions.filter(t=>t.accountId===a.id).length
                    + (settlements||[]).filter(s=>s.fromAccountId===a.id||s.toAccountId===a.id).length;
          return (
            <button key={a.id} className={`acc-tab ${fa===a.id?'active':''}`} onClick={()=>setFA(a.id)}>
              {a.type==='credit_card'?'💳':'🏦'} {a.name}
              <span className="acc-tab-count">{cnt}</span>
            </button>
          );
        })}
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={ft} onChange={e=>setFT(e.target.value)}>
          <option value="all">All Types</option>
          <option value="expense">Friend Expenses</option>
          <option value="payment">Payments Received</option>
          <option value="personal">Personal Expenses</option>
        </select>
        <select className="filter-select" value={ff} onChange={e=>setFF(e.target.value)}>
          <option value="all">All Friends</option>
          {friends.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select className="filter-select" value={fa} onChange={e=>setFA(e.target.value)}>
          <option value="all">All Accounts</option>
          {accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input className="filter-select filter-date" type="date" value={from} onChange={e=>setFrom(e.target.value)} title="From"/>
        <input className="filter-select filter-date" type="date" value={to}   onChange={e=>setTo(e.target.value)}   title="To"/>
        {hasFilter && <button className="filter-clear" onClick={clear}>✕ Clear filters</button>}
        <span className="filter-count">{displayRows.length} result{displayRows.length!==1?'s':''}</span>
      </div>

      {/* Column explanation note */}
      <div style={{
        display:'flex', alignItems:'center', gap:8, marginBottom:14,
        fontSize:12, color:'var(--ink3)', fontWeight:400, flexWrap:'wrap',
      }}>
        <span style={{background:'var(--indbg)',border:'1px solid var(--indbrd)',borderRadius:6,padding:'2px 8px',fontSize:11,fontWeight:700,color:'var(--ind)'}}>🔄 Settlement</span>
        rows show account-to-account transfers ·
        <strong style={{color:'var(--ink2)'}}>Remaining 💳</strong> = credit available or cash left in that account after each entry
      </div>

      {displayRows.length===0?(
        <div className="tbl-card"><div className="empty"><div className="empty-icon">💳</div><div className="empty-title">No transactions found</div><div className="empty-sub">Try adjusting your filters</div></div></div>
      ):(
        <div className="tbl-card">
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Friend / Party</th>
                  <th>Account</th>
                  <th style={{textAlign:'right'}}>Amount</th>
                  <th>Note</th>
                  <th style={{textAlign:'right',whiteSpace:'nowrap'}}>Remaining 💳</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((r,i) => {
                  const isSettle = r._kind === 'settle';

                  if (isSettle) {
                    const fromAcc = aMap[r.fromAccountId];
                    const toAcc   = aMap[r.toAccountId];
                    return (
                      <tr key={r.id+'-s'} style={{background:'#faf5ff'}}>
                        <td className="td-muted">{fmtDate(r._date)}</td>
                        <td><span className="txn-settle">🔄 Settlement</span></td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
                            <span style={{fontSize:13,fontWeight:600,color:'var(--ink2)'}}>
                              {fromAcc?.name||'?'} → {toAcc?.name||'?'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:5,flexWrap:'wrap'}}>
                            <span style={{fontSize:13}}>
                              {fromAcc?.type==='credit_card'?'💳':'🏦'} {fromAcc?.name||'—'}
                            </span>
                            <span style={{color:'var(--ind)',fontWeight:700}}>→</span>
                            <span style={{fontSize:13}}>
                              {toAcc?.type==='credit_card'?'💳':'🏦'} {toAcc?.name||'—'}
                            </span>
                          </div>
                        </td>
                        <td style={{textAlign:'right',fontWeight:700,color:'var(--ind)',fontFamily:'var(--fh)',fontSize:14}}>
                          ⇄ {fmt(r.amount)}
                        </td>
                        <td className="td-muted" style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                          {r.note||<span style={{color:'var(--ink4)'}}>—</span>}
                        </td>
                        <td style={{textAlign:'right'}}>
                          {(() => {
                            // Show remaining for each account involved
                            const remFrom = remainingMap[r.id + '__' + r.fromAccountId];
                            const remTo   = remainingMap[r.id + '__' + r.toAccountId];
                            const show = fa !== 'all'
                              ? remainingMap[r.id + '__' + fa]
                              : null; // all-accounts view — show both
                            if (fa !== 'all' && show) {
                              const pct = show.capacity > 0 ? Math.min(100, Math.max(0, (show.rem / show.capacity) * 100)) : null;
                              const color = show.rem < 0 ? 'var(--red)' : show.rem < show.capacity * 0.1 ? 'var(--amber)' : 'var(--green)';
                              return (
                                <div style={{textAlign:'right'}}>
                                  <div style={{fontFamily:'var(--fh)',fontWeight:800,fontSize:13,color}}>{fmt(show.rem)}</div>
                                  {pct!==null && <div style={{fontSize:10,color:'var(--ink4)',marginTop:2}}>{Math.round(pct)}% left</div>}
                                </div>
                              );
                            }
                            // All-accounts view: show both affected accounts' remaining
                            return (
                              <div style={{display:'flex',flexDirection:'column',gap:3,alignItems:'flex-end'}}>
                                {remFrom && <div style={{fontSize:11,fontWeight:700,color:remFrom.rem<0?'var(--red)':'var(--green)'}}>{remFrom.accName}: {fmt(remFrom.rem)}</div>}
                                {remTo   && <div style={{fontSize:11,fontWeight:700,color:remTo.rem<0?'var(--red)':'var(--green)'}}>{remTo.accName}: {fmt(remTo.rem)}</div>}
                              </div>
                            );
                          })()}
                        </td>
                        <td>
                          <div style={{display:'flex',gap:7}}>
                            <button className="btn btn-danger btn-sm btn-icon" onClick={()=>delSettle(r.id)}><IcoTrash/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  // Regular transaction row
                  const f = fMap[r.friendId];
                  const a = aMap[r.accountId];
                  const remInfo = remainingMap[r.id]; // remaining in this account after this txn
                  const isCredit = r.type === 'payment';
                  const amtColor = r.type==='payment' ? 'var(--green)' : r.type==='personal' ? 'var(--amber)' : 'var(--red)';

                  return (
                    <tr key={r.id}>
                      <td className="td-muted">{fmtDate(r._date)}</td>
                      <td>
                        {r.type==='personal' ? <span className="txn-personal">Personal</span>
                        : r.type==='expense'  ? <span className="txn-expense">Friend Exp</span>
                        : <span className="txn-payment">Payment In</span>}
                      </td>
                      <td>
                        {r.type==='personal' ? (
                          <span style={{color:'var(--amber)',fontWeight:600,fontSize:13}}>🧾 Self</span>
                        ) : (
                          <div style={{display:'flex',alignItems:'center',gap:9}}>
                            {f && <div style={{width:30,height:30,borderRadius:'50%',background:f.color||colorFor(f.name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'white',flexShrink:0}}>{initials(f.name)}</div>}
                            <span className="td-bold">{f?.name||'—'}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:7}}>
                          <span style={{fontSize:15}}>{a?.type==='credit_card'?'💳':'🏦'}</span>
                          <span className="td-muted">{a?.name||'—'}</span>
                        </div>
                      </td>
                      <td style={{textAlign:'right',fontWeight:700,color:amtColor,fontFamily:'var(--fh)',fontSize:14}}>
                        {isCredit?'+':'-'}{fmt(r.amount)}
                      </td>
                      <td className="td-muted" style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {r.note||'—'}
                      </td>
                      <td style={{textAlign:'right'}}>
                        {remInfo ? (() => {
                          const { rem, capacity, accType } = remInfo;
                          const pct = capacity > 0 ? Math.min(100, Math.max(0, (rem / capacity) * 100)) : null;
                          const isOverLimit = rem < 0;
                          const isLow = !isOverLimit && pct !== null && pct < 10;
                          const color = isOverLimit ? 'var(--red)' : isLow ? 'var(--amber)' : 'var(--green)';
                          const bg    = isOverLimit ? 'var(--redbg)' : isLow ? 'var(--amberbg)' : 'var(--greenbg)';
                          const bdr   = isOverLimit ? 'var(--redbrd)' : isLow ? 'var(--amberbrd)' : 'var(--greenbrd)';
                          return (
                            <div style={{textAlign:'right'}}>
                              <span style={{
                                display:'inline-block', fontFamily:'var(--fh)',
                                fontWeight:800, fontSize:13, color,
                                background:bg, border:`1px solid ${bdr}`,
                                borderRadius:20, padding:'3px 10px',
                                whiteSpace:'nowrap',
                              }}>
                                {isOverLimit ? `⚠ -${fmt(Math.abs(rem))}` : fmt(rem)}
                              </span>
                              {pct !== null && (
                                <div style={{fontSize:10,color:'var(--ink4)',marginTop:3}}>
                                  {accType==='credit_card' ? `${Math.round(pct)}% available` : `${Math.round(pct)}% left`}
                                </div>
                              )}
                            </div>
                          );
                        })() : <span style={{color:'var(--ink4)'}}>—</span>}
                      </td>
                      <td>
                        <div style={{display:'flex',gap:7}}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>{setEditTxn(r);setShowForm(true);}}><IcoEdit/></button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={()=>del(r.id)}><IcoTrash/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer summary bar */}
          {(() => {
            const totalDebit  = displayRows.filter(r=>r._kind==='txn'&&r.type!=='payment').reduce((s,r)=>s+Number(r.amount),0);
            const totalCredit = displayRows.filter(r=>r._kind==='txn'&&r.type==='payment').reduce((s,r)=>s+Number(r.amount),0);
            const settleCount = displayRows.filter(r=>r._kind==='settle').length;
            const netSpend    = totalDebit - totalCredit;
            return (
              <div style={{
                display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:1,
                borderTop:'2px solid var(--border)', background:'var(--bg)',
              }}>
                {[
                  {lbl:'Total Spent',     val:fmt(totalDebit),  color:'var(--red)'},
                  {lbl:'Total Received',  val:fmt(totalCredit), color:'var(--green)'},
                  {lbl:'Settlements',     val:`${settleCount} entries`, color:'var(--ind)'},
                  {lbl:'Net Spend',       val:fmt(netSpend),
                   color: netSpend>0?'var(--red)':netSpend<0?'var(--green)':'var(--ink3)'},
                ].map(({lbl,val,color})=>(
                  <div key={lbl} style={{padding:'14px 18px',textAlign:'center'}}>
                    <div style={{fontSize:10,fontWeight:700,color:'var(--ink4)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:4}}>{lbl}</div>
                    <div style={{fontFamily:'var(--fh)',fontWeight:800,fontSize:16,color}}>{val}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {showForm&&(
        <TxnModal userId={user.id} friends={friends} accounts={accounts} existing={editTxn}
          onClose={()=>{setShowForm(false);setEditTxn(null);}}
          onSaved={msg=>{setShowForm(false);setEditTxn(null);showToast(msg);}}/>
      )}
    </div>
  );
}

// ─── TXN MODAL ───────────────────────────────────────────────────────────────
function TxnModal({ userId, friends, accounts, existing, onClose, onSaved }) {
  const [form,setForm]=useState({
    type:existing?.type||'expense', category:existing?.category||'friend',
    friendId:existing?.friendId||'', accountId:existing?.accountId||'',
    amount:existing?.amount?String(existing.amount):'', date:existing?.date||today(), note:existing?.note||'',
  });
  const [saving,setSaving]=useState(false);
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const setCat=cat=>setForm(f=>({...f,category:cat,type:cat==='personal'?'personal':f.type==='personal'?'expense':f.type,friendId:cat==='personal'?'':f.friendId}));

  const submit=async(e)=>{
    e.preventDefault();
    const isPer=form.category==='personal';
    if(!form.accountId||!form.amount||!form.date){alert('Fill all required fields');return;}
    if(!isPer&&!form.friendId){alert('Select a friend');return;}
    const amt=parseFloat(form.amount);
    if(isNaN(amt)||amt<=0){alert('Enter a valid amount');return;}
    setSaving(true);
    try{
      const data={userId,type:isPer?'personal':form.type,category:isPer?'personal':'friend',friendId:isPer?null:form.friendId,accountId:form.accountId,amount:amt,date:form.date,note:form.note};
      if(existing){await updateDoc(doc(db,'transactions',existing.id),data);onSaved('Transaction updated ✓');}
      else{await addDoc(collection(db,'transactions'),data);onSaved('Transaction added ✓');}
    }catch(err){alert('Save failed');console.error(err);}
    finally{setSaving(false);}
  };
  const isPer=form.category==='personal';

  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-body">
          <div className="modal-title">{existing?'Edit Transaction':'Add Transaction'}</div>
          <div className="modal-sub">Record a spend for a friend or yourself</div>
          <form onSubmit={submit}>
            <div style={{display:'flex',gap:9,marginBottom:16}}>
              {[['friend','👥 For a Friend'],['personal','🧾 Personal']].map(([cat,lbl])=>(
                <button key={cat} type="button" onClick={()=>setCat(cat)} className="btn btn-sm"
                  style={{flex:1,background:form.category===cat?'var(--t)':'var(--bg2)',color:form.category===cat?'white':'var(--ink3)',border:'1.5px solid '+(form.category===cat?'transparent':'var(--border)')}}>
                  {lbl}
                </button>
              ))}
            </div>
            {!isPer&&(
              <div style={{display:'flex',gap:9,marginBottom:16}}>
                {['expense','payment'].map(tp=>(
                  <button key={tp} type="button" onClick={()=>setForm(f=>({...f,type:tp}))} className="btn btn-sm"
                    style={{flex:1,background:form.type===tp?(tp==='expense'?'var(--red)':'var(--green)'):'var(--bg2)',color:form.type===tp?'white':'var(--ink3)',border:'1.5px solid '+(form.type===tp?'transparent':'var(--border)')}}>
                    {tp==='expense'?'💸 I Paid For Them':'💰 They Paid Me Back'}
                  </button>
                ))}
              </div>
            )}
            <div className="form-row g2">
              {!isPer&&(
                <div className="field">
                  <label className="field-label">Friend *</label>
                  <select className="field-input" value={form.friendId} onChange={set('friendId')}>
                    <option value="">Select friend…</option>
                    {friends.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              )}
              <div className="field">
                <label className="field-label">Account *</label>
                <select className="field-input" value={form.accountId} onChange={set('accountId')}>
                  <option value="">Select account…</option>
                  {accounts.map(a=><option key={a.id} value={a.id}>{a.type==='credit_card'?'💳':'🏦'} {a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row g2">
              <div className="field">
                <label className="field-label">Amount (₹) *</label>
                <input className="field-input" type="number" placeholder="0" min="1" value={form.amount} onChange={set('amount')}/>
              </div>
              <div className="field">
                <label className="field-label">Date *</label>
                <input className="field-input" type="date" value={form.date} onChange={set('date')}/>
              </div>
            </div>
            <div className="form-row" style={{marginBottom:0}}>
              <div className="field">
                <label className="field-label">{isPer?'Category / Note':'Note (optional)'}</label>
                <input className="field-input" placeholder={isPer?'e.g. Groceries, Netflix…':'e.g. Dinner at restaurant'} value={form.note} onChange={set('note')}/>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose} style={{flex:1}}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{flex:2}}>{saving?'Saving…':existing?'Update':'Add Transaction'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── FRIENDS ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Friends({ user, friends, accounts, transactions, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [editF, setEditF]       = useState(null);
  const [form, setForm]         = useState({ name: '', phone: '' });
  const [saving, setSaving]     = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch]     = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const aMap = Object.fromEntries(accounts.map(a => [a.id, a]));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) { alert('Enter a name'); return; }
    setSaving(true);
    try {
      const data = { userId: user.id, name: form.name, phone: form.phone, color: colorFor(form.name) };
      if (editF) { await updateDoc(doc(db, 'friends', editF.id), data); showToast('Friend updated ✓'); }
      else       { await addDoc(collection(db, 'friends'), data);        showToast('Friend added ✓'); }
      setShowForm(false); setEditF(null);
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const del = async (e, f) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${f.name}?`)) return;
    try { await deleteDoc(doc(db, 'friends', f.id)); showToast(`${f.name} removed`); }
    catch { showToast('Delete failed', 'error'); }
  };

  const openEdit = (e, f) => {
    e.stopPropagation();
    setForm({ name: f.name, phone: f.phone || '' });
    setEditF(f); setShowForm(true);
  };

  const withStats = friends.map(f => {
    const given    = transactions.filter(t => t.friendId === f.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const received = transactions.filter(t => t.friendId === f.id && t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
    const history  = transactions.filter(t => t.friendId === f.id).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const byAccount = accounts.map(a => {
      const aGiven = history.filter(t => t.accountId === a.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
      const aRecvd = history.filter(t => t.accountId === a.id && t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
      return { ...a, given: aGiven, received: aRecvd, net: aGiven - aRecvd };
    }).filter(a => a.given > 0 || a.received > 0);
    return { ...f, given, received, balance: given - received, history, byAccount };
  });

  const totalPending = withStats.reduce((s, f) => s + Math.max(0, f.balance), 0);

  // Apply search filter
  const q = search.trim().toLowerCase();
  const filtered = q
    ? withStats.filter(f => f.name.toLowerCase().includes(q) || (f.phone||'').includes(q))
    : withStats;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Friends</div>
          <div className="page-sub">
            {friends.length} friend{friends.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
            <span style={{ color: 'var(--red)', fontWeight: 700 }}>{fmt(totalPending)} outstanding</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ name: '', phone: '' }); setEditF(null); setShowForm(true); }}>
          <IcoPlus /> Add Friend
        </button>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: 20, position: 'relative', maxWidth: 360 }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: 15, color: 'var(--ink4)', pointerEvents: 'none',
        }}>🔍</span>
        <input
          className="field-input"
          style={{ paddingLeft: 38, borderRadius: 22 }}
          placeholder="Search friends by name or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink4)',
            fontSize: 16, lineHeight: 1,
          }}>✕</button>
        )}
      </div>
      {q && (
        <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--ink3)' }}>
          {filtered.length === 0
            ? `No friends match "${search}"`
            : `${filtered.length} of ${friends.length} friends`}
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <div className="form-section">
          <div className="form-title">{editF ? 'Edit Friend' : 'Add Friend'}</div>
          <div className="form-sub">Track money you spend on behalf of this person</div>
          <form onSubmit={submit}>
            <div className="form-row g2">
              <div className="field">
                <label className="field-label">Full Name *</label>
                <input className="field-input" placeholder="e.g. Amit Sharma" value={form.name} onChange={set('name')} autoFocus />
              </div>
              <div className="field">
                <label className="field-label">Phone (optional)</label>
                <input className="field-input" type="tel" placeholder="10-digit number"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editF ? 'Update Friend' : 'Add Friend'}</button>
              <button className="btn btn-ghost" type="button" onClick={() => { setShowForm(false); setEditF(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {withStats.length === 0 ? (
        <div className="tbl-card">
          <div className="empty">
            <div className="empty-icon">👥</div>
            <div className="empty-title">No friends yet</div>
            <div className="empty-sub">Add your first friend to start tracking expenses</div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="tbl-card">
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No results for "{search}"</div>
            <div className="empty-sub">Try a different name or phone number</div>
          </div>
        </div>
      ) : (
        <div className="friends-list">

          {/* Column headers */}
          <div className="fl-header">
            <div className="fl-header-cell">Friend</div>
            <div className="fl-header-cell">Total Given</div>
            <div className="fl-header-cell">Received Back</div>
            <div className="fl-header-cell">Outstanding</div>
            <div className="fl-header-cell" style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {/* One row per friend */}
          {filtered.map(f => {
            const isOpen = expanded === f.id;
            const balClass = f.balance > 0 ? 'bal-pos' : f.balance < 0 ? 'bal-neg' : 'bal-zero';

            return (
              <div key={f.id} className="fl-row-wrap">

                {/* ── Clickable summary row ── */}
                <div
                  className={`fl-row ${isOpen ? 'open' : ''}`}
                  onClick={() => setExpanded(isOpen ? null : f.id)}
                  title="Click to view full breakdown"
                >
                  {/* Identity */}
                  <div className="fl-identity">
                    <div className="fl-av" style={{ background: f.color || colorFor(f.name) }}>
                      {initials(f.name)}
                    </div>
                    <div>
                      <div className="fl-name">{f.name}</div>
                      {f.phone && <div className="fl-phone">📞 {f.phone}</div>}
                    </div>
                  </div>

                  {/* Given */}
                  <div className="fl-cell given">{fmt(f.given)}</div>

                  {/* Received */}
                  <div className="fl-cell recvd">{fmt(f.received)}</div>

                  {/* Outstanding balance */}
                  <div>
                    <div className={`fl-cell ${balClass}`}>
                      {f.balance > 0 ? fmt(f.balance) : f.balance < 0 ? `You owe ${fmt(Math.abs(f.balance))}` : '✓ Settled'}
                    </div>
                    {f.balance > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2, fontWeight: 500 }}>
                        {f.history.length} transaction{f.history.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="fl-actions" onClick={e => e.stopPropagation()}>
                    <button className="fl-expand-btn" onClick={() => setExpanded(isOpen ? null : f.id)}>
                      {isOpen ? '▲ Close' : '▼ Details'}
                    </button>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={e => openEdit(e, f)} title="Edit"><IcoEdit /></button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={e => del(e, f)} title="Delete"><IcoTrash /></button>
                  </div>
                </div>

                {/* ── Expandable detail panel ── */}
                {isOpen && (
                  <div className="fl-detail">
                    <div className="fl-detail-inner">

                      {/* 4-stat summary strip */}
                      <div className="fl-summary">
                        <div className="fl-sum-card">
                          <div className="fl-sum-lbl">💸 Total Given</div>
                          <div className="fl-sum-val red">{fmt(f.given)}</div>
                        </div>
                        <div className="fl-sum-card">
                          <div className="fl-sum-lbl">💰 Received Back</div>
                          <div className="fl-sum-val green">{fmt(f.received)}</div>
                        </div>
                        <div className="fl-sum-card" style={{ background: f.balance > 0 ? 'var(--redbg)' : f.balance < 0 ? 'var(--greenbg)' : 'var(--card)', borderColor: f.balance > 0 ? 'var(--redbrd)' : f.balance < 0 ? 'var(--greenbrd)' : 'var(--border)' }}>
                          <div className="fl-sum-lbl">⚖️ Net Balance</div>
                          <div className="fl-sum-val" style={{ color: f.balance > 0 ? 'var(--red)' : f.balance < 0 ? 'var(--green)' : 'var(--ink3)' }}>
                            {f.balance === 0 ? '✓ Settled' : fmt(Math.abs(f.balance))}
                          </div>
                        </div>
                        <div className="fl-sum-card">
                          <div className="fl-sum-lbl">📊 Transactions</div>
                          <div className="fl-sum-val" style={{ color: 'var(--t)' }}>{f.history.length}</div>
                        </div>
                      </div>

                      {/* Per-account pills */}
                      {f.byAccount.length > 0 && (
                        <div style={{ marginBottom: 18 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Breakdown by Account</div>
                          <div className="fl-acc-strip">
                            {f.byAccount.map(a => (
                              <div key={a.id} className="fl-acc-pill">
                                <span style={{ fontSize: 16 }}>{a.type === 'credit_card' ? '💳' : '🏦'}</span>
                                <span className="fl-acc-pill-name">{a.name}</span>
                                <span style={{ color: 'var(--border2)' }}>·</span>
                                <span className="fl-acc-pill-amt">-{fmt(a.given)}</span>
                                {a.received > 0 && <><span style={{ color: 'var(--border2)' }}>·</span><span className="fl-acc-pill-recv">+{fmt(a.received)}</span></>}
                                <span style={{ background: a.net > 0 ? 'var(--redbg)' : 'var(--greenbg)', color: a.net > 0 ? 'var(--red)' : 'var(--green)', border: `1px solid ${a.net > 0 ? 'var(--redbrd)' : 'var(--greenbrd)'}`, borderRadius: 6, padding: '1px 8px', fontSize: 11, fontWeight: 800, fontFamily: 'var(--fh)' }}>
                                  {a.net > 0 ? `owes ${fmt(a.net)}` : a.net < 0 ? `settled +${fmt(Math.abs(a.net))}` : '✓'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Full transaction table */}
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                        All Transactions with {f.name}
                      </div>
                      {f.history.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: 'var(--ink3)' }}>No transactions yet.</div>
                      ) : (
                        <div className="fl-txn-wrap">
                          <table className="fl-txn-table">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Account Used</th>
                                <th>Amount</th>
                                <th>Note / Description</th>
                                <th>Running Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                let running = 0;
                                // process oldest→newest for running balance, then reverse for display
                                const chronological = [...f.history].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
                                const rows = chronological.map(t => {
                                  const acc = aMap[t.accountId];
                                  const isPay = t.type === 'payment';
                                  running += isPay ? -Number(t.amount) : Number(t.amount);
                                  return { t, acc, isPay, snapshot: running };
                                });
                                // display newest first
                                return rows.reverse().map(({ t, acc, isPay, snapshot }) => (
                                  <tr key={t.id}>
                                    <td style={{ color: 'var(--ink3)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>{fmtDate(t.date)}</td>
                                    <td>
                                      {isPay
                                        ? <span className="txn-payment">Payment In</span>
                                        : <span className="txn-expense">Expense</span>}
                                    </td>
                                    <td>
                                      {acc ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                          <span style={{ fontSize: 15 }}>{acc.type === 'credit_card' ? '💳' : '🏦'}</span>
                                          <span style={{ fontWeight: 600, color: 'var(--ink2)', fontSize: 13 }}>{acc.name}</span>
                                        </div>
                                      ) : <span style={{ color: 'var(--ink4)' }}>—</span>}
                                    </td>
                                    <td style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 14, color: isPay ? 'var(--green)' : 'var(--red)' }}>
                                      {isPay ? '+' : '-'}{fmt(t.amount)}
                                    </td>
                                    <td style={{ color: 'var(--ink2)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {t.note || <span style={{ color: 'var(--ink4)' }}>—</span>}
                                    </td>
                                    <td>
                                      <span style={{
                                        fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 13,
                                        color: snapshot > 0 ? 'var(--red)' : snapshot < 0 ? 'var(--green)' : 'var(--ink3)'
                                      }}>
                                        {snapshot > 0 ? `${fmt(snapshot)} owed` : snapshot < 0 ? `${fmt(Math.abs(snapshot))} ahead` : '✓ Settled'}
                                      </span>
                                    </td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ACCOUNTS ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Accounts({ user, accounts, transactions, settlements, friends, showToast }) {
  const [showForm,setShowForm]=useState(false);
  const [editA,setEditA]=useState(null);
  const [form,setForm]=useState({name:'',type:'credit_card',limit:'',balance:''});
  const [saving,setSaving]=useState(false);
  const [expand,setExpand]=useState(null);     // friend breakdown
  const [ledger,setLedger]=useState(null);     // account ledger drilldown
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const submit=async(e)=>{
    e.preventDefault();
    if(!form.name){alert('Enter a name');return;}
    setSaving(true);
    try{
      const data={userId:user.id,name:form.name,type:form.type,color:colorFor(form.name),
        limit:form.type==='credit_card'&&form.limit?parseFloat(form.limit):null,
        balance:form.type==='bank_account'&&form.balance?parseFloat(form.balance):null};
      if(editA){await updateDoc(doc(db,'accounts',editA.id),data);showToast('Account updated ✓');}
      else{await addDoc(collection(db,'accounts'),data);showToast('Account added ✓');}
      setShowForm(false);
    }catch{showToast('Save failed','error');}
    finally{setSaving(false);}
  };

  const del=async(a)=>{
    if(!window.confirm(`Delete "${a.name}"?`))return;
    try{await deleteDoc(doc(db,'accounts',a.id));showToast('Account removed');}
    catch{showToast('Delete failed','error');}
  };

  const fMap=Object.fromEntries(friends.map(f=>[f.id,f]));

  const withStats=accounts.map(a=>{
    const txns=transactions.filter(t=>t.accountId===a.id);
    const spent=txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
    const back=txns.filter(t=>t.type==='payment').reduce((s,t)=>s+Number(t.amount),0);
    const personal=txns.filter(t=>t.type==='personal').reduce((s,t)=>s+Number(t.amount),0);
    const net=spent-back;
    const fbd=friends.map(f=>{
      const fs=txns.filter(t=>t.friendId===f.id&&t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
      const fr=txns.filter(t=>t.friendId===f.id&&t.type==='payment').reduce((s,t)=>s+Number(t.amount),0);
      return{...f,spent:fs,received:fr,balance:fs-fr};
    }).filter(f=>f.spent>0||f.received>0);
    const avail=a.type==='credit_card'&&a.limit?a.limit-net:null;
    const usedP=a.type==='credit_card'&&a.limit?Math.min(100,(net/a.limit)*100):0;
    const rem=a.type==='bank_account'&&a.balance!=null?a.balance-net:null;
    const balP=a.type==='bank_account'&&a.balance?Math.min(100,(net/a.balance)*100):0;
    // settlements involving this account
    const settles=(settlements||[]).filter(s=>s.fromAccountId===a.id||s.toAccountId===a.id);
    const settleIn=settles.filter(s=>s.toAccountId===a.id).reduce((s,t)=>s+Number(t.amount),0);
    const settleOut=settles.filter(s=>s.fromAccountId===a.id).reduce((s,t)=>s+Number(t.amount),0);
    return{...a,spent,back,personal,net,avail,usedP,rem,balP,fbd,settles,settleIn,settleOut,cnt:txns.length};
  });

  // Build a merged chronological ledger for one account
  const buildLedger=(a)=>{
    const txnRows=transactions.filter(t=>t.accountId===a.id).map(t=>({
      ...t, _kind:'txn',
      _date: t.date||'',
      _amt: t.type==='payment'?Number(t.amount):-Number(t.amount),
    }));
    const settleRows=(settlements||[]).filter(s=>s.fromAccountId===a.id||s.toAccountId===a.id).map(s=>({
      ...s, _kind:'settle',
      _date: s.date||'',
      _amt: s.toAccountId===a.id ? Number(s.amount) : -Number(s.amount),
    }));
    return [...txnRows,...settleRows].sort((a,b)=>a._date.localeCompare(b._date));
  };

  return(
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Accounts</div>
          <div className="page-sub">{accounts.length} linked account{accounts.length!==1?'s':''}</div>
        </div>
        <button className="btn btn-primary" onClick={()=>{setForm({name:'',type:'credit_card',limit:'',balance:''});setEditA(null);setShowForm(true);}}>
          <IcoPlus/> Add Account
        </button>
      </div>

      {showForm&&(
        <div className="form-section">
          <div className="form-title">{editA?'Edit Account':'Add Account'}</div>
          <div className="form-sub">Add a credit card or bank account you use for expenses</div>
          <form onSubmit={submit}>
            <div className="form-row g3">
              <div className="field">
                <label className="field-label">Account Name *</label>
                <input className="field-input" placeholder="e.g. HDFC Credit Card" value={form.name} onChange={set('name')} autoFocus/>
              </div>
              <div className="field">
                <label className="field-label">Type *</label>
                <select className="field-input" value={form.type} onChange={e=>{set('type')(e);setForm(f=>({...f,type:e.target.value,limit:'',balance:''}));}}>
                  <option value="credit_card">💳 Credit Card</option>
                  <option value="bank_account">🏦 Bank Account</option>
                </select>
              </div>
              {form.type==='credit_card'&&(
                <div className="field">
                  <label className="field-label">Credit Limit (₹)</label>
                  <input className="field-input" type="number" placeholder="e.g. 100000" min="0" value={form.limit} onChange={set('limit')}/>
                </div>
              )}
              {form.type==='bank_account'&&(
                <div className="field">
                  <label className="field-label">Current Balance (₹)</label>
                  <input className="field-input" type="number" placeholder="e.g. 50000" min="0" value={form.balance} onChange={set('balance')}/>
                </div>
              )}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving?'Saving…':editA?'Update Account':'Add Account'}</button>
              <button className="btn btn-ghost" type="button" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {withStats.length===0?(
        <div className="tbl-card"><div className="empty"><div className="empty-icon">🏦</div><div className="empty-title">No accounts yet</div><div className="empty-sub">Add cards and accounts you use for expenses</div></div></div>
      ):(
        <div className="accounts-grid">
          {withStats.map(a=>{
            const isCC=a.type==='credit_card';
            const isLedgerOpen=ledger===a.id;
            return(
              <div key={a.id}>
                <div className="account-card">
                  <div className={`acc-stripe ${isCC?'cc':'bank'}`}/>
                  <div className="acc-body">
                    <div className={`acc-chip ${isCC?'cc':'bank'}`}>{isCC?'💳 Credit Card':'🏦 Savings Account'}</div>
                    <div className="acc-name">{a.name}</div>
                    <div className="acc-sub">{a.cnt} transaction{a.cnt!==1?'s':''}{a.settles.length>0?` · ${a.settles.length} settlement${a.settles.length!==1?'s':''} linked`:''}</div>
                    {isCC&&a.limit?(
                      <div>
                        <div className="bar-row"><span>Used <strong style={{color:'var(--ink2)'}}>{fmt(a.net)}</strong></span><span>{Math.round(a.usedP)}% of {fmt(a.limit)}</span></div>
                        <div className="bar-track">
                          <div className={`bar-fill ${a.usedP>=90?'danger':a.usedP>=70?'warn':'cc'}`} style={{width:`${a.usedP}%`}}/>
                        </div>
                        <div className="bar-row" style={{marginTop:4}}>
                          <span>Limit: {fmt(a.limit)}</span>
                          <span className="bar-avail" style={{color:a.avail<0?'var(--red)':'var(--green)'}}>{a.avail<0?`⚠️ Over by ${fmt(Math.abs(a.avail))}`:`${fmt(a.avail)} free`}</span>
                        </div>
                      </div>
                    ):!isCC&&a.balance!=null?(
                      <div>
                        <div className="bar-row"><span>Spent <strong style={{color:'var(--ink2)'}}>{fmt(a.net)}</strong></span><span>{Math.round(a.balP)}% of {fmt(a.balance)}</span></div>
                        <div className="bar-track">
                          <div className={`bar-fill ${a.balP>=90?'danger':'bank'}`} style={{width:`${a.balP}%`}}/>
                        </div>
                        <div className="bar-row" style={{marginTop:4}}>
                          <span>Balance: {fmt(a.balance)}</span>
                          <span className="bar-avail" style={{color:a.rem<0?'var(--red)':'var(--green)'}}>{fmt(Math.max(0,a.rem))} left</span>
                        </div>
                      </div>
                    ):(
                      <div><div className="acc-big">{fmt(a.spent)}</div><div style={{fontSize:12,color:'var(--ink3)',marginTop:2}}>Total spent via this account</div></div>
                    )}
                  </div>
                  <div className="acc-actions">
                    <button className="acc-btn" style={{color:isLedgerOpen?'var(--t)':'',background:isLedgerOpen?'var(--tbg)':''}}
                      onClick={()=>{setLedger(isLedgerOpen?null:a.id);setExpand(null);}}>
                      📋 {isLedgerOpen?'Hide':'All Txns'}
                    </button>
                    <button className="acc-btn" onClick={()=>{setExpand(expand===a.id?null:a.id);setLedger(null);}}>
                      👥 {expand===a.id?'Hide':'By Friend'}
                    </button>
                    <button className="acc-btn" onClick={()=>{setForm({name:a.name,type:a.type,limit:a.limit?String(a.limit):'',balance:a.balance?String(a.balance):''});setEditA(a);setShowForm(true);}}>✏️ Edit</button>
                    <button className="acc-btn" style={{color:'var(--red)'}} onClick={()=>del(a)}>🗑️ Delete</button>
                  </div>
                </div>

                {/* ── FULL ACCOUNT LEDGER ── */}
                {isLedgerOpen&&(()=>{
                  const rows=buildLedger(a);
                  const totDebit=rows.filter(r=>r._amt<0).reduce((s,r)=>s+Math.abs(r._amt),0);
                  const totCredit=rows.filter(r=>r._amt>0).reduce((s,r)=>s+r._amt,0);
                  // compute running balance from bottom up (oldest first)
                  let running=0;
                  const withBal=rows.map(r=>{running+=r._amt;return{...r,_running:running};});
                  // display newest first
                  const display=[...withBal].reverse();
                  return(
                    <div className="acc-ledger">
                      <div className="acc-ledger-header">
                        <div className="acc-ledger-title">
                          {isCC?'💳':'🏦'} All Transactions — {a.name}
                          <span style={{background:'var(--tbg)',color:'var(--t)',border:'1px solid var(--tbrd)',borderRadius:20,fontSize:10,fontWeight:700,padding:'2px 8px'}}>{display.length} entries</span>
                        </div>
                        <div style={{fontSize:11,color:'var(--ink3)',fontWeight:500}}>
                          💜 Purple rows = settlements · Other rows = transactions
                        </div>
                      </div>

                      {/* Summary stats */}
                      <div className="acc-ledger-stats">
                        <div className="als-card">
                          <div className="als-lbl">💸 Total Debited</div>
                          <div className="als-val red">{fmt(totDebit)}</div>
                        </div>
                        <div className="als-card">
                          <div className="als-lbl">💰 Total Credited</div>
                          <div className="als-val green">{fmt(totCredit)}</div>
                        </div>
                        <div className="als-card">
                          <div className="als-lbl">🔄 Settlements</div>
                          <div className="als-val ind">{a.settles.length} ({fmt(a.settleIn+a.settleOut)})</div>
                        </div>
                        <div className="als-card" style={{background:running>0?'var(--redbg)':running<0?'var(--greenbg)':'var(--card)',borderColor:running>0?'var(--redbrd)':running<0?'var(--greenbrd)':'var(--border)'}}>
                          <div className="als-lbl">⚖️ Net Balance</div>
                          <div className="als-val" style={{color:running>0?'var(--red)':running<0?'var(--green)':'var(--ink3)'}}>{running===0?'✓ Clear':running>0?`${fmt(running)} owed`:fmt(Math.abs(running))}</div>
                        </div>
                      </div>

                      {/* Full ledger table */}
                      <div style={{padding:'0 22px 22px'}}>
                        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden',boxShadow:'var(--s1)'}}>
                          <table style={{width:'100%',borderCollapse:'collapse'}}>
                            <thead>
                              <tr style={{background:'var(--bg)'}}>
                                <th style={{padding:'10px 14px',textAlign:'left',fontSize:10,fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--ink3)',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>Date</th>
                                <th style={{padding:'10px 14px',textAlign:'left',fontSize:10,fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--ink3)',borderBottom:'1px solid var(--border)'}}>Type</th>
                                <th style={{padding:'10px 14px',textAlign:'left',fontSize:10,fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--ink3)',borderBottom:'1px solid var(--border)'}}>Party / Flow</th>
                                <th style={{padding:'10px 14px',textAlign:'left',fontSize:10,fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--ink3)',borderBottom:'1px solid var(--border)'}}>Description</th>
                                <th style={{padding:'10px 14px',textAlign:'right',fontSize:10,fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--ink3)',borderBottom:'1px solid var(--border)'}}>Debit</th>
                                <th style={{padding:'10px 14px',textAlign:'right',fontSize:10,fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--ink3)',borderBottom:'1px solid var(--border)'}}>Credit</th>
                                <th style={{padding:'10px 14px',textAlign:'right',fontSize:10,fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--ink3)',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>Running Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {display.map((row,i)=>{
                                const isSettle=row._kind==='settle';
                                const isCredit=row._amt>0;
                                const f=!isSettle&&fMap[row.friendId];
                                const settleDir=isSettle?(row.toAccountId===a.id?'credit':'debit'):null;

                                return(
                                  <tr key={row.id+i} className={isSettle?'ledger-settle-row':''}>
                                    <td style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',fontSize:12,color:'var(--ink3)',fontWeight:500,whiteSpace:'nowrap'}}>{fmtDate(row._date)}</td>
                                    <td style={{padding:'12px 14px',borderBottom:'1px solid var(--border)'}}>
                                      {isSettle ? (
                                        <span className="txn-settle">🔄 Settlement</span>
                                      ) : row.type==='personal' ? (
                                        <span className="txn-personal">Personal</span>
                                      ) : row.type==='expense' ? (
                                        <span className="txn-expense">Friend Exp</span>
                                      ) : (
                                        <span className="txn-payment">Payment In</span>
                                      )}
                                    </td>
                                    <td style={{padding:'12px 14px',borderBottom:'1px solid var(--border)'}}>
                                      {isSettle?(
                                        <div style={{display:'flex',alignItems:'center',gap:7}}>
                                          <span style={{fontSize:15}}>{settleDir==='credit'?'⬇️':'⬆️'}</span>
                                          <div>
                                            <div style={{fontWeight:700,fontSize:13,color:'var(--ind)'}}>
                                              {settleDir==='credit'?'Received from':'Sent to'} {row.fromType==='cash'?'Cash':row.toType==='cash'?'Cash':'account'}
                                            </div>
                                            <div style={{fontSize:11,color:'var(--ink3)',fontWeight:500}}>{row.label||'Settlement'}</div>
                                          </div>
                                        </div>
                                      ):row.type==='personal'?(
                                        <span style={{color:'var(--amber)',fontWeight:600,fontSize:13}}>🧾 Self</span>
                                      ):f?(
                                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                                          <div style={{width:28,height:28,borderRadius:'50%',background:f.color||colorFor(f.name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'white',fontFamily:'var(--fh)',flexShrink:0}}>{initials(f.name)}</div>
                                          <span style={{fontWeight:700,fontSize:13}}>{f.name}</span>
                                        </div>
                                      ):<span style={{color:'var(--ink4)'}}>—</span>}
                                    </td>
                                    <td style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',color:'var(--ink2)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:13}}>
                                      {row.note||<span style={{color:'var(--ink4)'}}>—</span>}
                                    </td>
                                    <td style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',textAlign:'right',fontFamily:'var(--fh)',fontWeight:800,fontSize:14,color:isSettle&&!isCredit?'var(--ind)':'var(--red)'}}>
                                      {row._amt<0?fmt(Math.abs(row._amt)):''}
                                    </td>
                                    <td style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',textAlign:'right',fontFamily:'var(--fh)',fontWeight:800,fontSize:14,color:isSettle&&isCredit?'var(--ind)':'var(--green)'}}>
                                      {row._amt>0?fmt(row._amt):''}
                                    </td>
                                    <td style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',textAlign:'right'}}>
                                      <span style={{fontFamily:'var(--fh)',fontWeight:800,fontSize:13,color:row._running>0?'var(--red)':row._running<0?'var(--green)':'var(--ink3)'}}>
                                        {row._running===0?'✓ Clear':row._running>0?fmt(row._running):`+${fmt(Math.abs(row._running))}`}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          {display.length===0&&<div style={{padding:'40px',textAlign:'center',fontSize:13,color:'var(--ink3)'}}>No activity on this account yet.</div>}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Friend breakdown */}
                {expand===a.id&&(
                  <div className="bkd-panel">
                    <div style={{padding:'13px 18px 9px',fontFamily:'var(--fh)',fontWeight:800,fontSize:14,color:'var(--ink)'}}>👥 Per-Friend Breakdown</div>
                    {a.fbd.length===0?<div style={{padding:'10px 18px 14px',fontSize:13,color:'var(--ink3)'}}>No friend transactions via this account.</div>:(
                      <table className="bkd-table">
                        <thead><tr><th>Friend</th><th>Borrowed</th><th>Paid Back</th><th>Balance</th></tr></thead>
                        <tbody>
                          {a.fbd.map(f=>(
                            <tr key={f.id}>
                              <td><div style={{display:'flex',alignItems:'center',gap:9}}>
                                <div style={{width:28,height:28,borderRadius:'50%',background:f.color||colorFor(f.name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'white',fontFamily:'var(--fh)'}}>{initials(f.name)}</div>
                                <span style={{fontWeight:700}}>{f.name}</span>
                              </div></td>
                              <td style={{color:'var(--red)',fontWeight:700}}>{fmt(f.spent)}</td>
                              <td style={{color:'var(--green)',fontWeight:700}}>{fmt(f.received)}</td>
                              <td><span className={`badge ${f.balance>0?'badge-red':f.balance<0?'badge-green':'badge-gray'}`}>{f.balance>0?`Owes ${fmt(f.balance)}`:f.balance<0?`You owe ${fmt(Math.abs(f.balance))}`:'✓ Settled'}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ACCOUNT STATEMENT ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AccountStatement({ accounts, transactions, friends }) {
  const [sel,setSel]=useState(accounts[0]?.id||'');
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');
  const fMap=Object.fromEntries(friends.map(f=>[f.id,f]));
  const acc=accounts.find(a=>a.id===sel);
  let rows=transactions.filter(t=>t.accountId===sel);
  if(from) rows=rows.filter(t=>t.date>=from);
  if(to)   rows=rows.filter(t=>t.date<=to);
  rows=rows.sort((a,b)=>b.date?.localeCompare(a.date));
  const totExp=rows.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
  const totPer=rows.filter(t=>t.type==='personal').reduce((s,t)=>s+Number(t.amount),0);
  const totRec=rows.filter(t=>t.type==='payment').reduce((s,t)=>s+Number(t.amount),0);
  const totDeb=totExp+totPer;
  const net=totRec-totDeb;
  const fbd=friends.map(f=>{
    const fs=rows.filter(t=>t.friendId===f.id&&t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
    const fr=rows.filter(t=>t.friendId===f.id&&t.type==='payment').reduce((s,t)=>s+Number(t.amount),0);
    return{...f,spent:fs,received:fr,balance:fs-fr};
  }).filter(f=>f.spent>0||f.received>0);
  const isCC=acc?.type==='credit_card';

  return(
    <div>
      <div className="page-head">
        <div><div className="page-title">Statement</div><div className="page-sub">Account-level transaction report</div></div>
      </div>

      <div className="filter-bar" style={{marginBottom:20}}>
        <select className="filter-select" style={{minWidth:200}} value={sel} onChange={e=>setSel(e.target.value)}>
          {accounts.map(a=><option key={a.id} value={a.id}>{a.type==='credit_card'?'💳':'🏦'} {a.name}</option>)}
        </select>
        <input className="filter-select filter-date" type="date" value={from} onChange={e=>setFrom(e.target.value)} title="From"/>
        <input className="filter-select filter-date" type="date" value={to}   onChange={e=>setTo(e.target.value)}   title="To"/>
        {(from||to)&&<button className="filter-clear" onClick={()=>{setFrom('');setTo('');}}>✕ Clear</button>}
      </div>

      {!acc?<div className="tbl-card"><div className="empty"><div className="empty-icon">🏦</div><div className="empty-title">No accounts added</div></div></div>:(
        <>
          <div className={`stmt-header ${isCC?'cc':'bank'}`}>
            <div style={{fontSize:11,opacity:0.6,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>{isCC?'💳 Credit Card':'🏦 Bank Account'}</div>
            <div style={{fontFamily:'var(--fh)',fontSize:26,fontWeight:900}}>{acc.name}</div>
            {(from||to)&&<div style={{fontSize:13,opacity:0.6,marginTop:4,fontWeight:500}}>{from?fmtDate(from):'All time'} → {to?fmtDate(to):'Today'}</div>}
            <div className="stmt-stats">
              <div className="stmt-box"><div className="stmt-box-lbl">Total Debited</div><div className="stmt-box-val">{fmt(totDeb)}</div></div>
              <div className="stmt-box"><div className="stmt-box-lbl">Received Back</div><div className="stmt-box-val">{fmt(totRec)}</div></div>
              <div className="stmt-box"><div className="stmt-box-lbl">Friend Expenses</div><div className="stmt-box-val">{fmt(totExp)}</div></div>
              <div className="stmt-box"><div className="stmt-box-lbl">Net Flow</div><div className="stmt-box-val" style={{color:net>=0?'#4ade80':'#fca5a5'}}>{net>=0?'+':''}{fmt(net)}</div></div>
            </div>
          </div>

          {fbd.length>0&&(
            <div className="tbl-card" style={{marginBottom:20}}>
              <div style={{padding:'16px 20px 10px',fontFamily:'var(--fh)',fontWeight:800,fontSize:16}}>Friend Breakdown</div>
              <table className="bkd-table">
                <thead><tr><th>Friend</th><th>Borrowed</th><th>Paid Back</th><th>Balance</th></tr></thead>
                <tbody>
                  {fbd.map(f=>(
                    <tr key={f.id}>
                      <td><div style={{display:'flex',alignItems:'center',gap:9}}>
                        <div style={{width:30,height:30,borderRadius:'50%',background:f.color||colorFor(f.name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'white',fontFamily:'var(--fh)'}}>{initials(f.name)}</div>
                        <span style={{fontWeight:700}}>{f.name}</span>
                      </div></td>
                      <td style={{color:'var(--red)',fontWeight:700}}>{fmt(f.spent)}</td>
                      <td style={{color:'var(--green)',fontWeight:700}}>{fmt(f.received)}</td>
                      <td><span className={`badge ${f.balance>0?'badge-red':f.balance<0?'badge-green':'badge-gray'}`}>{f.balance>0?`Owes ${fmt(f.balance)}`:f.balance<0?`You owe ${fmt(Math.abs(f.balance))}`:'✓ Settled'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {rows.length===0?<div className="tbl-card"><div className="empty"><div className="empty-icon">📋</div><div className="empty-title">No transactions in this period</div></div></div>:(
            <div className="tbl-card">
              <div style={{padding:'16px 20px 10px',fontFamily:'var(--fh)',fontWeight:800,fontSize:16}}>All Transactions</div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Type</th><th>Friend / Party</th><th>Amount</th><th>Note</th></tr></thead>
                  <tbody>
                    {rows.map(t=>{
                      const f=fMap[t.friendId];
                      return(
                        <tr key={t.id}>
                          <td className="td-muted">{fmtDate(t.date)}</td>
                          <td>{t.type==='personal'?<span className="txn-personal">Personal</span>:t.type==='expense'?<span className="txn-expense">Friend Exp</span>:<span className="txn-payment">Payment In</span>}</td>
                          <td>{t.type==='personal'?<span style={{color:'var(--amber)',fontWeight:600,fontSize:13}}>🧾 Self</span>:(
                            <div style={{display:'flex',alignItems:'center',gap:9}}>
                              {f&&<div style={{width:28,height:28,borderRadius:'50%',background:f.color||colorFor(f.name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'white',fontFamily:'var(--fh)'}}>{initials(f.name)}</div>}
                              <span style={{fontWeight:700}}>{f?.name||'—'}</span>
                            </div>
                          )}</td>
                          <td style={{fontWeight:700,color:t.type==='payment'?'var(--green)':t.type==='personal'?'var(--amber)':'var(--red)',fontFamily:'var(--fh)',fontSize:14}}>{t.type==='payment'?'+':'-'}{fmt(t.amount)}</td>
                          <td className="td-muted" style={{maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.note||'—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── INSIGHTS ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Insights({ friends, accounts, transactions }) {
  const fChart=friends.map(f=>({
    name:f.name.split(' ')[0],
    Given:transactions.filter(t=>t.friendId===f.id&&t.type==='expense').reduce((s,t)=>s+Number(t.amount),0),
    Received:transactions.filter(t=>t.friendId===f.id&&t.type==='payment').reduce((s,t)=>s+Number(t.amount),0),
  })).filter(d=>d.Given>0||d.Received>0);

  const aChart=accounts.map(a=>({
    name:a.name,
    value:transactions.filter(t=>t.accountId===a.id&&t.type==='expense').reduce((s,t)=>s+Number(t.amount),0),
  })).filter(d=>d.value>0);

  const mMap={};
  transactions.forEach(t=>{
    if(!t.date)return;
    const k=t.date.slice(0,7);
    if(!mMap[k])mMap[k]={month:k,Given:0,Received:0};
    if(t.type==='expense') mMap[k].Given+=Number(t.amount);
    if(t.type==='payment') mMap[k].Received+=Number(t.amount);
  });
  const mData=Object.values(mMap).sort((a,b)=>a.month.localeCompare(b.month))
    .map(d=>({...d,month:new Date(d.month+'-01').toLocaleDateString('en-IN',{month:'short',year:'2-digit'})}));

  const COLORS=['#0a7268','#2563eb','#7c3aed','#db2777','#ea580c','#16a34a'];
  const axS={fill:'#5f8880',fontSize:12,fontFamily:'Figtree'};
  const fmtY=v=>'₹'+(v>=1e5?(v/1e5).toFixed(1)+'L':v>=1e3?(v/1e3).toFixed(0)+'K':v);

  const topOwing=[...friends].map(f=>({
    name:f.name,
    balance:transactions.filter(t=>t.friendId===f.id&&t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
           -transactions.filter(t=>t.friendId===f.id&&t.type==='payment').reduce((s,t)=>s+Number(t.amount),0)
  })).sort((a,b)=>b.balance-a.balance);
  const topAcc=[...accounts].map(a=>({name:a.name,type:a.type,spent:transactions.filter(t=>t.accountId===a.id&&t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)})).sort((a,b)=>b.spent-a.spent);

  return(
    <div>
      <div className="page-head"><div><div className="page-title">Insights</div><div className="page-sub">Visualise spending patterns and friend balances</div></div></div>
      {transactions.length===0?(
        <div className="tbl-card"><div className="empty"><div className="empty-icon">🔍</div><div className="empty-title">No data yet</div><div className="empty-sub">Add transactions to see insights</div></div></div>
      ):(
        <>
          {mData.length>0&&(
            <div className="chart-card" style={{marginBottom:20}}>
              <div className="chart-title">Monthly Trend — Given vs Received</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mData} margin={{top:4,right:16,left:4,bottom:0}}>
                  <XAxis dataKey="month" tick={axS} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={fmtY} tick={axS} axisLine={false} tickLine={false} width={56}/>
                  <Tooltip content={<ChartTip/>}/>
                  <Legend wrapperStyle={{fontSize:13,color:'#5f8880'}}/>
                  <Bar dataKey="Given"    fill="#dc2626" radius={[5,5,0,0]}/>
                  <Bar dataKey="Received" fill="#16a34a" radius={[5,5,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="charts-row">
            {fChart.length>0&&(
              <div className="chart-card">
                <div className="chart-title">Per Friend — Given vs Received</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={fChart} margin={{top:4,right:8,left:4,bottom:0}}>
                    <XAxis dataKey="name" tick={axS} axisLine={false} tickLine={false}/>
                    <YAxis tickFormatter={fmtY} tick={axS} axisLine={false} tickLine={false} width={56}/>
                    <Tooltip content={<ChartTip/>}/>
                    <Legend wrapperStyle={{fontSize:12}}/>
                    <Bar dataKey="Given"    fill="#dc2626" radius={[4,4,0,0]}/>
                    <Bar dataKey="Received" fill="#16a34a" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {aChart.length>0&&(
              <div className="chart-card">
                <div className="chart-title">Spending by Account</div>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={aChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({name,percent})=>`${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={12}>
                      {aChart.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Pie>
                    <Tooltip formatter={v=>[fmt(v),'Spent']}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div className="tbl-card">
              <div style={{padding:'16px 20px 10px',fontFamily:'var(--fh)',fontWeight:800,fontSize:16}}>Balance Summary</div>
              {topOwing.map(f=>(
                <div key={f.name} className="insight-row">
                  <span style={{fontWeight:700,fontSize:14}}>{f.name}</span>
                  <span className={`badge ${f.balance>0?'badge-red':f.balance<0?'badge-green':'badge-gray'}`}>
                    {f.balance>0?`Owes ${fmt(f.balance)}`:f.balance<0?`You owe ${fmt(Math.abs(f.balance))}`:'Settled ✓'}
                  </span>
                </div>
              ))}
            </div>
            <div className="tbl-card">
              <div style={{padding:'16px 20px 10px',fontFamily:'var(--fh)',fontWeight:800,fontSize:16}}>Account Usage</div>
              {topAcc.map(a=>(
                <div key={a.name} className="insight-row">
                  <div style={{display:'flex',alignItems:'center',gap:9}}>
                    <span>{a.type==='credit_card'?'💳':'🏦'}</span>
                    <span style={{fontWeight:700,fontSize:14}}>{a.name}</span>
                  </div>
                  <span className="badge badge-teal">{fmt(a.spent)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── SETTLEMENT MODAL ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const SETTLE_METHODS = [
  { key: 'cash',         label: 'Cash',         icon: '💵', desc: 'Physical cash payment' },
  { key: 'bank_account', label: 'Bank / UPI',   icon: '🏦', desc: 'NEFT / IMPS / UPI transfer' },
  { key: 'credit_card',  label: 'Credit Card',  icon: '💳', desc: 'Card bill payment' },
];

function SettlementModal({ userId, accounts, existing, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fromType:      existing?.fromType      || 'cash',
    fromAccountId: existing?.fromAccountId || '',
    toType:        existing?.toType        || 'credit_card',
    toAccountId:   existing?.toAccountId   || '',
    amount:        existing?.amount        ? String(existing.amount) : '',
    date:          existing?.date          || today(),
    note:          existing?.note          || '',
  });
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const setE = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const ccAccounts   = accounts.filter(a => a.type === 'credit_card');
  const bankAccounts = accounts.filter(a => a.type === 'bank_account');

  const accountsFor = type => type === 'credit_card' ? ccAccounts : type === 'bank_account' ? bankAccounts : [];

  const settlementLabel = () => {
    const from = SETTLE_METHODS.find(m => m.key === form.fromType);
    const to   = SETTLE_METHODS.find(m => m.key === form.toType);
    return `${from?.icon} ${from?.label}  →  ${to?.icon} ${to?.label}`;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.date) { alert('Fill all required fields'); return; }
    if (['bank_account','credit_card'].includes(form.fromType) && !form.fromAccountId) { alert('Select the source account'); return; }
    if (!form.toAccountId) { alert('Select the destination account'); return; }
    if (form.fromType !== 'cash' && form.fromAccountId === form.toAccountId) { alert('Source and destination cannot be the same account'); return; }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { alert('Enter a valid amount'); return; }
    setSaving(true);
    try {
      const data = {
        userId,
        fromType:      form.fromType,
        fromAccountId: form.fromType === 'cash' ? null : form.fromAccountId,
        toType:        form.toType,
        toAccountId:   form.toAccountId,
        amount:        amt,
        date:          form.date,
        note:          form.note,
        label:         settlementLabel(),
      };
      if (existing) {
        await updateDoc(doc(db, 'settlements', existing.id), data);
        onSaved('Settlement updated ✓');
      } else {
        await addDoc(collection(db, 'settlements'), data);
        onSaved('Settlement recorded ✓');
      }
    } catch (err) { alert('Save failed'); console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-settle">
        <div className="modal-body">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: 'var(--indbg)', border: '1px solid var(--indbrd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🔄</div>
            <div>
              <div className="modal-title" style={{ marginBottom: 0 }}>{existing ? 'Edit Settlement' : 'Record Settlement'}</div>
              <div className="modal-sub" style={{ marginBottom: 0 }}>Log a payment between any two accounts or cash</div>
            </div>
          </div>

          <form onSubmit={submit}>
            {/* FROM — payment source */}
            <div style={{ marginBottom: 18 }}>
              <div className="field-label" style={{ marginBottom: 10 }}>💳 Paying From (Source)</div>
              <div className="method-grid">
                {SETTLE_METHODS.map(m => (
                  <button key={m.key} type="button"
                    className={`method-btn ${form.fromType === m.key ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, fromType: m.key, fromAccountId: '' }))}>
                    <span className="method-btn-ico">{m.icon}</span>
                    <span className="method-btn-lbl">{m.label}</span>
                  </button>
                ))}
              </div>
              {form.fromType !== 'cash' && (
                <div className="field">
                  <label className="field-label">Which {form.fromType === 'credit_card' ? 'Credit Card' : 'Bank Account'} *</label>
                  <select className="field-input" value={form.fromAccountId} onChange={setE('fromAccountId')}>
                    <option value="">Select account…</option>
                    {accountsFor(form.fromType).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              )}
              {form.fromType === 'cash' && (
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--ink3)', fontWeight: 500 }}>
                  💵 Cash — no account needed
                </div>
              )}
            </div>

            {/* Arrow divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--indbg)', border: '1px solid var(--indbrd)', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: 'var(--ind)' }}>
                ↓ Settling to
              </div>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* TO — destination */}
            <div style={{ marginBottom: 20 }}>
              <div className="field-label" style={{ marginBottom: 10 }}>🎯 Paying Into (Destination)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 14 }}>
                {SETTLE_METHODS.filter(m => m.key !== 'cash').map(m => (
                  <button key={m.key} type="button"
                    className={`method-btn ${form.toType === m.key ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, toType: m.key, toAccountId: '' }))}>
                    <span className="method-btn-ico">{m.icon}</span>
                    <span className="method-btn-lbl">{m.label}</span>
                  </button>
                ))}
              </div>
              <div className="field">
                <label className="field-label">Which {form.toType === 'credit_card' ? 'Credit Card' : 'Bank Account'} *</label>
                <select className="field-input" value={form.toAccountId} onChange={setE('toAccountId')}>
                  <option value="">Select account…</option>
                  {accountsFor(form.toType).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>

            {/* Amount + Date */}
            <div className="form-row g2" style={{ marginBottom: 14 }}>
              <div className="field">
                <label className="field-label">Amount (₹) *</label>
                <input className="field-input" type="number" placeholder="0" min="1" value={form.amount} onChange={setE('amount')} />
              </div>
              <div className="field">
                <label className="field-label">Date *</label>
                <input className="field-input" type="date" value={form.date} onChange={setE('date')} />
              </div>
            </div>

            {/* Note */}
            <div className="form-row" style={{ marginBottom: 0 }}>
              <div className="field">
                <label className="field-label">Note (optional)</label>
                <input className="field-input" placeholder="e.g. HDFC CC bill paid via SBI net banking" value={form.note} onChange={setE('note')} />
              </div>
            </div>

            {/* Preview pill */}
            {form.amount && (
              <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--indbg)', border: '1px solid var(--indbrd)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>🔄</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ind)' }}>{settlementLabel()}</div>
                  <div style={{ fontFamily: 'var(--fh)', fontSize: 18, fontWeight: 900, color: 'var(--ind-dark)', marginTop: 1 }}>{fmt(parseFloat(form.amount) || 0)}</div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn" disabled={saving}
                style={{ flex: 2, background: 'var(--ind)', color: 'white', boxShadow: '0 2px 10px rgba(79,70,229,0.3)' }}>
                {saving ? 'Saving…' : existing ? '🔄 Update Settlement' : '🔄 Record Settlement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── SETTLEMENTS PAGE ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function SettlementsPage({ user, accounts, settlements, showToast, onNew }) {
  const [filterFrom, setFrom] = useState('');
  const [filterTo,   setTo]   = useState('');
  const [editSettle, setEditSettle] = useState(null);
  const aMap = Object.fromEntries(accounts.map(a => [a.id, a]));

  const del = async (id) => {
    if (!window.confirm('Delete this settlement record?')) return;
    try { await deleteDoc(doc(db, 'settlements', id)); showToast('Settlement deleted'); }
    catch { showToast('Delete failed', 'error'); }
  };

  let rows = [...settlements].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  if (filterFrom) rows = rows.filter(s => s.date >= filterFrom);
  if (filterTo)   rows = rows.filter(s => s.date <= filterTo);

  const totalSettled = rows.reduce((s, r) => s + Number(r.amount), 0);

  // Group by settle type for summary
  const byType = {};
  rows.forEach(r => {
    const k = `${r.fromType}→${r.toType}`;
    if (!byType[k]) byType[k] = { label: r.label || k, total: 0, count: 0 };
    byType[k].total += Number(r.amount);
    byType[k].count += 1;
  });

  const methodIcon = type => type === 'cash' ? '💵' : type === 'credit_card' ? '💳' : '🏦';
  const methodName = type => type === 'cash' ? 'Cash' : type === 'credit_card' ? 'Credit Card' : 'Bank / UPI';

  const accName = (type, id) => {
    if (type === 'cash') return 'Cash';
    return aMap[id]?.name || '—';
  };

  return (
    <div>
      {/* Page header */}
      <div className="page-head">
        <div>
          <div className="page-title">Settlements</div>
          <div className="page-sub">Inter-account & inter-method payment records</div>
        </div>
        <button className="btn" onClick={onNew}
          style={{ background: 'var(--ind)', color: 'white', boxShadow: '0 2px 10px rgba(79,70,229,0.3)' }}>
          🔄 Record Settlement
        </button>
      </div>

      {/* Hero banner */}
      <div className="settle-hero">
        <div>
          <div className="settle-hero-title">Settlement Tracker</div>
          <div className="settle-hero-sub">Track every payment you've made — cash to CC, bank to CC, or bank to bank</div>
        </div>
        <div className="settle-stats">
          <div className="settle-stat">
            <div className="settle-stat-lbl">Total Settled</div>
            <div className="settle-stat-val">{fmt(totalSettled)}</div>
          </div>
          <div className="settle-stat">
            <div className="settle-stat-lbl">Records</div>
            <div className="settle-stat-val">{rows.length}</div>
          </div>
          <div className="settle-stat">
            <div className="settle-stat-lbl">Flow Types</div>
            <div className="settle-stat-val">{Object.keys(byType).length}</div>
          </div>
        </div>
      </div>

      {/* Summary cards by type */}
      {Object.keys(byType).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
          {Object.entries(byType).map(([key, val]) => {
            const [fromT, toT] = key.split('→');
            return (
              <div key={key} style={{ background: 'var(--card)', border: '1px solid var(--indbrd)', borderRadius: 14, padding: '16px 18px', boxShadow: 'var(--s1)' }}>
                <div className="flow-pill" style={{ marginBottom: 12 }}>
                  {methodIcon(fromT)} {methodName(fromT)}
                  <span className="flow-arrow">→</span>
                  {methodIcon(toT)} {methodName(toT)}
                </div>
                <div style={{ fontFamily: 'var(--fh)', fontSize: 22, fontWeight: 900, color: 'var(--ind)', marginBottom: 3 }}>{fmt(val.total)}</div>
                <div style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 500 }}>{val.count} settlement{val.count !== 1 ? 's' : ''}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <input className="filter-select filter-date" type="date" value={filterFrom} onChange={e => setFrom(e.target.value)} title="From date" />
        <input className="filter-select filter-date" type="date" value={filterTo}   onChange={e => setTo(e.target.value)}   title="To date" />
        {(filterFrom || filterTo) && <button className="filter-clear" onClick={() => { setFrom(''); setTo(''); }}>✕ Clear</button>}
        <span className="filter-count">{rows.length} record{rows.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="tbl-card">
          <div className="empty">
            <div className="empty-icon">🔄</div>
            <div className="empty-title">No settlements yet</div>
            <div className="empty-sub">Record a cash → CC payment, bank transfer, or any inter-account settlement</div>
          </div>
        </div>
      ) : (
        <div className="tbl-card">
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Settlement Flow</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Note</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(s => (
                  <tr key={s.id}>
                    <td className="td-muted">{fmtDate(s.date)}</td>
                    <td>
                      <div className="flow-pill">
                        {methodIcon(s.fromType)} {methodName(s.fromType)}
                        <span className="flow-arrow">→</span>
                        {methodIcon(s.toType)} {methodName(s.toType)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 16 }}>{methodIcon(s.fromType)}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{methodName(s.fromType)}</div>
                          {s.fromAccountId && <div style={{ fontSize: 11, color: 'var(--ink3)', fontWeight: 500 }}>{aMap[s.fromAccountId]?.name || '—'}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 16 }}>{methodIcon(s.toType)}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{methodName(s.toType)}</div>
                          {s.toAccountId && <div style={{ fontSize: 11, color: 'var(--ink3)', fontWeight: 500 }}>{aMap[s.toAccountId]?.name || '—'}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 15, color: 'var(--ind)' }}>
                        {fmt(s.amount)}
                      </span>
                    </td>
                    <td className="td-muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.note || '—'}
                    </td>
                    <td>
                      <div style={{display:'flex',gap:7}}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditSettle(s)} title="Edit"><IcoEdit /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(s.id)} title="Delete"><IcoTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editSettle && (
        <SettlementModal
          userId={user.id} accounts={accounts} existing={editSettle}
          onClose={() => setEditSettle(null)}
          onSaved={msg => { setEditSettle(null); showToast(msg); }}
        />
      )}
    </div>
  );
}
export default function App() {
  const [user,setUser]     = useState(null);
  const [booting,setBooting] = useState(true);

  useEffect(()=>{ injectCSS(); setBooting(false); },[]);

  if (booting) return(
    <div className="ft-app" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <div className="loader"><div className="spinner"/><span>Loading FinTrack…</span></div>
    </div>
  );

  return(
    <div className="ft-app">
      {!user && <LoginPage onLogin={u=>setUser(u)}/>}
      {user  && <AppShell user={user} onLogout={()=>setUser(null)}/>}
    </div>
  );
}
