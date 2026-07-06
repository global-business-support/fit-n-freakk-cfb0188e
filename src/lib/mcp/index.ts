import { defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import listMachinesTool from "./tools/list-machines";

export default defineMcp({
  name: "feet-and-freakk-mcp",
  title: "Feet & Freakk MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Feet & Freakk gym management app. Use `echo` to verify connectivity and `list_machines` to browse gym equipment.",
  tools: [echoTool, listMachinesTool],
});
