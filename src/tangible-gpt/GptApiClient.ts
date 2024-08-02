type Role = "system" | "user" | "assistant" | "tool" | "function";

type ToolCallFunction = {
    name: string;
    arguments: string;
};

export type ToolCall = {
    id: string;
    function: ToolCallFunction;
};

export type ContentMessage = {
    messageType: "ConrtentMessage";
    role: Role;
    content: string;
};

export type ToolCallsMessage = {
    messageType: "ToolCallsMessage";
    role: Role;
    content: "";
    tool_calls: ToolCall[];
};

export type ResultFromToolMessage = {
    messageType: "ResultFromToolMessage";
    role: Role;
    name: string;
    content: string;
    tool_call_id: string;
};

export type Message = ContentMessage | ToolCallsMessage | ResultFromToolMessage;

export type CompletionRequest = {
    model: string;
    messages: Message[];
    tools: Tool[] | null;
};

export type PropertyType = "string" | "integer" | "boolean" | "double";

export type Property = {
    type: PropertyType;
    description: string;
    enum?: string[];
};

export type Parameters = {
    type: "object";
    properties: { [k: string]: Property };
};

type RequestFunction = {
    name: string;
    description: string | null;
    parameters: Parameters;
};

export type Tool = {
    type: "function";
    function: RequestFunction;
};

type StopChoice = {
    finish_reason: "stop";
    index: number;
    message: ContentMessage;
};

type ToolCallsChoice = {
    finish_reason: "tool_calls";
    index: number;
    message: ToolCallsMessage;
};

type Choice = StopChoice | ToolCallsChoice;

type Usage = {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
};

export type CompletionResponse = {
    id: string;
    model: string;
    choices: Choice[];
    usage: Usage;
};

class GptApiClient {
    private openAiKey: string;

    constructor(openAiKey: string) {
        this.openAiKey = openAiKey;
    }

    public chatCompletion = (
        messages: Message[],
        tools: Tool[] | undefined = undefined,
    ): Promise<CompletionResponse> => {
        const body: CompletionRequest = {
            model: "gpt-4",
            messages: messages,
            tools: tools ?? null,
        };

        return fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.openAiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            },
        ).then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(
                    new Error(
                        `${response.status.toString()} ${response.statusText}`,
                    ),
                );
            }
        });
    };
}

export default GptApiClient;
