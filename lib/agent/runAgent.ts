import "server-only";
import type { Content, Part } from "@google/genai";
import { getGemini } from "../gemini";
import { GEMINI_MODEL } from "../env";
import type { ChatMessage } from "../schemas";
import { tools } from "./tools";
import { toFunctionDeclarations } from "./defineTool";
import { buildSystemPrompt } from "./systemPrompt";
import type { AgentResult, AgentStep } from "./types";

/** Stops the agent from looping forever and exceeding Gemini quota. */
const MAX_ROUNDS = 8;

/**
 * THE AGENT EXECUTION LOOP
 * 1. Formulate conversation history and declare available IT helpdesk tools.
 * 2. Gemini independently selects one or more tools based on natural language understanding.
 * 3. Arguments are rigorously validated against Zod schemas on the server.
 * 4. Tools execute secure server-side database operations in Supabase.
 * 5. Results are delivered back into the conversation context.
 * 6. Repeats sequentially until Gemini reaches its final synthesis or MAX_ROUNDS is exhausted.
 */
export async function runAgent(messages: ChatMessage[]): Promise<AgentResult> {
  const ai = getGemini();
  const steps: AgentStep[] = [];
  const functionDeclarations = toFunctionDeclarations(tools);

  const contents: Content[] = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: buildSystemPrompt(),
        tools: [{ functionDeclarations }],
        temperature: 0.2,
      },
    });

    const calls = response.functionCalls ?? [];

    // When no further tools are requested, synthesize and return final response
    if (calls.length === 0) {
      return {
        reply: response.text?.trim() || "I have processed your request. How else may I assist you with your IT needs?",
        steps,
      };
    }

    // Keep Gemini's model turn with its tool call requests in context history
    const modelTurn = response.candidates?.[0]?.content;
    if (modelTurn) {
      contents.push(modelTurn);
    }

    // Execute each tool requested by the model sequentially
    const responseParts: Part[] = [];
    for (const call of calls) {
      const step = await runTool(call.name ?? "", call.args ?? {});
      steps.push(step);
      responseParts.push({
        functionResponse: {
          id: call.id,
          name: call.name,
          response: step.ok ? { result: step.result } : { error: step.error },
        },
      });
    }

    contents.push({ role: "user", parts: responseParts });
  }

  return {
    reply: "I reached the maximum number of reasoning steps while processing your request. Please check your tickets or ask a more specific question.",
    steps,
  };
}

/**
 * Server-side tool execution with Zod schema validation and error isolation.
 */
async function runTool(name: string, rawArgs: unknown): Promise<AgentStep> {
  const tool = tools.find((t) => t.name === name);
  if (!tool) {
    return {
      tool: name,
      args: rawArgs,
      ok: false,
      writes: false,
      error: `Unknown tool '${name}' requested. Available tools: searchKnowledgeBase, getMyTickets, getTicketStatus, createTicket, updateTicket.`,
    };
  }

  // Strict Zod argument validation
  const parsed = tool.schema.safeParse(rawArgs);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `${i.path.join(".") || "parameter"}: ${i.message}`)
      .join("; ");
    return {
      tool: name,
      args: rawArgs,
      ok: false,
      writes: tool.writes,
      error: `Validation error for tool '${name}': ${message}`,
    };
  }

  try {
    const result = await tool.run(parsed.data);
    return {
      tool: name,
      args: parsed.data,
      ok: true,
      writes: tool.writes,
      result,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Execution failed";
    console.error(`[runTool:${name}] Error:`, message);
    return {
      tool: name,
      args: parsed.data,
      ok: false,
      writes: tool.writes,
      error: message,
    };
  }
}
