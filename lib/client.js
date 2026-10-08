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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "svg",
    {
      "data-dsh-panel-entry": "ssh-dfy",
      viewBox: "0 0 16 16",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "1.75", y: "2.75", width: "12.5", height: "10.5", rx: "1.75" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4.5 6.25l2 1.75-2 1.75" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8.25 10h3.25" })
      ]
    }
  );
}
var C = {
  border: "var(--ds-color-border, rgba(128,140,160,0.28))",
  muted: "var(--ds-color-text-secondary, #8b94a3)",
  text: "var(--ds-color-text-primary, inherit)",
  accent: "var(--ds-color-accent, #4c6ef5)",
  danger: "#d64545"
};
var btn = (primary = false, small = false) => ({
  background: primary ? C.accent : "transparent",
  color: primary ? "#fff" : C.text,
  border: "1px solid " + (primary ? C.accent : C.border),
  borderRadius: 5,
  padding: small ? "1px 6px" : "3px 8px",
  fontSize: small ? 11 : 12,
  cursor: "pointer",
  lineHeight: 1.6,
  whiteSpace: "nowrap"
});
var field = {
  background: "transparent",
  color: C.text,
  border: "1px solid " + C.border,
  borderRadius: 5,
  padding: "3px 6px",
  fontSize: 12,
  width: "100%",
  boxSizing: "border-box"
};
var overlay = {
  position: "absolute",
  inset: 0,
  background: "var(--ds-color-bg-secondary, #171a21)",
  display: "flex",
  flexDirection: "column",
  zIndex: 5
};
function humanSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "K";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + "M";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + "G";
}
function emptyForm() {
  return { alias: "", host: "", port: 22, user: "root", auth: "agent", privateKeyPath: "", password: "", description: "" };
}
function WorkspacePanel() {
  const [hosts, setHosts] = (0, import_react.useState)([]);
  const [alias, setAlias] = (0, import_react.useState)("");
  const [root, setRoot] = (0, import_react.useState)("");
  const [listing, setListing] = (0, import_react.useState)(null);
  const [preview, setPreview] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)("");
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [formOpen, setFormOpen] = (0, import_react.useState)(false);
  const [form, setForm] = (0, import_react.useState)(emptyForm());
  const [picker, setPicker] = (0, import_react.useState)({ open: false, listing: null });
  const selected = hosts.find((host) => host.alias === alias);
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
    void run(async () => {
      setListing(await sshApi.list(alias, workspace === "" ? void 0 : workspace));
    });
  }, [alias, hosts, run]);
  const openPath = (0, import_react.useCallback)((path) => {
    if (alias === "") return;
    void run(async () => {
      setPreview(null);
      setListing(await sshApi.list(alias, path));
    });
  }, [alias, run]);
  const openPicker = (0, import_react.useCallback)(() => {
    void run(async () => {
      const home = await sshApi.home(alias);
      setPicker({ open: true, listing: await sshApi.list(alias, home) });
    });
  }, [alias, run]);
  const pickerGo = (0, import_react.useCallback)((path) => {
    void run(async () => {
      const next = await sshApi.list(alias, path);
      setPicker({ open: true, listing: next });
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
      setPicker({ open: false, listing: null });
      await refreshHosts(alias);
      setRoot(path);
      setListing(await sshApi.list(alias, path));
    });
  }, [alias, refreshHosts, run, selected]);
  const saveHost = (0, import_react.useCallback)(() => {
    void run(async () => {
      const saved = await sshApi.saveHost(form);
      setFormOpen(false);
      setForm(emptyForm());
      await refreshHosts(saved.alias);
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
    });
  }, [alias, run]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { position: "relative", height: "100%", minHeight: 0, display: "flex", flexDirection: "column", fontSize: 12, color: C.text }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: "6px 8px", display: "grid", gap: 6, borderBottom: "1px solid " + C.border }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "select",
          {
            style: { ...field, flex: 1 },
            value: alias,
            onChange: (event) => setAlias(event.target.value),
            children: [
              hosts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: "\uFF08\u8FD8\u6CA1\u6709\u4E3B\u673A\uFF09" }),
              hosts.map((host) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: host.alias, children: [
                host.alias,
                " \u2014 ",
                host.user,
                "@",
                host.host
              ] }, host.alias))
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: btn(), title: "\u65B0\u589E\u4E3B\u673A", onClick: () => setFormOpen(true), children: "+" }),
        alias !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: btn(), title: "\u5220\u9664\u5F53\u524D\u4E3B\u673A", onClick: removeHost, children: "\u2212" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: C.muted }, title: root === "" ? selected?.workspaceRoot ?? "\u672A\u8BBE\u7F6E\uFF08\u9ED8\u8BA4\u767B\u5F55\u5BB6\u76EE\u5F55\uFF09" : root, children: [
          "\u6839\u76EE\u5F55\uFF1A",
          root === "" ? selected?.workspaceRoot ?? "\u672A\u8BBE\u7F6E\uFF08\u9ED8\u8BA4 ~\uFF09" : root
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: btn(), onClick: openPicker, disabled: alias === "" || busy, children: "\u9009\u62E9" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: btn(), onClick: () => openPath(root === "" ? void 0 : root), disabled: alias === "" || busy, children: "\u5237\u65B0" })
      ] })
    ] }),
    error !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { margin: 8, padding: "6px 8px", border: "1px solid " + C.danger, borderRadius: 5, color: "#ffb4b4", whiteSpace: "pre-wrap" }, children: error }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: "4px 8px", display: "flex", gap: 6, alignItems: "center", borderBottom: "1px solid " + C.border, color: C.muted }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: btn(false, true), onClick: () => listing?.parent != null && openPath(listing.parent), disabled: listing?.parent == null, children: "\u2191" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: listing?.path ?? "", children: listing?.path ?? (alias === "" ? "\u5148\u6DFB\u52A0\u4E00\u53F0\u4E3B\u673A" : "\u2026") }),
      busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 11 }, children: "\u2026" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { flex: 1, minHeight: 0, overflow: "auto" }, children: [
      (listing?.entries ?? []).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "div",
        {
          onClick: () => entry.type === "dir" ? openPath(entry.path) : openFile(entry.path),
          style: { padding: "3px 8px", cursor: "pointer", display: "flex", gap: 6, alignItems: "center" },
          onMouseEnter: (event) => {
            event.currentTarget.style.background = "rgba(128,140,160,0.12)";
          },
          onMouseLeave: (event) => {
            event.currentTarget.style.background = "transparent";
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: 12, textAlign: "center" }, children: entry.type === "dir" ? "\u{1F4C1}" : entry.type === "link" ? "\u{1F517}" : "\u{1F4C4}" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: entry.name }),
            entry.type !== "dir" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: C.muted, fontSize: 11 }, children: humanSize(entry.size) })
          ]
        },
        entry.path
      )),
      listing != null && listing.entries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { padding: 10, color: C.muted }, children: "\u7A7A\u76EE\u5F55" })
    ] }),
    formOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: overlay, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: "8px 10px", borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { flex: 1 }, children: "\u65B0\u589E\u4E3B\u673A" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: btn(), onClick: () => setFormOpen(false), children: "\u53D6\u6D88" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: 10, display: "grid", gap: 8, overflow: "auto" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "grid", gap: 3 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: C.muted, fontSize: 11 }, children: "\u522B\u540D\uFF08\u5DE5\u5177\u91CC\u7528\uFF09" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { style: field, value: form.alias, onChange: (event) => setForm({ ...form, alias: event.target.value }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "grid", gap: 3 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: C.muted, fontSize: 11 }, children: "\u4E3B\u673A / IP" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { style: field, value: form.host, onChange: (event) => setForm({ ...form, host: event.target.value }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "grid", gap: 3, flex: 1 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: C.muted, fontSize: 11 }, children: "\u7528\u6237\u540D" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { style: field, value: form.user, onChange: (event) => setForm({ ...form, user: event.target.value }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "grid", gap: 3, width: 70 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: C.muted, fontSize: 11 }, children: "\u7AEF\u53E3" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { style: field, value: String(form.port), onChange: (event) => setForm({ ...form, port: Number(event.target.value) || 22 }) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "grid", gap: 3 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: C.muted, fontSize: 11 }, children: "\u8BA4\u8BC1\u65B9\u5F0F" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { style: field, value: form.auth, onChange: (event) => setForm({ ...form, auth: event.target.value }), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "agent", children: "ssh-agent" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "key", children: "\u79C1\u94A5\u6587\u4EF6" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "password", children: "\u5BC6\u7801" })
          ] })
        ] }),
        form.auth === "key" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "grid", gap: 3 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: C.muted, fontSize: 11 }, children: "\u79C1\u94A5\u8DEF\u5F84\uFF08\u672C\u673A\uFF09" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { style: field, value: form.privateKeyPath ?? "", onChange: (event) => setForm({ ...form, privateKeyPath: event.target.value }) })
        ] }),
        form.auth === "password" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "grid", gap: 3 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: C.muted, fontSize: 11 }, children: "\u5BC6\u7801\uFF08\u5B58\u672C\u673A 0600 \u6587\u4EF6\uFF09" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { style: field, type: "password", value: form.password ?? "", onChange: (event) => setForm({ ...form, password: event.target.value }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: btn(true), onClick: saveHost, disabled: busy, children: "\u4FDD\u5B58" })
      ] })
    ] }),
    picker.open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: overlay, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: "6px 8px", borderBottom: "1px solid " + C.border, display: "flex", gap: 6, alignItems: "center" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { flex: 1 }, children: "\u9009\u62E9\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: btn(false, true), onClick: () => pickerGo(picker.listing?.parent ?? void 0), disabled: picker.listing?.parent == null, children: "\u2191" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: btn(false, true), onClick: () => setPicker({ open: false, listing: null }), children: "\u53D6\u6D88" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { padding: "4px 8px", color: C.muted, borderBottom: "1px solid " + C.border, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: picker.listing?.path ?? "\u2026" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { flex: 1, minHeight: 0, overflow: "auto" }, children: (picker.listing?.entries ?? []).filter((entry) => entry.type === "dir").map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { onClick: () => pickerGo(entry.path), style: { padding: "3px 8px", cursor: "pointer" }, children: [
        "\u{1F4C1} ",
        entry.name
      ] }, entry.path)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { padding: 8, borderTop: "1px solid " + C.border }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          style: { ...btn(true), width: "100%" },
          disabled: picker.listing == null || busy,
          onClick: () => picker.listing != null && usePickedRoot(picker.listing.path),
          children: "\u4F7F\u7528\u6B64\u76EE\u5F55\u4F5C\u4E3A\u5DE5\u4F5C\u533A"
        }
      ) })
    ] }),
    preview != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: overlay, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: "6px 8px", borderBottom: "1px solid " + C.border, display: "flex", gap: 6, alignItems: "center" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: preview.path, children: preview.path.split("/").pop() }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { color: C.muted, fontSize: 11 }, children: [
          humanSize(preview.size),
          preview.truncated ? "+" : ""
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: btn(false, true), onClick: () => setPreview(null), children: "\u8FD4\u56DE" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { style: { margin: 0, padding: 8, overflow: "auto", flex: 1, fontSize: 11.5, whiteSpace: "pre-wrap", wordBreak: "break-all" }, children: preview.content })
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
