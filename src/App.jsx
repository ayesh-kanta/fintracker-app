// ─────────────────────────────────────────────────────────────────────────────
//  FinTrack — Personal Finance & Friend Split Tracker  (Redesigned)
//  Firebase Firestore · Real-time · Mobile-first
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection, doc, getDoc, getDocs, onSnapshot,
  setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy,
} from 'firebase/firestore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { db } from './firebase';

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Figtree:wght@400;500;600;700;800&display=swap');

:root {
  /* ── Palette: Deep Teal + Warm Gold ── */
  --bg:        #f2f6f5;
  --bg2:       #e6eeec;
  --card:      #ffffff;
  --border:    #dde8e5;
  --border2:   #c5d8d3;

  /* Text */
  --ink:       #0e1f1c;
  --ink2:      #243b36;
  --ink3:      #6b8e87;
  --ink4:      #a8c4be;

  /* Brand — Deep Teal */
  --t:         #0d7870;
  --t-light:   #1aac9c;
  --t-dark:    #075c55;
  --tbg:       #e6f4f3;
  --tbrd:      rgba(13,120,112,0.2);

  /* Accent — Warm Gold */
  --gold:      #e8a020;
  --goldbg:    #fef8ec;
  --goldbrd:   #fde68a;

  /* Semantic */
  --green:     #16a34a;
  --greenbg:   #f0fdf4;
  --greenbrd:  #bbf7d0;
  --red:       #e53e3e;
  --redbg:     #fff5f5;
  --redbrd:    #fed7d7;
  --amber:     #d97706;
  --amberbg:   #fffbeb;
  --amberbrd:  #fde68a;

  /* Layout */
  --nav-h:     66px;
  --top-h:     60px;
  --r:         18px;
  --r-sm:      12px;
  --r-xs:      8px;

  /* Shadows */
  --s1: 0 1px 3px rgba(13,31,28,0.05), 0 1px 2px rgba(13,31,28,0.04);
  --s2: 0 2px 8px rgba(13,31,28,0.06), 0 1px 3px rgba(13,31,28,0.04);
  --s3: 0 8px 24px rgba(13,31,28,0.1), 0 2px 6px rgba(13,31,28,0.06);

  /* Gradients */
  --g-brand: linear-gradient(135deg, #0d7870 0%, #1aac9c 100%);
  --g-hero:  linear-gradient(145deg, #053c35 0%, #0d7870 55%, #1aac9c 100%);
  --g-gold:  linear-gradient(135deg, #d97706 0%, #f59e0b 100%);

  --fh: 'Nunito', system-ui, sans-serif;
  --fb: 'Figtree', system-ui, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  font-family: var(--fb);
  color: var(--ink);
  -webkit-tap-highlight-color: transparent;
}
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

/* ══ SHELL ══ */
.ft-app { min-height: 100vh; }
.shell  { display: flex; flex-direction: column; min-height: 100vh; }

/* ══ TOP BAR ══ */
.topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: var(--top-h);
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center;
  justify-content: space-between; padding: 0 18px;
  box-shadow: 0 1px 0 var(--border);
}
.topbar-brand { display: flex; align-items: center; gap: 10px; }
.brand-icon {
  width: 36px; height: 36px; border-radius: 11px;
  background: var(--g-brand);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  box-shadow: 0 3px 10px rgba(13,120,112,0.35);
}
.brand-name {
  font-family: var(--fh); font-size: 18px; font-weight: 900;
  color: var(--ink); letter-spacing: -0.5px;
}
.topbar-right { display: flex; align-items: center; gap: 8px; }
.user-chip {
  display: flex; align-items: center; gap: 8px;
  background: var(--tbg); border: 1px solid var(--tbrd);
  border-radius: 28px; padding: 5px 13px 5px 5px;
}
.user-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--g-brand);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 800; color: white; font-family: var(--fh);
}
.user-name { font-size: 13px; font-weight: 700; color: var(--t-dark); }

/* ══ MAIN ══ */
.main {
  flex: 1;
  padding: calc(var(--top-h) + 20px) 16px calc(var(--nav-h) + 24px);
  max-width: 620px; margin: 0 auto; width: 100%;
}

/* ══ BOTTOM NAV ══ */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  height: var(--nav-h);
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid var(--border);
  display: flex; align-items: center;
  padding: 0 4px env(safe-area-inset-bottom, 8px);
  box-shadow: 0 -4px 20px rgba(13,31,28,0.06);
}
.bnav-item {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  flex: 1; padding: 8px 2px 4px; background: none; border: none; cursor: pointer;
  -webkit-tap-highlight-color: transparent; transition: opacity 0.15s;
}
.bnav-item:active { opacity: 0.6; }
.bnav-icon {
  width: 42px; height: 28px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; transition: background 0.18s;
}
.bnav-item.active .bnav-icon { background: var(--tbg); }
.bnav-label {
  font-size: 9.5px; font-weight: 700; color: var(--ink4);
  letter-spacing: 0.01em; font-family: var(--fb);
  transition: color 0.18s;
}
.bnav-item.active .bnav-label { color: var(--t); }

/* ══ FAB ══ */
.fab {
  position: fixed;
  bottom: calc(var(--nav-h) + 14px); right: 18px; z-index: 110;
  width: 54px; height: 54px; border-radius: 17px; border: none;
  background: var(--g-brand); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; cursor: pointer;
  box-shadow: 0 4px 18px rgba(13,120,112,0.45), 0 1px 4px rgba(13,120,112,0.25);
  transition: transform 0.18s, box-shadow 0.18s;
  -webkit-tap-highlight-color: transparent;
}
.fab:active { transform: scale(0.9); box-shadow: 0 2px 8px rgba(13,120,112,0.4); }

/* ══ HERO CARD ══ */
.hero-card {
  background: var(--g-hero);
  border-radius: 24px; padding: 26px 22px 22px;
  margin-bottom: 18px; position: relative; overflow: hidden;
  box-shadow: 0 6px 24px rgba(5,60,53,0.35), 0 2px 6px rgba(5,60,53,0.2);
}
.hero-card::before {
  content: ''; position: absolute;
  width: 220px; height: 220px; border-radius: 50%;
  top: -80px; right: -70px;
  background: rgba(255,255,255,0.06); pointer-events: none;
}
.hero-card::after {
  content: ''; position: absolute;
  width: 150px; height: 150px; border-radius: 50%;
  bottom: -60px; left: -40px;
  background: rgba(255,255,255,0.04); pointer-events: none;
}
.hero-greeting  { font-size: 12px; color: rgba(255,255,255,0.55); font-weight: 600; margin-bottom: 3px; letter-spacing: 0.03em; }
.hero-name      { font-family: var(--fh); font-size: 22px; font-weight: 900; color: white; margin-bottom: 20px; }
.hero-label     { font-size: 10px; color: rgba(255,255,255,0.5); letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; margin-bottom: 5px; }
.hero-value     { font-family: var(--fh); font-size: 38px; font-weight: 900; color: white; line-height: 1; margin-bottom: 20px; letter-spacing: -1.5px; }
.hero-row       { display: flex; gap: 9px; }
.hero-mini {
  flex: 1; background: rgba(255,255,255,0.12); border-radius: 13px;
  padding: 11px 13px; border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(4px);
}
.hero-mini-label { font-size: 9px; color: rgba(255,255,255,0.5); font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 4px; }
.hero-mini-value { font-family: var(--fh); font-size: 15px; font-weight: 800; color: white; }

/* ══ QUICK CARDS ══ */
.quick-row { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; margin-bottom: 18px; }
.quick-card {
  background: var(--card); border-radius: var(--r); padding: 15px;
  border: 1px solid var(--border); box-shadow: var(--s1);
  display: flex; align-items: center; gap: 11px;
  transition: transform 0.15s, box-shadow 0.15s;
}
.quick-card:active { transform: scale(0.98); }
.quick-ico {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 19px; flex-shrink: 0;
}
.quick-label { font-size: 10px; font-weight: 700; color: var(--ink3); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 3px; }
.quick-value { font-family: var(--fh); font-size: 17px; font-weight: 900; color: var(--ink); }
.quick-value.green  { color: var(--green); }
.quick-value.red    { color: var(--red); }
.quick-value.amber  { color: var(--amber); }
.quick-value.teal   { color: var(--t); }

/* ══ SECTION HEADER ══ */
.sec-title {
  font-family: var(--fh); font-size: 16px; font-weight: 900; color: var(--ink);
  margin-bottom: 11px; display: flex; align-items: center; justify-content: space-between;
}
.sec-more  { font-size: 12px; font-weight: 700; color: var(--t); cursor: pointer; background: none; border: none; font-family: var(--fb); }
.page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
.page-title { font-family: var(--fh); font-size: 23px; font-weight: 900; color: var(--ink); }
.page-sub   { font-size: 13px; color: var(--ink3); margin-top: 3px; font-weight: 500; }

/* ══ ACTIVITY LIST ══ */
.activity-card {
  background: var(--card); border-radius: var(--r);
  border: 1px solid var(--border); box-shadow: var(--s1);
  overflow: hidden; margin-bottom: 15px;
}
.activity-row {
  display: flex; align-items: center; gap: 13px;
  padding: 13px 16px; border-bottom: 1px solid var(--border);
  transition: background 0.12s;
}
.activity-row:last-child { border-bottom: none; }
.activity-row:active { background: var(--bg); }
.activity-ico {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
.activity-desc { flex: 1; min-width: 0; }
.activity-title { font-size: 14px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.activity-sub   { font-size: 11px; color: var(--ink3); margin-top: 2px; font-weight: 500; }
.activity-amt   { font-family: var(--fh); font-size: 15px; font-weight: 800; flex-shrink: 0; }

/* ══ FRIEND CARD ══ */
.friend-grid { display: flex; flex-direction: column; gap: 13px; }
.friend-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--r); box-shadow: var(--s1); overflow: hidden;
}
.friend-card-top { padding: 16px 16px 0; }
.friend-head { display: flex; align-items: center; gap: 13px; margin-bottom: 14px; }
.friend-avatar {
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-family: var(--fh); font-weight: 900; color: white; flex-shrink: 0;
  font-size: 14px;
}
.friend-name  { font-family: var(--fh); font-size: 16px; font-weight: 900; color: var(--ink); }
.friend-phone { font-size: 12px; color: var(--ink3); margin-top: 2px; font-weight: 500; }
.friend-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 14px; }
.fstat        { background: var(--bg); border-radius: var(--r-xs); padding: 10px 11px; border: 1px solid var(--border); }
.fstat-label  { font-size: 9px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--ink4); margin-bottom: 4px; }
.fstat-value  { font-family: var(--fh); font-size: 14px; font-weight: 900; color: var(--ink); }
.fstat-value.green  { color: var(--green); }
.fstat-value.red    { color: var(--red); }
.fstat-value.teal   { color: var(--t); }
.friend-actions { display: flex; border-top: 1px solid var(--border); background: var(--bg); }
.friend-action-btn {
  flex: 1; padding: 11px 8px; background: none; border: none;
  color: var(--ink3); cursor: pointer; font-family: var(--fb);
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  border-right: 1px solid var(--border); transition: all 0.13s;
}
.friend-action-btn:last-child { border-right: none; }
.friend-action-btn:active { background: var(--bg2); color: var(--ink); }
.friend-action-btn.history { color: var(--t); }
.friend-action-btn.history:active { background: var(--tbg); }

/* ══ FRIEND HISTORY PANEL ══ */
.friend-history {
  border-top: 1px solid var(--border);
  background: #fafcfb;
}
.fhistory-header {
  padding: 14px 16px 10px;
  display: flex; align-items: center; justify-content: space-between;
}
.fhistory-title {
  font-family: var(--fh); font-size: 13px; font-weight: 800; color: var(--ink);
  display: flex; align-items: center; gap: 6px;
}
.fhistory-badge {
  background: var(--tbg); color: var(--t); border: 1px solid var(--tbrd);
  border-radius: 20px; font-size: 10px; font-weight: 700; padding: 2px 8px;
}
.fhistory-empty {
  padding: 20px 16px; font-size: 13px; color: var(--ink3); text-align: center;
}

/* ══ TIMELINE ══ */
.timeline { padding: 0 16px 14px; }
.timeline-item {
  display: flex; gap: 12px; margin-bottom: 0;
  position: relative;
}
.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 15px; top: 32px; bottom: -2px;
  width: 2px; background: var(--border);
  z-index: 0;
}
.timeline-dot {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; z-index: 1; margin-top: 2px;
  border: 2px solid var(--card);
}
.timeline-dot.expense { background: var(--redbg); border-color: var(--redbrd); }
.timeline-dot.payment { background: var(--greenbg); border-color: var(--greenbrd); }
.timeline-dot.personal { background: var(--amberbg); border-color: var(--amberbrd); }
.timeline-body {
  flex: 1; background: var(--card); border: 1px solid var(--border);
  border-radius: 12px; padding: 10px 13px; margin-bottom: 10px;
  box-shadow: var(--s1);
}
.timeline-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
.timeline-note { font-size: 13px; font-weight: 700; color: var(--ink); }
.timeline-amt  { font-family: var(--fh); font-size: 14px; font-weight: 900; }
.timeline-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.timeline-tag  {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600; color: var(--ink3);
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 6px; padding: 2px 7px;
}

/* ══ ACCOUNT CARD ══ */
.account-grid { display: flex; flex-direction: column; gap: 13px; }
.account-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--r); box-shadow: var(--s1); overflow: hidden;
}
.account-stripe { height: 4px; width: 100%; }
.account-stripe.cc   { background: linear-gradient(90deg, #075c55, #1aac9c); }
.account-stripe.bank { background: linear-gradient(90deg, #166534, #22c55e); }
.account-card-inner { padding: 16px; }
.account-chip {
  display: inline-flex; align-items: center; gap: 5px;
  border-radius: 20px; padding: 3px 11px; font-size: 10px;
  font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 10px;
}
.account-chip.cc   { background: var(--tbg); color: var(--t); border: 1px solid var(--tbrd); }
.account-chip.bank { background: var(--greenbg); color: var(--green); border: 1px solid var(--greenbrd); }
.account-name { font-family: var(--fh); font-size: 18px; font-weight: 900; color: var(--ink); margin-bottom: 2px; }
.account-sub  { font-size: 11px; color: var(--ink3); margin-bottom: 14px; font-weight: 500; }
.account-spent { font-family: var(--fh); font-size: 28px; font-weight: 900; color: var(--ink); margin-bottom: 2px; }
.account-spent-label { font-size: 11px; color: var(--ink3); }

.limit-bar-track { background: var(--bg2); border-radius: 6px; height: 7px; overflow: hidden; margin: 9px 0 5px; }
.limit-bar-fill { height: 100%; border-radius: 6px; transition: width 0.6s ease; }
.limit-bar-fill.cc     { background: linear-gradient(90deg, #075c55, var(--t)); }
.limit-bar-fill.bank   { background: linear-gradient(90deg, #166534, #22c55e); }
.limit-bar-fill.warn   { background: linear-gradient(90deg, var(--amber), #f59e0b); }
.limit-bar-fill.danger { background: linear-gradient(90deg, var(--red), #fc8181); }
.limit-row { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink3); margin-bottom: 2px; font-weight: 500; }
.limit-available { font-family: var(--fh); font-size: 12px; font-weight: 800; }

.account-actions { display: flex; border-top: 1px solid var(--border); background: var(--bg); }
.account-action-btn {
  flex: 1; padding: 11px 8px; background: none; border: none;
  color: var(--ink3); cursor: pointer; font-family: var(--fb);
  font-size: 12px; font-weight: 700; display: flex; align-items: center;
  justify-content: center; gap: 5px; transition: all 0.14s;
  border-right: 1px solid var(--border);
}
.account-action-btn:last-child { border-right: none; }
.account-action-btn:active { background: var(--bg2); color: var(--ink); }

/* ══ BREAKDOWN PANEL ══ */
.breakdown-panel { background: #fafcfb; border-top: 1px solid var(--border); }
.breakdown-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.breakdown-table th { padding: 9px 13px; text-align: left; font-size: 9.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink3); background: var(--bg); border-bottom: 1px solid var(--border); }
.breakdown-table td { padding: 11px 13px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.breakdown-table tr:last-child td { border-bottom: none; }

/* ══ BUTTONS ══ */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 11px 20px; border-radius: var(--r-sm); font-family: var(--fb);
  font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.15s;
  border: none; white-space: nowrap; -webkit-tap-highlight-color: transparent;
}
.btn-primary {
  background: var(--t); color: white;
  box-shadow: 0 2px 10px rgba(13,120,112,0.3);
}
.btn-primary:hover { background: var(--t-dark); }
.btn-primary:active { background: var(--t-dark); transform: scale(0.98); }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-ghost  { background: var(--bg); color: var(--ink2); border: 1.5px solid var(--border); }
.btn-ghost:active { background: var(--bg2); }
.btn-danger { background: var(--redbg); color: var(--red); border: 1px solid var(--redbrd); }
.btn-danger:active { background: #fee2e2; }
.btn-success { background: var(--greenbg); color: var(--green); border: 1px solid var(--greenbrd); }
.btn-sm   { padding: 7px 14px; font-size: 12px; border-radius: var(--r-xs); }
.btn-icon { padding: 8px; border-radius: 10px; }
.btn-full { width: 100%; }

/* ══ FORM ══ */
.form-section { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 20px; box-shadow: var(--s1); }
.form-title   { font-family: var(--fh); font-size: 18px; font-weight: 900; color: var(--ink); margin-bottom: 4px; }
.form-sub     { font-size: 12px; color: var(--ink3); margin-bottom: 18px; font-weight: 500; }
.form-row     { display: grid; gap: 12px; margin-bottom: 12px; }
.form-row.g2  { grid-template-columns: 1fr 1fr; }
.field        { display: flex; flex-direction: column; gap: 5px; }
.field-label  { font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink2); }
.field-input  {
  background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--r-sm);
  padding: 11px 14px; font-size: 14px; color: var(--ink); font-family: var(--fb);
  transition: border-color 0.15s, box-shadow 0.15s; outline: none; width: 100%; font-weight: 500;
}
.field-input:focus { border-color: var(--t); box-shadow: 0 0 0 3px var(--tbg); }
.field-input::placeholder { color: var(--ink4); }
select.field-input { cursor: pointer; }
select.field-input option { background: white; color: var(--ink); }
.input-wrap { position: relative; }
.input-wrap .field-input { padding-right: 44px; }
.eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--ink3); padding: 4px; display: flex; align-items: center; }

/* ══ TABLE ══ */
.table-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--s1); overflow: hidden; }
.table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
table { width: 100%; border-collapse: collapse; min-width: 520px; }
thead tr { background: var(--bg); }
th { padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink3); border-bottom: 1px solid var(--border); white-space: nowrap; }
td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid var(--border); vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:active { background: var(--bg); }
.td-bold  { font-weight: 700; color: var(--ink); }
.td-muted { color: var(--ink3); font-size: 12px; font-weight: 500; }
.td-green { color: var(--green); font-weight: 700; }
.td-red   { color: var(--red); font-weight: 700; }
.td-teal  { color: var(--t); font-weight: 700; }

/* ══ BADGES ══ */
.badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge-green  { background: var(--greenbg);  color: var(--green);  border: 1px solid var(--greenbrd); }
.badge-red    { background: var(--redbg);    color: var(--red);    border: 1px solid var(--redbrd); }
.badge-teal   { background: var(--tbg);      color: var(--t);      border: 1px solid var(--tbrd); }
.badge-amber  { background: var(--amberbg);  color: var(--amber);  border: 1px solid var(--amberbrd); }
.badge-gray   { background: var(--bg2);      color: var(--ink3);   border: 1px solid var(--border2); }
.badge-gold   { background: var(--goldbg);   color: var(--gold);   border: 1px solid var(--goldbrd); }
.bal-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }

/* ══ TXN CHIPS ══ */
.txn-expense  { background: var(--redbg);   color: var(--red);   border-radius: 6px; padding: 2px 9px; font-size: 10px; font-weight: 700; border: 1px solid var(--redbrd); }
.txn-payment  { background: var(--greenbg); color: var(--green); border-radius: 6px; padding: 2px 9px; font-size: 10px; font-weight: 700; border: 1px solid var(--greenbrd); }
.txn-personal { background: var(--amberbg); color: var(--amber); border-radius: 6px; padding: 2px 9px; font-size: 10px; font-weight: 700; border: 1px solid var(--amberbrd); }

/* ══ BOTTOM SHEET ══ */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(8,20,18,0.6);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  z-index: 200; display: flex; align-items: flex-end; justify-content: center;
}
.modal {
  background: var(--card); border-radius: 26px 26px 0 0;
  width: 100%; max-width: 540px; max-height: 92vh; overflow-y: auto;
  box-shadow: 0 -6px 36px rgba(8,20,18,0.18);
  animation: sheetUp 0.28s cubic-bezier(0.32, 1.1, 0.64, 1);
}
@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.modal-handle { width: 34px; height: 4px; background: var(--border2); border-radius: 2px; margin: 12px auto 0; }
.modal-body   { padding: 20px 22px 38px; }
.modal-title  { font-family: var(--fh); font-size: 20px; font-weight: 900; color: var(--ink); margin-bottom: 3px; }
.modal-sub    { font-size: 12px; color: var(--ink3); margin-bottom: 20px; font-weight: 500; }
.modal-actions{ display: flex; gap: 10px; margin-top: 18px; }

/* ══ FILTER BAR ══ */
.filter-bar { display: flex; gap: 7px; margin-bottom: 14px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.filter-bar::-webkit-scrollbar { display: none; }
.filter-select {
  background: var(--card); border: 1.5px solid var(--border); border-radius: 22px;
  padding: 7px 14px; font-size: 12px; font-family: var(--fb);
  color: var(--ink2); outline: none; cursor: pointer;
  white-space: nowrap; flex-shrink: 0; font-weight: 600;
}
.filter-select:focus { border-color: var(--t); }
.filter-date  { padding: 7px 12px; }
.filter-clear { font-size: 12px; color: var(--ink3); cursor: pointer; background: none; border: none; font-family: var(--fb); flex-shrink: 0; font-weight: 600; }
.filter-clear:active { color: var(--red); }

/* ══ LOGIN ══ */
.login-page {
  min-height: 100vh; display: flex; align-items: center;
  justify-content: center; padding: 20px;
  background: var(--bg);
}
.login-bg   { position: fixed; inset: 0; pointer-events: none; overflow: hidden; }
.login-blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.12; }
.login-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 26px;
  padding: 34px 28px; width: 100%; max-width: 390px;
  box-shadow: var(--s3); position: relative; z-index: 1;
}
.login-logo      { display: flex; align-items: center; gap: 13px; margin-bottom: 30px; }
.login-logo-icon {
  width: 50px; height: 50px; border-radius: 16px;
  background: var(--g-brand);
  display: flex; align-items: center; justify-content: center; font-size: 26px;
  box-shadow: 0 4px 16px rgba(13,120,112,0.4);
}
.login-logo-text { font-family: var(--fh); font-size: 26px; font-weight: 900; color: var(--ink); letter-spacing: -0.5px; }
.login-logo-sub  { font-size: 11px; color: var(--ink3); font-weight: 500; }
.login-title { font-family: var(--fh); font-size: 21px; font-weight: 900; color: var(--ink); margin-bottom: 4px; }
.login-sub   { font-size: 13px; color: var(--ink3); margin-bottom: 24px; font-weight: 500; }
.login-error { background: var(--redbg); border: 1px solid var(--redbrd); border-radius: 10px; padding: 11px 14px; font-size: 13px; color: var(--red); margin-bottom: 14px; font-weight: 600; }

/* ══ EMPTY ══ */
.empty { padding: 52px 20px; text-align: center; }
.empty-icon { font-size: 46px; margin-bottom: 13px; opacity: 0.22; }
.empty-text { font-size: 15px; color: var(--ink3); font-weight: 700; }
.empty-sub  { font-size: 12px; color: var(--ink4); margin-top: 5px; font-weight: 500; }

/* ══ TOAST ══ */
.toast {
  position: fixed; bottom: calc(var(--nav-h) + 14px); left: 50%;
  transform: translateX(-50%); z-index: 9999;
  background: var(--ink2); color: white; border-radius: 14px;
  padding: 12px 20px; font-size: 13px; font-weight: 700;
  white-space: nowrap; box-shadow: var(--s3);
  animation: toastIn 0.26s cubic-bezier(0.32, 1.1, 0.64, 1);
  display: flex; align-items: center; gap: 8px;
}
.toast.success { background: #064e3b; }
.toast.error   { background: #9b1c1c; }
@keyframes toastIn { from { transform: translateX(-50%) translateY(12px) scale(0.93); opacity: 0; } to { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; } }

/* ══ LOADER ══ */
.loader { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; min-height: 100vh; color: var(--ink3); font-size: 14px; font-weight: 600; }
.spinner { width: 28px; height: 28px; border: 2.5px solid var(--border); border-top-color: var(--t); border-radius: 50%; animation: spin 0.65s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ CHARTS ══ */
.chart-card  { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 18px; box-shadow: var(--s1); margin-bottom: 13px; }
.chart-title { font-family: var(--fh); font-size: 14px; font-weight: 800; color: var(--ink); margin-bottom: 15px; }

/* ══ STATEMENT ══ */
.stmt-header { border-radius: var(--r); padding: 22px; color: white; margin-bottom: 15px; box-shadow: var(--s2); }
.stmt-header.cc   { background: linear-gradient(140deg, #053c35 0%, #0d7870 100%); }
.stmt-header.bank { background: linear-gradient(140deg, #052e16 0%, #16a34a 100%); }
.stmt-total-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 14px; }
.stmt-total-box   { background: rgba(255,255,255,0.12); border-radius: 11px; padding: 11px 13px; border: 1px solid rgba(255,255,255,0.1); }
.stmt-total-label { font-size: 9px; opacity: 0.65; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px; }
.stmt-total-value { font-family: var(--fh); font-size: 18px; font-weight: 900; }

/* ══ MISC ══ */
.insight-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
.insight-row:last-child { border-bottom: none; }
.divider { height: 1px; background: var(--border); margin: 15px 0; }

/* ══ RESPONSIVE ══ */
@media (min-width: 600px) {
  .quick-row { grid-template-columns: repeat(4, 1fr); }
  .friend-grid, .account-grid { display: grid; grid-template-columns: 1fr 1fr; }
  .form-row.g2 { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 360px) {
  .main { padding-left: 12px; padding-right: 12px; }
  .hero-value { font-size: 30px; }
}
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const injectCSS = () => {
  if (document.getElementById('ft-css')) return;
  const el = document.createElement('style');
  el.id = 'ft-css'; el.textContent = CSS;
  document.head.appendChild(el);
};

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};
const fmtDateShort = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); }
  catch { return d; }
};
const initials = (name = '') => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
const today    = () => new Date().toISOString().split('T')[0];

const PALETTE = ['#0d7870','#2563eb','#7c3aed','#db2777','#ea580c','#16a34a','#0891b2','#d97706','#dc2626','#059669'];
const colorFor = (str = '') => PALETTE[str.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  return <div className={`toast ${type}`}>{icon} {msg}</div>;
}
function useToast() {
  const [t, setT] = useState(null);
  const show = useCallback((msg, type = 'success') => setT({ msg, type, id: Date.now() }), []);
  const el = t ? <Toast key={t.id} msg={t.msg} type={t.type} onDone={() => setT(null)} /> : null;
  return [show, el];
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const IcoTrash  = () => <Ico d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></>} />;
const IcoEdit   = () => <Ico d={<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>} />;
const IcoPlus   = () => <Ico d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />;
const IcoEye    = () => <Ico d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>} />;
const IcoEyeOff = () => <Ico d={<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>} />;
const IcoHistory = () => <Ico d={<><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 106 5.3L3 8"/><path d="M12 7v5l4 2"/></>} />;
const IcoChevDown = () => <Ico d={<polyline points="6 9 12 15 18 9"/>} />;
const IcoChevUp   = () => <Ico d={<polyline points="18 15 12 9 6 15"/>} />;

// ─── SEED DATA ────────────────────────────────────────────────────────────────
async function seedIfEmpty(userId) {
  const snap = await getDocs(query(collection(db, 'friends'), where('userId', '==', userId)));
  if (!snap.empty) return;

  const f1 = await addDoc(collection(db, 'friends'), { userId, name: 'Amit Sharma', phone: '9876543001', color: PALETTE[0] });
  const f2 = await addDoc(collection(db, 'friends'), { userId, name: 'Priya Patel',  phone: '9876543002', color: PALETTE[2] });

  const a1 = await addDoc(collection(db, 'accounts'), { userId, name: 'HDFC Credit Card', type: 'credit_card',   color: PALETTE[1], limit: 100000 });
  const a2 = await addDoc(collection(db, 'accounts'), { userId, name: 'SBI Savings',       type: 'bank_account', color: PALETTE[3], balance: 50000 });

  const txns = [
    { userId, friendId: f1.id, accountId: a1.id, type: 'expense', amount: 3200,  date: '2026-01-15', note: 'Dinner at Mainland China' },
    { userId, friendId: f1.id, accountId: a2.id, type: 'expense', amount: 1500,  date: '2026-02-10', note: 'Movie tickets' },
    { userId, friendId: f1.id, accountId: a1.id, type: 'payment', amount: 2000,  date: '2026-03-01', note: 'Partial repayment' },
    { userId, friendId: f2.id, accountId: a1.id, type: 'expense', amount: 5800,  date: '2026-01-22', note: 'Flight tickets booking' },
    { userId, friendId: f2.id, accountId: a2.id, type: 'expense', amount: 2200,  date: '2026-02-18', note: 'Hotel split' },
    { userId, friendId: f2.id, accountId: a1.id, type: 'payment', amount: 5800,  date: '2026-03-05', note: 'Full payment received' },
  ];
  for (const t of txns) await addDoc(collection(db, 'transactions'), t);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [phone, setPhone]   = useState('');
  const [pass,  setPass]    = useState('');
  const [showP, setShowP]   = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [regMode, setRegMode] = useState(false);
  const [name, setName] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!phone || !pass) { setError('Please fill all fields.'); return; }
    setLoading(true); setError('');
    try {
      if (regMode) {
        const q = query(collection(db, 'users'), where('phone', '==', phone));
        const existing = await getDocs(q);
        if (!existing.empty) { setError('Phone number already registered.'); setLoading(false); return; }
        const ref = await addDoc(collection(db, 'users'), { name: name || 'User', phone, password: pass });
        await seedIfEmpty(ref.id);
        onLogin({ id: ref.id, name: name || 'User', phone });
      } else {
        const q = query(collection(db, 'users'), where('phone', '==', phone));
        const snap = await getDocs(q);
        if (snap.empty) { setError('Phone number not found. Please register.'); setLoading(false); return; }
        const u = snap.docs[0];
        if (u.data().password !== pass) { setError('Incorrect password.'); setLoading(false); return; }
        onLogin({ id: u.id, ...u.data() });
      }
    } catch (err) { setError('Connection error. Check Firebase config.'); console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-blob" style={{ width: 400, height: 400, background: '#0d7870', top: -100, right: -100 }} />
        <div className="login-blob" style={{ width: 300, height: 300, background: '#0891b2', bottom: -80, left: -80 }} />
      </div>
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">💸</div>
          <div>
            <div className="login-logo-text">FinTrack</div>
            <div className="login-logo-sub">Split & Track Money</div>
          </div>
        </div>
        <div className="login-title">{regMode ? 'Create Account' : 'Welcome back'}</div>
        <div className="login-sub">{regMode ? 'Start tracking your splits' : 'Sign in to your tracker'}</div>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={submit}>
          {regMode && (
            <div className="form-row" style={{ marginBottom: 13 }}>
              <div className="field">
                <label className="field-label">Your Name</label>
                <input className="field-input" placeholder="e.g. Rahul Verma" value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>
          )}
          <div className="form-row" style={{ marginBottom: 13 }}>
            <div className="field">
              <label className="field-label">Phone Number</label>
              <input className="field-input" type="tel" placeholder="10-digit number"
                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} />
            </div>
          </div>
          <div className="form-row" style={{ marginBottom: 22 }}>
            <div className="field">
              <label className="field-label">Password</label>
              <div className="input-wrap">
                <input className="field-input" type={showP ? 'text' : 'password'} placeholder="Enter password"
                  value={pass} onChange={e => setPass(e.target.value)} />
                <button type="button" className="eye-btn" onClick={() => setShowP(v => !v)}>
                  {showP ? <IcoEyeOff /> : <IcoEye />}
                </button>
              </div>
            </div>
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ height: 48, fontSize: 15 }}>
            {loading ? 'Please wait…' : regMode ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: 'var(--ink3)', fontWeight: 500 }}>
          {regMode ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => { setRegMode(v => !v); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--t)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--fb)', fontSize: 13 }}>
            {regMode ? 'Sign In' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOM CHART TOOLTIP ─────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0e1f1c', color: 'white', padding: '10px 15px', borderRadius: 11, fontSize: 13 }}>
      <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 5 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ fontWeight: 700, color: p.color || 'white' }}>{p.name}: {fmt(p.value)}</div>)}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN APP SHELL ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AppShell({ user, onLogout }) {
  const [tab, setTab]           = useState('dashboard');
  const [friends, setFriends]   = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTxns] = useState([]);
  const [showTxnForm, setShowTxnForm] = useState(false);
  const [showToast, toastEl]    = useToast();

  useEffect(() => {
    const qF = query(collection(db, 'friends'),     where('userId', '==', user.id));
    const qA = query(collection(db, 'accounts'),    where('userId', '==', user.id));
    const qT = query(collection(db, 'transactions'),where('userId', '==', user.id));
    const u1 = onSnapshot(qF, s => setFriends(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(qA, s => setAccounts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(qT, s => setTxns(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); u3(); };
  }, [user.id]);

  const navItems = [
    { id: 'dashboard',    label: 'Home',      icon: '🏠' },
    { id: 'transactions', label: 'Activity',  icon: '💳' },
    { id: 'friends',      label: 'Friends',   icon: '👥' },
    { id: 'accounts',     label: 'Accounts',  icon: '🏦' },
    { id: 'statement',    label: 'Statement', icon: '📋' },
    { id: 'insights',     label: 'Insights',  icon: '📊' },
  ];

  return (
    <div className="shell">
      {toastEl}
      <div className="topbar">
        <div className="topbar-brand">
          <div className="brand-icon">💸</div>
          <div className="brand-name">FinTrack</div>
        </div>
        <div className="topbar-right">
          <div className="user-chip">
            <div className="user-avatar">{initials(user.name)}</div>
            <span className="user-name">{user.name.split(' ')[0]}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout} style={{ fontSize: 12, padding: '6px 12px' }}>Sign Out</button>
        </div>
      </div>

      <div className="main">
        {tab === 'dashboard'    && <Dashboard    user={user} friends={friends} accounts={accounts} transactions={transactions} setTab={setTab} />}
        {tab === 'transactions' && <Transactions user={user} friends={friends} accounts={accounts} transactions={transactions} showToast={showToast} />}
        {tab === 'friends'      && <Friends      user={user} friends={friends} accounts={accounts} transactions={transactions} showToast={showToast} />}
        {tab === 'accounts'     && <Accounts     user={user} accounts={accounts} transactions={transactions} friends={friends} showToast={showToast} />}
        {tab === 'statement'    && <AccountStatement accounts={accounts} transactions={transactions} friends={friends} />}
        {tab === 'insights'     && <Insights     friends={friends} accounts={accounts} transactions={transactions} />}
      </div>

      <button className="fab" onClick={() => setShowTxnForm(true)} title="Add transaction">＋</button>

      <nav className="bottom-nav">
        {navItems.map(item => (
          <button key={item.id} className={`bnav-item ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
            <div className="bnav-icon">{item.icon}</div>
            <span className="bnav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {showTxnForm && (
        <TxnModal
          userId={user.id} friends={friends} accounts={accounts} existing={null}
          onClose={() => setShowTxnForm(false)}
          onSaved={(msg) => { setShowTxnForm(false); showToast(msg); }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DASHBOARD ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ user, friends, accounts, transactions, setTab }) {
  const totalGiven    = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const totalPersonal = transactions.filter(t => t.type === 'personal').reduce((s, t) => s + Number(t.amount), 0);
  const totalReceived = transactions.filter(t => t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
  const totalPending  = totalGiven - totalReceived;

  const friendMap  = Object.fromEntries(friends.map(f => [f.id, f]));
  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a]));

  const topOwing = friends.map(f => ({
    ...f,
    balance: transactions.filter(t=>t.friendId===f.id&&t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
           - transactions.filter(t=>t.friendId===f.id&&t.type==='payment').reduce((s,t)=>s+Number(t.amount),0)
  })).filter(f => f.balance > 0).sort((a,b) => b.balance - a.balance);

  const recent = [...transactions].sort((a, b) => (b.date||'').localeCompare(a.date||'')).slice(0, 5);

  return (
    <div>
      {/* Hero balance card */}
      <div className="hero-card">
        <div className="hero-greeting">Good day,</div>
        <div className="hero-name">{user.name.split(' ')[0]} 👋</div>
        <div className="hero-label">Total Pending from Friends</div>
        <div className="hero-value">{fmt(totalPending > 0 ? totalPending : 0)}</div>
        <div className="hero-row">
          <div className="hero-mini">
            <div className="hero-mini-label">💸 Given</div>
            <div className="hero-mini-value">{fmt(totalGiven)}</div>
          </div>
          <div className="hero-mini">
            <div className="hero-mini-label">💰 Received</div>
            <div className="hero-mini-value">{fmt(totalReceived)}</div>
          </div>
          <div className="hero-mini">
            <div className="hero-mini-label">🧾 Personal</div>
            <div className="hero-mini-value">{fmt(totalPersonal)}</div>
          </div>
        </div>
      </div>

      {/* Account status pills */}
      {accounts.some(a => a.limit || a.balance != null) && (
        <div style={{ marginBottom: 20 }}>
          <div className="sec-title">
            Accounts
            <button className="sec-more" onClick={() => setTab('accounts')}>View all →</button>
          </div>
          <div style={{ display: 'flex', gap: 11, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {accounts.map(a => {
              const spent = transactions.filter(t => t.accountId === a.id && t.type === 'expense').reduce((s,t)=>s+Number(t.amount),0);
              const recv  = transactions.filter(t => t.accountId === a.id && t.type === 'payment').reduce((s,t)=>s+Number(t.amount),0);
              const net   = spent - recv;
              const isCC  = a.type === 'credit_card';
              const limit = isCC ? a.limit : a.balance;
              const pct   = limit ? Math.min(100, (net / limit) * 100) : 0;
              const avail = limit ? limit - net : null;
              const barClass = pct >= 90 ? 'danger' : pct >= 70 ? 'warn' : isCC ? 'cc' : 'bank';
              return (
                <div key={a.id} style={{ background: 'var(--card)', borderRadius: 15, padding: '15px 17px', minWidth: 175, flex: '0 0 auto', border: '1px solid var(--border)', boxShadow: 'var(--s1)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: isCC ? 'linear-gradient(90deg, #075c55, #1aac9c)' : 'linear-gradient(90deg, #166534, #22c55e)' }} />
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: isCC ? 'var(--t)' : 'var(--green)', marginBottom: 4, marginTop: 7 }}>{isCC ? '💳 Credit' : '🏦 Savings'}</div>
                  <div style={{ fontFamily: 'var(--fh)', fontSize: 13, fontWeight: 900, color: 'var(--ink)', marginBottom: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                  {limit ? (
                    <>
                      <div className="limit-bar-track" style={{ marginBottom: 7 }}>
                        <div className={`limit-bar-fill ${barClass}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ink3)', fontWeight: 500 }}>
                        <span>{Math.round(pct)}% used</span>
                        <span style={{ fontWeight: 700, color: avail < 0 ? 'var(--red)' : 'var(--green)' }}>{fmt(Math.max(0, avail))} free</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontFamily: 'var(--fh)', fontSize: 18, fontWeight: 900, color: 'var(--ink)' }}>{fmt(net)} <span style={{ fontSize: 11, color: 'var(--ink3)', fontFamily: 'var(--fb)', fontWeight: 500 }}>spent</span></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Who owes you */}
      {topOwing.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="sec-title">
            Who Owes You
            <button className="sec-more" onClick={() => setTab('friends')}>View all →</button>
          </div>
          <div className="activity-card">
            {topOwing.slice(0, 4).map(f => (
              <div key={f.id} className="activity-row">
                <div className="activity-ico" style={{ background: f.color ? f.color + '22' : 'var(--tbg)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: f.color || colorFor(f.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: 'white', fontFamily: 'var(--fh)' }}>
                    {initials(f.name)}
                  </div>
                </div>
                <div className="activity-desc">
                  <div className="activity-title">{f.name}</div>
                  <div className="activity-sub">Pending repayment</div>
                </div>
                <div className="activity-amt" style={{ color: 'var(--red)' }}>{fmt(f.balance)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div>
        <div className="sec-title">
          Recent Activity
          <button className="sec-more" onClick={() => setTab('transactions')}>View all →</button>
        </div>
        {recent.length === 0 ? (
          <div className="activity-card"><div className="empty" style={{ padding: '34px 20px' }}><div className="empty-icon">💳</div><div className="empty-text">No transactions yet</div><div className="empty-sub">Tap + to add your first one</div></div></div>
        ) : (
          <div className="activity-card">
            {recent.map(t => {
              const f = friendMap[t.friendId];
              const a = accountMap[t.accountId];
              const isPersonal = t.type === 'personal';
              const isPayment  = t.type === 'payment';
              return (
                <div key={t.id} className="activity-row">
                  <div className="activity-ico" style={{ background: isPersonal ? 'var(--amberbg)' : isPayment ? 'var(--greenbg)' : 'var(--redbg)' }}>
                    <span style={{ fontSize: 20 }}>{isPersonal ? '🧾' : isPayment ? '💰' : '💸'}</span>
                  </div>
                  <div className="activity-desc">
                    <div className="activity-title">{t.note || (isPersonal ? 'Personal expense' : isPayment ? 'Payment received' : 'Expense')}</div>
                    <div className="activity-sub">
                      {isPersonal ? '🧾 Self' : f?.name || '—'} · {a?.name || '—'} · {fmtDate(t.date)}
                    </div>
                  </div>
                  <div className="activity-amt" style={{ color: isPayment ? 'var(--green)' : isPersonal ? 'var(--amber)' : 'var(--red)' }}>
                    {isPayment ? '+' : '-'}{fmt(t.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Transactions({ user, friends, accounts, transactions, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [editTxn, setEditTxn]   = useState(null);
  const [filterFriend, setFF]   = useState('all');
  const [filterAccount, setFA]  = useState('all');
  const [filterType, setFT]     = useState('all');
  const [filterFrom, setFrom]   = useState('');
  const [filterTo, setTo]       = useState('');

  const friendMap  = Object.fromEntries(friends.map(f => [f.id, f]));
  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a]));

  let filtered = [...transactions].sort((a, b) => b.date?.localeCompare(a.date));
  if (filterFriend  !== 'all') filtered = filtered.filter(t => t.friendId  === filterFriend);
  if (filterAccount !== 'all') filtered = filtered.filter(t => t.accountId === filterAccount);
  if (filterType    !== 'all') filtered = filtered.filter(t => t.type      === filterType);
  if (filterFrom)              filtered = filtered.filter(t => t.date >= filterFrom);
  if (filterTo)                filtered = filtered.filter(t => t.date <= filterTo);

  const clearFilters = () => { setFF('all'); setFA('all'); setFT('all'); setFrom(''); setTo(''); };
  const hasFilter = filterFriend !== 'all' || filterAccount !== 'all' || filterType !== 'all' || filterFrom || filterTo;

  const deleteTxn = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await deleteDoc(doc(db, 'transactions', id)); showToast('Transaction deleted'); }
    catch { showToast('Delete failed', 'error'); }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Transactions</div>
          <div className="page-sub">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTxn(null); setShowForm(true); }}>
          <IcoPlus /> Add
        </button>
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={filterType} onChange={e => setFT(e.target.value)}>
          <option value="all">All Types</option>
          <option value="expense">Friend Expenses</option>
          <option value="payment">Payments Received</option>
          <option value="personal">Personal Expenses</option>
        </select>
        <select className="filter-select" value={filterFriend} onChange={e => setFF(e.target.value)}>
          <option value="all">All Friends</option>
          {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select className="filter-select" value={filterAccount} onChange={e => setFA(e.target.value)}>
          <option value="all">All Accounts</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input className="filter-select filter-date" type="date" value={filterFrom} onChange={e => setFrom(e.target.value)} title="From date" />
        <input className="filter-select filter-date" type="date" value={filterTo}   onChange={e => setTo(e.target.value)}   title="To date" />
        {hasFilter && <button className="filter-clear" onClick={clearFilters}>✕ Clear</button>}
      </div>

      {filtered.length === 0 ? (
        <div className="table-card"><div className="empty"><div className="empty-icon">💳</div><div className="empty-text">No transactions found</div><div className="empty-sub">Try adjusting filters</div></div></div>
      ) : (
        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Date</th><th>Type</th><th>Friend</th><th>Account</th><th>Amount</th><th>Note</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const f = friendMap[t.friendId];
                  const a = accountMap[t.accountId];
                  return (
                    <tr key={t.id}>
                      <td className="td-muted">{fmtDate(t.date)}</td>
                      <td>
                        {t.type === 'personal' ? <span className="txn-personal">Personal</span>
                         : t.type === 'expense' ? <span className="txn-expense">Friend Exp</span>
                         : <span className="txn-payment">Payment In</span>}
                      </td>
                      <td>
                        {t.type === 'personal' ? (
                          <span style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 600 }}>🧾 Self</span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {f && <div className="friend-avatar" style={{ width: 28, height: 28, fontSize: 11, background: f.color || colorFor(f.name) }}>{initials(f.name)}</div>}
                            <span className="td-bold">{f?.name || '—'}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14 }}>{a?.type === 'credit_card' ? '💳' : '🏦'}</span>
                          <span className="td-muted">{a?.name || '—'}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: t.type === 'payment' ? 'var(--green)' : t.type === 'personal' ? 'var(--amber)' : 'var(--red)' }}>
                        {t.type === 'payment' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td className="td-muted" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.note || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setEditTxn(t); setShowForm(true); }}><IcoEdit /></button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteTxn(t.id)}><IcoTrash /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <TxnModal
          userId={user.id} friends={friends} accounts={accounts}
          existing={editTxn}
          onClose={() => { setShowForm(false); setEditTxn(null); }}
          onSaved={(msg) => { setShowForm(false); setEditTxn(null); showToast(msg); }}
        />
      )}
    </div>
  );
}

// ─── TRANSACTION FORM MODAL ───────────────────────────────────────────────────
function TxnModal({ userId, friends, accounts, existing, onClose, onSaved }) {
  const [form, setForm] = useState({
    type:      existing?.type      || 'expense',
    category:  existing?.category  || 'friend',
    friendId:  existing?.friendId  || '',
    accountId: existing?.accountId || '',
    amount:    existing?.amount    ? String(existing.amount) : '',
    date:      existing?.date      || today(),
    note:      existing?.note      || '',
  });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const setCategory = (cat) => setForm(f => ({
    ...f, category: cat,
    type: cat === 'personal' ? 'personal' : f.type === 'personal' ? 'expense' : f.type,
    friendId: cat === 'personal' ? '' : f.friendId,
  }));

  const submit = async (e) => {
    e.preventDefault();
    const isPersonal = form.category === 'personal';
    if (!form.accountId || !form.amount || !form.date) { alert('Fill all required fields'); return; }
    if (!isPersonal && form.type !== 'personal' && !form.friendId) { alert('Select a friend'); return; }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { alert('Enter a valid amount'); return; }
    setSaving(true);
    try {
      const data = {
        userId,
        type:      isPersonal ? 'personal' : form.type,
        category:  isPersonal ? 'personal' : 'friend',
        friendId:  isPersonal ? null : form.friendId,
        accountId: form.accountId,
        amount:    amt,
        date:      form.date,
        note:      form.note,
      };
      if (existing) { await updateDoc(doc(db, 'transactions', existing.id), data); onSaved('Transaction updated ✓'); }
      else          { await addDoc(collection(db, 'transactions'), data);           onSaved('Transaction added ✓'); }
    } catch (err) { alert('Save failed'); console.error(err); }
    finally { setSaving(false); }
  };

  const isPersonal = form.category === 'personal';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-body">
          <div className="modal-title">{existing ? 'Edit Transaction' : 'Add Transaction'}</div>
          <div className="modal-sub">Record a spend for a friend or yourself</div>
          <form onSubmit={submit}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 15 }}>
              {[['friend','👥 For a Friend'],['personal','🧾 Personal']].map(([cat, label]) => (
                <button key={cat} type="button" onClick={() => setCategory(cat)}
                  className="btn btn-sm"
                  style={{ flex: 1, fontSize: 12,
                    background: form.category === cat ? 'var(--t)' : 'var(--bg2)',
                    color: form.category === cat ? 'white' : 'var(--ink3)',
                    border: '1.5px solid ' + (form.category === cat ? 'transparent' : 'var(--border)') }}>
                  {label}
                </button>
              ))}
            </div>

            {!isPersonal && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 15 }}>
                {['expense','payment'].map(tp => (
                  <button key={tp} type="button" onClick={() => setForm(f => ({ ...f, type: tp }))}
                    className="btn btn-sm"
                    style={{ flex: 1,
                      background: form.type === tp ? (tp === 'expense' ? 'var(--red)' : 'var(--green)') : 'var(--bg2)',
                      color: form.type === tp ? 'white' : 'var(--ink3)',
                      border: '1.5px solid ' + (form.type === tp ? 'transparent' : 'var(--border)') }}>
                    {tp === 'expense' ? '💸 I Paid For Them' : '💰 They Paid Me Back'}
                  </button>
                ))}
              </div>
            )}

            <div className="form-row g2">
              {!isPersonal && (
                <div className="field">
                  <label className="field-label">Friend *</label>
                  <select className="field-input" value={form.friendId} onChange={set('friendId')}>
                    <option value="">Select friend…</option>
                    {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              )}
              <div className="field">
                <label className="field-label">Account *</label>
                <select className="field-input" value={form.accountId} onChange={set('accountId')}>
                  <option value="">Select account…</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.type === 'credit_card' ? '💳' : '🏦'} {a.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row g2">
              <div className="field">
                <label className="field-label">Amount (₹) *</label>
                <input className="field-input" type="number" placeholder="0" min="1" value={form.amount} onChange={set('amount')} />
              </div>
              <div className="field">
                <label className="field-label">Date *</label>
                <input className="field-input" type="date" value={form.date} onChange={set('date')} />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: 0 }}>
              <div className="field">
                <label className="field-label">{isPersonal ? 'Category / Note' : 'Note (optional)'}</label>
                <input className="field-input" placeholder={isPersonal ? 'e.g. Groceries, Netflix…' : 'e.g. Dinner at restaurant'} value={form.note} onChange={set('note')} />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 2 }}>{saving ? 'Saving…' : existing ? 'Update' : 'Add Transaction'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── FRIENDS ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Friends({ user, friends, accounts, transactions, showToast }) {
  const [showForm, setShowForm]         = useState(false);
  const [editFriend, setEditFriend]     = useState(null);
  const [form, setForm]                 = useState({ name: '', phone: '' });
  const [saving, setSaving]             = useState(false);
  const [expandedFriend, setExpanded]   = useState(null); // friend id whose history is open

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a]));

  const openAdd  = () => { setForm({ name: '', phone: '' }); setEditFriend(null); setShowForm(true); };
  const openEdit = (f) => { setForm({ name: f.name, phone: f.phone || '' }); setEditFriend(f); setShowForm(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) { alert('Enter a name'); return; }
    setSaving(true);
    try {
      const data = { userId: user.id, name: form.name, phone: form.phone, color: colorFor(form.name) };
      if (editFriend) { await updateDoc(doc(db, 'friends', editFriend.id), data); showToast('Friend updated ✓'); }
      else            { await addDoc(collection(db, 'friends'), data);             showToast('Friend added ✓'); }
      setShowForm(false);
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteFriend = async (f) => {
    if (!window.confirm(`Delete ${f.name}? Their transactions will remain.`)) return;
    try { await deleteDoc(doc(db, 'friends', f.id)); showToast(`${f.name} removed`); }
    catch { showToast('Delete failed', 'error'); }
  };

  const withStats = friends.map(f => {
    const given    = transactions.filter(t => t.friendId === f.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const received = transactions.filter(t => t.friendId === f.id && t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
    const history  = transactions
      .filter(t => t.friendId === f.id)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return { ...f, given, received, balance: given - received, history };
  });

  return (
    <div>
      <div className="page-head">
        <div><div className="page-title">Friends</div><div className="page-sub">{friends.length} friend{friends.length !== 1 ? 's' : ''}</div></div>
        <button className="btn btn-primary" onClick={openAdd}><IcoPlus /> Add Friend</button>
      </div>

      {showForm && (
        <div className="form-section" style={{ marginBottom: 24 }}>
          <div className="form-title">{editFriend ? 'Edit Friend' : 'Add Friend'}</div>
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
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g,'').slice(0,10) }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editFriend ? 'Update' : 'Add Friend'}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {withStats.length === 0 ? (
        <div className="table-card"><div className="empty"><div className="empty-icon">👥</div><div className="empty-text">No friends yet</div><div className="empty-sub">Add your first friend to start tracking</div></div></div>
      ) : (
        <div className="friend-grid">
          {withStats.map(f => {
            const isOpen = expandedFriend === f.id;
            return (
              <div key={f.id} className="friend-card">
                {/* Card top area */}
                <div className="friend-card-top">
                  <div className="friend-head">
                    <div className="friend-avatar" style={{ width: 50, height: 50, background: f.color || colorFor(f.name) }}>{initials(f.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div className="friend-name">{f.name}</div>
                      {f.phone && <div className="friend-phone">📞 {f.phone}</div>}
                    </div>
                    {/* Balance pill */}
                    <span className={`badge ${f.balance > 0 ? 'badge-red' : f.balance < 0 ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 12 }}>
                      {f.balance > 0 ? `Owes ${fmt(f.balance)}` : f.balance < 0 ? `You owe ${fmt(Math.abs(f.balance))}` : '✓ Settled'}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="friend-stats">
                    <div className="fstat">
                      <div className="fstat-label">💸 Given</div>
                      <div className="fstat-value red">{fmt(f.given)}</div>
                    </div>
                    <div className="fstat">
                      <div className="fstat-label">💰 Received</div>
                      <div className="fstat-value green">{fmt(f.received)}</div>
                    </div>
                    <div className="fstat" style={{ background: f.balance > 0 ? 'var(--redbg)' : f.balance < 0 ? 'var(--greenbg)' : 'var(--bg)' }}>
                      <div className="fstat-label">📊 Txns</div>
                      <div className="fstat-value teal">{f.history.length}</div>
                    </div>
                  </div>
                </div>

                {/* Actions bar */}
                <div className="friend-actions">
                  <button
                    className={`friend-action-btn history`}
                    onClick={() => setExpanded(isOpen ? null : f.id)}
                  >
                    <IcoHistory /> {isOpen ? 'Hide History' : `View History (${f.history.length})`}
                    {isOpen ? <IcoChevUp /> : <IcoChevDown />}
                  </button>
                  <button className="friend-action-btn" onClick={() => openEdit(f)}><IcoEdit /> Edit</button>
                  <button className="friend-action-btn" style={{ color: 'var(--red)' }} onClick={() => deleteFriend(f)}><IcoTrash /></button>
                </div>

                {/* ── FRIEND TRANSACTION HISTORY PANEL ── */}
                {isOpen && (
                  <div className="friend-history">
                    <div className="fhistory-header">
                      <div className="fhistory-title">
                        📅 Transaction History
                        <span className="fhistory-badge">{f.history.length} records</span>
                      </div>
                    </div>

                    {f.history.length === 0 ? (
                      <div className="fhistory-empty">No transactions with {f.name} yet.</div>
                    ) : (
                      <div className="timeline">
                        {f.history.map((t, idx) => {
                          const account = accountMap[t.accountId];
                          const isPayment  = t.type === 'payment';
                          const isExpense  = t.type === 'expense';
                          return (
                            <div key={t.id} className="timeline-item">
                              <div className={`timeline-dot ${t.type}`}>
                                {isPayment ? '💰' : '💸'}
                              </div>
                              <div className="timeline-body">
                                <div className="timeline-top">
                                  <div className="timeline-note">{t.note || (isPayment ? 'Payment received' : 'Expense paid')}</div>
                                  <div className="timeline-amt" style={{ color: isPayment ? 'var(--green)' : 'var(--red)' }}>
                                    {isPayment ? '+' : '-'}{fmt(t.amount)}
                                  </div>
                                </div>
                                <div className="timeline-meta">
                                  <span className="timeline-tag">📅 {fmtDate(t.date)}</span>
                                  {account && (
                                    <span className="timeline-tag">
                                      {account.type === 'credit_card' ? '💳' : '🏦'} {account.name}
                                    </span>
                                  )}
                                  <span className={`timeline-tag`} style={{
                                    color: isPayment ? 'var(--green)' : 'var(--red)',
                                    borderColor: isPayment ? 'var(--greenbrd)' : 'var(--redbrd)',
                                    background: isPayment ? 'var(--greenbg)' : 'var(--redbg)',
                                  }}>
                                    {isPayment ? '✓ Paid Back' : '↑ You Paid'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Summary footer */}
                    {f.history.length > 0 && (
                      <div style={{ display: 'flex', gap: 0, borderTop: '1px solid var(--border)' }}>
                        <div style={{ flex: 1, padding: '12px 16px', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Total Given</div>
                          <div style={{ fontFamily: 'var(--fh)', fontSize: 16, fontWeight: 900, color: 'var(--red)' }}>{fmt(f.given)}</div>
                        </div>
                        <div style={{ flex: 1, padding: '12px 16px', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Received Back</div>
                          <div style={{ fontFamily: 'var(--fh)', fontSize: 16, fontWeight: 900, color: 'var(--green)' }}>{fmt(f.received)}</div>
                        </div>
                        <div style={{ flex: 1, padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Net Balance</div>
                          <div style={{ fontFamily: 'var(--fh)', fontSize: 16, fontWeight: 900, color: f.balance > 0 ? 'var(--red)' : f.balance < 0 ? 'var(--green)' : 'var(--ink3)' }}>
                            {f.balance === 0 ? '✓ Settled' : fmt(Math.abs(f.balance))}
                          </div>
                        </div>
                      </div>
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
// ─── ACCOUNTS ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Accounts({ user, accounts, transactions, friends, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [editAcc, setEditAcc]   = useState(null);
  const [form, setForm] = useState({ name: '', type: 'credit_card', limit: '', balance: '' });
  const [saving, setSaving] = useState(false);
  const [expandAcc, setExpandAcc] = useState(null);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openAdd  = () => { setForm({ name: '', type: 'credit_card', limit: '', balance: '' }); setEditAcc(null); setShowForm(true); };
  const openEdit = (a) => { setForm({ name: a.name, type: a.type, limit: a.limit ? String(a.limit) : '', balance: a.balance ? String(a.balance) : '' }); setEditAcc(a); setShowForm(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) { alert('Enter a name'); return; }
    setSaving(true);
    try {
      const data = {
        userId: user.id, name: form.name, type: form.type, color: colorFor(form.name),
        limit:   form.type === 'credit_card'  && form.limit   ? parseFloat(form.limit)   : null,
        balance: form.type === 'bank_account' && form.balance ? parseFloat(form.balance) : null,
      };
      if (editAcc) { await updateDoc(doc(db, 'accounts', editAcc.id), data); showToast('Account updated ✓'); }
      else         { await addDoc(collection(db, 'accounts'), data);          showToast('Account added ✓'); }
      setShowForm(false);
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteAcc = async (a) => {
    if (!window.confirm(`Delete "${a.name}"?`)) return;
    try { await deleteDoc(doc(db, 'accounts', a.id)); showToast('Account removed'); }
    catch { showToast('Delete failed', 'error'); }
  };

  const friendMap = Object.fromEntries(friends.map(f => [f.id, f]));

  const withStats = accounts.map(a => {
    const accTxns    = transactions.filter(t => t.accountId === a.id);
    const totalSpent = accTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const totalBack  = accTxns.filter(t => t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);

    const friendBreakdown = friends.map(f => {
      const spent    = accTxns.filter(t => t.friendId === f.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
      const received = accTxns.filter(t => t.friendId === f.id && t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
      return { ...f, spent, received, balance: spent - received };
    }).filter(f => f.spent > 0 || f.received > 0);

    const netSpent   = totalSpent - totalBack;
    const available  = a.type === 'credit_card' && a.limit ? a.limit - netSpent : null;
    const usedPct    = a.type === 'credit_card' && a.limit ? Math.min(100, (netSpent / a.limit) * 100) : 0;
    const remaining  = a.type === 'bank_account' && a.balance != null ? a.balance - netSpent : null;
    const balPct     = a.type === 'bank_account' && a.balance ? Math.min(100, (netSpent / a.balance) * 100) : 0;

    return { ...a, totalSpent, totalBack, netSpent, available, usedPct, remaining, balPct, friendBreakdown, txnCount: accTxns.length };
  });

  return (
    <div>
      <div className="page-head">
        <div><div className="page-title">Accounts</div><div className="page-sub">{accounts.length} linked</div></div>
        <button className="btn btn-primary" onClick={openAdd}><IcoPlus /> Add Account</button>
      </div>

      {showForm && (
        <div className="form-section" style={{ marginBottom: 24 }}>
          <div className="form-title">{editAcc ? 'Edit Account' : 'Add Account'}</div>
          <div className="form-sub">Add a credit card or bank account you use for expenses</div>
          <form onSubmit={submit}>
            <div className="form-row g2">
              <div className="field">
                <label className="field-label">Account Name *</label>
                <input className="field-input" placeholder="e.g. HDFC Credit Card" value={form.name} onChange={set('name')} autoFocus />
              </div>
              <div className="field">
                <label className="field-label">Account Type *</label>
                <select className="field-input" value={form.type} onChange={e => { set('type')(e); setForm(f => ({ ...f, type: e.target.value, limit: '', balance: '' })); }}>
                  <option value="credit_card">💳 Credit Card</option>
                  <option value="bank_account">🏦 Bank Account</option>
                </select>
              </div>
            </div>
            {form.type === 'credit_card' && (
              <div className="form-row" style={{ marginBottom: 14 }}>
                <div className="field">
                  <label className="field-label">Credit Limit (₹)</label>
                  <input className="field-input" type="number" placeholder="e.g. 100000" min="0" value={form.limit} onChange={set('limit')} />
                  <span style={{ fontSize: 11, color: 'var(--ink4)', marginTop: 3 }}>Available credit auto-updates when you add expenses</span>
                </div>
              </div>
            )}
            {form.type === 'bank_account' && (
              <div className="form-row" style={{ marginBottom: 14 }}>
                <div className="field">
                  <label className="field-label">Current Balance (₹)</label>
                  <input className="field-input" type="number" placeholder="e.g. 50000" min="0" value={form.balance} onChange={set('balance')} />
                  <span style={{ fontSize: 11, color: 'var(--ink4)', marginTop: 3 }}>Remaining balance auto-reduces when you add expenses</span>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editAcc ? 'Update' : 'Add Account'}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {withStats.length === 0 ? (
        <div className="table-card"><div className="empty"><div className="empty-icon">🏦</div><div className="empty-text">No accounts yet</div><div className="empty-sub">Add the card or account you use for expenses</div></div></div>
      ) : (
        <div className="account-grid">
          {withStats.map(a => {
            const isCC = a.type === 'credit_card';
            return (
              <div key={a.id}>
                <div className="account-card">
                  <div className={`account-stripe ${isCC ? 'cc' : 'bank'}`} />
                  <div className="account-card-inner">
                    <div className={`account-chip ${isCC ? 'cc' : 'bank'}`}>
                      {isCC ? '💳 Credit Card' : '🏦 Savings Account'}
                    </div>
                    <div className="account-name">{a.name}</div>
                    <div className="account-sub">{a.txnCount} transaction{a.txnCount !== 1 ? 's' : ''}</div>

                    {isCC && a.limit ? (
                      <div>
                        <div className="limit-row">
                          <span>Used <strong style={{color:'var(--ink2)'}}>{fmt(a.netSpent)}</strong></span>
                          <span>{Math.round(a.usedPct)}% of {fmt(a.limit)}</span>
                        </div>
                        <div className="limit-bar-track">
                          <div className={`limit-bar-fill ${a.usedPct >= 90 ? 'danger' : a.usedPct >= 70 ? 'warn' : 'cc'}`} style={{ width: `${a.usedPct}%` }} />
                        </div>
                        <div className="limit-row" style={{ marginTop: 4 }}>
                          <span>Limit: {fmt(a.limit)}</span>
                          <span className="limit-available" style={{ color: a.available < 0 ? 'var(--red)' : 'var(--green)' }}>
                            {a.available < 0 ? `⚠️ Over by ${fmt(Math.abs(a.available))}` : `${fmt(a.available)} free`}
                          </span>
                        </div>
                      </div>
                    ) : !isCC && a.balance != null ? (
                      <div>
                        <div className="limit-row">
                          <span>Spent <strong style={{color:'var(--ink2)'}}>{fmt(a.netSpent)}</strong></span>
                          <span>{Math.round(a.balPct)}% of {fmt(a.balance)}</span>
                        </div>
                        <div className="limit-bar-track">
                          <div className={`limit-bar-fill ${a.balPct >= 90 ? 'danger' : 'bank'}`} style={{ width: `${a.balPct}%` }} />
                        </div>
                        <div className="limit-row" style={{ marginTop: 4 }}>
                          <span>Balance: {fmt(a.balance)}</span>
                          <span className="limit-available" style={{ color: a.remaining < 0 ? 'var(--red)' : 'var(--green)' }}>
                            {fmt(Math.max(0, a.remaining))} left
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="account-spent">{fmt(a.totalSpent)}</div>
                        <div className="account-spent-label">Total spent via this account</div>
                      </div>
                    )}
                  </div>
                  <div className="account-actions">
                    <button className="account-action-btn" onClick={() => setExpandAcc(expandAcc === a.id ? null : a.id)}>
                      👥 {expandAcc === a.id ? 'Hide' : 'By Friend'}
                    </button>
                    <button className="account-action-btn" onClick={() => openEdit(a)}>✏️ Edit</button>
                    <button className="account-action-btn" style={{ color: 'var(--red)' }} onClick={() => deleteAcc(a)}>🗑️ Delete</button>
                  </div>
                </div>

                {expandAcc === a.id && (
                  <div className="breakdown-panel">
                    <div style={{ padding: '13px 15px 9px', fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>
                      👥 Who Used This Account
                    </div>
                    {a.friendBreakdown.length === 0 ? (
                      <div style={{ padding: '10px 15px 15px', fontSize: 13, color: 'var(--ink3)' }}>No friend transactions via this account.</div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table className="breakdown-table">
                          <thead><tr><th>Friend</th><th>Borrowed</th><th>Paid Back</th><th>Balance</th></tr></thead>
                          <tbody>
                            {a.friendBreakdown.map(f => (
                              <tr key={f.id}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div className="friend-avatar" style={{ width: 27, height: 27, fontSize: 10, background: f.color || colorFor(f.name) }}>{initials(f.name)}</div>
                                    <span style={{ fontWeight: 700 }}>{f.name}</span>
                                  </div>
                                </td>
                                <td style={{ color: 'var(--red)', fontWeight: 700 }}>{fmt(f.spent)}</td>
                                <td style={{ color: 'var(--green)', fontWeight: 700 }}>{fmt(f.received)}</td>
                                <td><span className={`badge ${f.balance > 0 ? 'badge-red' : f.balance < 0 ? 'badge-green' : 'badge-gray'}`}>{f.balance > 0 ? `Owes ${fmt(f.balance)}` : f.balance < 0 ? `You owe ${fmt(Math.abs(f.balance))}` : '✓ Settled'}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
// ─── ACCOUNT STATEMENT ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AccountStatement({ accounts, transactions, friends }) {
  const [selAcc,   setSelAcc]   = useState(accounts[0]?.id || '');
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');

  const friendMap = Object.fromEntries(friends.map(f => [f.id, f]));
  const account   = accounts.find(a => a.id === selAcc);

  let stmtTxns = transactions.filter(t => t.accountId === selAcc);
  if (fromDate) stmtTxns = stmtTxns.filter(t => t.date >= fromDate);
  if (toDate)   stmtTxns = stmtTxns.filter(t => t.date <= toDate);
  stmtTxns = stmtTxns.sort((a, b) => b.date.localeCompare(a.date));

  const totalFriendExpense = stmtTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const totalPersonal      = stmtTxns.filter(t => t.type === 'personal').reduce((s, t) => s + Number(t.amount), 0);
  const totalReceived      = stmtTxns.filter(t => t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
  const totalDebited       = totalFriendExpense + totalPersonal;
  const netFlow            = totalReceived - totalDebited;

  const friendBreakdown = friends.map(f => {
    const spent    = stmtTxns.filter(t => t.friendId === f.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const received = stmtTxns.filter(t => t.friendId === f.id && t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
    return { ...f, spent, received, balance: spent - received };
  }).filter(f => f.spent > 0 || f.received > 0);

  const isCC = account?.type === 'credit_card';

  return (
    <div>
      <div className="page-head">
        <div><div className="page-title">Statement</div><div className="page-sub">Account-level transaction report</div></div>
      </div>

      {/* Account selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select className="filter-select" style={{ flex: 1 }} value={selAcc} onChange={e => setSelAcc(e.target.value)}>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.type === 'credit_card' ? '💳' : '🏦'} {a.name}</option>)}
        </select>
        <input className="filter-select filter-date" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} title="From date" />
        <input className="filter-select filter-date" type="date" value={toDate}   onChange={e => setToDate(e.target.value)}   title="To date" />
        {(fromDate || toDate) && <button className="filter-clear" onClick={() => { setFromDate(''); setToDate(''); }}>✕ Clear</button>}
      </div>

      {!account ? (
        <div className="table-card"><div className="empty"><div className="empty-icon">🏦</div><div className="empty-text">No accounts added</div></div></div>
      ) : (
        <>
          <div className={`stmt-header ${isCC ? 'cc' : 'bank'}`}>
            <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{isCC ? '💳 Credit Card' : '🏦 Bank Account'}</div>
            <div style={{ fontFamily: 'var(--fh)', fontSize: 22, fontWeight: 900 }}>{account.name}</div>
            {(fromDate || toDate) && (
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4, fontWeight: 500 }}>
                {fromDate ? fmtDate(fromDate) : 'All time'} → {toDate ? fmtDate(toDate) : 'Today'}
              </div>
            )}
            <div className="stmt-total-row">
              <div className="stmt-total-box">
                <div className="stmt-total-label">Total Debited</div>
                <div className="stmt-total-value">{fmt(totalDebited)}</div>
              </div>
              <div className="stmt-total-box">
                <div className="stmt-total-label">Received Back</div>
                <div className="stmt-total-value">{fmt(totalReceived)}</div>
              </div>
              <div className="stmt-total-box">
                <div className="stmt-total-label">Friend Expenses</div>
                <div className="stmt-total-value">{fmt(totalFriendExpense)}</div>
              </div>
              <div className="stmt-total-box">
                <div className="stmt-total-label">Net Flow</div>
                <div className="stmt-total-value" style={{ color: netFlow >= 0 ? '#4ade80' : '#fca5a5' }}>
                  {netFlow >= 0 ? '+' : ''}{fmt(netFlow)}
                </div>
              </div>
            </div>
          </div>

          {/* Per-friend breakdown */}
          {friendBreakdown.length > 0 && (
            <div className="table-card" style={{ marginBottom: 14 }}>
              <div style={{ padding: '14px 16px 8px', fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 15 }}>Friend Breakdown</div>
              <div style={{ overflowX: 'auto' }}>
                <table className="breakdown-table">
                  <thead><tr><th>Friend</th><th>Borrowed</th><th>Paid Back</th><th>Balance</th></tr></thead>
                  <tbody>
                    {friendBreakdown.map(f => (
                      <tr key={f.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="friend-avatar" style={{ width: 27, height: 27, fontSize: 10, background: f.color || colorFor(f.name) }}>{initials(f.name)}</div>
                            <span style={{ fontWeight: 700 }}>{f.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--red)', fontWeight: 700 }}>{fmt(f.spent)}</td>
                        <td style={{ color: 'var(--green)', fontWeight: 700 }}>{fmt(f.received)}</td>
                        <td><span className={`badge ${f.balance > 0 ? 'badge-red' : f.balance < 0 ? 'badge-green' : 'badge-gray'}`}>{f.balance > 0 ? `Owes ${fmt(f.balance)}` : f.balance < 0 ? `You owe ${fmt(Math.abs(f.balance))}` : '✓ Settled'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transaction list */}
          {stmtTxns.length === 0 ? (
            <div className="table-card"><div className="empty"><div className="empty-icon">📋</div><div className="empty-text">No transactions in this period</div></div></div>
          ) : (
            <div className="table-card">
              <div style={{ padding: '14px 16px 8px', fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 15 }}>All Transactions</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Type</th><th>Friend / Note</th><th>Amount</th><th>Note</th></tr>
                  </thead>
                  <tbody>
                    {stmtTxns.map(t => {
                      const f = friendMap[t.friendId];
                      return (
                        <tr key={t.id}>
                          <td className="td-muted">{fmtDate(t.date)}</td>
                          <td>
                            {t.type === 'personal' ? <span className="txn-personal">Personal</span>
                             : t.type === 'expense' ? <span className="txn-expense">Friend Exp</span>
                             : <span className="txn-payment">Payment In</span>}
                          </td>
                          <td>
                            {t.type === 'personal' ? (
                              <span style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 600 }}>🧾 Self</span>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {f && <div className="friend-avatar" style={{ width: 25, height: 25, fontSize: 10, background: f.color || colorFor(f.name) }}>{initials(f.name)}</div>}
                                <span className="td-bold" style={{ fontSize: 13 }}>{f?.name || '—'}</span>
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: 700, color: t.type === 'payment' ? 'var(--green)' : t.type === 'personal' ? 'var(--amber)' : 'var(--red)' }}>
                            {t.type === 'payment' ? '+' : '-'}{fmt(t.amount)}
                          </td>
                          <td className="td-muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.note || '—'}</td>
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
// ─── INSIGHTS ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Insights({ friends, accounts, transactions }) {
  const friendMap  = Object.fromEntries(friends.map(f => [f.id, f.name]));
  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a.name]));

  const friendChart = friends.map(f => ({
    name:     f.name.split(' ')[0],
    Given:    transactions.filter(t => t.friendId === f.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    Received: transactions.filter(t => t.friendId === f.id && t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0),
  })).filter(d => d.Given > 0 || d.Received > 0);

  const accountChart = accounts.map(a => ({
    name:  a.name,
    value: transactions.filter(t => t.accountId === a.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
  })).filter(d => d.value > 0);

  const monthlyMap = {};
  transactions.forEach(t => {
    if (!t.date) return;
    const key = t.date.slice(0, 7);
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, Given: 0, Received: 0 };
    if (t.type === 'expense') monthlyMap[key].Given    += Number(t.amount);
    if (t.type === 'payment') monthlyMap[key].Received += Number(t.amount);
  });
  const monthlyData = Object.values(monthlyMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(d => ({ ...d, month: new Date(d.month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) }));

  const COLORS = ['#0d7870','#2563eb','#7c3aed','#db2777','#ea580c','#16a34a'];
  const axisStyle = { fill: '#6b8e87', fontSize: 11, fontFamily: 'Figtree' };
  const fmtY = v => '₹' + (v >= 1e5 ? (v/1e5).toFixed(1)+'L' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v);

  const topOwing = [...friends].map(f => ({
    name: f.name,
    balance: transactions.filter(t => t.friendId === f.id && t.type === 'expense').reduce((s,t)=>s+Number(t.amount),0)
           - transactions.filter(t => t.friendId === f.id && t.type === 'payment').reduce((s,t)=>s+Number(t.amount),0)
  })).sort((a,b) => b.balance - a.balance);

  const topAcc = [...accounts].map(a => ({
    name: a.name, type: a.type,
    spent: transactions.filter(t => t.accountId === a.id && t.type === 'expense').reduce((s,t)=>s+Number(t.amount),0)
  })).sort((a,b) => b.spent - a.spent);

  return (
    <div>
      <div className="page-head">
        <div><div className="page-title">Insights</div><div className="page-sub">Visualise your splits and spending patterns</div></div>
      </div>

      {transactions.length === 0 ? (
        <div className="table-card"><div className="empty"><div className="empty-icon">🔍</div><div className="empty-text">No data yet</div><div className="empty-sub">Add transactions to see insights</div></div></div>
      ) : (
        <div>
          {monthlyData.length > 0 && (
            <div className="chart-card">
              <div className="chart-title">Monthly Trend — Given vs Received</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 10, left: 4, bottom: 0 }}>
                  <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={fmtY} tick={axisStyle} axisLine={false} tickLine={false} width={52} />
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#6b8e87' }} />
                  <Bar dataKey="Given"    fill="#e53e3e" radius={[5,5,0,0]} />
                  <Bar dataKey="Received" fill="#16a34a" radius={[5,5,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            {friendChart.length > 0 && (
              <div className="chart-card">
                <div className="chart-title">Per Friend — Given vs Received</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={friendChart} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmtY} tick={axisStyle} axisLine={false} tickLine={false} width={52} />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Given"    fill="#e53e3e" radius={[4,4,0,0]} />
                    <Bar dataKey="Received" fill="#16a34a" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {accountChart.length > 0 && (
              <div className="chart-card">
                <div className="chart-title">Spending by Account</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={accountChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                      label={({ name, percent }) => `${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {accountChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => [fmt(v), 'Spent']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, marginTop: 4 }}>
            <div className="table-card">
              <div style={{ padding: '15px 17px 9px', fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 15 }}>Balance Summary</div>
              <div style={{ padding: '0 0 8px' }}>
                {topOwing.map(f => (
                  <div key={f.name} className="insight-row" style={{ padding: '10px 17px' }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{f.name}</span>
                    <span className={`badge ${f.balance > 0 ? 'badge-red' : f.balance < 0 ? 'badge-green' : 'badge-gray'}`}>
                      {f.balance > 0 ? `Owes ${fmt(f.balance)}` : f.balance < 0 ? `You owe ${fmt(Math.abs(f.balance))}` : 'Settled ✓'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="table-card">
              <div style={{ padding: '15px 17px 9px', fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 15 }}>Account Usage</div>
              <div style={{ padding: '0 0 8px' }}>
                {topAcc.map(a => (
                  <div key={a.name} className="insight-row" style={{ padding: '10px 17px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{a.type === 'credit_card' ? '💳' : '🏦'}</span>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</span>
                    </div>
                    <span className="badge badge-teal">{fmt(a.spent)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ROOT APP ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser]       = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => { injectCSS(); setBooting(false); }, []);

  const handleLogin  = useCallback(u => setUser(u), []);
  const handleLogout = useCallback(() => setUser(null), []);

  if (booting) return (
    <div className="ft-app" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div className="loader"><div className="spinner" /><span>Loading FinTrack…</span></div>
    </div>
  );

  return (
    <div className="ft-app">
      {!user && <LoginPage onLogin={handleLogin} />}
      {user   && <AppShell user={user} onLogout={handleLogout} />}
    </div>
  );
}
