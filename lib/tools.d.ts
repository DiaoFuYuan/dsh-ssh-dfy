import type { SshEngine } from './engine.js';
/** Host inventory: what the agent may operate on. */
export declare function sshHostsTool(engine: SshEngine): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Remote command execution. */
export declare function sshExecTool(engine: SshEngine): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Remote directory listing (the same listing the panel renders). */
export declare function sshLsTool(engine: SshEngine): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Remote file read over SFTP. */
export declare function sshReadTool(engine: SshEngine): import("@deepseek-ai/dsh-tools").ToolDefinition;
