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
  PANEL_ID: () => PANEL_ID,
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
  async saveHost(input2) {
    const result = await request(API.hosts, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input2)
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
function WorkspaceIcon({ size }) {
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
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4.5 6.25h7M4.5 9h7M4.5 11.5h4" })
      ]
    }
  );
}
var COLORS = {
  border: "var(--ds-color-border, #2a2f3a)",
  muted: "var(--ds-color-text-secondary, #9aa4b2)",
  text: "var(--ds-color-text-primary, #e6e9ef)",
  bg: "var(--ds-color-bg-secondary, #171a21)",
  accent: "var(--ds-color-accent, #4c6ef5)"
};
var button = (primary = false) => ({
  background: primary ? COLORS.accent : "transparent",
  color: primary ? "#fff" : COLORS.text,
  border: "1px solid " + (primary ? COLORS.accent : COLORS.border),
  borderRadius: 6,
  padding: "4px 10px",
  fontSize: 12,
  cursor: "pointer"
});
var input = {
  background: "transparent",
  color: COLORS.text,
  border: "1px solid " + COLORS.border,
  borderRadius: 6,
  padding: "5px 8px",
  fontSize: 12,
  width: "100%",
  boxSizing: "border-box"
};
function humanSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
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
  const [pickerOpen, setPickerOpen] = (0, import_react.useState)(false);
  const [pickerListing, setPickerListing] = (0, import_react.useState)(null);
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
    const next = keepAlias !== void 0 && list.some((host) => host.alias === keepAlias) ? keepAlias : list[0]?.alias ?? "";
    setAlias(next);
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
    const host = hosts.find((item) => item.alias === alias);
    const workspace = host?.workspaceRoot ?? "";
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
    if (alias === "") return;
    setPickerOpen(true);
    void run(async () => {
      const home = await sshApi.home(alias);
      setPickerListing(await sshApi.list(alias, home));
    });
  }, [alias, run]);
  const pickerGo = (0, import_react.useCallback)((path) => {
    void run(async () => {
      setPickerListing(await sshApi.list(alias, path));
    });
  }, [alias, run]);
  const usePickedRoot = (0, import_react.useCallback)((path) => {
    void run(async () => {
      await sshApi.saveHost({ ...selected, alias: selected?.alias ?? "", port: selected?.port ?? 22, auth: selected?.auth ?? "agent", workspaceRoot: path });
      setPickerOpen(false);
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
  const deleteHost = (0, import_react.useCallback)((target) => {
    void run(async () => {
      await sshApi.deleteHost(target);
      await refreshHosts();
    });
  }, [refreshHosts, run]);
  const openFile = (0, import_react.useCallback)((path) => {
    void run(async () => {
      const result = await sshApi.read(alias, path);
      setPreview({ path: result.path, content: result.content, truncated: result.truncated, size: result.size });
    });
  }, [alias, run]);
  const breadcrumb = listing?.path ?? "";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", height: "100%", minHeight: 0, color: COLORS.text, fontSize: 13, background: COLORS.bg }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { style: { width: 240, flex: "0 0 240px", borderRight: "1px solid " + COLORS.border, display: "flex", flexDirection: "column", minHeight: 0 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: "10px 12px", borderBottom: "1px solid " + COLORS.border, display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { fontSize: 13 }, children: "SSH \u5DE5\u4F5C\u533A" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: button(), onClick: () => setFormOpen((value) => !value), children: formOpen ? "\u53D6\u6D88" : "+ \u4E3B\u673A" })
      ] }),
      formOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: 12, borderBottom: "1px solid " + COLORS.border, display: "grid", gap: 6 }, children: [
        [
          ["alias", "\u522B\u540D\uFF08\u5DE5\u5177\u91CC\u7528\uFF09"],
          ["host", "\u4E3B\u673A / IP"],
          ["user", "\u7528\u6237\u540D"],
          ["privateKeyPath", "\u79C1\u94A5\u8DEF\u5F84\uFF08auth=key\uFF09"]
        ].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "grid", gap: 3 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: COLORS.muted, fontSize: 11 }, children: label }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              style: input,
              value: String(form[key] ?? ""),
              onChange: (event) => setForm({ ...form, [key]: event.target.value })
            }
          )
        ] }, String(key))),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 6 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "grid", gap: 3, width: 80 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: COLORS.muted, fontSize: 11 }, children: "\u7AEF\u53E3" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { style: input, value: String(form.port), onChange: (event) => setForm({ ...form, port: Number(event.target.value) || 22 }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "grid", gap: 3, flex: 1 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: COLORS.muted, fontSize: 11 }, children: "\u8BA4\u8BC1\u65B9\u5F0F" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { style: input, value: form.auth, onChange: (event) => setForm({ ...form, auth: event.target.value }), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "agent", children: "ssh-agent" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "key", children: "\u79C1\u94A5\u6587\u4EF6" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "password", children: "\u5BC6\u7801" })
            ] })
          ] })
        ] }),
        form.auth === "password" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "grid", gap: 3 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: COLORS.muted, fontSize: 11 }, children: "\u5BC6\u7801\uFF08\u5B58\u5728\u672C\u673A 0600 \u6587\u4EF6\u91CC\uFF09" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { style: input, type: "password", value: form.password ?? "", onChange: (event) => setForm({ ...form, password: event.target.value }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: button(true), onClick: saveHost, disabled: busy, children: "\u4FDD\u5B58\u4E3B\u673A" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { overflow: "auto", flex: 1, minHeight: 0 }, children: [
        hosts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { color: COLORS.muted, padding: 12, fontSize: 12 }, children: "\u8FD8\u6CA1\u6709\u4E3B\u673A\uFF0C\u70B9\u53F3\u4E0A\u89D2\u300C+ \u4E3B\u673A\u300D\u6DFB\u52A0\u4E00\u53F0\u3002" }),
        hosts.map((host) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            onClick: () => setAlias(host.alias),
            style: {
              padding: "8px 12px",
              cursor: "pointer",
              borderBottom: "1px solid " + COLORS.border,
              background: host.alias === alias ? "rgba(76,110,245,0.14)" : "transparent"
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", gap: 6 }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { fontSize: 12 }, children: host.alias }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    style: { ...button(), padding: "1px 6px", fontSize: 11 },
                    onClick: (event) => {
                      event.stopPropagation();
                      deleteHost(host.alias);
                    },
                    children: "\u5220"
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { color: COLORS.muted, fontSize: 11 }, children: [
                host.user,
                "@",
                host.host,
                ":",
                host.port
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { color: COLORS.muted, fontSize: 11 }, children: [
                "\u6839\u76EE\u5F55\uFF1A",
                host.workspaceRoot ?? "\uFF08\u672A\u8BBE\u7F6E\uFF0C\u9ED8\u8BA4 ~\uFF09"
              ] })
            ]
          },
          host.alias
        ))
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: "10px 14px", borderBottom: "1px solid " + COLORS.border, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: COLORS.muted, fontSize: 12 }, children: "\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { style: { fontSize: 12 }, children: root === "" ? selected?.workspaceRoot ?? "\u672A\u8BBE\u7F6E\uFF08\u9ED8\u8BA4\u767B\u5F55\u5BB6\u76EE\u5F55\uFF09" : root }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: button(), onClick: openPicker, disabled: alias === "", children: "\u9009\u62E9\u6839\u76EE\u5F55\u2026" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: button(), onClick: () => openPath(root === "" ? void 0 : root), disabled: alias === "", children: "\u5237\u65B0" }),
        busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: COLORS.muted, fontSize: 11 }, children: "\u52A0\u8F7D\u4E2D\u2026" })
      ] }),
      error !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { margin: "8px 14px", padding: "8px 10px", border: "1px solid #d64545", borderRadius: 6, color: "#ffb4b4", fontSize: 12, whiteSpace: "pre-wrap" }, children: error }),
      alias === "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { padding: 24, color: COLORS.muted }, children: "\u5148\u5728\u5DE6\u4FA7\u9009\u62E9\u6216\u6DFB\u52A0\u4E00\u53F0\u4E3B\u673A\u3002" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", flex: 1, minHeight: 0 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: "6px 14px", color: COLORS.muted, fontSize: 12, borderBottom: "1px solid " + COLORS.border, display: "flex", gap: 10, alignItems: "center" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: button(), onClick: () => listing?.parent != null && openPath(listing.parent), disabled: listing?.parent == null, children: "\u2191 \u4E0A\u7EA7" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: breadcrumb === "" ? "\u2014" : breadcrumb })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { overflow: "auto", flex: 1, minHeight: 0 }, children: [
            (listing?.entries ?? []).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "div",
              {
                onClick: () => entry.type === "dir" ? openPath(entry.path) : openFile(entry.path),
                style: { padding: "5px 14px", cursor: "pointer", display: "flex", gap: 10, alignItems: "center", borderBottom: "1px solid " + COLORS.border },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: 14, textAlign: "center" }, children: entry.type === "dir" ? "\u{1F4C1}" : entry.type === "link" ? "\u{1F517}" : "\u{1F4C4}" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: entry.name }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: COLORS.muted, fontSize: 11 }, children: entry.type === "dir" ? "" : humanSize(entry.size) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: COLORS.muted, fontSize: 11, width: 52, textAlign: "right" }, children: entry.mode })
                ]
              },
              entry.path
            )),
            listing != null && listing.entries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { padding: 14, color: COLORS.muted }, children: "\u7A7A\u76EE\u5F55" })
          ] })
        ] }),
        preview != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { width: "46%", flex: "0 0 46%", borderLeft: "1px solid " + COLORS.border, display: "flex", flexDirection: "column", minHeight: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: "6px 12px", borderBottom: "1px solid " + COLORS.border, display: "flex", gap: 8, alignItems: "center" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }, children: preview.path }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { color: COLORS.muted, fontSize: 11 }, children: [
              humanSize(preview.size),
              preview.truncated ? " \xB7 \u5DF2\u622A\u65AD" : ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: button(), onClick: () => setPreview(null), children: "\u5173\u95ED" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { style: { margin: 0, padding: 12, overflow: "auto", flex: 1, fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-all" }, children: preview.content })
        ] })
      ] })
    ] }),
    pickerOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 40 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { width: 560, maxHeight: "70vh", background: COLORS.bg, border: "1px solid " + COLORS.border, borderRadius: 8, display: "flex", flexDirection: "column" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: "10px 12px", borderBottom: "1px solid " + COLORS.border, display: "flex", gap: 8, alignItems: "center" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { flex: 1, fontSize: 13 }, children: "\u9009\u62E9\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: button(), onClick: () => pickerGo(pickerListing?.parent ?? void 0), disabled: pickerListing?.parent == null, children: "\u2191 \u4E0A\u7EA7" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: button(), onClick: () => setPickerOpen(false), children: "\u53D6\u6D88" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { padding: "6px 12px", color: COLORS.muted, fontSize: 12, borderBottom: "1px solid " + COLORS.border }, children: pickerListing?.path ?? "\u2026" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { overflow: "auto", flex: 1, minHeight: 0 }, children: (pickerListing?.entries ?? []).filter((entry) => entry.type === "dir").map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { onClick: () => pickerGo(entry.path), style: { padding: "5px 12px", cursor: "pointer", borderBottom: "1px solid " + COLORS.border }, children: [
        "\u{1F4C1} ",
        entry.name
      ] }, entry.path)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { padding: 10, borderTop: "1px solid " + COLORS.border, display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          style: button(true),
          disabled: pickerListing == null,
          onClick: () => pickerListing != null && usePickedRoot(pickerListing.path),
          children: "\u4F7F\u7528\u6B64\u76EE\u5F55\u4F5C\u4E3A\u5DE5\u4F5C\u533A"
        }
      ) })
    ] }) })
  ] });
}

// src/client/index.tsx
var PANEL_ID = "ssh-dfy";
var PANEL_ORDER = 45;
var inject = ["slots"];
function apply(ctx) {
  const slots = ctx.slots;
  if (slots === void 0) {
    console.warn("[dsh-ssh-dfy] slot registry missing; panel not mounted");
    return;
  }
  const disposers = [];
  try {
    disposers.push(slots.inject("sidebar.panellist", () => slots.register({
      name: "sidebar.panellist",
      id: PANEL_ID,
      order: PANEL_ORDER,
      label: () => "SSH"
    }, WorkspaceIcon)));
    disposers.push(slots.inject("main", () => slots.register({
      name: "main",
      key: PANEL_ID
    }, WorkspacePanel)));
  } catch (error) {
    console.warn("[dsh-ssh-dfy] panel registration failed:", error);
  }
  ctx.effect(() => () => {
    for (const dispose of disposers.splice(0)) dispose();
  }, "dsh-ssh-dfy: ui mounts");
}

    return module.exports;
  },
});
