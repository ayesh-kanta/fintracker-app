// ─────────────────────────────────────────────────────────────────────────────
//  FinTrack — Personal Finance & Friend Split Tracker
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
// ─── CSS ─────────────────────────────────────────────────────────────────────
// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
/* ════════════════════════════════════
   DESIGN SYSTEM
   Rule: Gradient only on hero, FAB, brand.
   Everything else = clean white + precise accents.
   ════════════════════════════════════ */
:root {
  /* Background — very slightly warm white, not blue */
  --bg:        #f7f7f9;
  --bg2:       #eeeff4;
  --card:      #ffffff;
  --border:    #eaeaee;
  --border2:   #d8d8e0;

  /* Text */
  --ink:       #141416;
  --ink2:      #3a3a4a;
  --ink3:      #868692;
  --ink4:      #b8b8c4;

  /* Brand — Violet. Used sparingly. */
  --v:         #7c5cfc;
  --v-light:   #9d82fd;
  --v-dark:    #5a3dd8;
  --vbg:       #f0ecff;
  --vbrd:      rgba(124,92,252,0.22);

  /* Semantic */
  --green:     #12b76a;
  --greenbg:   #edfaf3;
  --greenbrd:  #a6f0c6;
  --red:       #f04438;
  --redbg:     #fef3f2;
  --redbrd:    #fecdca;
  --amber:     #f79009;
  --amberbg:   #fffaeb;
  --amberbrd:  #fedf89;

  /* Layout */
  --nav-h:     64px;
  --top-h:     58px;
  --r:         16px;
  --r-sm:      10px;
  --r-xs:      7px;

  /* Shadows — subtle, layered */
  --s1: 0 1px 2px rgba(20,20,22,0.04);
  --s2: 0 1px 2px rgba(20,20,22,0.04), 0 4px 12px rgba(20,20,22,0.06);
  --s3: 0 4px 6px rgba(20,20,22,0.04), 0 12px 28px rgba(20,20,22,0.1);

  /* Gradient — only 2 official ones */
  --g-brand: linear-gradient(135deg, #7c5cfc 0%, #b48cfe 100%);
  --g-hero:  linear-gradient(150deg, #2e1a6e 0%, #5535c4 50%, #7c5cfc 100%);

  --fh: 'Sora', system-ui, sans-serif;
  --fb: 'Plus Jakarta Sans', system-ui, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  font-family: var(--fb);
  color: var(--ink);
  -webkit-tap-highlight-color: transparent;
}
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

/* ══ SHELL ══ */
.ft-app { min-height: 100vh; }
.shell  { display: flex; flex-direction: column; min-height: 100vh; }

/* ══ TOP BAR — clean white frosted glass ══ */
.topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: var(--top-h);
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center;
  justify-content: space-between; padding: 0 16px;
}
.topbar-brand { display: flex; align-items: center; gap: 10px; }
.brand-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: var(--g-brand);
  display: flex; align-items: center; justify-content: center;
  font-size: 17px;
  box-shadow: 0 2px 8px rgba(124,92,252,0.4);
}
.brand-name {
  font-family: var(--fh); font-size: 17px; font-weight: 800;
  color: var(--ink); letter-spacing: -0.4px;
}
.topbar-right { display: flex; align-items: center; gap: 8px; }
.user-chip {
  display: flex; align-items: center; gap: 7px;
  background: var(--vbg); border: 1px solid var(--vbrd);
  border-radius: 24px; padding: 4px 12px 4px 5px;
}
.user-avatar {
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--g-brand);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 800; color: white;
}
.user-name { font-size: 12px; font-weight: 700; color: var(--v-dark); }

/* ══ MAIN ══ */
.main {
  flex: 1;
  padding: calc(var(--top-h) + 18px) 14px calc(var(--nav-h) + 20px);
  max-width: 600px; margin: 0 auto; width: 100%;
}

/* ══ BOTTOM NAV — pure white, no gradient ══ */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  height: var(--nav-h);
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border);
  display: flex; align-items: center;
  padding: 0 4px env(safe-area-inset-bottom, 8px);
  box-shadow: 0 -1px 0 var(--border), 0 -8px 20px rgba(20,20,22,0.04);
}
.bnav-item {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  flex: 1; padding: 7px 2px 4px; background: none; border: none; cursor: pointer;
  -webkit-tap-highlight-color: transparent; transition: opacity 0.15s;
}
.bnav-item:active { opacity: 0.6; }
.bnav-icon {
  width: 40px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; transition: background 0.18s;
}
.bnav-item.active .bnav-icon { background: var(--vbg); }
.bnav-label {
  font-size: 9.5px; font-weight: 600; color: var(--ink4);
  letter-spacing: 0.01em; font-family: var(--fb);
  transition: color 0.18s;
}
.bnav-item.active .bnav-label { color: var(--v); }

/* ══ FAB — the ONE place gradient makes sense ══ */
.fab {
  position: fixed;
  bottom: calc(var(--nav-h) + 12px); right: 16px; z-index: 110;
  width: 52px; height: 52px; border-radius: 16px; border: none;
  background: var(--g-brand); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; cursor: pointer;
  box-shadow: 0 4px 16px rgba(124,92,252,0.5), 0 1px 4px rgba(124,92,252,0.25);
  transition: transform 0.18s, box-shadow 0.18s;
  -webkit-tap-highlight-color: transparent;
}
.fab:active { transform: scale(0.9); box-shadow: 0 2px 8px rgba(124,92,252,0.4); }

/* ══ HERO CARD — gradient used intentionally here ══ */
.hero-card {
  background: var(--g-hero);
  border-radius: 22px; padding: 24px 20px 20px;
  margin-bottom: 16px; position: relative; overflow: hidden;
  box-shadow: 0 4px 20px rgba(90,53,196,0.3), 0 1px 4px rgba(90,53,196,0.15);
}
.hero-card::before {
  content: ''; position: absolute;
  width: 200px; height: 200px; border-radius: 50%;
  top: -60px; right: -60px;
  background: rgba(255,255,255,0.05); pointer-events: none;
}
.hero-card::after {
  content: ''; position: absolute;
  width: 140px; height: 140px; border-radius: 50%;
  bottom: -50px; left: -30px;
  background: rgba(255,255,255,0.04); pointer-events: none;
}
.hero-greeting  { font-size: 12px; color: rgba(255,255,255,0.6); font-weight: 500; margin-bottom: 2px; }
.hero-name      { font-family: var(--fh); font-size: 20px; font-weight: 800; color: white; margin-bottom: 18px; }
.hero-pending-label { font-size: 10px; color: rgba(255,255,255,0.5); letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
.hero-pending-value { font-family: var(--fh); font-size: 36px; font-weight: 800; color: white; line-height: 1; margin-bottom: 18px; letter-spacing: -1.5px; }
.hero-row { display: flex; gap: 8px; }
.hero-mini {
  flex: 1; background: rgba(255,255,255,0.13); border-radius: 12px;
  padding: 10px 12px; border: 1px solid rgba(255,255,255,0.1);
}
.hero-mini-label { font-size: 9px; color: rgba(255,255,255,0.55); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 3px; }
.hero-mini-value { font-family: var(--fh); font-size: 15px; font-weight: 800; color: white; }

/* ══ CARDS — white, not gradient ══ */
.quick-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.quick-card {
  background: var(--card); border-radius: var(--r); padding: 14px;
  border: 1px solid var(--border); box-shadow: var(--s1);
  display: flex; align-items: center; gap: 10px;
}
.quick-card:active { background: var(--bg2); }
.quick-ico {
  width: 38px; height: 38px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
.quick-label { font-size: 10px; font-weight: 600; color: var(--ink3); letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 2px; }
.quick-value { font-family: var(--fh); font-size: 16px; font-weight: 800; color: var(--ink); }
.quick-value.green  { color: var(--green); }
.quick-value.red    { color: var(--red); }
.quick-value.amber  { color: var(--amber); }
.quick-value.purple { color: var(--v); }

/* ══ SECTION HEADER ══ */
.sec-title {
  font-family: var(--fh); font-size: 15px; font-weight: 800; color: var(--ink);
  margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;
}
.sec-more  { font-size: 12px; font-weight: 600; color: var(--v); cursor: pointer; background: none; border: none; font-family: var(--fb); }
.page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; gap: 12px; flex-wrap: wrap; }
.page-title { font-family: var(--fh); font-size: 21px; font-weight: 800; color: var(--ink); }
.page-sub   { font-size: 13px; color: var(--ink3); margin-top: 2px; }

/* ══ ACTIVITY LIST — white cards, colored left-accent ══ */
.activity-card {
  background: var(--card); border-radius: var(--r);
  border: 1px solid var(--border); box-shadow: var(--s1);
  overflow: hidden; margin-bottom: 14px;
}
.activity-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-bottom: 1px solid var(--border);
  transition: background 0.12s;
}
.activity-row:last-child { border-bottom: none; }
.activity-row:active { background: var(--bg); }
.activity-ico {
  width: 38px; height: 38px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
}
.activity-desc { flex: 1; min-width: 0; }
.activity-title { font-size: 14px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.activity-sub   { font-size: 11px; color: var(--ink3); margin-top: 1px; }
.activity-amt   { font-family: var(--fh); font-size: 14px; font-weight: 800; flex-shrink: 0; }

/* ══ FRIEND CARD — white with colored avatar ══ */
.friend-grid { display: flex; flex-direction: column; gap: 10px; }
.friend-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--r); padding: 14px; box-shadow: var(--s1);
}
.friend-card:active { background: var(--bg); }
.friend-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.friend-avatar {
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-family: var(--fh); font-weight: 800; color: white; flex-shrink: 0;
}
.friend-name  { font-family: var(--fh); font-size: 15px; font-weight: 800; color: var(--ink); }
.friend-phone { font-size: 12px; color: var(--ink3); margin-top: 1px; }
.friend-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 7px; }
.fstat        { background: var(--bg); border-radius: var(--r-xs); padding: 9px 10px; border: 1px solid var(--border); }
.fstat-label  { font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink4); margin-bottom: 3px; }
.fstat-value  { font-family: var(--fh); font-size: 13px; font-weight: 800; color: var(--ink); }
.fstat-value.green  { color: var(--green); }
.fstat-value.red    { color: var(--red); }
.fstat-value.purple { color: var(--v); }
.friend-actions { display: flex; gap: 7px; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); }

/* ══ ACCOUNT CARD — white card with a colored top stripe ══ */
.account-grid { display: flex; flex-direction: column; gap: 10px; }
.account-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--r); box-shadow: var(--s1); overflow: hidden;
}
.account-stripe {
  height: 4px; width: 100%;
}
.account-stripe.cc   { background: linear-gradient(90deg, var(--v-dark), var(--v-light)); }
.account-stripe.bank { background: linear-gradient(90deg, #059669, #34d399); }
.account-card-inner { padding: 16px; }
.account-chip {
  display: inline-flex; align-items: center; gap: 5px;
  border-radius: 20px; padding: 3px 10px; font-size: 10px;
  font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 10px;
}
.account-chip.cc   { background: var(--vbg); color: var(--v); border: 1px solid var(--vbrd); }
.account-chip.bank { background: var(--greenbg); color: var(--green); border: 1px solid var(--greenbrd); }
.account-name { font-family: var(--fh); font-size: 17px; font-weight: 800; color: var(--ink); margin-bottom: 2px; }
.account-sub  { font-size: 11px; color: var(--ink3); margin-bottom: 14px; }
.account-spent { font-family: var(--fh); font-size: 26px; font-weight: 800; color: var(--ink); margin-bottom: 2px; }
.account-spent-label { font-size: 11px; color: var(--ink3); }

/* Limit bar — dark track, colored fill */
.limit-bar-track {
  background: var(--bg2); border-radius: 6px; height: 6px;
  overflow: hidden; margin: 8px 0 4px;
}
.limit-bar-fill  { height: 100%; border-radius: 6px; transition: width 0.5s ease; }
.limit-bar-fill.cc   { background: linear-gradient(90deg, var(--v-dark), var(--v)); }
.limit-bar-fill.bank { background: linear-gradient(90deg, #059669, #34d399); }
.limit-bar-fill.warn { background: linear-gradient(90deg, var(--amber), #fbbf24); }
.limit-bar-fill.danger { background: linear-gradient(90deg, var(--red), #fb7185); }
.limit-row { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink3); margin-bottom: 2px; }
.limit-available { font-family: var(--fh); font-size: 12px; font-weight: 700; color: var(--ink); }

.account-actions {
  display: flex; border-top: 1px solid var(--border);
  background: var(--bg);
}
.account-action-btn {
  flex: 1; padding: 11px 8px; background: none; border: none;
  color: var(--ink3); cursor: pointer; font-family: var(--fb);
  font-size: 12px; font-weight: 600; display: flex; align-items: center;
  justify-content: center; gap: 5px; transition: all 0.14s;
  border-right: 1px solid var(--border);
}
.account-action-btn:last-child { border-right: none; }
.account-action-btn:active { background: var(--bg2); color: var(--ink); }

/* ══ BREAKDOWN PANEL ══ */
.breakdown-panel { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); margin-top: 6px; overflow: hidden; box-shadow: var(--s1); }
.breakdown-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.breakdown-table th { padding: 9px 12px; text-align: left; font-size: 9.5px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--ink3); background: var(--bg); border-bottom: 1px solid var(--border); }
.breakdown-table td { padding: 11px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.breakdown-table tr:last-child td { border-bottom: none; }

/* ══ BUTTONS ══ */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 18px; border-radius: var(--r-sm); font-family: var(--fb);
  font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.15s;
  border: none; white-space: nowrap; -webkit-tap-highlight-color: transparent;
}
.btn-primary {
  background: var(--v); color: white;
  box-shadow: 0 2px 8px rgba(124,92,252,0.35);
}
.btn-primary:active { background: var(--v-dark); transform: scale(0.98); }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-ghost  { background: var(--bg); color: var(--ink2); border: 1.5px solid var(--border); }
.btn-ghost:active { background: var(--bg2); }
.btn-danger { background: var(--redbg); color: var(--red); border: 1px solid var(--redbrd); }
.btn-danger:active { background: #fee2e0; }
.btn-success { background: var(--greenbg); color: var(--green); border: 1px solid var(--greenbrd); }
.btn-sm   { padding: 7px 14px; font-size: 12px; border-radius: var(--r-xs); }
.btn-icon { padding: 8px; border-radius: 9px; }
.btn-full { width: 100%; }

/* ══ FORM ══ */
.form-section { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 18px; box-shadow: var(--s1); }
.form-title   { font-family: var(--fh); font-size: 17px; font-weight: 800; color: var(--ink); margin-bottom: 3px; }
.form-sub     { font-size: 12px; color: var(--ink3); margin-bottom: 18px; }
.form-row     { display: grid; gap: 11px; margin-bottom: 11px; }
.form-row.g2  { grid-template-columns: 1fr 1fr; }
.field        { display: flex; flex-direction: column; gap: 5px; }
.field-label  { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--ink2); }
.field-input  {
  background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--r-sm);
  padding: 11px 13px; font-size: 14px; color: var(--ink); font-family: var(--fb);
  transition: border-color 0.15s, box-shadow 0.15s; outline: none; width: 100%;
}
.field-input:focus { border-color: var(--v); box-shadow: 0 0 0 3px var(--vbg); }
.field-input::placeholder { color: var(--ink4); }
select.field-input { cursor: pointer; }
select.field-input option { background: white; color: var(--ink); }
.input-wrap { position: relative; }
.input-wrap .field-input { padding-right: 42px; }
.eye-btn { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--ink3); padding: 4px; display: flex; align-items: center; }

/* ══ TABLE ══ */
.table-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--s1); overflow: hidden; }
.table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
table { width: 100%; border-collapse: collapse; min-width: 520px; }
thead tr { background: var(--bg); }
th { padding: 10px 13px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink3); border-bottom: 1px solid var(--border); white-space: nowrap; }
td { padding: 12px 13px; font-size: 13px; border-bottom: 1px solid var(--border); vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:active { background: var(--bg); }
.td-bold  { font-weight: 600; color: var(--ink); }
.td-muted { color: var(--ink3); font-size: 12px; }
.td-green { color: var(--green); font-weight: 700; }
.td-red   { color: var(--red); font-weight: 700; }
.td-purple{ color: var(--v); font-weight: 700; }

/* ══ BADGES ══ */
.badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge-green  { background: var(--greenbg);  color: var(--green);  border: 1px solid var(--greenbrd); }
.badge-red    { background: var(--redbg);    color: var(--red);    border: 1px solid var(--redbrd); }
.badge-purple { background: var(--vbg);      color: var(--v);      border: 1px solid var(--vbrd); }
.badge-amber  { background: var(--amberbg);  color: var(--amber);  border: 1px solid var(--amberbrd); }
.badge-gray   { background: var(--bg2);      color: var(--ink3);   border: 1px solid var(--border2); }
.badge-indigo { background: var(--vbg);      color: var(--v);      border: 1px solid var(--vbrd); }
.bal-chip     { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 12px; font-weight: 700; }

/* ══ TXN CHIPS ══ */
.txn-expense  { background: var(--redbg);   color: var(--red);   border-radius: 5px; padding: 2px 8px; font-size: 10px; font-weight: 700; border: 1px solid var(--redbrd); }
.txn-payment  { background: var(--greenbg); color: var(--green); border-radius: 5px; padding: 2px 8px; font-size: 10px; font-weight: 700; border: 1px solid var(--greenbrd); }
.txn-personal { background: var(--amberbg); color: var(--amber); border-radius: 5px; padding: 2px 8px; font-size: 10px; font-weight: 700; border: 1px solid var(--amberbrd); }

/* ══ BOTTOM SHEET ══ */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(14,14,18,0.55);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  z-index: 200; display: flex; align-items: flex-end; justify-content: center;
}
.modal {
  background: var(--card); border-radius: 24px 24px 0 0;
  width: 100%; max-width: 540px; max-height: 92vh; overflow-y: auto;
  box-shadow: 0 -4px 32px rgba(20,20,22,0.14);
  animation: sheetUp 0.28s cubic-bezier(0.32, 1.1, 0.64, 1);
}
@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.modal-handle { width: 32px; height: 3.5px; background: var(--border2); border-radius: 2px; margin: 10px auto 0; }
.modal-body   { padding: 18px 20px 36px; }
.modal-title  { font-family: var(--fh); font-size: 19px; font-weight: 800; color: var(--ink); margin-bottom: 3px; }
.modal-sub    { font-size: 12px; color: var(--ink3); margin-bottom: 18px; }
.modal-actions{ display: flex; gap: 9px; margin-top: 16px; }

/* ══ FILTER BAR ══ */
.filter-bar { display: flex; gap: 7px; margin-bottom: 13px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.filter-bar::-webkit-scrollbar { display: none; }
.filter-select {
  background: var(--card); border: 1.5px solid var(--border); border-radius: 20px;
  padding: 6px 13px; font-size: 12px; font-family: var(--fb);
  color: var(--ink2); outline: none; cursor: pointer;
  white-space: nowrap; flex-shrink: 0; font-weight: 600;
}
.filter-select:focus { border-color: var(--v); }
.filter-date  { padding: 6px 11px; }
.filter-clear { font-size: 12px; color: var(--ink3); cursor: pointer; background: none; border: none; font-family: var(--fb); flex-shrink: 0; }
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
  background: var(--card); border: 1px solid var(--border); border-radius: 24px;
  padding: 32px 26px; width: 100%; max-width: 390px;
  box-shadow: var(--s3); position: relative; z-index: 1;
}
.login-logo      { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.login-logo-icon {
  width: 48px; height: 48px; border-radius: 14px;
  background: var(--g-brand);
  display: flex; align-items: center; justify-content: center; font-size: 24px;
  box-shadow: 0 4px 14px rgba(124,92,252,0.4);
}
.login-logo-text { font-family: var(--fh); font-size: 24px; font-weight: 800; color: var(--ink); }
.login-logo-sub  { font-size: 11px; color: var(--ink3); }
.login-title { font-family: var(--fh); font-size: 20px; font-weight: 800; color: var(--ink); margin-bottom: 4px; }
.login-sub   { font-size: 13px; color: var(--ink3); margin-bottom: 22px; }
.login-error { background: var(--redbg); border: 1px solid var(--redbrd); border-radius: 9px; padding: 10px 13px; font-size: 13px; color: var(--red); margin-bottom: 13px; }

/* ══ EMPTY ══ */
.empty { padding: 48px 20px; text-align: center; }
.empty-icon { font-size: 44px; margin-bottom: 12px; opacity: 0.25; }
.empty-text { font-size: 15px; color: var(--ink3); font-weight: 700; }
.empty-sub  { font-size: 12px; color: var(--ink4); margin-top: 4px; }

/* ══ TOAST ══ */
.toast {
  position: fixed; bottom: calc(var(--nav-h) + 12px); left: 50%;
  transform: translateX(-50%); z-index: 9999;
  background: var(--ink2); color: white; border-radius: 12px;
  padding: 11px 18px; font-size: 13px; font-weight: 600;
  white-space: nowrap; box-shadow: var(--s3);
  animation: toastIn 0.26s cubic-bezier(0.32, 1.1, 0.64, 1);
  display: flex; align-items: center; gap: 7px;
}
.toast.success { background: #027a48; }
.toast.error   { background: #b42318; }
@keyframes toastIn { from { transform: translateX(-50%) translateY(10px) scale(0.94); opacity: 0; } to { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; } }

/* ══ LOADER ══ */
.loader { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; min-height: 100vh; color: var(--ink3); font-size: 14px; }
.spinner { width: 26px; height: 26px; border: 2px solid var(--border); border-top-color: var(--v); border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ CHARTS ══ */
.chart-card  { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 16px; box-shadow: var(--s1); margin-bottom: 12px; }
.chart-title { font-family: var(--fh); font-size: 14px; font-weight: 800; color: var(--ink); margin-bottom: 14px; }

/* ══ STATEMENT ══ */
.stmt-header { border-radius: var(--r); padding: 20px; color: white; margin-bottom: 14px; box-shadow: var(--s2); }
.stmt-header.cc   { background: linear-gradient(140deg, #2e1a6e 0%, #7c5cfc 100%); }
.stmt-header.bank { background: linear-gradient(140deg, #064e3b 0%, #10b981 100%); }
.stmt-total-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
.stmt-total-box   { background: rgba(255,255,255,0.12); border-radius: 10px; padding: 10px 12px; border: 1px solid rgba(255,255,255,0.1); }
.stmt-total-label { font-size: 9px; opacity: 0.7; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 3px; }
.stmt-total-value { font-family: var(--fh); font-size: 17px; font-weight: 800; }

/* ══ MISC ══ */
.insight-row { display: flex; align-items: center; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid var(--border); }
.insight-row:last-child { border-bottom: none; }
.divider { height: 1px; background: var(--border); margin: 14px 0; }

/* ══ RESPONSIVE ══ */
@media (min-width: 600px) {
  .quick-row { grid-template-columns: repeat(4, 1fr); }
  .friend-grid, .account-grid { display: grid; grid-template-columns: 1fr 1fr; }
  .form-row.g2 { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 360px) {
  .main { padding-left: 10px; padding-right: 10px; }
  .hero-pending-value { font-size: 28px; }
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
const initials = (name = '') => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
const today    = () => new Date().toISOString().split('T')[0];

// Nice colors for friends/accounts
const PALETTE = ['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed','#db2777','#0284c7','#16a34a','#ea580c'];
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
const IcoFilter = () => <Ico d={<><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>} />;
const IcoX      = () => <Ico d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} />;
const IcoCheck  = () => <Ico d={<polyline points="20 6 9 17 4 12"/>} />;

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
        // Register
        const q = query(collection(db, 'users'), where('phone', '==', phone));
        const existing = await getDocs(q);
        if (!existing.empty) { setError('Phone number already registered.'); setLoading(false); return; }
        const ref = await addDoc(collection(db, 'users'), { name: name || 'User', phone, password: pass });
        await seedIfEmpty(ref.id);
        onLogin({ id: ref.id, name: name || 'User', phone });
      } else {
        // Login
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
        <div className="login-blob" style={{ width: 400, height: 400, background: '#4f46e5', top: -100, right: -100 }} />
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
            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="field">
                <label className="field-label">Your Name</label>
                <input className="field-input" placeholder="e.g. Rahul Verma" value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>
          )}
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="field">
              <label className="field-label">Phone Number</label>
              <input className="field-input" type="tel" placeholder="10-digit number"
                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} />
            </div>
          </div>
          <div className="form-row" style={{ marginBottom: 20 }}>
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
          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ height: 46, fontSize: 15 }}>
            {loading ? 'Please wait…' : regMode ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--ink3)' }}>
          {regMode ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => { setRegMode(v => !v); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--v)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--fb)', fontSize: 13 }}>
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
    <div style={{ background: '#0f0f0f', color: 'white', padding: '10px 14px', borderRadius: 10, fontSize: 13 }}>
      <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 4 }}>{label}</div>
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
    { id: 'dashboard',    label: 'Home',       icon: '🏠' },
    { id: 'transactions', label: 'Activity',   icon: '💳' },
    { id: 'friends',      label: 'Friends',    icon: '👥' },
    { id: 'accounts',     label: 'Accounts',   icon: '🏦' },
    { id: 'statement',    label: 'Statement',  icon: '📋' },
    { id: 'insights',     label: 'Insights',   icon: '📊' },
  ];

  return (
    <div className="shell">
      {toastEl}

      {/* Top bar */}
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
          <button className="btn btn-ghost btn-sm" onClick={onLogout} style={{ fontSize: 12, padding: '6px 12px' }}>Out</button>
        </div>
      </div>

      {/* Main content */}
      <div className="main">
        {tab === 'dashboard'    && <Dashboard    user={user} friends={friends} accounts={accounts} transactions={transactions} setTab={setTab} />}
        {tab === 'transactions' && <Transactions user={user} friends={friends} accounts={accounts} transactions={transactions} showToast={showToast} />}
        {tab === 'friends'      && <Friends      user={user} friends={friends} transactions={transactions} showToast={showToast} />}
        {tab === 'accounts'     && <Accounts     user={user} accounts={accounts} transactions={transactions} friends={friends} showToast={showToast} />}
        {tab === 'statement'    && <AccountStatement accounts={accounts} transactions={transactions} friends={friends} />}
        {tab === 'insights'     && <Insights     friends={friends} accounts={accounts} transactions={transactions} />}
      </div>

      {/* FAB — quick add transaction */}
      <button className="fab" onClick={() => setShowTxnForm(true)} title="Add transaction">＋</button>

      {/* Bottom navigation */}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <button key={item.id} className={`bnav-item ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
            <div className="bnav-icon">{item.icon}</div>
            <span className="bnav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Quick add modal (via FAB) */}
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

  // Who owes me most
  const topOwing = friends.map(f => ({
    ...f,
    balance: transactions.filter(t=>t.friendId===f.id&&t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
           - transactions.filter(t=>t.friendId===f.id&&t.type==='payment').reduce((s,t)=>s+Number(t.amount),0)
  })).filter(f => f.balance > 0).sort((a,b) => b.balance - a.balance);

  // Recent 5 transactions
  const recent = [...transactions].sort((a, b) => (b.date||'').localeCompare(a.date||'')).slice(0, 5);

  return (
    <div>
      {/* Hero balance card */}
      <div className="hero-card">
        <div className="hero-greeting">Good day,</div>
        <div className="hero-name">{user.name.split(' ')[0]} 👋</div>
        <div className="hero-pending-label">Friends owe you</div>
        <div className="hero-pending-value">{fmt(totalPending > 0 ? totalPending : 0)}</div>
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
        <div style={{ marginBottom: 18 }}>
          <div className="sec-title">
            Accounts
            <button className="sec-more" onClick={() => setTab('accounts')}>View all</button>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {accounts.map(a => {
              const spent = transactions.filter(t => t.accountId === a.id && t.type === 'expense').reduce((s,t)=>s+Number(t.amount),0);
              const recv  = transactions.filter(t => t.accountId === a.id && t.type === 'payment').reduce((s,t)=>s+Number(t.amount),0);
              const net   = spent - recv;
              const isCC  = a.type === 'credit_card';
              const limit = isCC ? a.limit : a.balance;
              const pct   = limit ? Math.min(100, (net / limit) * 100) : 0;
              const avail = limit ? limit - net : null;
              const accentColor = isCC ? 'var(--v)' : 'var(--green)';
              const accentBg    = isCC ? 'var(--vbg)' : 'var(--greenbg)';
              const barClass    = pct >= 90 ? 'danger' : pct >= 70 ? 'warn' : isCC ? 'cc' : 'bank';
              return (
                <div key={a.id} style={{ background: 'var(--card)', borderRadius: 14, padding: '14px 16px', minWidth: 170, flex: '0 0 auto', border: '1px solid var(--border)', boxShadow: 'var(--s1)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: isCC ? 'linear-gradient(90deg, var(--v-dark), var(--v-light))' : 'linear-gradient(90deg, #059669, #34d399)' }} />
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: accentColor, marginBottom: 3, marginTop: 6 }}>{isCC ? '💳 Credit' : '🏦 Savings'}</div>
                  <div style={{ fontFamily: 'var(--fh)', fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginBottom: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                  {limit ? (
                    <>
                      <div className="limit-bar-track" style={{ marginBottom: 6 }}>
                        <div className={`limit-bar-fill ${barClass}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ink3)' }}>
                        <span>{Math.round(pct)}% used</span>
                        <span style={{ fontWeight: 700, color: avail < 0 ? 'var(--red)' : 'var(--green)' }}>{fmt(Math.max(0, avail))} free</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontFamily: 'var(--fh)', fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>{fmt(net)} <span style={{ fontSize: 11, color: 'var(--ink3)', fontFamily: 'var(--fb)', fontWeight: 500 }}>spent</span></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Who owes you */}
      {topOwing.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div className="sec-title">
            Who Owes You
            <button className="sec-more" onClick={() => setTab('friends')}>View all</button>
          </div>
          <div className="activity-card">
            {topOwing.slice(0, 4).map(f => (
              <div key={f.id} className="activity-row">
                <div className="activity-ico" style={{ background: f.color ? f.color + '22' : 'var(--vbg)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: f.color || colorFor(f.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', fontFamily: 'var(--fh)' }}>
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
          <button className="sec-more" onClick={() => setTab('transactions')}>View all</button>
        </div>
        {recent.length === 0 ? (
          <div className="activity-card"><div className="empty" style={{ padding: '32px 20px' }}><div className="empty-icon">💳</div><div className="empty-text"
