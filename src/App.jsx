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
const CSS = `
:root {
  --bg:        #f0f2f8;
  --bg2:       #e8eaf2;
  --bg3:       #dde0ec;
  --card:      #ffffff;
  --border:    #e4e7f0;
  --border2:   #cdd1e0;
  --ink:       #0d0f1a;
  --ink2:      #2d3148;
  --ink3:      #7b80a0;
  --ink4:      #b0b5cc;
  --purple:    #6c47ff;
  --purple2:   #8b6fff;
  --purplebg:  rgba(108,71,255,0.08);
  --purplebrd: rgba(108,71,255,0.2);
  --teal:      #0abf8f;
  --tealbg:    rgba(10,191,143,0.09);
  --tealbrd:   rgba(10,191,143,0.22);
  --green:     #0aaf6e;
  --greenbg:   rgba(10,175,110,0.09);
  --greenbrd:  rgba(10,175,110,0.22);
  --red:       #f04060;
  --redbg:     rgba(240,64,96,0.08);
  --redbrd:    rgba(240,64,96,0.22);
  --amber:     #f08c20;
  --amberbg:   rgba(240,140,32,0.09);
  --amberbrd:  rgba(240,140,32,0.22);
  --nav-h:     68px;
  --topbar-h:  60px;
  --radius:    18px;
  --radius-sm: 12px;
  --radius-xs: 8px;
  --shadow-sm: 0 1px 3px rgba(13,15,26,0.06), 0 2px 8px rgba(13,15,26,0.04);
  --shadow:    0 4px 20px rgba(13,15,26,0.08), 0 1px 4px rgba(13,15,26,0.04);
  --shadow-lg: 0 12px 40px rgba(13,15,26,0.14), 0 4px 12px rgba(13,15,26,0.06);
  --fh: 'Sora', system-ui, sans-serif;
  --fb: 'Plus Jakarta Sans', system-ui, sans-serif;
}
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { background: var(--bg); font-family: var(--fb); color: var(--ink); -webkit-tap-highlight-color: transparent; }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

/* ══ APP SHELL ══ */
.ft-app { min-height: 100vh; }
.shell  { display: flex; flex-direction: column; min-height: 100vh; }

/* ══ TOP BAR ══ */
.topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: var(--topbar-h);
  background: rgba(240,242,248,0.9); backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid rgba(228,231,240,0.8);
  display: flex; align-items: center; justify-content: space-between; padding: 0 18px;
}
.topbar-brand { display: flex; align-items: center; gap: 10px; }
.brand-icon {
  width: 36px; height: 36px; border-radius: 11px; flex-shrink: 0;
  background: linear-gradient(135deg, #6c47ff 0%, #a78bfa 100%);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; box-shadow: 0 4px 12px rgba(108,71,255,0.35);
}
.brand-name { font-family: var(--fh); font-size: 18px; font-weight: 800; color: var(--ink); letter-spacing: -0.3px; }
.topbar-right { display: flex; align-items: center; gap: 8px; }
.user-chip {
  display: flex; align-items: center; gap: 7px;
  background: var(--card); border: 1px solid var(--border);
  border-radius: 30px; padding: 4px 12px 4px 5px; box-shadow: var(--shadow-sm);
}
.user-avatar {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #6c47ff, #a78bfa);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: white;
}
.user-name { font-size: 13px; font-weight: 600; color: var(--ink2); }

/* ══ MAIN CONTENT ══ */
.main {
  flex: 1; padding: calc(var(--topbar-h) + 20px) 16px calc(var(--nav-h) + 24px);
  max-width: 680px; margin: 0 auto; width: 100%;
}

/* ══ BOTTOM NAV ══ */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  height: var(--nav-h);
  background: rgba(255,255,255,0.94); backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-top: 1px solid rgba(228,231,240,0.9);
  display: flex; align-items: center; justify-content: space-around;
  padding: 0 4px 4px; box-shadow: 0 -4px 24px rgba(13,15,26,0.07);
}
.bnav-item {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  flex: 1; padding: 8px 4px; background: none; border: none;
  cursor: pointer; border-radius: 14px; transition: all 0.18s;
  -webkit-tap-highlight-color: transparent;
}
.bnav-item:active { transform: scale(0.9); }
.bnav-icon {
  width: 44px; height: 32px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; transition: all 0.22s;
}
.bnav-item.active .bnav-icon { background: var(--purplebg); }
.bnav-label { font-size: 10px; font-weight: 600; color: var(--ink4); letter-spacing: 0.02em; transition: color 0.18s; font-family: var(--fb); }
.bnav-item.active .bnav-label { color: var(--purple); }

/* ══ FAB ══ */
.fab {
  position: fixed; bottom: calc(var(--nav-h) + 14px); right: 18px; z-index: 110;
  width: 54px; height: 54px; border-radius: 18px; border: none;
  background: linear-gradient(135deg, #6c47ff 0%, #a78bfa 100%);
  color: white; font-size: 26px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(108,71,255,0.45), 0 2px 8px rgba(108,71,255,0.2);
  transition: all 0.2s; -webkit-tap-highlight-color: transparent;
}
.fab:active { transform: scale(0.88); box-shadow: 0 4px 14px rgba(108,71,255,0.35); }

/* ══ HERO BALANCE CARD ══ */
.hero-card {
  background: linear-gradient(140deg, #1a0a4f 0%, #3d1fa3 45%, #6c47ff 100%);
  border-radius: 24px; padding: 26px 22px 22px;
  margin-bottom: 18px; position: relative; overflow: hidden;
  box-shadow: 0 8px 32px rgba(108,71,255,0.4), 0 2px 8px rgba(108,71,255,0.2);
}
.hero-card::before {
  content: ''; position: absolute; top: -40px; right: -40px;
  width: 160px; height: 160px; border-radius: 50%;
  background: rgba(255,255,255,0.06); pointer-events: none;
}
.hero-card::after {
  content: ''; position: absolute; bottom: -30px; left: 20px;
  width: 120px; height: 120px; border-radius: 50%;
  background: rgba(255,255,255,0.04); pointer-events: none;
}
.hero-greeting { font-size: 13px; color: rgba(255,255,255,0.65); font-weight: 500; margin-bottom: 4px; }
.hero-name { font-family: var(--fh); font-size: 22px; font-weight: 800; color: white; margin-bottom: 20px; }
.hero-pending-label { font-size: 11px; color: rgba(255,255,255,0.55); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; margin-bottom: 6px; }
.hero-pending-value { font-family: var(--fh); font-size: 38px; font-weight: 800; color: white; line-height: 1; margin-bottom: 20px; letter-spacing: -1px; }
.hero-row { display: flex; gap: 10px; }
.hero-mini { flex: 1; background: rgba(255,255,255,0.12); border-radius: 14px; padding: 12px 14px; backdrop-filter: blur(8px); }
.hero-mini-label { font-size: 10px; color: rgba(255,255,255,0.6); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; }
.hero-mini-value { font-family: var(--fh); font-size: 16px; font-weight: 700; color: white; }

/* ══ QUICK STATS ══ */
.quick-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
.quick-card {
  background: var(--card); border-radius: var(--radius); padding: 16px;
  box-shadow: var(--shadow-sm); border: 1px solid var(--border);
  display: flex; align-items: center; gap: 12px; transition: all 0.18s;
}
.quick-card:active { transform: scale(0.97); }
.quick-ico { width: 42px; height: 42px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.quick-label { font-size: 10px; font-weight: 700; color: var(--ink3); letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 3px; }
.quick-value { font-family: var(--fh); font-size: 17px; font-weight: 800; color: var(--ink); }
.quick-value.green  { color: var(--green); }
.quick-value.red    { color: var(--red); }
.quick-value.amber  { color: var(--amber); }
.quick-value.purple { color: var(--purple); }

/* ══ SECTION TITLE ══ */
.sec-title { font-family: var(--fh); font-size: 16px; font-weight: 800; color: var(--ink); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
.sec-more  { font-size: 12px; font-weight: 600; color: var(--purple); cursor: pointer; background: none; border: none; font-family: var(--fb); }
.page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; gap: 12px; flex-wrap: wrap; }
.page-title { font-family: var(--fh); font-size: 22px; font-weight: 800; color: var(--ink); }
.page-sub   { font-size: 13px; color: var(--ink3); margin-top: 2px; }

/* ══ ACTIVITY FEED ══ */
.activity-card { background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow-sm); border: 1px solid var(--border); overflow: hidden; margin-bottom: 16px; }
.activity-row {
  display: flex; align-items: center; gap: 12px; padding: 13px 16px;
  border-bottom: 1px solid var(--border); transition: background 0.14s;
}
.activity-row:last-child { border-bottom: none; }
.activity-row:active { background: var(--bg); }
.activity-ico { width: 40px; height: 40px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.activity-desc { flex: 1; min-width: 0; }
.activity-title { font-size: 14px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.activity-sub   { font-size: 12px; color: var(--ink3); margin-top: 1px; }
.activity-amt   { font-family: var(--fh); font-size: 15px; font-weight: 800; flex-shrink: 0; }

/* ══ FRIEND CARD ══ */
.friend-grid { display: flex; flex-direction: column; gap: 10px; }
.friend-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow-sm); }
.friend-card:active { transform: scale(0.99); }
.friend-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.friend-avatar { border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--fh); font-weight: 800; color: white; flex-shrink: 0; }
.friend-name  { font-family: var(--fh); font-size: 16px; font-weight: 800; color: var(--ink); }
.friend-phone { font-size: 12px; color: var(--ink3); margin-top: 1px; }
.friend-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.fstat { background: var(--bg); border-radius: var(--radius-xs); padding: 10px; }
.fstat-label { font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink4); margin-bottom: 3px; }
.fstat-value { font-family: var(--fh); font-size: 14px; font-weight: 800; color: var(--ink); }
.fstat-value.green  { color: var(--green); }
.fstat-value.red    { color: var(--red); }
.fstat-value.purple { color: var(--purple); }
.friend-actions { display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }

/* ══ ACCOUNT CARD ══ */
.account-grid { display: flex; flex-direction: column; gap: 10px; }
.account-card { border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); }
.account-card-inner { padding: 18px; }
.account-chip { display: inline-flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.2); border-radius: 20px; padding: 3px 10px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 14px; }
.account-name { font-family: var(--fh); font-size: 18px; font-weight: 800; color: white; margin-bottom: 2px; }
.account-sub  { font-size: 11px; color: rgba(255,255,255,0.6); margin-bottom: 16px; }
.account-spent { font-family: var(--fh); font-size: 30px; font-weight: 800; color: white; margin-bottom: 4px; }
.account-spent-label { font-size: 11px; color: rgba(255,255,255,0.6); }
.account-actions { background: rgba(255,255,255,0.1); display: flex; border-top: 1px solid rgba(255,255,255,0.15); }
.account-action-btn { flex: 1; padding: 13px; background: none; border: none; color: rgba(255,255,255,0.85); cursor: pointer; font-family: var(--fb); font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background 0.15s; border-right: 1px solid rgba(255,255,255,0.12); }
.account-action-btn:last-child { border-right: none; }
.account-action-btn:active { background: rgba(255,255,255,0.1); }
.limit-bar-track { border-radius: 6px; height: 5px; overflow: hidden; margin: 8px 0 5px; background: rgba(255,255,255,0.2); }
.limit-bar-fill  { height: 100%; border-radius: 6px; transition: width 0.5s ease; background: rgba(255,255,255,0.85); }
.limit-row { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.65); margin-bottom: 3px; }
.limit-available { font-size: 13px; font-weight: 700; color: white; }

/* ══ ACCOUNT BREAKDOWN ══ */
.breakdown-panel { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); margin-top: 8px; overflow: hidden; box-shadow: var(--shadow-sm); }
.breakdown-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.breakdown-table th { padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--ink3); background: var(--bg); border-bottom: 1px solid var(--border); }
.breakdown-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.breakdown-table tr:last-child td { border-bottom: none; }

/* ══ BUTTONS ══ */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 11px 20px; border-radius: var(--radius-sm); font-family: var(--fb);
  font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.18s;
  border: none; white-space: nowrap; -webkit-tap-highlight-color: transparent;
}
.btn-primary  { background: linear-gradient(135deg, #6c47ff, #a78bfa); color: white; box-shadow: 0 4px 14px rgba(108,71,255,0.35); }
.btn-primary:active { transform: scale(0.97); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-ghost    { background: var(--bg); color: var(--ink2); border: 1.5px solid var(--border); }
.btn-ghost:active { background: var(--bg2); }
.btn-danger   { background: var(--redbg); color: var(--red); border: 1px solid var(--redbrd); }
.btn-danger:active { background: rgba(240,64,96,0.15); }
.btn-success  { background: var(--greenbg); color: var(--green); border: 1px solid var(--greenbrd); }
.btn-sm   { padding: 7px 14px; font-size: 12px; border-radius: var(--radius-xs); }
.btn-icon { padding: 9px; border-radius: 11px; }
.btn-full { width: 100%; }

/* ══ FORM ══ */
.form-section { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow-sm); }
.form-title   { font-family: var(--fh); font-size: 18px; font-weight: 800; color: var(--ink); margin-bottom: 4px; }
.form-sub     { font-size: 13px; color: var(--ink3); margin-bottom: 20px; }
.form-row     { display: grid; gap: 12px; margin-bottom: 12px; }
.form-row.g2  { grid-template-columns: 1fr 1fr; }
.field        { display: flex; flex-direction: column; gap: 6px; }
.field-label  { font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink2); }
.field-input  {
  background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  padding: 12px 14px; font-size: 15px; color: var(--ink); font-family: var(--fb);
  transition: border-color 0.18s, box-shadow 0.18s; outline: none; width: 100%;
}
.field-input:focus { border-color: var(--purple); box-shadow: 0 0 0 3px var(--purplebg); }
.field-input::placeholder { color: var(--ink4); }
select.field-input { cursor: pointer; }
select.field-input option { background: white; color: var(--ink); }
.input-wrap { position: relative; }
.input-wrap .field-input { padding-right: 44px; }
.eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--ink3); padding: 4px; display: flex; align-items: center; }

/* ══ TABLE ══ */
.table-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden; }
.table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
table { width: 100%; border-collapse: collapse; min-width: 520px; }
thead tr { background: var(--bg); }
th { padding: 11px 14px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink3); border-bottom: 1px solid var(--border); white-space: nowrap; }
td { padding: 13px 14px; font-size: 13.5px; border-bottom: 1px solid var(--border); vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:active { background: var(--bg); }
.td-bold  { font-weight: 700; color: var(--ink); }
.td-muted { color: var(--ink3); font-size: 12px; }
.td-green { color: var(--green); font-weight: 700; }
.td-red   { color: var(--red); font-weight: 700; }
.td-purple{ color: var(--purple); font-weight: 700; }

/* ══ BADGE ══ */
.badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge-green  { background: var(--greenbg);  color: var(--green);  border: 1px solid var(--greenbrd); }
.badge-red    { background: var(--redbg);    color: var(--red);    border: 1px solid var(--redbrd); }
.badge-purple { background: var(--purplebg); color: var(--purple); border: 1px solid var(--purplebrd); }
.badge-amber  { background: var(--amberbg);  color: var(--amber);  border: 1px solid var(--amberbrd); }
.badge-gray   { background: var(--bg2); color: var(--ink3); border: 1px solid var(--border); }
.badge-indigo { background: var(--purplebg); color: var(--purple); border: 1px solid var(--purplebrd); }
.bal-chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }

/* ══ TXN TYPE CHIPS ══ */
.txn-expense  { background: var(--redbg);   color: var(--red);   border-radius: 6px; padding: 3px 9px; font-size: 11px; font-weight: 700; }
.txn-payment  { background: var(--greenbg); color: var(--green); border-radius: 6px; padding: 3px 9px; font-size: 11px; font-weight: 700; }
.txn-personal { background: var(--amberbg); color: var(--amber); border-radius: 6px; padding: 3px 9px; font-size: 11px; font-weight: 700; }

/* ══ BOTTOM SHEET MODAL ══ */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(13,15,26,0.5);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  z-index: 200; display: flex; align-items: flex-end; justify-content: center;
}
.modal {
  background: var(--card); border-radius: 26px 26px 0 0;
  width: 100%; max-width: 520px; max-height: 92vh; overflow-y: auto;
  box-shadow: 0 -8px 40px rgba(13,15,26,0.18);
  animation: sheetUp 0.3s cubic-bezier(0.34,1.1,0.64,1);
}
@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.modal-handle { width: 36px; height: 4px; background: var(--border2); border-radius: 2px; margin: 12px auto 0; }
.modal-body   { padding: 20px 22px 32px; }
.modal-title  { font-family: var(--fh); font-size: 20px; font-weight: 800; color: var(--ink); margin-bottom: 4px; }
.modal-sub    { font-size: 13px; color: var(--ink3); margin-bottom: 20px; }
.modal-actions{ display: flex; gap: 10px; margin-top: 18px; }

/* ══ FILTER BAR ══ */
.filter-bar { display: flex; gap: 8px; margin-bottom: 14px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.filter-bar::-webkit-scrollbar { display: none; }
.filter-select {
  background: var(--card); border: 1.5px solid var(--border); border-radius: 20px;
  padding: 7px 14px; font-size: 13px; font-family: var(--fb); color: var(--ink2);
  outline: none; cursor: pointer; white-space: nowrap; flex-shrink: 0; font-weight: 500;
}
.filter-select:focus { border-color: var(--purple); }
.filter-date  { padding: 7px 12px; }
.filter-clear { font-size: 12px; color: var(--ink3); cursor: pointer; background: none; border: none; font-family: var(--fb); flex-shrink: 0; }

/* ══ LOGIN ══ */
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: var(--bg); }
.login-bg   { position: fixed; inset: 0; pointer-events: none; overflow: hidden; }
.login-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15; }
.login-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 26px;
  padding: 36px 28px; width: 100%; max-width: 400px;
  box-shadow: var(--shadow-lg); position: relative; z-index: 1;
}
.login-logo      { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.login-logo-icon { width: 50px; height: 50px; border-radius: 16px; background: linear-gradient(135deg,#6c47ff,#a78bfa); display: flex; align-items: center; justify-content: center; font-size: 26px; box-shadow: 0 6px 18px rgba(108,71,255,0.4); }
.login-logo-text { font-family: var(--fh); font-size: 26px; font-weight: 800; color: var(--ink); }
.login-logo-sub  { font-size: 12px; color: var(--ink3); }
.login-title { font-family: var(--fh); font-size: 22px; font-weight: 800; color: var(--ink); margin-bottom: 6px; }
.login-sub   { font-size: 13px; color: var(--ink3); margin-bottom: 24px; }
.login-error { background: var(--redbg); border: 1px solid var(--redbrd); border-radius: 10px; padding: 11px 14px; font-size: 13px; color: var(--red); margin-bottom: 14px; }

/* ══ EMPTY ══ */
.empty { padding: 52px 20px; text-align: center; }
.empty-icon { font-size: 48px; margin-bottom: 14px; }
.empty-text { font-size: 16px; color: var(--ink3); font-weight: 700; }
.empty-sub  { font-size: 13px; color: var(--ink4); margin-top: 4px; }

/* ══ TOAST ══ */
.toast {
  position: fixed; bottom: calc(var(--nav-h) + 14px); left: 50%; transform: translateX(-50%);
  z-index: 9999; background: var(--ink2); color: white; border-radius: 14px;
  padding: 13px 20px; font-size: 13px; font-weight: 600; white-space: nowrap;
  box-shadow: var(--shadow-lg); animation: toastPop 0.3s cubic-bezier(0.34,1.1,0.64,1);
  display: flex; align-items: center; gap: 8px;
}
.toast.success { background: #0a6640; }
.toast.error   { background: #8b1422; }
@keyframes toastPop { from { transform: translateX(-50%) translateY(12px) scale(0.95); opacity: 0; } to { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; } }

/* ══ LOADING ══ */
.loader { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; min-height: 100vh; color: var(--ink3); font-size: 14px; }
.spinner { width: 28px; height: 28px; border: 2.5px solid var(--border); border-top-color: var(--purple); border-radius: 50%; animation: spin 0.65s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ CHARTS ══ */
.chart-card  { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; box-shadow: var(--shadow-sm); margin-bottom: 14px; }
.chart-title { font-family: var(--fh); font-size: 15px; font-weight: 800; color: var(--ink); margin-bottom: 16px; }

/* ══ STATEMENT ══ */
.stmt-header { border-radius: var(--radius); padding: 22px; color: white; margin-bottom: 16px; box-shadow: var(--shadow); }
.stmt-header.cc   { background: linear-gradient(135deg, #1a0a4f 0%, #6c47ff 100%); }
.stmt-header.bank { background: linear-gradient(135deg, #064e3b 0%, #0aaf6e 100%); }
.stmt-total-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
.stmt-total-box   { background: rgba(255,255,255,0.13); border-radius: 12px; padding: 12px 14px; }
.stmt-total-label { font-size: 10px; opacity: 0.75; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; }
.stmt-total-value { font-family: var(--fh); font-size: 18px; font-weight: 800; }

/* ══ INSIGHT ROW ══ */
.insight-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
.insight-row:last-child { border-bottom: none; }
.divider { height: 1px; background: var(--border); margin: 16px 0; }

/* ══ RESPONSIVE ══ */
@media (min-width: 680px) {
  .quick-row { grid-template-columns: repeat(4, 1fr); }
  .friend-grid, .account-grid { display: grid; grid-template-columns: 1fr 1fr; }
  .form-row.g2 { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 400px) {
  .main { padding-left: 12px; padding-right: 12px; }
  .hero-pending-value { font-size: 30px; }
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
            style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--fb)', fontSize: 13 }}>
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
              const grad  = isCC
                ? 'linear-gradient(135deg,#1a0a4f,#6c47ff)'
                : 'linear-gradient(135deg,#064e3b,#0aaf6e)';
              return (
                <div key={a.id} style={{ background: grad, borderRadius: 16, padding: '14px 16px', minWidth: 170, flex: '0 0 auto', color: 'white', boxShadow: '0 4px 16px rgba(13,15,26,0.15)' }}>
                  <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>{isCC ? '💳' : '🏦'} {a.type === 'credit_card' ? 'Credit' : 'Savings'}</div>
                  <div style={{ fontFamily: 'var(--fh)', fontSize: 14, fontWeight: 800, marginBottom: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                  {limit ? (
                    <>
                      <div className="limit-bar-track" style={{ marginBottom: 6 }}>
                        <div className="limit-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ opacity: 0.7 }}>Used {Math.round(pct)}%</span>
                        <span style={{ fontWeight: 700 }}>{fmt(Math.max(0, avail))} free</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontFamily: 'var(--fh)', fontSize: 18, fontWeight: 800 }}>{fmt(net)} <span style={{ fontSize: 11, opacity: 0.7 }}>spent</span></div>
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
                <div className="activity-ico" style={{ background: f.color ? f.color + '22' : 'var(--purplebg)' }}>
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
          <div className="activity-card"><div className="empty" style={{ padding: '32px 20px' }}><div className="empty-icon">💳</div><div className="empty-text">No transactions yet</div><div className="empty-sub">Tap + to add your first one</div></div></div>
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
          <IcoPlus /> Add Transaction
        </button>
      </div>

      {/* Filters */}
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
        <input className="filter-select filter-date" type="date" value={filterFrom} onChange={e => setFrom(e.target.value)} placeholder="From" title="From date" />
        <input className="filter-select filter-date" type="date" value={filterTo}   onChange={e => setTo(e.target.value)} placeholder="To"   title="To date" />
        {hasFilter && <button className="filter-clear" onClick={clearFilters}>Clear filters</button>}
      </div>

      {filtered.length === 0 ? (
        <div className="table-card"><div className="empty"><div className="empty-icon">💳</div><div className="empty-text">No transactions found</div><div className="empty-sub">Try adjusting filters or add a new one</div></div></div>
      ) : (
        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Date</th><th>Type</th><th>Friend</th><th>Account</th><th>Amount</th><th>Note</th><th>Actions</th></tr>
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
                      <td className={t.type === 'expense' ? 'td-red' : 'td-green'}>
                        {t.type === 'expense' ? '-' : '+'}{fmt(t.amount)}
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
    category:  existing?.category  || 'friend',   // 'friend' | 'personal'
    friendId:  existing?.friendId  || '',
    accountId: existing?.accountId || '',
    amount:    existing?.amount    ? String(existing.amount) : '',
    date:      existing?.date      || today(),
    note:      existing?.note      || '',
  });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  // When switching to personal, clear friendId; when payment always needs friend
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

          {/* Category — Friend or Personal */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[['friend','👥 For a Friend'],['personal','🧾 Personal Expense']].map(([cat, label]) => (
              <button key={cat} type="button" onClick={() => setCategory(cat)}
                className="btn btn-sm"
                style={{ flex: 1, fontSize: 12,
                  background: form.category === cat ? 'var(--purple)' : 'var(--bg2)',
                  color: form.category === cat ? 'white' : 'var(--ink3)',
                  border: '1.5px solid ' + (form.category === cat ? 'transparent' : 'var(--border)') }}>
                {label}
              </button>
            ))}
          </div>

          {/* Type toggle — only for friend transactions */}
          {!isPersonal && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
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
            {/* Friend selector — only for friend transactions */}
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

          {isPersonal && (
            <div className="form-row" style={{ marginBottom: 0 }}>
              <div className="field">
                <label className="field-label">Category / Note</label>
                <input className="field-input" placeholder="e.g. Groceries, Netflix, Petrol…" value={form.note} onChange={set('note')} />
              </div>
            </div>
          )}
          {!isPersonal && (
            <div className="form-row" style={{ marginBottom: 0 }}>
              <div className="field">
                <label className="field-label">Note (optional)</label>
                <input className="field-input" placeholder="e.g. Dinner at restaurant" value={form.note} onChange={set('note')} />
              </div>
            </div>
          )}

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
function Friends({ user, friends, transactions, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [editFriend, setEditFriend] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openAdd = () => { setForm({ name: '', phone: '' }); setEditFriend(null); setShowForm(true); };
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

  // Per-friend stats
  const withStats = friends.map(f => {
    const given    = transactions.filter(t => t.friendId === f.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const received = transactions.filter(t => t.friendId === f.id && t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
    return { ...f, given, received, balance: given - received };
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
          {withStats.map(f => (
            <div key={f.id} className="friend-card">
              <div className="friend-head">
                <div className="friend-avatar" style={{ background: f.color || colorFor(f.name) }}>{initials(f.name)}</div>
                <div>
                  <div className="friend-name">{f.name}</div>
                  {f.phone && <div className="friend-phone">{f.phone}</div>}
                </div>
              </div>
              <div className="friend-stats">
                <div className="fstat">
                  <div className="fstat-label">Given</div>
                  <div className="fstat-value red">{fmt(f.given)}</div>
                </div>
                <div className="fstat">
                  <div className="fstat-label">Received</div>
                  <div className="fstat-value green">{fmt(f.received)}</div>
                </div>
                <div className="fstat" style={{ gridColumn: 'span 2', background: f.balance > 0 ? 'var(--redbg)' : f.balance < 0 ? 'var(--greenbg)' : 'var(--bg)' }}>
                  <div className="fstat-label">{f.balance > 0 ? 'They owe you' : f.balance < 0 ? 'You owe them' : 'Status'}</div>
                  <div className={`fstat-value ${f.balance > 0 ? 'red' : f.balance < 0 ? 'green' : ''}`} style={{ fontSize: 16 }}>
                    {f.balance === 0 ? '✅ Settled' : fmt(Math.abs(f.balance))}
                  </div>
                </div>
              </div>
              <div className="friend-actions">
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEdit(f)}><IcoEdit /> Edit</button>
                <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => deleteFriend(f)}><IcoTrash /> Remove</button>
              </div>
            </div>
          ))}
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
  const [expandAcc, setExpandAcc] = useState(null); // which account's friend breakdown is open
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

    // Per-friend breakdown for this account
    const friendBreakdown = friends.map(f => {
      const spent    = accTxns.filter(t => t.friendId === f.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
      const received = accTxns.filter(t => t.friendId === f.id && t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
      return { ...f, spent, received, balance: spent - received };
    }).filter(f => f.spent > 0 || f.received > 0);

    // Credit card: available = limit - netSpent (spent - received back)
    const netSpent = totalSpent - totalBack;
    const available = a.type === 'credit_card' && a.limit ? a.limit - netSpent : null;
    const usedPct   = a.type === 'credit_card' && a.limit ? Math.min(100, (netSpent / a.limit) * 100) : 0;

    // Bank account: remaining = balance - net spent
    const remaining = a.type === 'bank_account' && a.balance != null ? a.balance - netSpent : null;
    const balPct    = a.type === 'bank_account' && a.balance ? Math.min(100, (netSpent / a.balance) * 100) : 0;

    return { ...a, totalSpent, totalBack, netSpent, available, usedPct, remaining, balPct, friendBreakdown, txnCount: accTxns.length };
  });

  // Bar color based on usage
  const barColor = (pct) => pct >= 90 ? 'var(--red)' : pct >= 70 ? 'var(--amber)' : 'var(--purple)';

  return (
    <div>
      <div className="page-head">
        <div><div className="page-title">Accounts</div><div className="page-sub">{accounts.length} linked</div></div>
        <button className="btn btn-primary" onClick={openAdd}><IcoPlus /> Add Account</button>
      </div>

      {showForm && (
        <div className="form-section" style={{ marginBottom: 24 }}>
          <div className="form-title">{editAcc ? 'Edit Account' : 'Add Account'}</div>
          <div className="form-sub">Add a credit card or bank account you use for friend expenses</div>
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
                  <input className="field-input" type="number" placeholder="e.g. 100000" min="0"
                    value={form.limit} onChange={set('limit')} />
                  <span style={{ fontSize: 11, color: 'var(--ink4)', marginTop: 3 }}>
                    Available credit auto-updates when you add expenses
                  </span>
                </div>
              </div>
            )}
            {form.type === 'bank_account' && (
              <div className="form-row" style={{ marginBottom: 14 }}>
                <div className="field">
                  <label className="field-label">Current Balance (₹)</label>
                  <input className="field-input" type="number" placeholder="e.g. 50000" min="0"
                    value={form.balance} onChange={set('balance')} />
                  <span style={{ fontSize: 11, color: 'var(--ink4)', marginTop: 3 }}>
                    Remaining balance auto-reduces when you add expenses
                  </span>
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
        <div className="table-card"><div className="empty"><div className="empty-icon">🏦</div><div className="empty-text">No accounts yet</div><div className="empty-sub">Add the card or account you use for friend expenses</div></div></div>
      ) : (
        <div className="account-grid">
          {withStats.map(a => {
            const grad = a.type === 'credit_card'
              ? `linear-gradient(135deg, ${a.color || '#1a0a4f'} 0%, #6c47ff 100%)`
              : `linear-gradient(135deg, #064e3b 0%, ${a.color || '#0aaf6e'} 100%)`;
            return (
            <div key={a.id}>
              <div className="account-card" style={{ background: grad }}>
                <div className="account-card-inner">
                  <div className="account-chip">
                    {a.type === 'credit_card' ? '💳 Credit Card' : '🏦 Savings Account'}
                  </div>
                  <div className="account-name">{a.name}</div>
                  <div className="account-sub">{a.txnCount} transaction{a.txnCount !== 1 ? 's' : ''}</div>

                  {/* Credit Card Limit Bar */}
                  {a.type === 'credit_card' && a.limit ? (
                    <div>
                      <div className="limit-row">
                        <span>Used: {fmt(a.netSpent)}</span>
                        <span>{Math.round(a.usedPct)}% of limit</span>
                      </div>
                      <div className="limit-bar-track">
                        <div className="limit-bar-fill" style={{ width: `${a.usedPct}%` }} />
                      </div>
                      <div className="limit-row" style={{ marginTop: 4 }}>
                        <span>Limit: {fmt(a.limit)}</span>
                        <span className="limit-available">{a.available < 0 ? '⚠️ Over limit' : `${fmt(Math.max(0, a.available))} free`}</span>
                      </div>
                    </div>
                  ) : a.type === 'bank_account' && a.balance != null ? (
                    <div>
                      <div className="limit-row"><span>Spent: {fmt(a.netSpent)}</span><span>{Math.round(a.balPct)}% of balance</span></div>
                      <div className="limit-bar-track"><div className="limit-bar-fill" style={{ width: `${a.balPct}%` }} /></div>
                      <div className="limit-row" style={{ marginTop: 4 }}><span>Total: {fmt(a.balance)}</span><span className="limit-available">{fmt(Math.max(0, a.remaining))} left</span></div>
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
                  <button className="account-action-btn" onClick={() => deleteAcc(a)}>🗑️ Delete</button>
                </div>
              </div>

              {/* Friend × Account Breakdown Panel */}
              {expandAcc === a.id && (
                <div className="breakdown-panel">
                  <div style={{ padding: '14px 16px 8px', fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>
                    👥 Who Used This Account
                  </div>
                  {a.friendBreakdown.length === 0 ? (
                    <div style={{ padding: '14px 16px 16px', fontSize: 13, color: 'var(--ink3)' }}>No transactions yet.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="breakdown-table">
                        <thead><tr><th>Friend</th><th>Borrowed</th><th>Paid Back</th><th>Balance</th></tr></thead>
                        <tbody>
                          {a.friendBreakdown.map(f => (
                            <tr key={f.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div className="friend-avatar" style={{ width: 28, height: 28, fontSize: 11, background: f.color || colorFor(f.name) }}>{initials(f.name)}</div>
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
          );})}
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

  // Filter transactions for selected account + date range
  let stmtTxns = transactions.filter(t => t.accountId === selAcc);
  if (fromDate) stmtTxns = stmtTxns.filter(t => t.date >= fromDate);
  if (toDate)   stmtTxns = stmtTxns.filter(t => t.date <= toDate);
  stmtTxns = stmtTxns.sort((a, b) => b.date.localeCompare(a.date));

  // Summary totals for the period
  const totalFriendExpense = stmtTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const totalPersonal      = stmtTxns.filter(t => t.type === 'personal').reduce((s, t) => s + Number(t.amount), 0);
  const totalReceived      = stmtTxns.filter(t => t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
  const totalDebited       = totalFriendExpense + totalPersonal;
  const netFlow            = totalReceived - totalDebited;

  // Per-friend breakdown for this period
  const friendBreakdown = friends.map(f => {
    const spent    = stmtTxns.filter(t => t.friendId === f.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const received = stmtTxns.filter(t => t.friendId === f.id && t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
    return { ...f, spent, received, balance: spent - received };
  }).filter(f => f.spent > 0 || f.received > 0);

  const isCC = account?.type === 'credit_card';

  return (
    <div>
      <div className="page-head">
        <div><div className="page-title">Account Statement</div>
          <div className="page-sub">Full breakdown of any card or account for any period</div>
        </div>
      </div>

      {/* Controls */}
      <div className="form-section" style={{ marginBottom: 22 }}>
        <div className="form-row g2" style={{ marginBottom: 0 }}>
          <div className="field">
            <label className="field-label">Select Account *</label>
            <select className="field-input" value={selAcc} onChange={e => setSelAcc(e.target.value)}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.type === 'credit_card' ? '💳' : '🏦'} {a.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">From Date</label>
            <input className="field-input" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">To Date</label>
            <input className="field-input" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
        </div>
        {(fromDate || toDate) && (
          <button className="filter-clear" style={{ marginTop: 10 }}
            onClick={() => { setFromDate(''); setToDate(''); }}>
            Clear date filter
          </button>
        )}
      </div>

      {!account ? (
        <div className="table-card"><div className="empty"><div className="empty-icon">🏦</div><div className="empty-text">No accounts yet</div></div></div>
      ) : (
        <>
          {/* Statement Header Card */}
          <div className={`stmt-header ${isCC ? 'cc' : 'bank'}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <span style={{ fontSize: 28 }}>{isCC ? '💳' : '🏦'}</span>
              <div>
                <div style={{ fontFamily: 'var(--fh)', fontSize: 22, fontWeight: 800 }}>{account.name}</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                  {fromDate || toDate
                    ? `${fromDate ? fmtDate(fromDate) : 'Beginning'} → ${toDate ? fmtDate(toDate) : 'Today'}`
                    : 'All time'} · {stmtTxns.length} transaction{stmtTxns.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            {account.limit && isCC && (
              <div style={{ marginTop: 10, marginBottom: 6 }}>
                <div className="limit-bar-track" style={{ background: 'rgba(255,255,255,0.2)', marginBottom: 6 }}>
                  <div className="limit-bar-fill" style={{
                    width: `${Math.min(100, (totalDebited / account.limit) * 100)}%`,
                    background: 'white'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.85 }}>
                  <span>Limit: {fmt(account.limit)}</span>
                  <span>Available: {fmt(Math.max(0, account.limit - totalDebited))}</span>
                </div>
              </div>
            )}
            <div className="stmt-total-row">
              <div className="stmt-total-box">
                <div className="stmt-total-label">Friend Expenses</div>
                <div className="stmt-total-value">{fmt(totalFriendExpense)}</div>
              </div>
              <div className="stmt-total-box">
                <div className="stmt-total-label">Personal Spend</div>
                <div className="stmt-total-value">{fmt(totalPersonal)}</div>
              </div>
              <div className="stmt-total-box">
                <div className="stmt-total-label">Received Back</div>
                <div className="stmt-total-value">{fmt(totalReceived)}</div>
              </div>
              <div className="stmt-total-box" style={{ background: 'rgba(255,255,255,0.25)' }}>
                <div className="stmt-total-label">Net Outflow</div>
                <div className="stmt-total-value">{fmt(totalDebited - totalReceived)}</div>
              </div>
            </div>
          </div>

          {/* Friend Breakdown for this period */}
          {friendBreakdown.length > 0 && (
            <div className="table-card" style={{ marginBottom: 20 }}>
              <div style={{ padding: '16px 18px 8px', fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15 }}>
                Friend Breakdown — This Period
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="breakdown-table">
                  <thead>
                    <tr><th>Friend</th><th>Borrowed via this account</th><th>Paid Back</th><th>Outstanding</th></tr>
                  </thead>
                  <tbody>
                    {friendBreakdown.map(f => (
                      <tr key={f.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="friend-avatar" style={{ width: 30, height: 30, fontSize: 12, background: f.color || colorFor(f.name) }}>{initials(f.name)}</div>
                            <span style={{ fontWeight: 600 }}>{f.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--red)', fontWeight: 600 }}>{fmt(f.spent)}</td>
                        <td style={{ color: 'var(--green)', fontWeight: 600 }}>{fmt(f.received)}</td>
                        <td>
                          <span className={`badge ${f.balance > 0 ? 'badge-red' : f.balance < 0 ? 'badge-green' : 'badge-gray'}`}>
                            {f.balance > 0 ? `Owes ${fmt(f.balance)}` : f.balance < 0 ? `You owe ${fmt(Math.abs(f.balance))}` : '✓ Settled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Full Transaction List */}
          {stmtTxns.length === 0 ? (
            <div className="table-card"><div className="empty"><div className="empty-icon">📋</div><div className="empty-text">No transactions in this period</div><div className="empty-sub">Try adjusting the date range</div></div></div>
          ) : (
            <div className="table-card">
              <div style={{ padding: '16px 18px 8px', fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15 }}>
                All Transactions
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Type</th><th>Who</th><th>Amount</th><th>Note</th></tr>
                  </thead>
                  <tbody>
                    {stmtTxns.map(t => {
                      const f = friendMap[t.friendId];
                      return (
                        <tr key={t.id}>
                          <td className="td-muted">{fmtDate(t.date)}</td>
                          <td>
                            {t.type === 'personal' ? <span className="txn-personal">Personal</span>
                             : t.type === 'expense'  ? <span className="txn-expense">Friend Exp</span>
                             : <span className="txn-payment">Payment In</span>}
                          </td>
                          <td>
                            {t.type === 'personal' ? (
                              <span style={{ color: 'var(--amber)', fontWeight: 600, fontSize: 13 }}>🧾 Self</span>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                {f && <div className="friend-avatar" style={{ width: 26, height: 26, fontSize: 10, background: f?.color || colorFor(f?.name || '') }}>{initials(f?.name)}</div>}
                                <span className="td-bold">{f?.name || '—'}</span>
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

  // Per-friend bar chart data
  const friendChart = friends.map(f => ({
    name:     f.name.split(' ')[0],
    Given:    transactions.filter(t => t.friendId === f.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    Received: transactions.filter(t => t.friendId === f.id && t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0),
  })).filter(d => d.Given > 0 || d.Received > 0);

  // Per-account pie chart
  const accountChart = accounts.map(a => ({
    name:  a.name,
    value: transactions.filter(t => t.accountId === a.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
  })).filter(d => d.value > 0);

  // Monthly trend
  const monthlyMap = {};
  transactions.forEach(t => {
    if (!t.date) return;
    const key = t.date.slice(0, 7); // YYYY-MM
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, Given: 0, Received: 0 };
    if (t.type === 'expense') monthlyMap[key].Given    += Number(t.amount);
    if (t.type === 'payment') monthlyMap[key].Received += Number(t.amount);
  });
  const monthlyData = Object.values(monthlyMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(d => ({ ...d, month: new Date(d.month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) }));

  const COLORS = ['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed'];
  const axisStyle = { fill: '#7a7670', fontSize: 11, fontFamily: 'Plus Jakarta Sans' };
  const fmtY = v => '₹' + (v >= 1e5 ? (v/1e5).toFixed(1)+'L' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v);

  // Top stats
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
          {/* Monthly trend */}
          {monthlyData.length > 0 && (
            <div className="chart-card">
              <div className="chart-title">Monthly Trend — Given vs Received</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 10, left: 4, bottom: 0 }}>
                  <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={fmtY} tick={axisStyle} axisLine={false} tickLine={false} width={52} />
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#7a7670' }} />
                  <Bar dataKey="Given"    fill="#ef4444" radius={[4,4,0,0]} />
                  <Bar dataKey="Received" fill="#16a34a" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Friend chart */}
            {friendChart.length > 0 && (
              <div className="chart-card">
                <div className="chart-title">Per Friend — Given vs Received</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={friendChart} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmtY} tick={axisStyle} axisLine={false} tickLine={false} width={52} />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Given"    fill="#ef4444" radius={[4,4,0,0]} />
                    <Bar dataKey="Received" fill="#16a34a" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Account pie */}
            {accountChart.length > 0 && (
              <div className="chart-card">
                <div className="chart-title">Spending by Account</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={accountChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {accountChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => [fmt(v), 'Spent']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 4 }}>
            <div className="table-card">
              <div style={{ padding: '16px 18px 8px', fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15 }}>Balance Summary</div>
              <div style={{ padding: '0 0 8px' }}>
                {topOwing.map(f => (
                  <div key={f.name} className="insight-row" style={{ padding: '10px 18px' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</span>
                    <span className={`badge ${f.balance > 0 ? 'badge-red' : f.balance < 0 ? 'badge-green' : 'badge-gray'}`}>
                      {f.balance > 0 ? `Owes ${fmt(f.balance)}` : f.balance < 0 ? `You owe ${fmt(Math.abs(f.balance))}` : 'Settled ✓'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="table-card">
              <div style={{ padding: '16px 18px 8px', fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15 }}>Account Usage</div>
              <div style={{ padding: '0 0 8px' }}>
                {topAcc.map(a => (
                  <div key={a.name} className="insight-row" style={{ padding: '10px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{a.type === 'credit_card' ? '💳' : '🏦'}</span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</span>
                    </div>
                    <span className="badge badge-indigo">{fmt(a.spent)}</span>
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
