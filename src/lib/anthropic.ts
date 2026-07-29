import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "sk-ant-not-configured",
});

export const CLAUDE_MODEL = "claude-sonnet-5";
