// Black Friday Beacon: render, search, filter and sort the deal list.
// Discount % and dollars saved are computed here from sale and usual prices.
import { DEALS, CHECKED_AT, CATEGORIES } from "./deals.js";

const grid = document.getElementById("deals");
const countEl = document.getElementById("count");
const searchEl = document.getElementById("search");
const categoryEl = document.getElementById("category");
const storeEl = document.getElementById("store");
const minoffEl = document.getElementById("minoff");
const sortEl = document.getElementById("sort");
const emptyEl = document.getElementById("empty");

const VERDICT_CLASS = { "NEW LOW": "new-low", "STRONG DEAL": "strong", "ROUTINE SALE": "routine" };
const VERDICT_RANK = { "NEW LOW": 0, "STRONG DEAL": 1, "ROUTINE SALE": 2 };

export function discountPct(deal) {
  return Math.round((1 - deal.sale / deal.usual) * 100);
}

export function dollarsSaved(deal) {
  return deal.usual - deal.sale;
}

export function formatPrice(value) {
  return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function readHashState() {
  const params = new URLSearchParams(location.hash.slice(1));
  return {
    q: params.get("q") || "",
    category: params.get("category") || "All",
    store: params.get("store") || "All",
    minoff: Number(params.get("minoff") || 0),
    sort: params.get("sort") || "discount"
  };
}

export function writeHashState(state) {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.category !== "All") params.set("category", state.category);
  if (state.store !== "All") params.set("store", state.store);
  if (state.minoff > 0) params.set("minoff", String(state.minoff));
  if (state.sort !== "discount") params.set("sort", state.sort);
  const hash = params.toString();
  const next = hash ? "#" + hash : "#";
  if (location.hash !== next) history.replaceState(null, "", next);
}

export function filterDeals(deals, state) {
  const q = state.q.trim().toLowerCase();
  return deals.filter((deal) => {
    if (state.category !== "All" && deal.cat !== state.category) return false;
    if (state.store !== "All" && deal.store !== state.store) return false;
    if (discountPct(deal) < state.minoff) return false;
    if (q && !(deal.name.toLowerCase().includes(q) || deal.store.toLowerCase().includes(q) || deal.cat.toLowerCase().includes(q))) return false;
    return true;
  });
}

export function sortDeals(deals, sort) {
  const list = [...deals];
  if (sort === "discount") list.sort((a, b) => discountPct(b) - discountPct(a) || dollarsSaved(b) - dollarsSaved(a));
  else if (sort === "saved") list.sort((a, b) => dollarsSaved(b) - dollarsSaved(a));
  else if (sort === "price") list.sort((a, b) => a.sale - b.sale);
  else if (sort === "verdict") list.sort((a, b) => VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] || discountPct(b) - discountPct(a));
  return list;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function dealCard(deal) {
  const pct = discountPct(deal);
  const saved = dollarsSaved(deal);
  return `<article class="card">
    <div class="card-top"><span class="cat">${escapeHtml(deal.cat)}</span><span class="badge ${VERDICT_CLASS[deal.verdict]}">${escapeHtml(deal.verdict)}</span></div>
    <h3>${escapeHtml(deal.name)}</h3>
    <p class="store">at <a href="${escapeHtml(deal.storeUrl)}" target="_blank" rel="noopener">${escapeHtml(deal.store)}</a></p>
    <p class="prices"><span class="sale">${formatPrice(deal.sale)}</span> <span class="usual">${formatPrice(deal.usual)}</span></p>
    <p class="off">${pct}% off &middot; save ${formatPrice(saved)}</p>
    <p class="note">${escapeHtml(deal.note)}</p>
    <p class="checked">Checked ${escapeHtml(CHECKED_AT)}</p>
    <p class="actions"><a class="deal-link" href="${escapeHtml(deal.sourceUrl)}" target="_blank" rel="noopener">View deal</a></p>
    <p class="source">Source: <a href="${escapeHtml(deal.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(deal.source)}</a></p>
  </article>`;
}

export function renderDeals() {
  const state = {
    q: searchEl.value,
    category: categoryEl.value,
    store: storeEl.value,
    minoff: Number(minoffEl.value),
    sort: sortEl.value
  };
  const shown = sortDeals(filterDeals(DEALS, state), state.sort);
  grid.innerHTML = shown.map(dealCard).join("");
  countEl.textContent = shown.length === 1 ? "1 deal" : shown.length + " deals";
  emptyEl.hidden = shown.length > 0;
  writeHashState(state);
}

function fillSelect(select, options) {
  for (const option of options) {
    const el = document.createElement("option");
    el.value = option;
    el.textContent = option;
    select.appendChild(el);
  }
}

function initControls() {
  fillSelect(categoryEl, CATEGORIES);
  const stores = [...new Set(DEALS.map((d) => d.store))].sort();
  fillSelect(storeEl, stores);
  const state = readHashState();
  searchEl.value = state.q;
  if (CATEGORIES.includes(state.category)) categoryEl.value = state.category;
  if (stores.includes(state.store)) storeEl.value = state.store;
  if ([0, 20, 30, 40, 50].includes(state.minoff)) minoffEl.value = String(state.minoff);
  if (["discount", "saved", "price", "verdict"].includes(state.sort)) sortEl.value = state.sort;
}

initControls();
for (const control of [searchEl, categoryEl, storeEl, minoffEl, sortEl]) {
  control.addEventListener("input", renderDeals);
  control.addEventListener("change", renderDeals);
}
window.addEventListener("hashchange", () => {
  initControls();
  renderDeals();
});
renderDeals();
