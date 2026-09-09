/* 更新意図: 服の保存・提案・評価学習に加え、各カテゴリ5点の画像付きサンプルを非破壊で初期投入。処理日時: 2026-09-09 JST */
const DB_NAME = "kinari-closet";
const DB_VERSION = 1;

const labels = {
  category: { tops: "トップス", bottoms: "ボトムス", onepiece: "ワンピース", outer: "アウター", shoes: "靴", accessory: "小物" },
  color: { white: "白", black: "黒", gray: "グレー", navy: "ネイビー", blue: "ブルー", beige: "ベージュ", brown: "ブラウン", green: "グリーン", red: "レッド", yellow: "イエロー", pink: "ピンク", purple: "パープル", multi: "マルチ" },
  season: { all: "通年", spring: "春", summer: "夏", autumn: "秋", winter: "冬" },
  status: { ready: "着用可能", laundry: "洗濯中", cleaning: "クリーニング", archived: "アーカイブ" },
  occasion: { daily: "普段のお出かけ", work: "仕事・打ち合わせ", active: "よく歩く日", special: "食事・特別な予定" },
  mood: { relaxed: "リラックス", clean: "きちんと", minimal: "シンプル", adventure: "少し冒険" },
};

const colorHex = { white: "#f6f5ef", black: "#282a28", gray: "#92958f", navy: "#263b55", blue: "#6585a3", beige: "#c8b797", brown: "#765846", green: "#647a61", red: "#a8534e", yellow: "#d3b34c", pink: "#c58f99", purple: "#7b6886", multi: "linear-gradient(90deg,#b38b67,#6e8290,#8a6b77)" };

const SAMPLE_ITEMS = [
  { id: "sample-tops-01", name: "白のオックスフォードシャツ", category: "tops", color: "white", season: "all", warmth: 2, formality: 4, photo: "assets/samples/tops-01.jpg" },
  { id: "sample-tops-02", name: "ネイビーのクルーネックニット", category: "tops", color: "navy", season: "winter", warmth: 4, formality: 3, photo: "assets/samples/tops-02.jpg" },
  { id: "sample-tops-03", name: "セージグリーンのTシャツ", category: "tops", color: "green", season: "summer", warmth: 1, formality: 1, photo: "assets/samples/tops-03.jpg" },
  { id: "sample-tops-04", name: "ブルーのストライプシャツ", category: "tops", color: "blue", season: "all", warmth: 2, formality: 3, photo: "assets/samples/tops-04.jpg" },
  { id: "sample-tops-05", name: "ベージュのスウェット", category: "tops", color: "beige", season: "autumn", warmth: 3, formality: 1, photo: "assets/samples/tops-05.jpg" },
  { id: "sample-bottoms-01", name: "濃紺ストレートデニム", category: "bottoms", color: "navy", season: "all", warmth: 3, formality: 2, photo: "assets/samples/bottoms-01.jpg" },
  { id: "sample-bottoms-02", name: "ベージュのチノパン", category: "bottoms", color: "beige", season: "all", warmth: 2, formality: 3, photo: "assets/samples/bottoms-02.jpg" },
  { id: "sample-bottoms-03", name: "黒のテーパードパンツ", category: "bottoms", color: "black", season: "all", warmth: 2, formality: 4, photo: "assets/samples/bottoms-03.jpg" },
  { id: "sample-bottoms-04", name: "オリーブのミディスカート", category: "bottoms", color: "green", season: "autumn", warmth: 2, formality: 3, photo: "assets/samples/bottoms-04.jpg" },
  { id: "sample-bottoms-05", name: "ブルーのワイドデニム", category: "bottoms", color: "blue", season: "all", warmth: 3, formality: 1, photo: "assets/samples/bottoms-05.jpg" },
  { id: "sample-onepiece-01", name: "クリームのシャツワンピース", category: "onepiece", color: "white", season: "spring", warmth: 2, formality: 3, photo: "assets/samples/onepiece-01.jpg" },
  { id: "sample-onepiece-02", name: "ネイビーのミディワンピース", category: "onepiece", color: "navy", season: "all", warmth: 2, formality: 4, photo: "assets/samples/onepiece-02.jpg" },
  { id: "sample-onepiece-03", name: "テラコッタのカジュアルワンピース", category: "onepiece", color: "red", season: "summer", warmth: 1, formality: 2, photo: "assets/samples/onepiece-03.jpg" },
  { id: "sample-onepiece-04", name: "黒のフォーマルワンピース", category: "onepiece", color: "black", season: "all", warmth: 3, formality: 5, photo: "assets/samples/onepiece-04.jpg" },
  { id: "sample-onepiece-05", name: "セージグリーンのリネンワンピース", category: "onepiece", color: "green", season: "summer", warmth: 1, formality: 2, photo: "assets/samples/onepiece-05.jpg" },
  { id: "sample-outer-01", name: "ベージュのトレンチコート", category: "outer", color: "beige", season: "spring", warmth: 3, formality: 4, photo: "assets/samples/outer-01.jpg" },
  { id: "sample-outer-02", name: "ブルーのデニムジャケット", category: "outer", color: "blue", season: "spring", warmth: 3, formality: 1, photo: "assets/samples/outer-02.jpg" },
  { id: "sample-outer-03", name: "黒のテーラードジャケット", category: "outer", color: "black", season: "all", warmth: 3, formality: 5, photo: "assets/samples/outer-03.jpg" },
  { id: "sample-outer-04", name: "オリーブのフィールドジャケット", category: "outer", color: "green", season: "autumn", warmth: 3, formality: 2, photo: "assets/samples/outer-04.jpg" },
  { id: "sample-outer-05", name: "チャコールのウールコート", category: "outer", color: "gray", season: "winter", warmth: 5, formality: 4, photo: "assets/samples/outer-05.jpg" },
  { id: "sample-shoes-01", name: "白のローカットスニーカー", category: "shoes", color: "white", season: "all", warmth: 2, formality: 1, photo: "assets/samples/shoes-01.jpg" },
  { id: "sample-shoes-02", name: "黒のレザーローファー", category: "shoes", color: "black", season: "all", warmth: 2, formality: 4, photo: "assets/samples/shoes-02.jpg" },
  { id: "sample-shoes-03", name: "ブラウンのアンクルブーツ", category: "shoes", color: "brown", season: "winter", warmth: 4, formality: 3, photo: "assets/samples/shoes-03.jpg" },
  { id: "sample-shoes-04", name: "ベージュのフラットサンダル", category: "shoes", color: "beige", season: "summer", warmth: 1, formality: 2, photo: "assets/samples/shoes-04.jpg" },
  { id: "sample-shoes-05", name: "ネイビーのランニングシューズ", category: "shoes", color: "navy", season: "all", warmth: 2, formality: 1, photo: "assets/samples/shoes-05.jpg", notes: "よく歩く日に向くサンプル" },
  { id: "sample-accessory-01", name: "ブラウンのレザートート", category: "accessory", color: "brown", season: "all", warmth: 2, formality: 3, photo: "assets/samples/accessory-01.jpg" },
  { id: "sample-accessory-02", name: "黒のショルダーバッグ", category: "accessory", color: "black", season: "all", warmth: 2, formality: 4, photo: "assets/samples/accessory-02.jpg" },
  { id: "sample-accessory-03", name: "ベージュのキャップ", category: "accessory", color: "beige", season: "all", warmth: 1, formality: 1, photo: "assets/samples/accessory-03.jpg" },
  { id: "sample-accessory-04", name: "ライトグレーのマフラー", category: "accessory", color: "gray", season: "winter", warmth: 5, formality: 3, photo: "assets/samples/accessory-04.jpg" },
  { id: "sample-accessory-05", name: "ブラウンのレザーベルト", category: "accessory", color: "brown", season: "all", warmth: 2, formality: 3, photo: "assets/samples/accessory-05.jpg" },
];

let db;
let items = [];
let feedback = [];
let currentPhoto = null;
let currentPhotoUrl = null;
let toastTimer;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("items")) database.createObjectStore("items", { keyPath: "id" });
      if (!database.objectStoreNames.contains("feedback")) database.createObjectStore("feedback", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function storeRequest(store, mode, action, value) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, mode);
    const request = transaction.objectStore(store)[action](value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const getAll = (store) => storeRequest(store, "readonly", "getAll");
const put = (store, value) => storeRequest(store, "readwrite", "put", value);

async function ensureSampleItems() {
  const savedItems = await getAll("items");
  const savedIds = new Set(savedItems.map((item) => item.id));
  const seedTime = Date.now();

  for (const [index, sample] of SAMPLE_ITEMS.entries()) {
    if (savedIds.has(sample.id)) continue;
    const createdAt = new Date(seedTime - index * 1000).toISOString();
    await put("items", {
      ...sample,
      status: "ready",
      notes: sample.notes || "KINARIのサンプルデータ",
      isSample: true,
      createdAt,
      updatedAt: createdAt,
      lastWornAt: null,
    });
  }
}

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric", weekday: "long" }).format(date);
}

function objectURL(photo) {
  if (!photo) return "";
  if (typeof photo === "string") return photo;
  return URL.createObjectURL(photo);
}

function revokePhotoURL(url) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function switchView(view) {
  $$(".view").forEach((node) => node.classList.toggle("is-active", node.id === `view-${view}`));
  $$(".nav-item").forEach((node) => node.classList.toggle("is-active", node.dataset.view === view));
  $(".sidebar").classList.remove("is-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (view === "closet") renderCloset();
}

function categoryFromName(filename) {
  const name = filename.toLowerCase();
  const groups = [
    ["shoes", /shoe|sneaker|boot|靴|スニーカー|ブーツ/],
    ["bottoms", /pants|jeans|skirt|trouser|パンツ|デニム|スカート/],
    ["outer", /jacket|coat|cardigan|ジャケット|コート|カーディガン/],
    ["onepiece", /dress|onepiece|ワンピ|ドレス/],
    ["accessory", /bag|hat|belt|バッグ|帽子|ベルト/],
  ];
  return groups.find(([, pattern]) => pattern.test(name))?.[0] || "tops";
}

function closestColor([r, g, b]) {
  const palette = {
    white: [238, 235, 225], black: [42, 44, 42], gray: [138, 140, 136], navy: [41, 55, 73], blue: [91, 128, 164],
    beige: [194, 173, 137], brown: [111, 79, 57], green: [91, 117, 80], red: [157, 65, 61], yellow: [208, 173, 65], pink: [196, 128, 145], purple: [116, 89, 130],
  };
  return Object.entries(palette).sort((a, b2) => distance(a[1]) - distance(b2[1]))[0][0];
  function distance(sample) { return Math.sqrt((r - sample[0]) ** 2 + (g - sample[1]) ** 2 + (b - sample[2]) ** 2); }
}

async function loadPhoto(file) {
  if ("createImageBitmap" in window) return createImageBitmap(file);
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("画像を読み込めませんでした"));
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function compressAndAnalyze(file) {
  const bitmap = await loadPhoto(file);
  const max = 1000;
  const ratio = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = 32; sampleCanvas.height = 32;
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  sampleCtx.drawImage(canvas, 0, 0, 32, 32);
  const pixels = sampleCtx.getImageData(0, 0, 32, 32).data;
  let r = 0, g = 0, b = 0, count = 0;
  for (let y = 5; y < 27; y += 2) {
    for (let x = 5; x < 27; x += 2) {
      const i = (y * 32 + x) * 4;
      const maxChannel = Math.max(pixels[i], pixels[i + 1], pixels[i + 2]);
      const minChannel = Math.min(pixels[i], pixels[i + 1], pixels[i + 2]);
      if (maxChannel > 244 && maxChannel - minChannel < 12) continue;
      r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; count++;
    }
  }
  const detectedColor = closestColor([r / Math.max(1, count), g / Math.max(1, count), b / Math.max(1, count)]);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", .82));
  if (typeof bitmap.close === "function") bitmap.close();
  return { blob, detectedColor };
}

function resetItemForm() {
  $("#item-form").reset();
  $("#item-id").value = "";
  $("#item-dialog-title").textContent = "服を登録";
  $("#photo-preview").hidden = true;
  $("#photo-placeholder").hidden = false;
  $("#analysis-hint").textContent = "写真から色とファイル名を仮入力します。";
  revokePhotoURL(currentPhotoUrl);
  currentPhoto = null;
  currentPhotoUrl = null;
}

function openItemDialog(item = null) {
  resetItemForm();
  if (item) {
    $("#item-dialog-title").textContent = "服の情報を編集";
    $("#item-id").value = item.id;
    $("#item-name").value = item.name;
    $("#item-category").value = item.category;
    $("#item-color").value = item.color;
    $("#item-season").value = item.season;
    $("#item-warmth").value = item.warmth;
    $("#item-formality").value = item.formality;
    $("#item-status").value = item.status === "archived" ? "ready" : item.status;
    $("#item-notes").value = item.notes || "";
    currentPhoto = item.photo || null;
    if (item.photo) {
      currentPhotoUrl = objectURL(item.photo);
      $("#photo-preview").src = currentPhotoUrl;
      $("#photo-preview").hidden = false;
      $("#photo-placeholder").hidden = true;
    }
  }
  $("#item-dialog").showModal();
}

async function saveItem(event) {
  event.preventDefault();
  const form = $("#item-form");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const saveButton = $("#save-item");
  const defaultLabel = saveButton.textContent;
  saveButton.disabled = true;
  saveButton.textContent = "保存しています…";

  try {
    const existing = items.find((item) => item.id === $("#item-id").value);
    const now = new Date().toISOString();
    const item = {
      id: existing?.id || createId(),
      name: $("#item-name").value.trim(), category: $("#item-category").value, color: $("#item-color").value,
      season: $("#item-season").value, warmth: Number($("#item-warmth").value), formality: Number($("#item-formality").value),
      status: existing?.status === "archived" ? "archived" : $("#item-status").value,
      notes: $("#item-notes").value.trim(), photo: currentPhoto || existing?.photo || null,
      createdAt: existing?.createdAt || now, updatedAt: now, lastWornAt: existing?.lastWornAt || null,
    };
    await put("items", item);
    items = await getAll("items");
    $("#item-dialog").close();
    renderAll();
    showToast(existing ? "服の情報を更新しました" : "クローゼットに追加しました");
  } catch (error) {
    console.error("服の保存に失敗しました", error);
    showToast("保存できませんでした。通常モードのブラウザで、もう一度お試しください");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = defaultLabel;
  }
}

async function archiveItem(id) {
  const item = items.find((entry) => entry.id === id);
  if (!item) return;
  item.status = "archived";
  item.archivedAt = new Date().toISOString();
  item.updatedAt = item.archivedAt;
  await put("items", item);
  items = await getAll("items");
  renderAll();
  showToast("削除せず、アーカイブへ移しました");
}

async function restoreItem(id) {
  const item = items.find((entry) => entry.id === id);
  if (!item) return;
  item.status = "ready";
  item.restoredAt = new Date().toISOString();
  item.updatedAt = item.restoredAt;
  await put("items", item);
  items = await getAll("items");
  renderAll();
  showToast("クローゼットへ戻しました");
}

function itemPhotoMarkup(item, alt = true) {
  if (item.photo) return `<img src="${objectURL(item.photo)}" alt="${alt ? escapeHTML(item.name) : ""}">`;
  const fill = colorHex[item.color] || "#ddd7ca";
  return `<svg viewBox="0 0 100 100" role="img" aria-label="${escapeHTML(item.name)}" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="${fill.startsWith("#") ? fill : "#b89b83"}"/><path d="M27 28 40 20h20l13 8 12 21-13 8-6-11v38H34V46l-6 11-13-8 12-21Z" fill="rgba(255,255,255,.35)" stroke="rgba(30,30,30,.18)"/></svg>`;
}

function renderStats() {
  const active = items.filter((item) => item.status !== "archived");
  const currentMonth = new Date().toISOString().slice(0, 7);
  $("#stat-total").textContent = active.length;
  $("#stat-ready").textContent = active.filter((item) => item.status === "ready").length;
  $("#stat-worn").textContent = feedback.filter((entry) => entry.type === "worn" && entry.createdAt.startsWith(currentMonth)).length;

  const recent = [...active].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  $("#recent-items").innerHTML = recent.length ? recent.map((item) => `<article class="mini-item"><div class="mini-image">${itemPhotoMarkup(item)}</div><p>${escapeHTML(item.name)}</p></article>`).join("") : `<div class="empty-mini">服を登録すると、ここに並びます</div>`;
}

function renderCloset() {
  const search = $("#closet-search").value.trim().toLowerCase();
  const category = $("#category-filter").value;
  const status = $("#status-filter").value;
  const filtered = items.filter((item) => {
    const text = `${item.name} ${labels.color[item.color]} ${item.notes || ""}`.toLowerCase();
    return (!search || text.includes(search)) && (category === "all" || item.category === category) && (status === "all" || item.status === status);
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  $("#closet-grid").innerHTML = filtered.length ? filtered.map((item) => `
    <article class="closet-card">
      <div class="card-image">${itemPhotoMarkup(item)}<span class="status-pill">${labels.status[item.status]}</span>${item.isSample ? `<span class="sample-pill">サンプル</span>` : ""}</div>
      <div class="card-body">
        <h3>${escapeHTML(item.name)}</h3>
        <p class="card-meta"><span class="color-dot" style="background:${colorHex[item.color]}"></span>${labels.color[item.color]} ・ ${labels.category[item.category]} ・ ${labels.season[item.season]}</p>
        <div class="card-actions">
          <button data-edit-item="${item.id}">情報を編集</button>
          ${item.status !== "archived" ? `<button data-archive-item="${item.id}">アーカイブ</button>` : `<button data-restore-item="${item.id}">元に戻す</button>`}
        </div>
      </div>
    </article>`).join("") : `<div class="empty-state"><strong>該当する服がありません</strong><span>条件を変えるか、新しい服を登録してください。</span></div>`;
}

function desiredWarmth(temp) {
  if (temp <= 7) return 5;
  if (temp <= 14) return 4;
  if (temp <= 23) return 3;
  if (temp <= 29) return 2;
  return 1;
}

function targetFormality(occasion) {
  return { active: 1.8, daily: 2.4, work: 3.8, special: 4.1 }[occasion];
}

function seasonForTemperature(temp) {
  if (temp <= 12) return "winter";
  if (temp <= 20) return "autumn";
  if (temp <= 27) return "spring";
  return "summer";
}

function colorCompatibility(colors, mood) {
  const neutrals = new Set(["white", "black", "gray", "navy", "beige", "brown"]);
  const unique = [...new Set(colors)];
  const accents = unique.filter((color) => !neutrals.has(color));
  let score = 20;
  if (unique.length <= 3) score += 8;
  if (accents.length <= 1) score += 6;
  if (mood === "adventure" && accents.length >= 1) score += 6;
  if (mood === "minimal" && unique.every((color) => neutrals.has(color))) score += 7;
  return score;
}

function combinations(groups) {
  return groups.reduce((acc, group) => acc.flatMap((set) => group.map((item) => [...set, item])), [[]]);
}

function generateCandidates(conditions) {
  const ready = items.filter((item) => item.status === "ready");
  const group = (category) => ready.filter((item) => item.category === category);
  const bases = [];
  if (group("tops").length && group("bottoms").length) bases.push(...combinations([group("tops"), group("bottoms")]));
  if (group("onepiece").length) bases.push(...group("onepiece").map((item) => [item]));
  const optional = (base, category, shouldInclude) => {
    const choices = group(category);
    if (!choices.length || !shouldInclude) return [base];
    return choices.map((item) => [...base, item]);
  };
  let candidates = [];
  for (const base of bases) {
    const withOuter = optional(base, "outer", conditions.temperature < 19 || conditions.weather === "rain");
    for (const set of withOuter) candidates.push(...optional(set, "shoes", true));
  }
  if (!candidates.length) return [];

  const preference = new Map();
  feedback.forEach((entry) => entry.itemIds.forEach((id) => preference.set(id, (preference.get(id) || 0) + ({ like: 3, worn: 5, dislike: -5 }[entry.type] || 0))));
  const wantedWarmth = desiredWarmth(conditions.temperature);
  const wantedFormality = targetFormality(conditions.occasion);
  const wantedSeason = seasonForTemperature(conditions.temperature);
  const recentLimit = Date.now() - 7 * 86400000;

  return candidates.map((set) => {
    const avgWarmth = set.reduce((sum, item) => sum + item.warmth, 0) / set.length;
    const avgFormality = set.reduce((sum, item) => sum + item.formality, 0) / set.length;
    let score = 48 + colorCompatibility(set.map((item) => item.color), conditions.mood);
    score -= Math.abs(avgWarmth - wantedWarmth) * 7;
    score -= Math.abs(avgFormality - wantedFormality) * 6;
    score -= set.filter((item) => item.season !== "all" && item.season !== wantedSeason).length * 7;
    score += set.reduce((sum, item) => sum + (preference.get(item.id) || 0), 0);
    if (conditions.weather === "rain" && set.some((item) => /撥水|防水/.test(item.notes))) score += 7;
    if (conditions.weather === "rain" && set.some((item) => /雨.{0,4}(避け|苦手)|濡れ/.test(item.notes))) score -= 12;
    if (conditions.occasion === "active" && set.some((item) => item.category === "shoes" && item.formality <= 2)) score += 5;
    if (conditions.avoidRecent && set.some((item) => item.lastWornAt && new Date(item.lastWornAt).getTime() > recentLimit)) score -= 12;
    return { id: set.map((item) => item.id).join("-"), items: set, score: Math.max(40, Math.min(98, Math.round(score))), conditions };
  }).sort((a, b) => b.score - a.score);
}

function selectDiverse(candidates) {
  const selected = [];
  for (const candidate of candidates) {
    const signature = candidate.items.map((item) => item.id).sort();
    const tooSimilar = selected.some((picked) => signature.filter((id) => picked.items.some((item) => item.id === id)).length >= Math.min(signature.length, picked.items.length) - 1);
    if (!tooSimilar || selected.length === 0) selected.push(candidate);
    if (selected.length === 3) break;
  }
  for (const candidate of candidates) {
    if (selected.length === 3) break;
    if (!selected.includes(candidate)) selected.push(candidate);
  }
  return selected;
}

function outfitReason(outfit, index) {
  const { conditions, items: set } = outfit;
  const names = set.map((item) => item.name);
  const lead = ["条件とのバランスが最も良い定番案です。", "雰囲気を少し変えた、使いやすい別案です。", "いつもより少し変化をつける提案です。"][index];
  const tempText = conditions.temperature >= 27 ? "涼しさ" : conditions.temperature <= 14 ? "暖かさ" : "温度調整のしやすさ";
  return `${lead} ${names.slice(0, 2).join("と")}を軸に、${tempText}と「${labels.occasion[conditions.occasion]}」の場面を両立させました。`;
}

function renderOutfits(outfits, conditions) {
  $("#outfit-empty").hidden = true;
  const results = $("#outfit-results");
  results.hidden = false;
  if (!outfits.length) {
    results.innerHTML = `<div class="empty-results"><span class="sparkle">!</span><h2>組み合わせを作るには服が足りません</h2><p>「トップス＋ボトムス」または「ワンピース」と、靴を着用可能な状態で登録してください。</p><button class="primary-button" data-open-item-form>服を登録する</button></div>`;
    return;
  }
  results.innerHTML = `
    <div class="result-header"><div><p class="eyebrow">${conditions.temperature}℃・${labels.occasion[conditions.occasion]}</p><h2>今日の${outfits.length}つの提案</h2></div><span class="soft-badge">手持ち服のみ</span></div>
    <div class="outfit-list">${outfits.map((outfit, index) => `
      <article class="outfit-card">
        <div class="outfit-top"><div><span class="outfit-number">LOOK 0${index + 1}</span><h3>${["いちばんおすすめ", "安心の別案", "少し気分を変える"][index]}</h3></div><span class="score-ring">${outfit.score}</span></div>
        <div class="outfit-items">${outfit.items.map((item) => `<div class="outfit-piece"><div>${itemPhotoMarkup(item)}</div><p>${escapeHTML(item.name)}</p></div>`).join("")}</div>
        <p class="outfit-reason">${escapeHTML(outfitReason(outfit, index))}</p>
        <div class="feedback-row" data-outfit-id="${outfit.id}"><span>この提案はどうですか？</span><button data-feedback="like">♡ 好き</button><button data-feedback="dislike">合わない</button><button data-feedback="worn">着た</button></div>
      </article>`).join("")}</div>`;
  results.dataset.outfits = JSON.stringify(outfits.map((outfit) => ({ id: outfit.id, itemIds: outfit.items.map((item) => item.id), conditions })));
}

async function saveFeedback(button) {
  const row = button.closest(".feedback-row");
  const outfitData = JSON.parse($("#outfit-results").dataset.outfits || "[]").find((outfit) => outfit.id === row.dataset.outfitId);
  if (!outfitData) return;
  const entry = { id: createId(), type: button.dataset.feedback, itemIds: outfitData.itemIds, conditions: outfitData.conditions, createdAt: new Date().toISOString() };
  await put("feedback", entry);
  feedback.push(entry);
  if (entry.type === "worn") {
    for (const id of entry.itemIds) {
      const item = items.find((candidate) => candidate.id === id);
      if (item) { item.lastWornAt = entry.createdAt; item.updatedAt = entry.createdAt; await put("items", item); }
    }
  }
  $$('button', row).forEach((node) => node.classList.toggle("is-selected", node === button));
  renderStats();
  showToast(entry.type === "worn" ? "着用履歴に記録しました" : "好みとして学習しました");
}

function renderAll() {
  renderStats();
  renderCloset();
}

function bindEvents() {
  $$(".nav-item").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
  $$('[data-view-link]').forEach((button) => button.addEventListener("click", () => switchView(button.dataset.viewLink)));
  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-open-item-form]");
    const edit = event.target.closest("[data-edit-item]");
    const archive = event.target.closest("[data-archive-item]");
    const restore = event.target.closest("[data-restore-item]");
    const rating = event.target.closest("[data-feedback]");
    const closeDialog = event.target.closest("[data-close-item-dialog]");
    if (opener) openItemDialog();
    if (edit) openItemDialog(items.find((item) => item.id === edit.dataset.editItem));
    if (archive) archiveItem(archive.dataset.archiveItem);
    if (restore) restoreItem(restore.dataset.restoreItem);
    if (rating) saveFeedback(rating);
    if (closeDialog) $("#item-dialog").close();
  });
  $("#mobile-menu").addEventListener("click", () => $(".sidebar").classList.toggle("is-open"));
  $("#closet-search").addEventListener("input", renderCloset);
  $("#category-filter").addEventListener("change", renderCloset);
  $("#status-filter").addEventListener("change", renderCloset);
  $("#temperature").addEventListener("input", (event) => $("#temperature-output").value = `${event.target.value}℃`);
  $("#item-photo").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    $("#analysis-hint").textContent = "写真を軽量化し、色を確認しています…";
    try {
      const { blob, detectedColor } = await compressAndAnalyze(file);
      currentPhoto = blob;
      revokePhotoURL(currentPhotoUrl);
      currentPhotoUrl = objectURL(blob);
      $("#photo-preview").src = currentPhotoUrl;
      $("#photo-preview").hidden = false;
      $("#photo-placeholder").hidden = true;
      $("#item-color").value = detectedColor;
      $("#item-category").value = categoryFromName(file.name);
      if (!$("#item-name").value) $("#item-name").value = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
      $("#analysis-hint").textContent = `仮判定：${labels.color[detectedColor]}・${labels.category[$("#item-category").value]}。違う場合は修正してください。`;
    } catch (error) {
      console.error(error);
      $("#analysis-hint").textContent = "画像を読み込めませんでした。別の写真をお試しください。";
    }
  });
  $("#item-form").addEventListener("submit", saveItem);
  $("#item-dialog").addEventListener("close", resetItemForm);
  $("#condition-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const conditions = { temperature: Number($("#temperature").value), weather: form.get("weather"), occasion: form.get("occasion"), mood: form.get("mood"), avoidRecent: $("#avoid-recent").checked };
    $("#quick-temperature").textContent = `${conditions.temperature}℃`;
    $("#quick-occasion").textContent = labels.occasion[conditions.occasion];
    $("#quick-mood").textContent = labels.mood[conditions.mood];
    renderOutfits(selectDiverse(generateCandidates(conditions)), conditions);
  });
}

async function init() {
  $("#today-label").textContent = formatDate(new Date());
  try {
    db = await openDB();
    await ensureSampleItems();
    [items, feedback] = await Promise.all([getAll("items"), getAll("feedback")]);
    bindEvents();
    renderAll();
  } catch (error) {
    console.error(error);
    showToast("ブラウザ内の保存領域を開けませんでした");
  }
}

init();
