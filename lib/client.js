window.__ModuleLoader__.load({
  id: "dsh-ssh-dfy",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/panel.tsx
var import_react = require("react");

// src/client/api.ts
var API = {
  hosts: "/api/dsh-ssh-dfy/hosts",
  home: "/api/dsh-ssh-dfy/home",
  list: "/api/dsh-ssh-dfy/list",
  read: "/api/dsh-ssh-dfy/read"
};
async function request(url, init) {
  const response = await fetch(url, { credentials: "same-origin", ...init });
  const text = await response.text();
  let payload = void 0;
  try {
    payload = text === "" ? void 0 : JSON.parse(text);
  } catch {
    payload = void 0;
  }
  if (!response.ok) {
    const message = payload !== null && typeof payload === "object" && "error" in payload ? String(payload.error) : response.status + " " + response.statusText;
    throw new Error(message);
  }
  return payload;
}
function qs(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== void 0 && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text === "" ? "" : "?" + text;
}
var sshApi = {
  async hosts(query) {
    const result = await request(API.hosts + qs({ query }));
    return result.hosts ?? [];
  },
  async saveHost(input) {
    const result = await request(API.hosts, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input)
    });
    return result.host;
  },
  async deleteHost(alias) {
    await request(API.hosts + qs({ alias }), { method: "DELETE" });
  },
  async home(alias) {
    const result = await request(API.home + qs({ alias }));
    return result.path;
  },
  async list(alias, path) {
    return await request(API.list + qs({ alias, path }));
  },
  async read(alias, path) {
    return await request(API.read + qs({ alias, path }));
  }
};

// src/client/panel.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function SshIcon({ size = 16 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "1.75", y: "2.75", width: "12.5", height: "10.5", rx: "2.5" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4.75 6.5l1.9 1.6-1.9 1.6" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8.4 9.9h2.85" })
  ] });
}
var SVG = { width: 15, height: 15, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
function FolderIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { ...SVG, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M1.9 4.4a1.5 1.5 0 0 1 1.5-1.5h2.2l1.4 1.6h5.1a1.5 1.5 0 0 1 1.5 1.5v5.6a1.5 1.5 0 0 1-1.5 1.5H3.4a1.5 1.5 0 0 1-1.5-1.5z" }) });
}
function FileIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { ...SVG, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.2 1.9H4.4a1.4 1.4 0 0 0-1.4 1.4v9.4a1.4 1.4 0 0 0 1.4 1.4h7.2a1.4 1.4 0 0 0 1.4-1.4V5.6z" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.2 1.9v3.7h3.8" })
  ] });
}
function CodeIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { ...SVG, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.2 1.9H4.4a1.4 1.4 0 0 0-1.4 1.4v9.4a1.4 1.4 0 0 0 1.4 1.4h7.2a1.4 1.4 0 0 0 1.4-1.4V5.6z" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.2 1.9v3.7h3.8" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M6.3 8.4L5 9.7l1.3 1.3M9.7 8.4L11 9.7l-1.3 1.3" })
  ] });
}
function ImageIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { ...SVG, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "2.1", y: "3.1", width: "11.8", height: "9.8", rx: "1.4" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "5.9", cy: "6.4", r: "1.1" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 11.4l3-2.6 2.3 2 1.9-1.6 2.8 2.4" })
  ] });
}
function ArchiveIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { ...SVG, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "2.4", y: "2.4", width: "11.2", height: "3.2", rx: "1" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3.5 5.6v7.1a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V5.6" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 8v2.4" })
  ] });
}
function LinkIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { ...SVG, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M6.6 9.4a2.6 2.6 0 0 0 3.7 0l1.9-1.9a2.6 2.6 0 0 0-3.7-3.7l-1 1" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.4 6.6a2.6 2.6 0 0 0-3.7 0L3.8 8.5a2.6 2.6 0 0 0 3.7 3.7l1-1" })
  ] });
}
function RefreshIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { ...SVG, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M13 8a5 5 0 1 1-1.6-3.7" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M13.2 2.6v2.8h-2.8" })
  ] });
}
function PlusIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { ...SVG, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 3.6v8.8M3.6 8h8.8" }) });
}
function MinusIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { ...SVG, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3.6 8h8.8" }) });
}
function UpIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { ...SVG, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 12.4V3.8" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4.2 7.6L8 3.8l3.8 3.8" })
  ] });
}
function BackIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { ...SVG, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12.4 8H3.8" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M7.4 4.2L3.6 8l3.8 3.8" })
  ] });
}
function WarningIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { ...SVG, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 2.6l5.4 9.4H2.6z" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 6.4v2.6M8 11h.01" })
  ] });
}
function InboxIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { ...SVG, width: 26, height: 26, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2 9.4l1.8-5A1.4 1.4 0 0 1 5.1 3.5h5.8a1.4 1.4 0 0 1 1.3.9l1.8 5" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2 9.4h3.4l.9 1.8h3.4l.9-1.8H14v3.6a1.4 1.4 0 0 1-1.4 1.4H3.4A1.4 1.4 0 0 1 2 13z" })
  ] });
}
var CODE_EXT = /* @__PURE__ */ new Set(["ts", "tsx", "js", "jsx", "mjs", "cjs", "json", "yml", "yaml", "toml", "ini", "conf", "env", "sh", "bash", "zsh", "py", "rb", "go", "rs", "java", "kt", "c", "h", "cpp", "hpp", "cs", "php", "sql", "md", "txt", "log", "css", "scss", "html", "xml", "vue", "svelte", "lua", "pl", "r"]);
var IMAGE_EXT = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp", "ico", "svg", "avif"]);
var ARCHIVE_EXT = /* @__PURE__ */ new Set(["zip", "tar", "gz", "tgz", "bz2", "xz", "7z", "rar", "jar", "war"]);
function EntryIcon({ entry }) {
  if (entry.type === "dir") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-ico dfy-ico--dir", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderIcon, {}) });
  if (entry.type === "link") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-ico dfy-ico--link", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkIcon, {}) });
  const ext = entry.name.includes(".") ? entry.name.split(".").pop().toLowerCase() : "";
  if (IMAGE_EXT.has(ext)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-ico dfy-ico--image", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageIcon, {}) });
  if (ARCHIVE_EXT.has(ext)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-ico dfy-ico--archive", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchiveIcon, {}) });
  if (CODE_EXT.has(ext)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-ico dfy-ico--code", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeIcon, {}) });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-ico", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileIcon, {}) });
}
function humanSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}
var CSS = `
.dfy-root { position: relative; height: 100%; min-height: 0; display: flex; flex-direction: column; font-size: 12px; line-height: 1.55; color: inherit;
  --dfy-line: rgba(127,140,160,.26); --dfy-soft: rgba(127,140,160,.10); --dfy-hover: rgba(127,140,160,.16);
  --dfy-accent: var(--ds-color-accent, #4c6ef5); --dfy-mono: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  --dfy-ease: cubic-bezier(.32,.72,0,1); }
.dfy-root *, .dfy-root *::before, .dfy-root *::after { box-sizing: border-box; }
.dfy-root button { font: inherit; color: inherit; }
.dfy-root input, .dfy-root select { font: inherit; color: inherit; }

.dfy-head { display: flex; align-items: center; gap: 6px; padding: 9px 10px 7px; }
.dfy-head__title { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; font-weight: 600; letter-spacing: .01em; }
.dfy-head__title span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dfy-pulse { width: 6px; height: 6px; border-radius: 999px; background: var(--dfy-accent); box-shadow: 0 0 0 3px rgba(76,110,245,.18); flex: none; }

.dfy-btn { display: inline-flex; align-items: center; justify-content: center; gap: 5px; height: 25px; min-width: 25px; padding: 0 8px; border: 1px solid var(--dfy-line);
  border-radius: 7px; background: transparent; cursor: pointer; transition: background .14s var(--dfy-ease), border-color .14s var(--dfy-ease), transform .08s var(--dfy-ease), opacity .14s var(--dfy-ease); }
.dfy-btn:hover:not(:disabled) { background: var(--dfy-hover); }
.dfy-btn:active:not(:disabled) { transform: translateY(1px); }
.dfy-btn:disabled { opacity: .4; cursor: default; }
.dfy-btn--icon { padding: 0; width: 25px; }
.dfy-btn--primary { background: var(--dfy-accent); border-color: transparent; color: #fff; font-weight: 600; }
.dfy-btn--primary:hover:not(:disabled) { background: var(--dfy-accent); filter: brightness(1.1); }
.dfy-btn--block { width: 100%; height: 30px; }

.dfy-bar { display: flex; align-items: center; gap: 6px; padding: 0 10px 9px; }
.dfy-select { flex: 1; min-width: 0; height: 28px; padding: 0 8px; border: 1px solid var(--dfy-line); border-radius: 7px; background: var(--dfy-soft); cursor: pointer;
  transition: border-color .14s var(--dfy-ease), background .14s var(--dfy-ease); }
.dfy-select:hover { border-color: rgba(127,140,160,.45); }
.dfy-select:focus-visible, .dfy-btn:focus-visible, .dfy-field:focus-visible, .dfy-row:focus-visible { outline: 2px solid var(--dfy-accent); outline-offset: 1px; }

.dfy-scope { display: flex; align-items: center; gap: 6px; padding: 7px 10px 9px; border-top: 1px solid var(--dfy-line); border-bottom: 1px solid var(--dfy-line); }
.dfy-scope__label { flex: none; opacity: .6; font-size: 10.5px; letter-spacing: .06em; text-transform: uppercase; }
.dfy-scope__path { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--dfy-mono); font-size: 11px; opacity: .85; }
.dfy-scope__path--unset { opacity: .5; font-style: italic; }

.dfy-crumbs { display: flex; align-items: center; gap: 6px; padding: 7px 10px; }
.dfy-crumbs__path { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: rtl; text-align: left; font-family: var(--dfy-mono); font-size: 11px; opacity: .7; }

.dfy-list { flex: 1; min-height: 0; overflow: auto; padding: 2px 6px 10px; }
.dfy-list::-webkit-scrollbar { width: 8px; }
.dfy-list::-webkit-scrollbar-thumb { background: rgba(127,140,160,.28); border-radius: 999px; }
.dfy-list::-webkit-scrollbar-track { background: transparent; }
.dfy-row { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 7px; cursor: pointer; transition: background .1s var(--dfy-ease); }
.dfy-row:hover { background: var(--dfy-hover); }
.dfy-row__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dfy-row__size { flex: none; font-size: 10.5px; opacity: .55; font-variant-numeric: tabular-nums; }
.dfy-ico { flex: none; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; opacity: .75; }
.dfy-ico--dir { opacity: 1; color: var(--dfy-accent); }
.dfy-ico--code { opacity: .95; color: #4aa3d8; }
.dfy-ico--image { opacity: .95; color: #3fb98f; }
.dfy-ico--archive { opacity: .95; color: #c08a3e; }
.dfy-ico--link { opacity: .8; color: #9a7ad8; }

.dfy-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 30px 20px; text-align: center; opacity: .62; }
.dfy-empty__hint { font-size: 11.5px; max-width: 230px; }

.dfy-error { display: flex; gap: 8px; margin: 8px 10px; padding: 8px 10px; border: 1px solid rgba(214,69,69,.5); background: rgba(214,69,69,.10); border-radius: 8px; }
.dfy-error__text { flex: 1; min-width: 0; white-space: pre-wrap; word-break: break-word; font-size: 11.5px; }
.dfy-error svg { flex: none; color: #e06a6a; margin-top: 1px; }

.dfy-progress { height: 2px; margin: 0 10px; border-radius: 999px; overflow: hidden; background: var(--dfy-soft); }
.dfy-progress__bar { height: 100%; width: 38%; border-radius: 999px; background: var(--dfy-accent); animation: dfy-slide 1.1s var(--dfy-ease) infinite; }
@keyframes dfy-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(320%); } }

.dfy-form { flex: 1; min-height: 0; overflow: auto; padding: 4px 10px 12px; display: flex; flex-direction: column; gap: 10px; }
.dfy-field { width: 100%; height: 29px; padding: 0 9px; border: 1px solid var(--dfy-line); border-radius: 7px; background: var(--dfy-soft); transition: border-color .14s var(--dfy-ease); }
.dfy-field:hover { border-color: rgba(127,140,160,.45); }
.dfy-label { display: flex; flex-direction: column; gap: 4px; }
.dfy-label > span { font-size: 10.5px; letter-spacing: .05em; text-transform: uppercase; opacity: .6; }
.dfy-pair { display: flex; gap: 8px; }
.dfy-pair > .dfy-label:first-child { flex: 1; }
.dfy-pair > .dfy-label:last-child { flex: 0 0 74px; }
.dfy-note { font-size: 10.5px; opacity: .55; }

.dfy-preview { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.dfy-preview__meta { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-top: 1px solid var(--dfy-line); border-bottom: 1px solid var(--dfy-line); }
.dfy-preview__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--dfy-mono); font-size: 11px; }
.dfy-chip { flex: none; font-size: 10px; padding: 1px 6px; border-radius: 999px; background: var(--dfy-soft); border: 1px solid var(--dfy-line); opacity: .8; }
.dfy-preview__body { flex: 1; min-height: 0; overflow: auto; margin: 0; padding: 10px 12px 14px; font-family: var(--dfy-mono); font-size: 11.5px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
.dfy-preview__body::-webkit-scrollbar { width: 8px; }
.dfy-preview__body::-webkit-scrollbar-thumb { background: rgba(127,140,160,.28); border-radius: 999px; }

.dfy-foot { padding: 6px 10px 8px; border-top: 1px solid var(--dfy-line); font-size: 10.5px; opacity: .5; }
.dfy-fade { animation: dfy-fade .16s var(--dfy-ease); }
@keyframes dfy-fade { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; } }
`;
function useStyles() {
  (0, import_react.useEffect)(() => {
    const id = "dsh-ssh-dfy-style";
    if (document.getElementById(id) !== null) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = CSS;
    document.head.appendChild(style);
  }, []);
}
function emptyForm() {
  return { alias: "", host: "", port: 22, user: "root", auth: "agent", privateKeyPath: "", password: "", description: "" };
}
function WorkspacePanel() {
  useStyles();
  const [hosts, setHosts] = (0, import_react.useState)([]);
  const [alias, setAlias] = (0, import_react.useState)("");
  const [root, setRoot] = (0, import_react.useState)("");
  const [listing, setListing] = (0, import_react.useState)(null);
  const [preview, setPreview] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)("");
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [mode, setMode] = (0, import_react.useState)("browse");
  const [form, setForm] = (0, import_react.useState)(emptyForm());
  const [picker, setPicker] = (0, import_react.useState)(null);
  const selected = (0, import_react.useMemo)(() => hosts.find((host) => host.alias === alias), [hosts, alias]);
  const run = (0, import_react.useCallback)(async (step) => {
    setBusy(true);
    setError("");
    try {
      await step();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : String(problem));
    } finally {
      setBusy(false);
    }
  }, []);
  const refreshHosts = (0, import_react.useCallback)(async (keepAlias) => {
    const list = await sshApi.hosts();
    setHosts(list);
    setAlias(keepAlias !== void 0 && list.some((host) => host.alias === keepAlias) ? keepAlias : list[0]?.alias ?? "");
    return list;
  }, []);
  (0, import_react.useEffect)(() => {
    void run(async () => {
      await refreshHosts();
    });
  }, [run, refreshHosts]);
  (0, import_react.useEffect)(() => {
    if (alias === "") {
      setListing(null);
      setRoot("");
      return;
    }
    const workspace = hosts.find((host) => host.alias === alias)?.workspaceRoot ?? "";
    setRoot(workspace);
    setPreview(null);
    setMode("browse");
    void run(async () => {
      setListing(await sshApi.list(alias, workspace === "" ? void 0 : workspace));
    });
  }, [alias, hosts, run]);
  const openPath = (0, import_react.useCallback)((path) => {
    if (alias === "") return;
    void run(async () => {
      setListing(await sshApi.list(alias, path));
    });
  }, [alias, run]);
  const openPicker = (0, import_react.useCallback)(() => {
    void run(async () => {
      const home = await sshApi.home(alias);
      setPicker(await sshApi.list(alias, home));
      setMode("picker");
    });
  }, [alias, run]);
  const pickerGo = (0, import_react.useCallback)((path) => {
    void run(async () => {
      setPicker(await sshApi.list(alias, path));
    });
  }, [alias, run]);
  const usePickedRoot = (0, import_react.useCallback)((path) => {
    if (selected === void 0) return;
    void run(async () => {
      await sshApi.saveHost({
        alias: selected.alias,
        host: selected.host,
        port: selected.port,
        user: selected.user,
        auth: selected.auth,
        privateKeyPath: selected.privateKeyPath,
        workspaceRoot: path,
        description: selected.description
      });
      await refreshHosts(alias);
      setRoot(path);
      setListing(await sshApi.list(alias, path));
      setMode("browse");
    });
  }, [alias, refreshHosts, run, selected]);
  const saveHost = (0, import_react.useCallback)(() => {
    void run(async () => {
      const saved = await sshApi.saveHost(form);
      setForm(emptyForm());
      await refreshHosts(saved.alias);
      setMode("browse");
    });
  }, [form, refreshHosts, run]);
  const removeHost = (0, import_react.useCallback)(() => {
    if (alias === "") return;
    void run(async () => {
      await sshApi.deleteHost(alias);
      await refreshHosts();
    });
  }, [alias, refreshHosts, run]);
  const openFile = (0, import_react.useCallback)((path) => {
    void run(async () => {
      const result = await sshApi.read(alias, path);
      setPreview({ path: result.path, content: result.content, truncated: result.truncated, size: result.size });
      setMode("preview");
    });
  }, [alias, run]);
  const back = (0, import_react.useCallback)(() => {
    setMode("browse");
    setPreview(null);
  }, []);
  const title = mode === "form" ? "\u65B0\u589E\u4E3B\u673A" : mode === "picker" ? "\u9009\u62E9\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55" : mode === "preview" ? "\u6587\u4EF6\u9884\u89C8" : "\u8FDC\u7A0B\u5DE5\u4F5C\u533A";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-root", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-head", children: [
      mode !== "browse" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dfy-btn dfy-btn--icon", onClick: back, title: "\u8FD4\u56DE", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackIcon, {}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-pulse" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dfy-head__title", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: title }) }),
      mode === "browse" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dfy-btn dfy-btn--icon", onClick: () => openPath(root === "" ? void 0 : root), disabled: alias === "" || busy, title: "\u5237\u65B0", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshIcon, {}) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dfy-btn dfy-btn--icon", onClick: () => {
          setForm(emptyForm());
          setMode("form");
        }, title: "\u65B0\u589E\u4E3B\u673A", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {}) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dfy-btn dfy-btn--icon", onClick: removeHost, disabled: alias === "" || busy, title: "\u5220\u9664\u5F53\u524D\u4E3B\u673A", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinusIcon, {}) })
      ] })
    ] }),
    busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dfy-progress", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dfy-progress__bar" }) }),
    mode === "browse" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dfy-bar", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "dfy-select", value: alias, onChange: (event) => setAlias(event.target.value), children: [
        hosts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: "\u8FD8\u6CA1\u6709\u4E3B\u673A" }),
        hosts.map((host) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: host.alias, children: [
          host.alias,
          " \xB7 ",
          host.user,
          "@",
          host.host,
          ":",
          host.port
        ] }, host.alias))
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-scope", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-scope__label", children: "\u6839\u76EE\u5F55" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-scope__path" + (root === "" ? " dfy-scope__path--unset" : ""), title: root === "" ? "\u672A\u8BBE\u7F6E\uFF08\u9ED8\u8BA4\u767B\u5F55\u5BB6\u76EE\u5F55\uFF09" : root, children: root === "" ? "\u672A\u8BBE\u7F6E\uFF08\u9ED8\u8BA4 ~\uFF09" : root }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dfy-btn", onClick: openPicker, disabled: alias === "" || busy, children: "\u9009\u62E9" })
      ] })
    ] }),
    error !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-error", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarningIcon, {}),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dfy-error__text", children: error })
    ] }),
    mode === "browse" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-crumbs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dfy-btn dfy-btn--icon", onClick: () => listing?.parent != null && openPath(listing.parent), disabled: listing?.parent == null, title: "\u4E0A\u4E00\u7EA7", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpIcon, {}) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-crumbs__path", title: listing?.path ?? "", children: listing?.path ?? "" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-list", children: [
        (listing?.entries ?? []).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            className: "dfy-row",
            tabIndex: 0,
            onClick: () => entry.type === "dir" ? openPath(entry.path) : openFile(entry.path),
            onKeyDown: (event) => {
              if (event.key === "Enter") entry.type === "dir" ? openPath(entry.path) : openFile(entry.path);
            },
            title: entry.name,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntryIcon, { entry }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-row__name", children: entry.name }),
              entry.type !== "dir" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-row__size", children: humanSize(entry.size) })
            ]
          },
          entry.path
        )),
        alias === "" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-empty", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InboxIcon, {}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-empty__hint", children: [
            "\u8FD8\u6CA1\u6709\u4E3B\u673A\u3002\u70B9\u53F3\u4E0A\u89D2 ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "+" }),
            " \u6DFB\u52A0\u4E00\u53F0\u670D\u52A1\u5668\uFF0C\u7136\u540E\u9009\u62E9\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55\u3002"
          ] })
        ] }),
        alias !== "" && listing != null && listing.entries.length === 0 && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-empty", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InboxIcon, {}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dfy-empty__hint", children: "\u8FD9\u4E2A\u76EE\u5F55\u662F\u7A7A\u7684" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dfy-foot", children: "\u6839\u76EE\u5F55\u5373 Agent \u9ED8\u8BA4\u4F5C\u7528\u57DF \xB7 ssh_ls / ssh_read / ssh_exec" })
    ] }),
    mode === "picker" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-crumbs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dfy-btn dfy-btn--icon", onClick: () => pickerGo(picker?.parent ?? void 0), disabled: picker?.parent == null, title: "\u4E0A\u4E00\u7EA7", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpIcon, {}) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-crumbs__path", title: picker?.path ?? "", children: picker?.path ?? "\u2026" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-list", children: [
        (picker?.entries ?? []).filter((entry) => entry.type === "dir").map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-row", tabIndex: 0, onClick: () => pickerGo(entry.path), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntryIcon, { entry }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-row__name", children: entry.name })
        ] }, entry.path)),
        picker != null && picker.entries.filter((entry) => entry.type === "dir").length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-empty", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InboxIcon, {}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dfy-empty__hint", children: "\u8FD9\u91CC\u6CA1\u6709\u5B50\u76EE\u5F55" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { padding: "0 10px 10px" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dfy-btn dfy-btn--primary dfy-btn--block", disabled: picker == null || busy, onClick: () => picker != null && usePickedRoot(picker.path), children: "\u4F7F\u7528\u6B64\u76EE\u5F55\u4F5C\u4E3A\u5DE5\u4F5C\u533A" }) })
    ] }),
    mode === "preview" && preview != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-preview dfy-fade", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-preview__meta", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntryIcon, { entry: { type: "file", name: preview.path } }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dfy-preview__name", title: preview.path, children: preview.path.split("/").pop() }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dfy-chip", children: [
          humanSize(preview.size),
          preview.truncated ? "+" : ""
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "dfy-preview__body", children: preview.content })
    ] }),
    mode === "form" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-form dfy-fade", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dfy-label", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u522B\u540D\uFF08\u5DE5\u5177\u91CC\u7528\uFF09" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "dfy-field", value: form.alias, placeholder: "prod", onChange: (event) => setForm({ ...form, alias: event.target.value }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dfy-label", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u4E3B\u673A / IP" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "dfy-field", value: form.host, placeholder: "10.0.0.9", onChange: (event) => setForm({ ...form, host: event.target.value }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dfy-pair", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dfy-label", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u7528\u6237\u540D" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "dfy-field", value: form.user, onChange: (event) => setForm({ ...form, user: event.target.value }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dfy-label", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u7AEF\u53E3" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "dfy-field", value: String(form.port), onChange: (event) => setForm({ ...form, port: Number(event.target.value) || 22 }) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dfy-label", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u8BA4\u8BC1\u65B9\u5F0F" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "dfy-field", value: form.auth, onChange: (event) => setForm({ ...form, auth: event.target.value }), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "agent", children: "ssh-agent\uFF08\u63A8\u8350\uFF09" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "key", children: "\u79C1\u94A5\u6587\u4EF6" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "password", children: "\u5BC6\u7801" })
        ] })
      ] }),
      form.auth === "key" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dfy-label", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u79C1\u94A5\u8DEF\u5F84\uFF08\u672C\u673A\uFF09" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "dfy-field", placeholder: "C:\\\\Users\\\\you\\\\.ssh\\\\id_ed25519", value: form.privateKeyPath ?? "", onChange: (event) => setForm({ ...form, privateKeyPath: event.target.value }) })
      ] }),
      form.auth === "password" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dfy-label", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u5BC6\u7801" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "dfy-field", type: "password", value: form.password ?? "", onChange: (event) => setForm({ ...form, password: event.target.value }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dfy-note", children: "\u5BC6\u7801/\u53E3\u4EE4\u5B58\u653E\u5728\u672C\u673A $DSH_HOME/dsh-ssh-dfy/hosts.json\uFF080600\uFF09\uFF0C\u4E0D\u4F1A\u8FD4\u56DE\u7ED9 Agent \u6216\u6D4F\u89C8\u5668\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dfy-btn dfy-btn--primary dfy-btn--block", onClick: saveHost, disabled: busy || form.alias === "" || form.host === "", children: "\u4FDD\u5B58\u4E3B\u673A" })
    ] })
  ] });
}

// src/client/index.tsx
var TAB_ID = "ssh-dfy";
var inject = ["slots", "sidebarRightTabs"];
function apply(ctx) {
  const face = ctx;
  const slots = face.slots;
  const tabs = face.sidebarRightTabs;
  if (slots === void 0 || tabs === void 0) {
    console.warn("[dsh-ssh-dfy] right sidebar services missing; panel not mounted");
    return;
  }
  const disposers = [];
  try {
    disposers.push(tabs.register({
      id: TAB_ID,
      kind: TAB_ID,
      title: () => "SSH",
      guide: [{
        id: "ssh-dfy.guide",
        order: 46,
        title: () => "SSH \u8FDC\u7A0B\u5DE5\u4F5C\u533A",
        description: () => "\u9009\u62E9\u4E3B\u673A\u4E0E\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55\uFF0C\u6D4F\u89C8\u8BE5\u76EE\u5F55\u4E0B\u7684\u6240\u6709\u6587\u4EF6\uFF1B\u5BF9\u8BDD\u91CC\u7528 ssh_exec / ssh_ls / ssh_read \u64CD\u4F5C\u670D\u52A1\u5668",
        icon: SshIcon
      }]
    }));
    disposers.push(slots.inject("sidebar.right.pane.tab", () => slots.register({
      name: "sidebar.right.pane.tab",
      key: TAB_ID
    }, WorkspacePanel)));
  } catch (error) {
    console.warn("[dsh-ssh-dfy] right sidebar registration failed:", error);
  }
  ctx.effect(() => () => {
    for (const dispose of disposers.splice(0)) dispose();
  }, "dsh-ssh-dfy: right sidebar tab");
}

    return module.exports;
  },
});
