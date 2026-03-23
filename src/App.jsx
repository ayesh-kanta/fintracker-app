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
const CSS = `
:root {
  --bg:       #f8f7f4;
  --bg2:      #f0eeea;
  --bg3:      #e8e5df;
  --card:     #ffffff;
  --border:   #e5e2db;
  --border2:  #d4d0c8;
  --ink:      #0f0f0f;
  --ink2:     #3a3832;
  --ink3:     #7a7670;
  --ink4:     #b0aca4;
  --indigo:   #4f46e5;
  --indigo2:  #6366f1;
  --indigobg: rgba(79,70,229,0.08);
  --indigobrd: rgba(79,70,229,0.2);
  --green:    #16a34a;
  --greenbg:  rgba(22,163,74,0.08);
  --greenbrd: rgba(22,163,74,0.2);
  --red:      #dc2626;
  --redbg:    rgba(220,38,38,0.08);
  --redbrd:   rgba(220,38,38,0.2);
  --amber:    #d97706;
  --amberbg:  rgba(217,119,6,0.08);
  --amberbrd: rgba(217,119,6,0.2);
  --radius:   14px;
  --radius-sm:9px;
  --shadow:   0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  --shadow-md:0 4px 24px rgba(0,0,0,0.1);
  --fh: 'Sora', system-ui, sans-serif;
  --fb: 'Plus Jakarta Sans', system-ui, sans-serif;
}
*, *::before, *::after { box-sizing: border-box; }
body { background: var(--bg); font-family: var(--fb); color: var(--ink); }

/* ── LAYOUT ── */
.ft-app { min-height: 100vh; }
.shell { display: flex; flex-direction: column; min-height: 100vh; background: var(--bg); }
.topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(248,247,244,0.92); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  height: 60px; display: flex; align-items: center;
  justify-content: space-between; padding: 0 20px; gap: 12px;
}
.topbar-brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.brand-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: var(--indigo); display: flex; align-items: center;
  justify-content: center; font-size: 16px; flex-shrink: 0;
}
.brand-name { font-family: var(--fh); font-size: 18px; font-weight: 700; color: var(--ink); }
.brand-sub  { font-size: 10px; color: var(--ink3); letter-spacing: 0.06em; text-transform: uppercase; }
.topbar-center { flex: 1; display: flex; justify-content: center; }
.topbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.user-chip {
  display: flex; align-items: center; gap: 8px;
  background: var(--card); border: 1px solid var(--border);
  border-radius: 40px; padding: 5px 12px 5px 6px;
}
.user-avatar {
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--indigo); display: flex; align-items: center;
  justify-content: center; font-size: 11px; font-weight: 700; color: white;
}
.user-name { font-size: 13px; font-weight: 500; color: var(--ink2); }
.main { flex: 1; padding: 24px 20px 72px; max-width: 1100px; margin: 0 auto; width: 100%; }

/* ── NAV TABS ── */
.nav-tabs {
  display: flex; gap: 2px; background: var(--bg2); border: 1px solid var(--border);
  border-radius: 12px; padding: 4px; margin-bottom: 28px; overflow-x: auto;
  scrollbar-width: none;
}
.nav-tabs::-webkit-scrollbar { display: none; }
.nav-tab {
  flex: 1; min-width: max-content; padding: 8px 16px; border: none;
  border-radius: 9px; cursor: pointer; font-family: var(--fb);
  font-size: 13px; font-weight: 500; background: transparent;
  color: var(--ink3); transition: all 0.18s; white-space: nowrap;
  display: flex; align-items: center; gap: 6px; justify-content: center;
}
.nav-tab:hover { color: var(--ink); background: rgba(0,0,0,0.04); }
.nav-tab.active { background: var(--card); color: var(--indigo); font-weight: 600; box-shadow: var(--shadow); }

/* ── CARDS ── */
.cards-grid { display: grid; gap: 14px; margin-bottom: 24px; }
.cols-4 { grid-template-columns: repeat(4, 1fr); }
.cols-3 { grid-template-columns: repeat(3, 1fr); }
.cols-2 { grid-template-columns: repeat(2, 1fr); }
.stat-card {
  background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 20px; box-shadow: var(--shadow); transition: box-shadow 0.2s, border-color 0.2s;
}
.stat-card:hover { box-shadow: var(--shadow-md); border-color: var(--border2); }
.stat-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 14px; }
.stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink3); margin-bottom: 6px; }
.stat-value { font-family: var(--fh); font-size: 26px; font-weight: 700; color: var(--ink); line-height: 1; }
.stat-sub { font-size: 12px; color: var(--ink3); margin-top: 4px; }
.stat-value.green { color: var(--green); }
.stat-value.red   { color: var(--red);   }
.stat-value.indigo{ color: var(--indigo);}

/* ── PAGE HEADER ── */
.page-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; gap: 12px; flex-wrap: wrap; }
.page-title { font-family: var(--fh); font-size: 24px; font-weight: 700; color: var(--ink); }
.page-sub   { font-size: 13px; color: var(--ink3); margin-top: 3px; }

/* ── BUTTONS ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 18px; border-radius: var(--radius-sm); font-family: var(--fb);
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s;
  border: none; white-space: nowrap; letter-spacing: 0.01em;
}
.btn-primary { background: var(--indigo); color: white; }
.btn-primary:hover { background: var(--indigo2); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(79,70,229,0.35); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-ghost { background: transparent; color: var(--ink2); border: 1px solid var(--border); }
.btn-ghost:hover { background: var(--bg2); border-color: var(--border2); }
.btn-danger { background: var(--redbg); color: var(--red); border: 1px solid var(--redbrd); }
.btn-danger:hover { background: rgba(220,38,38,0.15); }
.btn-success { background: var(--greenbg); color: var(--green); border: 1px solid var(--greenbrd); }
.btn-success:hover { background: rgba(22,163,74,0.15); }
.btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 7px; }
.btn-icon { padding: 7px; border-radius: 8px; }
.btn-full { width: 100%; justify-content: center; }

/* ── FORM ── */
.form-section { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow); max-width: 560px; }
.form-title { font-family: var(--fh); font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
.form-sub   { font-size: 13px; color: var(--ink3); margin-bottom: 22px; }
.form-row   { display: grid; gap: 14px; margin-bottom: 14px; }
.form-row.g2{ grid-template-columns: 1fr 1fr; }
.field      { display: flex; flex-direction: column; gap: 5px; }
.field-label{ font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--ink2); }
.field-input{
  background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  padding: 10px 13px; font-size: 14px; color: var(--ink); font-family: var(--fb);
  transition: border-color 0.18s, box-shadow 0.18s; outline: none; width: 100%;
}
.field-input:focus { border-color: var(--indigo); box-shadow: 0 0 0 3px var(--indigobg); }
.field-input::placeholder { color: var(--ink4); }
select.field-input { cursor: pointer; }
select.field-input option { background: white; color: var(--ink); }
.input-wrap { position: relative; }
.input-wrap .field-input { padding-right: 42px; }
.eye-btn { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--ink3); padding: 4px; display: flex; align-items: center; transition: color 0.18s; }
.eye-btn:hover { color: var(--indigo); }

/* ── TABLE ── */
.table-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 560px; }
thead tr { background: var(--bg2); border-bottom: 1px solid var(--border); }
th { padding: 11px 15px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink3); white-space: nowrap; }
td { padding: 13px 15px; font-size: 13.5px; border-bottom: 1px solid var(--border); vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: var(--bg); }
.td-bold  { font-weight: 600; color: var(--ink); }
.td-muted { color: var(--ink3); font-size: 13px; }
.td-green { color: var(--green); font-weight: 600; }
.td-red   { color: var(--red); font-weight: 600; }
.td-indigo{ color: var(--indigo); font-weight: 600; }

/* ── BADGE ── */
.badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.badge-green  { background: var(--greenbg);  color: var(--green);  border: 1px solid var(--greenbrd); }
.badge-red    { background: var(--redbg);    color: var(--red);    border: 1px solid var(--redbrd); }
.badge-indigo { background: var(--indigobg); color: var(--indigo); border: 1px solid var(--indigobrd); }
.badge-amber  { background: var(--amberbg);  color: var(--amber);  border: 1px solid var(--amberbrd); }
.badge-gray   { background: var(--bg2); color: var(--ink3); border: 1px solid var(--border); }

/* ── FRIEND CARD ── */
.friend-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.friend-card {
  background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 20px; box-shadow: var(--shadow); transition: all 0.18s; cursor: default;
}
.friend-card:hover { box-shadow: var(--shadow-md); border-color: var(--border2); transform: translateY(-2px); }
.friend-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.friend-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--fh); font-size: 16px; font-weight: 700; color: white; flex-shrink: 0; }
.friend-name { font-family: var(--fh); font-size: 16px; font-weight: 700; color: var(--ink); }
.friend-phone{ font-size: 12px; color: var(--ink3); margin-top: 2px; }
.friend-stats{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.fstat { background: var(--bg); border-radius: var(--radius-sm); padding: 10px 12px; }
.fstat-label { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink4); margin-bottom: 3px; }
.fstat-value { font-family: var(--fh); font-size: 14px; font-weight: 700; color: var(--ink); }
.fstat-value.green  { color: var(--green); }
.fstat-value.red    { color: var(--red); }
.fstat-value.indigo { color: var(--indigo); }
.friend-actions { display: flex; gap: 6px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); }

/* ── ACCOUNT CARD ── */
.account-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
.account-card {
  background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 20px; box-shadow: var(--shadow); transition: all 0.18s;
}
.account-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.account-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 14px; }
.account-name { font-family: var(--fh); font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
.account-type { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 14px; }
.account-spent { font-family: var(--fh); font-size: 22px; font-weight: 700; color: var(--ink); }
.account-spent-label { font-size: 11px; color: var(--ink3); margin-top: 2px; }
.limit-bar-track { background: var(--bg2); border-radius: 6px; height: 7px; overflow: hidden; margin: 10px 0 5px; }
.limit-bar-fill  { height: 100%; border-radius: 6px; transition: width 0.5s ease; }
.limit-row { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink3); margin-bottom: 4px; }
.limit-available { font-size: 13px; font-weight: 700; }
/* Friend × Account breakdown table */
.breakdown-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.breakdown-table th { padding: 9px 14px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--ink3); background: var(--bg2); border-bottom: 1px solid var(--border); white-space: nowrap; }
.breakdown-table td { padding: 11px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.breakdown-table tr:last-child td { border-bottom: none; }
.breakdown-table tbody tr:hover { background: var(--bg); }
.account-actions { display: flex; gap: 6px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); }

/* ── LIMIT / BALANCE BAR ── */
.limit-bar-track { background: var(--bg2); border-radius: 6px; height: 7px; overflow: hidden; margin: 8px 0 4px; }
.limit-bar-fill  { height: 100%; border-radius: 6px; transition: width 0.5s ease; }
.limit-row { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink3); margin-bottom: 2px; }
.limit-label { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink4); margin-bottom: 4px; margin-top: 12px; }

/* ── FILTER BAR ── */
.filter-bar { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; align-items: center; }
.filter-select {
  background: var(--card); border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  padding: 8px 13px; font-size: 13px; font-family: var(--fb); color: var(--ink2);
  outline: none; cursor: pointer; transition: border-color 0.18s;
}
.filter-select:focus { border-color: var(--indigo); }
.filter-date { padding: 8px 13px; }
.filter-clear { font-size: 12px; color: var(--ink3); cursor: pointer; text-decoration: underline; background: none; border: none; font-family: var(--fb); }
.filter-clear:hover { color: var(--red); }

/* ── LOGIN PAGE ── */
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: var(--bg); }
.login-bg {
  position: fixed; inset: 0; pointer-events: none; overflow: hidden;
}
.login-blob {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.18;
}
.login-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 20px;
  padding: 44px 40px; width: 100%; max-width: 400px; box-shadow: var(--shadow-md);
  position: relative; z-index: 1;
}
.login-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
.login-logo-icon { width: 48px; height: 48px; border-radius: 14px; background: var(--indigo); display: flex; align-items: center; justify-content: center; font-size: 24px; }
.login-logo-text { font-family: var(--fh); font-size: 26px; font-weight: 800; color: var(--ink); }
.login-logo-sub  { font-size: 12px; color: var(--ink3); }
.login-title { font-family: var(--fh); font-size: 22px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
.login-sub   { font-size: 13px; color: var(--ink3); margin-bottom: 28px; }
.login-error { background: var(--redbg); border: 1px solid var(--redbrd); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: var(--red); margin-bottom: 16px; }

/* ── EMPTY STATE ── */
.empty { padding: 56px 20px; text-align: center; }
.empty-icon { font-size: 44px; margin-bottom: 12px; opacity: 0.3; }
.empty-text { font-size: 15px; color: var(--ink3); font-weight: 500; }
.empty-sub  { font-size: 13px; color: var(--ink4); margin-top: 4px; }

/* ── TOAST ── */
.toast {
  position: fixed; bottom: 22px; right: 22px; z-index: 9999;
  background: var(--ink); color: white; border-radius: 11px;
  padding: 13px 20px; font-size: 13px; font-weight: 500;
  box-shadow: var(--shadow-md); animation: slideUp 0.28s ease;
  max-width: 300px; display: flex; align-items: center; gap: 8px;
}
.toast.success { background: #166534; }
.toast.error   { background: #991b1b; }
@keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

/* ── LOADING ── */
.loader { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 60px 20px; color: var(--ink3); font-size: 14px; }
.spinner { width: 24px; height: 24px; border: 2px solid var(--border); border-top-color: var(--indigo); border-radius: 50%; animation: spin 0.65s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── DIVIDER ── */
.divider { height: 1px; background: var(--border); margin: 20px 0; }

/* ── MODAL ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35);
  backdrop-filter: blur(4px); z-index: 200;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal {
  background: var(--card); border-radius: 18px; padding: 28px;
  width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: modalIn 0.22s ease;
}
@keyframes modalIn { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.modal-title { font-family: var(--fh); font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
.modal-sub   { font-size: 13px; color: var(--ink3); margin-bottom: 22px; }
.modal-actions { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; }

/* ── CHART CARD ── */
.chart-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 22px; box-shadow: var(--shadow); margin-bottom: 20px; }
.chart-title { font-family: var(--fh); font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 18px; }
.recharts-tooltip-wrapper .custom-tip { background: var(--ink); color: white; padding: 10px 14px; border-radius: 9px; font-size: 13px; }
.custom-tip-label { font-size: 11px; opacity: 0.7; margin-bottom: 3px; }
.custom-tip-val   { font-weight: 700; font-size: 15px; }

/* ── BALANCE CHIP ── */
.bal-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;
}

/* ── TXN TYPE CHIP ── */
.txn-expense { background: var(--redbg); color: var(--red); border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; }
.txn-payment { background: var(--greenbg); color: var(--green); border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; }

/* ── INSIGHT ROW ── */
.insight-row { display: flex; align-items: center; justify-content: space-between; padding: 13px 0; border-bottom: 1px solid var(--border); }
.insight-row:last-child { border-bottom: none; }

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .cols-4 { grid-template-columns: repeat(2, 1fr); }
  .main   { padding: 20px 16px 60px; }
  .topbar { padding: 0 14px; }
}
@media (max-width: 600px) {
  .cols-4, .cols-3 { grid-template-columns: repeat(2, 1fr); }
  .cols-2          { grid-template-columns: 1fr 1fr; }
  .login-card      { padding: 32px 22px; }
  .form-section    { padding: 20px; }
  .form-row.g2     { grid-template-columns: 1fr; }
  .stat-value      { font-size: 20px; }
  .page-title      { font-size: 20px; }
  .brand-name      { font-size: 16px; }
  .user-name       { display: none; }
  .toast           { left: 16px; right: 16px; bottom: 16px; }
  .modal           { padding: 22px; }
}
@media (max-width: 400px) {
  .cols-4, .cols-3, .cols-2 { grid-template-columns: 1fr 1fr; }
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
            style={{ background: 'none', border: 'none', color: 'var(--indigo)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--fb)', fontSize: 13 }}>
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
  const [tab, setTab]             = useState('dashboard');
  const [friends, setFriends]     = useState([]);
  const [accounts, setAccounts]   = useState([]);
  const [transactions, setTxns]   = useState([]);
  const [showToast, toastEl]      = useToast();

  // Real-time listeners
  useEffect(() => {
    const qF = query(collection(db, 'friends'),     where('userId', '==', user.id));
    const qA = query(collection(db, 'accounts'),    where('userId', '==', user.id));
    const qT = query(collection(db, 'transactions'),where('userId', '==', user.id));
    const u1 = onSnapshot(qF, s => setFriends(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(qA, s => setAccounts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(qT, s => setTxns(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); u3(); };
  }, [user.id]);

  const tabs = [
    { id: 'dashboard',    label: 'Dashboard',     icon: '📊' },
    { id: 'transactions', label: 'Transactions',  icon: '💳' },
    { id: 'friends',      label: 'Friends',       icon: '👥' },
    { id: 'accounts',     label: 'Accounts',      icon: '🏦' },
    { id: 'insights',     label: 'Insights',      icon: '🔍' },
  ];

  return (
    <div className="shell">
      {toastEl}
      <div className="topbar">
        <div className="topbar-brand">
          <div className="brand-icon">💸</div>
          <div>
            <div className="brand-name">FinTrack</div>
          </div>
        </div>
        <div className="topbar-right">
          <div className="user-chip">
            <div className="user-avatar">{initials(user.name)}</div>
            <span className="user-name">{user.name}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      <div className="main">
        <div className="nav-tabs">
          {tabs.map(t => (
            <button key={t.id} className={`nav-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {tab === 'dashboard'    && <Dashboard    user={user} friends={friends} accounts={accounts} transactions={transactions} setTab={setTab} />}
        {tab === 'transactions' && <Transactions user={user} friends={friends} accounts={accounts} transactions={transactions} showToast={showToast} />}
        {tab === 'friends'      && <Friends      user={user} friends={friends} transactions={transactions} showToast={showToast} />}
        {tab === 'accounts'     && <Accounts     user={user} accounts={accounts} transactions={transactions} friends={friends} showToast={showToast} />}
        {tab === 'insights'     && <Insights     friends={friends} accounts={accounts} transactions={transactions} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DASHBOARD ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ user, friends, accounts, transactions, setTab }) {
  const totalGiven    = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const totalReceived = transactions.filter(t => t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
  const totalPending  = totalGiven - totalReceived;

  // Per friend balance
  const friendBalances = friends.map(f => {
    const given    = transactions.filter(t => t.friendId === f.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const received = transactions.filter(t => t.friendId === f.id && t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
    return { ...f, given, received, balance: given - received };
  }).sort((a, b) => b.balance - a.balance);

  // Recent transactions (last 6)
  const recent = [...transactions].sort((a, b) => b.date?.localeCompare(a.date)).slice(0, 6);
  const friendMap  = Object.fromEntries(friends.map(f => [f.id, f]));
  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a]));

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--fh)', fontSize: 26, fontWeight: 800, color: 'var(--ink)' }}>
          Hey, {user.name.split(' ')[0]} 👋
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink3)', marginTop: 4 }}>Here's your money overview</div>
      </div>

      {/* Summary cards */}
      <div className="cards-grid cols-4" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--redbg)' }}>💸</div>
          <div className="stat-label">Total Given</div>
          <div className="stat-value red">{fmt(totalGiven)}</div>
          <div className="stat-sub">{transactions.filter(t => t.type === 'expense').length} expenses</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--greenbg)' }}>💰</div>
          <div className="stat-label">Total Received</div>
          <div className="stat-value green">{fmt(totalReceived)}</div>
          <div className="stat-sub">{transactions.filter(t => t.type === 'payment').length} payments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--amberbg)' }}>⏳</div>
          <div className="stat-label">Pending</div>
          <div className={`stat-value ${totalPending > 0 ? 'red' : 'green'}`}>{fmt(totalPending)}</div>
          <div className="stat-sub">{totalPending > 0 ? 'Others owe you' : 'All settled!'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--indigobg)' }}>👥</div>
          <div className="stat-label">Active Friends</div>
          <div className="stat-value indigo">{friends.length}</div>
          <div className="stat-sub">{accounts.length} account{accounts.length !== 1 ? 's' : ''} linked</div>
        </div>
      </div>

      {/* Account Credit/Balance Status */}
      {accounts.some(a => a.limit || a.balance != null) && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 14 }}>Account Status</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {accounts.map(a => {
              const spent    = transactions.filter(t => t.accountId === a.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
              const received = transactions.filter(t => t.accountId === a.id && t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
              const net = spent - received;
              if (a.type === 'credit_card' && a.limit) {
                const avail = a.limit - net;
                const pct   = Math.min(100, (net / a.limit) * 100);
                const color = pct >= 90 ? 'var(--red)' : pct >= 70 ? 'var(--amber)' : 'var(--indigo)';
                return (
                  <div key={a.id} className="stat-card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 16 }}>💳</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</span>
                    </div>
                    <div className="limit-bar-track" style={{ marginBottom: 8 }}>
                      <div className="limit-bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--ink3)' }}>Used: {fmt(net)}</span>
                      <span style={{ fontWeight: 700, color: avail < 0 ? 'var(--red)' : 'var(--green)' }}>Free: {fmt(Math.max(0, avail))}</span>
                    </div>
                    {pct >= 90 && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 5, fontWeight: 600 }}>⚠️ Almost at limit!</div>}
                  </div>
                );
              }
              if (a.type === 'bank_account' && a.balance != null) {
                const rem = a.balance - net;
                const pct = Math.min(100, (net / a.balance) * 100);
                return (
                  <div key={a.id} className="stat-card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 16 }}>🏦</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</span>
                    </div>
                    <div className="limit-bar-track" style={{ marginBottom: 8 }}>
                      <div className="limit-bar-fill" style={{ width: `${pct}%`, background: 'var(--green)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--ink3)' }}>Spent: {fmt(net)}</span>
                      <span style={{ fontWeight: 700, color: rem < 0 ? 'var(--red)' : 'var(--green)' }}>Left: {fmt(Math.max(0, rem))}</span>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Friend balances */}
        <div className="table-card">
          <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15 }}>Who Owes You</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setTab('friends')}>View all</button>
          </div>
          {friendBalances.length === 0 ? (
            <div className="empty" style={{ padding: 32 }}><div className="empty-icon">👥</div><div className="empty-text">No friends yet</div></div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {friendBalances.slice(0, 5).map(f => (
                <div key={f.id} className="insight-row" style={{ padding: '11px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="friend-avatar" style={{ width: 34, height: 34, fontSize: 13, background: f.color || colorFor(f.name) }}>{initials(f.name)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink3)' }}>Given {fmt(f.given)}</div>
                    </div>
                  </div>
                  <div className={`bal-chip ${f.balance > 0 ? 'badge-red' : f.balance < 0 ? 'badge-green' : 'badge-gray'}`}>
                    {f.balance > 0 ? `Owes ${fmt(f.balance)}` : f.balance < 0 ? `You owe ${fmt(Math.abs(f.balance))}` : 'Settled'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="table-card">
          <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15 }}>Recent Activity</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setTab('transactions')}>View all</button>
          </div>
          {recent.length === 0 ? (
            <div className="empty" style={{ padding: 32 }}><div className="empty-icon">💳</div><div className="empty-text">No transactions</div></div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {recent.map(t => {
                const f = friendMap[t.friendId];
                const a = accountMap[t.accountId];
                return (
                  <div key={t.id} className="insight-row" style={{ padding: '11px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: t.type === 'expense' ? 'var(--redbg)' : 'var(--greenbg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                        {t.type === 'expense' ? '💸' : '💰'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{t.note || (t.type === 'expense' ? 'Expense' : 'Payment')}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{f?.name || '—'} · {a?.name || '—'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: t.type === 'expense' ? 'var(--red)' : 'var(--green)' }}>
                        {t.type === 'expense' ? '-' : '+'}{fmt(t.amount)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{fmtDate(t.date)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
          <option value="expense">Expenses</option>
          <option value="payment">Payments</option>
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
                      <td>{t.type === 'expense' ? <span className="txn-expense">Expense</span> : <span className="txn-payment">Payment</span>}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {f && <div className="friend-avatar" style={{ width: 28, height: 28, fontSize: 11, background: f.color || colorFor(f.name) }}>{initials(f.name)}</div>}
                          <span className="td-bold">{f?.name || '—'}</span>
                        </div>
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
    friendId:  existing?.friendId  || '',
    accountId: existing?.accountId || '',
    amount:    existing?.amount    ? String(existing.amount) : '',
    date:      existing?.date      || today(),
    note:      existing?.note      || '',
  });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.friendId || !form.accountId || !form.amount || !form.date) { alert('Fill all required fields'); return; }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { alert('Enter a valid amount'); return; }
    setSaving(true);
    try {
      const data = { userId, ...form, amount: amt };
      if (existing) { await updateDoc(doc(db, 'transactions', existing.id), data); onSaved('Transaction updated ✓'); }
      else           { await addDoc(collection(db, 'transactions'), data);          onSaved('Transaction added ✓'); }
    } catch (err) { alert('Save failed'); console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{existing ? 'Edit Transaction' : 'Add Transaction'}</div>
        <div className="modal-sub">Record an expense or a payment received</div>
        <form onSubmit={submit}>
          {/* Type toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['expense','payment'].map(tp => (
              <button key={tp} type="button"
                onClick={() => setForm(f => ({ ...f, type: tp }))}
                className="btn btn-sm"
                style={{ flex: 1, background: form.type === tp ? (tp === 'expense' ? 'var(--red)' : 'var(--green)') : 'var(--bg2)', color: form.type === tp ? 'white' : 'var(--ink3)', border: '1.5px solid ' + (form.type === tp ? 'transparent' : 'var(--border)') }}>
                {tp === 'expense' ? '💸 Expense' : '💰 Payment Received'}
              </button>
            ))}
          </div>

          <div className="form-row g2">
            <div className="field">
              <label className="field-label">Friend *</label>
              <select className="field-input" value={form.friendId} onChange={set('friendId')}>
                <option value="">Select friend…</option>
                {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
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
              <label className="field-label">Note (optional)</label>
              <input className="field-input" placeholder="e.g. Dinner at restaurant" value={form.note} onChange={set('note')} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : existing ? 'Update' : 'Add Transaction'}</button>
          </div>
        </form>
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
  const barColor = (pct) => pct >= 90 ? 'var(--red)' : pct >= 70 ? 'var(--amber)' : 'var(--indigo)';

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
          {withStats.map(a => (
            <div key={a.id}>
              <div className="account-card">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className="account-icon" style={{ background: a.type === 'credit_card' ? 'var(--indigobg)' : 'var(--greenbg)', marginBottom: 0 }}>
                    {a.type === 'credit_card' ? '💳' : '🏦'}
                  </div>
                  <span className="badge" style={{ background: a.type === 'credit_card' ? 'var(--indigobg)' : 'var(--greenbg)', color: a.type === 'credit_card' ? 'var(--indigo)' : 'var(--green)', border: `1px solid ${a.type === 'credit_card' ? 'var(--indigobrd)' : 'var(--greenbrd)'}` }}>
                    {a.type === 'credit_card' ? 'Credit' : 'Savings'}
                  </span>
                </div>

                <div className="account-name">{a.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 12 }}>{a.txnCount} transaction{a.txnCount !== 1 ? 's' : ''}</div>

                {/* Credit Card Limit Bar */}
                {a.type === 'credit_card' && a.limit && (
                  <div style={{ marginBottom: 12, background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
                    <div className="limit-row">
                      <span>Used</span>
                      <span style={{ fontWeight: 700, color: barColor(a.usedPct) }}>{fmt(a.netSpent)}</span>
                    </div>
                    <div className="limit-bar-track">
                      <div className="limit-bar-fill" style={{ width: `${a.usedPct}%`, background: barColor(a.usedPct) }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: 'var(--ink3)' }}>Limit: {fmt(a.limit)}</span>
                      <span className="limit-available" style={{ color: a.available < 0 ? 'var(--red)' : 'var(--green)' }}>
                        Available: {fmt(Math.max(0, a.available))}
                      </span>
                    </div>
                    {a.available < 0 && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4, fontWeight: 600 }}>⚠️ Limit exceeded by {fmt(Math.abs(a.available))}</div>}
                  </div>
                )}

                {/* Bank Account Balance Bar */}
                {a.type === 'bank_account' && a.balance != null && (
                  <div style={{ marginBottom: 12, background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
                    <div className="limit-row">
                      <span>Spent on friends</span>
                      <span style={{ fontWeight: 700, color: 'var(--red)' }}>{fmt(a.netSpent)}</span>
                    </div>
                    <div className="limit-bar-track">
                      <div className="limit-bar-fill" style={{ width: `${a.balPct}%`, background: 'var(--green)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: 'var(--ink3)' }}>Total: {fmt(a.balance)}</span>
                      <span className="limit-available" style={{ color: a.remaining < 0 ? 'var(--red)' : 'var(--green)' }}>
                        Remaining: {fmt(Math.max(0, a.remaining))}
                      </span>
                    </div>
                  </div>
                )}

                {/* Simple spent if no limit/balance set */}
                {((a.type === 'credit_card' && !a.limit) || (a.type === 'bank_account' && a.balance == null)) && (
                  <div style={{ marginBottom: 12 }}>
                    <div className="account-spent">{fmt(a.totalSpent)}</div>
                    <div className="account-spent-label">Total spent via this account</div>
                  </div>
                )}

                {/* Actions */}
                <div className="account-actions">
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}
                    onClick={() => setExpandAcc(expandAcc === a.id ? null : a.id)}>
                    👥 {expandAcc === a.id ? 'Hide' : 'Friends'}
                  </button>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(a)}><IcoEdit /></button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteAcc(a)}><IcoTrash /></button>
                </div>
              </div>

              {/* Friend × Account Breakdown Panel */}
              {expandAcc === a.id && (
                <div className="table-card" style={{ marginTop: 8, borderRadius: 12 }}>
                  <div style={{ padding: '14px 16px 8px', fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    👥 Who Used This Account
                    <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink3)', fontFamily: 'var(--fb)' }}>— {a.name}</span>
                  </div>
                  {a.friendBreakdown.length === 0 ? (
                    <div style={{ padding: '14px 16px 16px', fontSize: 13, color: 'var(--ink3)' }}>No transactions from this account yet.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="breakdown-table">
                        <thead>
                          <tr>
                            <th>Friend</th>
                            <th>Borrowed</th>
                            <th>Paid Back</th>
                            <th>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {a.friendBreakdown.map(f => (
                            <tr key={f.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div className="friend-avatar" style={{ width: 28, height: 28, fontSize: 11, background: f.color || colorFor(f.name) }}>{initials(f.name)}</div>
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
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
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
