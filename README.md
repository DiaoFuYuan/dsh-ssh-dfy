# dsh-ssh-dfy

**DeepSeek Harness 的远程 SSH 工作区插件**：让 Agent 在对话里直接操作远程服务器，并在 Web 侧边栏里
**先选工作区根目录，再浏览它下面的所有文件**。

> A remote SSH workspace plugin for DeepSeek Harness: agent-facing SSH tools plus a sidebar
> file browser that starts from a workspace root you pick.

- 适配：**DSH >= 0.2.0-rc.2**（官方 npm SDK，无需改动 dsh 源码）
- 依赖：本机无需安装 `ssh` / `sftp` 命令（内置 `ssh2`）
- 许可：MIT

---

## 它做什么

### 1. Agent 工具（对话里直接控制服务器）

| 工具 | 作用 |
| --- | --- |
| `ssh_hosts` | 列出已配置的主机（别名/地址/用户/认证方式/工作区根目录），**不返回任何密码** |
| `ssh_exec` | 在远程主机执行 shell 命令（返回退出码 / stdout / stderr / 耗时） |
| `ssh_ls` | 通过 SFTP 列远程目录（默认列该主机的工作区根目录） |
| `ssh_read` | 通过 SFTP 读远程文本文件（默认上限 256 KiB，最大 1 MiB） |

### 2. 侧边栏文件浏览器

点侧栏 **SSH** 入口打开面板，流程是：

1. **选主机**（左侧列表；也可以在面板里新增/删除主机）
2. **选工作区根目录** —— 点「选择根目录…」会从登录家目录开始浏览目录树，选定后点
   「使用此目录作为工作区」
3. **浏览根目录下的所有文件** —— 面包屑 + 目录进入 + 文件预览

工作区根目录是**这个主机在这个插件里的作用域**：面板浏览默认从它开始，`ssh_ls` 不带
`path` 时也返回它，Agent 和界面因此始终对"当前在哪儿"保持一致。

### 3. 认证方式

每台主机三种认证：`ssh-agent`、私钥文件（可带 passphrase）、密码。

- 密码 / passphrase 存放在 `$DSH_HOME/dsh-ssh-dfy/hosts.json`，目录 `0700`、文件 `0600`；
- **任何面向 Agent 或浏览器的 JSON 都不含密码**（只有 `hasPassword` 之类的布尔标记）；
- 推荐用 ssh-agent 或私钥，避免在磁盘上留明文口令。

---

## 安装

### 从 npm

```sh
dsh plugin --profile <你的 profile> add dsh-ssh-dfy
```

### 从 GitHub

```sh
dsh plugin --profile <你的 profile> add github:DiaoFuYuan/dsh-ssh-dfy
```

### 本地开发（link）

```sh
dsh plugin --profile <你的 profile> add link:/absolute/path/to/dsh-ssh-dfy
```

装好后**重启 DSH**（客户端半边需要宿主重新下发 bundle）。侧栏会出现 **SSH** 入口。

---

## 安全边界

- 所有 `/api/dsh-ssh-dfy/*` 路由都是 **loopback-only**：非回环地址直接 403，
  并且校验 `Host` 头与 `Origin` / `Sec-Fetch-Site`，所以把 dsh web 暴露到局域网时
  这些"能驱动远程服务器"的接口不会被外部调用。
- 远程命令输出**原样返回**，可能包含远端环境里的敏感信息，注意对话记录。
- `ssh_exec` 执行的是**远端**命令；本机命令请用本地 shell 工具。

---

## 开发

```sh
npm install
npm run build      # tsc（host 半边）+ esbuild（client 半边，产出 lib/client.js）
npm test           # host 半边 smoke 测试
```

结构：

```
src/index.ts        host 半边入口（注册 routes + tools）
src/routes.ts       /api/dsh-ssh-dfy 路由族（loopback-only）
src/engine.ts       ssh2 连接池：exec / SFTP 列目录 / 读文件
src/store.ts        主机注册表（$DSH_HOME/dsh-ssh-dfy/hosts.json）
src/tools.ts        四个 agent 工具
src/client/         浏览器半边（侧栏行 + 主区页面）
```

## 致谢

DSH 插件（cordis 行 + `dsh.bundle.patch` + `dsh.client` 浏览器半边 + slot 注册）的 API 用法参考了社区开源插件的公开实现结构，
其中 [@linxin666/dsh-ssh](https://www.npmjs.com/package/@linxin666/dsh-ssh)（Apache-2.0）与
[dshmarket](https://www.npmjs.com/package/dshmarket) 的源码是最主要的参考。本仓库的代码为独立实现，不含上述项目的代码。

## 许可

MIT