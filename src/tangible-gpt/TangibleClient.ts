import GptApiClient, {
    CompletionResponse,
    ContentMessage,
    Message,
    Property,
    PropertyType,
    ResultFromToolMessage,
    Tool,
    ToolCall,
} from "./GptApiClient.ts";
import {
    BooleanCell,
    Cell,
    Column,
    EnumCell,
    FunctionCall,
    GptModel,
    ItemGroup,
    JSONSerializable,
    NumberCell,
    Param,
    ReasoningStrategy,
    Row,
    Table,
    TangibleOptionResponse,
    TangibleOptionResponseSuccess,
    TangibleResponse,
    TangibleResponseFailure,
    TangibleResponseSuccess,
    TextCell,
} from "./model.ts";

interface HasToString {
    toString: () => string;
}

const userContentMessage = (s: string): ContentMessage => ({
    role: "user",
    content: s,
    messageType: "ConrtentMessage",
});

const initialPrompt = (
    reasoningStrategy: ReasoningStrategy,
    prompt: string,
    responseFormatDescription: string | null,
): string => {
    switch (reasoningStrategy) {
        case "Simple":
            return responseFormatDescription !== null ? `${prompt}\n\n${responseFormatDescription}` : prompt;
        case "ThinkStepByStep":
            return `${prompt}\n\nLet's think step by step`;
        case "SuggestMultipleAndPickOne":
            return `${prompt}\n\nGive me some alternative answers to this that make sense. Enumerate them.`;
    }
};

const mapToObject = (map: Map<string, Property>): { [k: string]: Property } => Object.fromEntries(map.entries());

const toPropertyType = (param: Param): PropertyType => {
    switch (param.type) {
        case "integer":
            return "integer";
        case "string":
            return "string";
        case "enum":
            return "string";
        case "boolean":
            return "boolean";
        case "double":
            return "double";
    }
};

const functionCallTools = <I = string, O = string>(functionCalls: FunctionCall<I, O>[]): Tool[] => {
    return functionCalls.map((fc) => {
        const properties: [string, Property][] = fc.params.map((p) => {
            const propertyType = toPropertyType(p);
            const property: Property =
                p.type === "enum"
                    ? { type: propertyType, description: p.name, enum: p.enum }
                    : { type: propertyType, description: p.name };

            return [p.name, property];
        });

        return {
            type: "function",
            function: {
                name: fc.name,
                description: fc.description,
                parameters: {
                    type: "object",
                    properties: mapToObject(new Map(properties)),
                },
            },
        };
    });
};

const last = <T>(arr: T[]): T | null => (arr.length > 0 ? arr[arr.length - 1] : null);

const iDontKnow = (response: TangibleResponseSuccess<string>): boolean =>
    response.value.toLowerCase().trim().includes("i don't know");

const parseBoolean = (s: string): boolean | null => {
    const cleaned = s.toLowerCase().trim();

    if (["false", "no", "n", "0"].includes(cleaned)) {
        return false;
    } else if (["true", "yes", "y", "1"].includes(cleaned)) {
        return true;
    } else {
        return null;
    }
};

const parseSingleChoice = (s: string, options: string[]): string | null => {
    const found = options.find((o) => o === s);
    return found !== undefined ? found : null;
};

const serializeRow = (row: Row): string => row.cells.map(serializeCell).join(";");

const serializeCell = (cell: Cell): string => {
    switch (cell.type) {
        case "TextCell":
            return cell.value;
        case "BooleanCell":
            return cell.value ? "true" : "false";
        case "NumberCell":
            return cell.value.toString();
        case "EnumCell":
            return cell.value;
    }
};

const withoutQuotes = (s: string) => s.replace(/"/g, '');

const renderTable = (table: Table) => {
    const columnNames = table.columns.map((c) => c.name).join(";");
    const serializedRows = table.rows.map(serializeRow).join("\n");
    return `csv file format (semicolon separated) with columns: ${columnNames}\n${serializedRows}\n`;
};

const toBooleanCell = (b: boolean, column: Column): BooleanCell => ({
    type: "BooleanCell",
    column: column,
    value: b,
});

const toNumberCell = (n: number, column: Column): NumberCell => ({
    type: "NumberCell",
    column: column,
    value: n,
});

const toSingleChoiceCell = (s: string, column: Column): EnumCell => ({
    type: "EnumCell",
    column: column,
    value: s,
});

const toTextCell = (s: string, column: Column): TextCell => ({
    type: "TextCell",
    column: column,
    value: s,
});

const describeColumn = (c: Column) => {
    switch (c.type) {
        case "BooleanColumn":
            return `${c.name}: Boolean (true or false)`;
        case "NumberColumn":
            return `${c.name}: Number (any number including decimal)`;
        case "TextColumn":
            return `${c.name}: String`;
        case "EnumColumn":
            return `${c.name}: One of the following (others are unacceptable): ${c.options.join(", ")}`;
    }
};

const groupsPrompt = (items: string[], groupNames?: Set<string>, groupingCriteria?: string): string => {
    const criteriaPrompt = groupingCriteria
        ? `Items should be grouped by the following criteria: ${groupingCriteria}`
        : ``;
    const itemsPrompt = `Here are the items that should be distributed in the right groups:\n\n${items.join("\n")}`;

    if (groupNames !== undefined) {
        return `I want you to put some items into different groups.
            
These groups are: ${[...groupNames].join(", ")}
 ${criteriaPrompt}

 ${itemsPrompt}`;
    } else {
        return `I want you to put some items into different groups.
Make up some sensible names for these groups.

${criteriaPrompt}

${itemsPrompt}`;
    }
};

const success = <T>(value: T, rawMessage: string, history: Message[]): TangibleResponseSuccess<T> => ({
    outcome: "Success",
    value: value,
    rawMessage: rawMessage,
    history: history,
});

const successOption = <T>(
    value: T | null,
    rawMessage: string,
    history: Message[],
): TangibleOptionResponseSuccess<T> => ({
    outcome: "Success",
    value: value,
    rawMessage: rawMessage,
    history: history,
});

const failure = (reason: string, rawMessage: string, history: Message[]): TangibleResponseFailure => ({
    outcome: "Failure",
    reason: reason,
    rawMessage: rawMessage,
    history: history,
});

const rejection = (message: string) => Promise.reject(new Error(message));

const parseTable = (columns: Column[], s: string): Table | null => {
    const lines = s.split("\n").filter((l) => l.includes(";"));

    const rows: (Row | null)[] = lines.map((line) => {
        const parts = line
            .split(";")
            .map(withoutQuotes)
            .map((p) => p.trim());
        const cells: (Cell | null)[] = columns.map((column, idx) => {
            const part = parts[idx];
            switch (column.type) {
                case "BooleanColumn": {
                    const parsedBoolean = parseBoolean(part);

                    return parsedBoolean !== null ? toBooleanCell(parsedBoolean, column) : null;
                }
                case "NumberColumn": {
                    let parsedNumber: number | null;
                    try {
                        parsedNumber = parseFloat(part);
                    } catch {
                        parsedNumber = null;
                    }

                    return parsedNumber !== null ? toNumberCell(parsedNumber, column) : null;
                }
                case "EnumColumn": {
                    const parsedSingleChoice = parseSingleChoice(part, column.options);

                    return parsedSingleChoice !== null ? toSingleChoiceCell(parsedSingleChoice, column) : null;
                }
                case "TextColumn": {
                    return toTextCell(part, column);
                }
            }
        });

        if (cells.every((c) => c !== null)) {
            return { cells: cells as Cell[] };
        } else {
            return null;
        }
    });

    if (rows.every((r) => r !== null)) {
        return {
            columns: columns,
            rows: rows.filter((r) => r !== null) as Row[],
        };
    } else {
        return null;
    }
};

class TangibleClient {
    private gptApiClient: GptApiClient;

    public constructor(openAiKey: string, model: GptModel = "gpt-4") {
        this.gptApiClient = new GptApiClient(openAiKey, model);
    }

    public expectJson = <
        R extends JSONSerializable,
        I extends JSONSerializable = null,
        O extends JSONSerializable = null,
    >(
        prompt: string,
        example: R,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponse<R>> => {
        const responseFormatDescription = `The response must be valid JSON and only JSON, nothing else\n\nExample:\n${JSON.stringify(
            example,
        )}`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            try {
                return success(JSON.parse(r.value) as R, r.rawMessage, r.history);
            } catch {
                return failure("Could not parse JSON", r.rawMessage, r.history);
            }
        });
    };

    private plainTextChat = (prompt: string, history: Message[] = []): Promise<TangibleResponseSuccess<string>> => {
        const message: ContentMessage = userContentMessage(prompt);
        const messages = history.concat(message);

        return this.gptApiClient.chatCompletion(messages).then((response) => {
            const lastChoice = last(response.choices);

            if (lastChoice !== null) {
                const reply = lastChoice.message;

                return success(reply.content, reply.content, history.concat(message).concat(reply));
            } else {
                const errorMsg = `Invalid format from GPT: ${JSON.stringify(response)}`;
                return rejection(errorMsg);
            }
        });
    };

    private chatWithFunctionCalls = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        prompt: string,
        functionCalls: FunctionCall<I, O>[],
        history: Message[],
    ): Promise<TangibleResponseSuccess<string>> => {
        const message: Message = userContentMessage(prompt);
        const messages = history.concat(message);
        const tools = functionCallTools(functionCalls);

        const initialResponse = this.gptApiClient.chatCompletion(messages, tools);

        return initialResponse
            .then((ir) =>
                this.callFunctionIfApplicable(
                    ir,
                    functionCalls,
                    [message as Message].concat(ir.choices.map((c) => c.message)),
                ),
            )
            .then((response) => {
                const reply = last(response.choices.map((c) => c.message));
                const history = [message as Message].concat(response.choices.map((c) => c.message));
                if (reply !== null) {
                    return success(reply.content, reply.content, history);
                } else {
                    return rejection("Invalid format from GPT: " + JSON.stringify(response));
                }
            });
    };

    private callFunctionIfApplicable = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        initialResponse: CompletionResponse,
        functionCalls: FunctionCall<I, O>[],
        history: Message[],
    ): Promise<CompletionResponse> => {
        const last = initialResponse.choices[initialResponse.choices.length - 1];

        switch (last.finish_reason) {
            case "stop":
                return Promise.resolve(initialResponse);
            case "tool_calls": {
                const toolCalls: ToolCall[] = last.message.tool_calls;

                const promises: Promise<ResultFromToolMessage>[] = toolCalls
                    .map((tc) => {
                        const matchingFunctionCall: FunctionCall<I, O> | undefined = functionCalls.find(
                            (fc) => fc.name === tc.function.name,
                        );

                        // Far from ideal we don't type check the parameters, especially for enums

                        const parsed = JSON.parse(tc.function.arguments) as I;

                        if (matchingFunctionCall !== undefined) {
                            const promise = matchingFunctionCall.function(parsed);

                            return promise.then((result) => ({
                                messageType: "ResultFromToolMessage",
                                role: "tool",
                                name: tc.function.name,
                                content: JSON.stringify(result),
                                tool_call_id: tc.id,
                            }));
                        } else {
                            return null;
                        }
                    })
                    .filter((p) => p !== null) as Promise<ResultFromToolMessage>[];

                return Promise.all(promises).then((messages) => {
                    return this.gptApiClient.chatCompletion(history.concat(messages), functionCallTools(functionCalls));
                });
            }
        }
    };

    private withPossibleFunctionCalls = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        prompt: string,
        history: Message[],
        functionCalls: FunctionCall<I, O>[],
    ): Promise<TangibleResponseSuccess<string>> => {
        if (functionCalls.length > 0) {
            return this.chatWithFunctionCalls(prompt, functionCalls, history);
        } else {
            return this.plainTextChat(prompt, history);
        }
    };

    private interact = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        prompt: string,
        history: Message[],
        functionCalls: FunctionCall<I, O>[],
        ReasoningStrategy: ReasoningStrategy,
        responseFormatDescription: string | null,
    ): Promise<TangibleResponseSuccess<string>> =>
        this.withPossibleFunctionCalls(prompt, history, functionCalls).then((response) =>
            this.afterPossibleReasoning(response, ReasoningStrategy, responseFormatDescription),
        );

    private afterPossibleReasoning = (
        response: TangibleResponseSuccess<string>,
        reasoningStrategy: ReasoningStrategy,
        responseFormatDescription: string | null,
    ): Promise<TangibleResponseSuccess<string>> => {
        switch (reasoningStrategy) {
            case "Simple":
                return Promise.resolve(response);
            case "ThinkStepByStep": {
                const prompt =
                    responseFormatDescription !== null
                        ? `Give me an answer.\n\n${responseFormatDescription}`
                        : `Give me an answer.`;
                return this.expectPlainText(prompt, response.history);
            }
            case "SuggestMultipleAndPickOne": {
                const prompt2 =
                    responseFormatDescription !== null
                        ? `Pick the best answer.\n\n${responseFormatDescription}`
                        : `Pick the best answer.`;
                return this.expectPlainText(prompt2, response.history);
            }
        }
    };

    public expectPlainText = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        prompt: string,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponseSuccess<string>> =>
        this.interact(initialPrompt(reasoningStrategy, prompt, null), history, functionCalls, reasoningStrategy, null);

    public expectJsonOption = <
        R extends JSONSerializable,
        I extends JSONSerializable = null,
        O extends JSONSerializable = null,
    >(
        prompt: string,
        example: R,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleOptionResponse<R>> => {
        const responseFormatDescription = `If you don't, know the answer, simply say "I don't know". Otherwise, the response must be in valid JSON and only JSON, nothing else.\n\nExample:\n${JSON.stringify(
            example,
        )}`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            try {
                return success(iDontKnow(r) ? null : JSON.parse(r.value), r.rawMessage, r.history);
            } catch {
                const reason = "Could not parse JSON";
                return failure(reason, r.rawMessage, r.history);
            }
        });
    };

    public expectPlainTextOption = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        prompt: string,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleOptionResponse<string>> => {
        const responseFormatDescription = `If you don't know the answer, simply say "I don't know"`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => success(iDontKnow(r) ? null : r.value, r.rawMessage, r.history));
    };

    public expectBoolean = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        prompt: string,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponse<boolean>> => {
        const responseFormatDescription = `I only want a yes or no answer, nothing else. Reply with either "yes" or "no"`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            const value = parseBoolean(r.value);
            if (value !== null) {
                return success(value, r.rawMessage, r.history);
            } else {
                return failure("Could not parse boolean value", r.rawMessage, r.history);
            }
        });
    };

    public expectBooleanOption = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        prompt: string,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleOptionResponse<boolean>> => {
        const responseFormatDescription = `If you don't know the answer, simply reply with "I don't know", nothing else.\nI only want a yes or no answer, nothing else. Reply with either "yes" or "no"`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            if (iDontKnow(r)) {
                return successOption(null, r.rawMessage, r.history);
            } else {
                const value = parseBoolean(r.value);
                if (value !== null) {
                    return successOption(value, r.rawMessage, r.history);
                } else {
                    return failure("Could not parse boolean value", r.rawMessage, r.history);
                }
            }
        });
    };

    public expectNumber = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        prompt: string,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponse<number>> => {
        const responseFormatDescription = `I only want a number (all digits) as an answer, nothing else.`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            try {
                return success(parseFloat(r.value), r.rawMessage, r.history);
            } catch {
                const reason = "Could not parse float value";
                return failure(reason, r.rawMessage, r.history);
            }
        });
    };

    public expectNumberOption = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        prompt: string,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleOptionResponse<number>> => {
        const responseFormatDescription = `If you don't know the answer, simply reply with "I don't know", nothing else.\nI only want a number as an answer, nothing else.`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            if (iDontKnow(r)) {
                return successOption(null, r.rawMessage, r.history);
            } else {
                try {
                    return successOption(parseFloat(r.value), r.rawMessage, r.history);
                } catch {
                    const reason = "Could not parse float value";
                    return failure(reason, r.rawMessage, r.history);
                }
            }
        });
    };

    public expectEnumCase = <
        T extends HasToString,
        I extends JSONSerializable = null,
        O extends JSONSerializable = null,
    >(
        prompt: string,
        options: T[],
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponse<T>> => {
        const optionsDescription = options.map((o) => o.toString()).join(", ");
        const responseFormatDescription = `I want you to respond with one of the following values, nothing else:\n${optionsDescription}`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            const found = options.find((o) => o.toString().toLowerCase() === r.value);

            if (found !== undefined) {
                return success(found, r.rawMessage, r.history);
            } else {
                const reason = `Invalid value for enum. Only valid: ${optionsDescription}`;
                return failure(reason, r.rawMessage, r.history);
            }
        });
    };

    public expectEnumCaseOption = <
        T extends HasToString,
        I extends JSONSerializable = null,
        O extends JSONSerializable = null,
    >(
        prompt: string,
        options: T[],
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleOptionResponse<T>> => {
        const optionsDescription = options.map((o) => o.toString()).join(", ");
        const responseFormatDescription = `If you don't know, simply reply "I don't know", nothing else.\nI want you to respond with one of the following values, nothing else:\n${optionsDescription}`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            if (iDontKnow(r)) {
                return successOption(null, r.rawMessage, r.history);
            } else {
                const found = options.find((o) => o.toString().toLowerCase() === r.value);

                if (found !== undefined) {
                    return successOption(found, r.rawMessage, r.history);
                } else {
                    const reason = `Invalid value for enum. Only valid: ${optionsDescription}`;
                    return failure(reason, r.rawMessage, r.history);
                }
            }
        });
    };

    public expectEnumCases = <
        T extends HasToString,
        I extends JSONSerializable = null,
        O extends JSONSerializable = null,
    >(
        prompt: string,
        options: T[],
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponse<Set<T>>> => {
        const optionsDescription = options.map((o) => o.toString()).join(", ");

        const responseFormatDescription = `Given the following options:\n${optionsDescription}\nI want you to respond with those that apply. If none of them apply, just say "None".\nI want a list of options on a single line, separated by comma, and nothing else in the response.`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            const splitted = r.value.split(",").map((p) => p.toLowerCase());

            const allSelectionsValid = splitted.every(
                (p) => options.find((o) => o.toString().toLowerCase() === p) !== undefined,
            );
            const result = options.filter((o) => splitted.find((p) => p === o.toString().toLowerCase()) !== undefined);

            if (allSelectionsValid) {
                return success(new Set(result), r.rawMessage, r.history);
            } else {
                const reason = `Invalid value(s) for enum. Only valid:  ${optionsDescription}`;
                return failure(reason, r.rawMessage, r.history);
            }
        });
    };

    public expectGroups = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        items: string[],
        groupNames?: Set<string>,
        groupingCriteria?: string,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponse<ItemGroup[]>> => {
        const prompt = groupsPrompt(items, groupNames, groupingCriteria);

        const example: ItemGroup[] = [
            { name: "group1", items: ["item1", "item2"] },
            { name: "group2", items: ["item3"] },
        ];
        const responseFormatDescription = `The response must be in valid JSON and only JSON, nothing else\n\nExample:\n${JSON.stringify(
            example,
            null,
            2,
        )}`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            try {
                return success(JSON.parse(r.value) as ItemGroup[], r.rawMessage, r.history);
            } catch {
                const reason = "Invalid response";
                return failure(reason, r.rawMessage, r.history);
            }
        });
    };

    public expectItems = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        prompt: string,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponse<string[]>> => {
        const responseFormatDescription = `I only want a list of items. Each item on its own line. Nothing else.`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            const items = r.value.split("\n").filter((s) => s.length > 0);
            return success(items, r.rawMessage, r.history);
        });
    };

    public expectSorted = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        items: string[],
        sortingCriteria?: string,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponse<string[]>> => {
        const itemsPrompt = items.join("\n");
        const prompt =
            sortingCriteria !== undefined
                ? `I want you to sort a list of items based on the following criteria: ${sortingCriteria}

Here are the items to be sorted\n${itemsPrompt}`
                : `I want you to sort the following items in the most obvious way:
${itemsPrompt}`;
        const responseFormatDescription = `The response must be a sorted JSON array of strings (items), nothing else`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            try {
                return success(JSON.parse(r.value) as string[], r.rawMessage, r.history);
            } catch {
                const reason = "Could not parse JSON (expected array of strings) from GPT";
                return failure(reason, r.rawMessage, r.history);
            }
        });
    };

    public expectExtendedItems = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        items: string[],
        noOfAddedItems: number = 1,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponse<string[]>> => {
        const itemsPrompt = items.join("\n");

        const prompt =
            noOfAddedItems === 1
                ? `Extend this list with the most obvious item: ${itemsPrompt}`
                : `Extend this list with the most obvious ${noOfAddedItems} items: ${itemsPrompt}`;

        const responseFormatDescription = `The added item must be last. The response must be a valid JSON array of strings (items), nothing else`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            try {
                return success(JSON.parse(r.value) as string[], r.rawMessage, r.history);
            } catch {
                const reason = "Could not parse JSON (expected array of strings) from GPT";
                return failure(reason, r.rawMessage, r.history);
            }
        });
    };

    public expectFiltered = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        items: string[],
        predicate: string,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponse<string[]>> => {
        const prompt = `I have a list of items that I need to filter.
Only include the items that adhere the following is true: ${predicate}

The items are:
${items.join("\n")}`;

        const responseFormatDescription = `The response must be a filtered JSON array of strings (items), nothing else`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            try {
                return success(JSON.parse(r.value) as string[], r.rawMessage, r.history);
            } catch {
                const reason = "Could not parse JSON (expected array of strings)";
                return failure(reason, r.rawMessage, r.history);
            }
        });
    };

    public expectTable = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        prompt: string,
        columns: Column[],
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponse<Table>> => {
        const responseFormatDescription = `The response must be CSV format (semicolon separated) with columns: ${columns
            .map((c) => c.name)
            .join(";")}
No header row, just data

Columns:
${columns.map(describeColumn).join("\n")}`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            const table = parseTable(columns, r.value);

            if (table !== null) {
                return success(table, r.rawMessage, r.history);
            } else {
                const reason = "Could not parse table";
                return failure(reason, r.rawMessage, r.history);
            }
        });
    };

    public expectTableWithAddedColumn = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        columnToAdd: Column,
        intention: string,
        table: Table,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponse<Table>> => {
        const prompt = `${renderTable(table)}
    
Expand this table with another column:
${describeColumn(columnToAdd)}
    
${intention}`;

        const resultColumns = table.columns.concat(columnToAdd);

        const responseFormatDescription = `The response must be in CSV format (semicolon separated) with columns: ${resultColumns
            .map((c) => c.name)
            .join(";")} header row, just data

Columns:
${resultColumns.map(describeColumn).join("\n")}`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            const value = parseTable(resultColumns, r.value);
            if (value !== null) {
                return success(value, r.rawMessage, r.history);
            } else {
                const reason = "Could not parse table";
                return failure(reason, r.rawMessage, r.history);
            }
        });
    };

    public expectTableWithAddedRow = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        table: Table,
        rowDescription: string,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponse<Table>> => {
        const prompt = `${renderTable(table)}

Expand this table with another row (as the last row in the table):
${rowDescription}`;

        const responseFormatDescription = `The response must be in CSV format (semicolon separated) with columns: ${table.columns
            .map((c) => c.name)
            .join(";")};
No header row, just data

Columns:
${table.columns.map(describeColumn).join("\n")}`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            const value = parseTable(table.columns, r.value);
            if (value !== null) {
                return success(value, r.rawMessage, r.history);
            } else {
                const reason = "Could not parse table";
                return failure(reason, r.rawMessage, r.history);
            }
        });
    };

    public expectAdditionalRows = <I extends JSONSerializable = null, O extends JSONSerializable = null>(
        table: Table,
        rowDescription: string,
        noOfRows: number = 1,
        history: Message[] = [],
        functionCalls: FunctionCall<I, O>[] = [],
        reasoningStrategy: ReasoningStrategy = "Simple",
    ): Promise<TangibleResponse<Table>> => {
        const prompt = `${renderTable(table)}

I need more ${noOfRows} rows in this table (do not not include the given rows in the response):
${rowDescription}`;

        const responseFormatDescription = `The response must be in CSV format (semicolon separated) with columns: ${table.columns
            .map((c) => c.name)
            .join(";")};
No header row, just data

Columns:
${table.columns.map(describeColumn).join("\n")}`;

        return this.interact(
            initialPrompt(reasoningStrategy, prompt, responseFormatDescription),
            history,
            functionCalls,
            reasoningStrategy,
            responseFormatDescription,
        ).then((r) => {
            const value = parseTable(table.columns, r.value);
            if (value !== null) {
                return success(value, r.rawMessage, r.history);
            } else {
                const reason = "Could not parse table";
                return failure(reason, r.rawMessage, r.history);
            }
        });
    };


}

export default TangibleClient;
