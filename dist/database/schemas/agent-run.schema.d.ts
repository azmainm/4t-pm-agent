import { Document } from 'mongoose';
export declare class AgentRun extends Document {
    runId: string;
    runType: 'ingestion' | 'sprint_plan';
    startedAt: Date;
    completedAt?: Date;
    status: 'running' | 'completed' | 'failed';
    error?: string;
    stats?: {
        transcriptsFetched?: number;
        messagesFetched?: number;
        summariesGenerated?: number;
        llmTokensUsed?: number;
        llmCost?: number;
        agentIterations?: number;
        durationMs?: number;
    };
    steps?: Array<{
        stepName: string;
        startedAt: Date;
        completedAt?: Date;
        durationMs?: number;
        success: boolean;
        error?: string;
        metadata?: Record<string, unknown>;
    }>;
    sprintPlanId?: string;
    requestId?: string;
}
export declare const AgentRunSchema: import("mongoose").Schema<AgentRun, import("mongoose").Model<AgentRun, any, any, any, (Document<unknown, any, AgentRun, any, import("mongoose").DefaultSchemaOptions> & AgentRun & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, AgentRun, any, import("mongoose").DefaultSchemaOptions> & AgentRun & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, AgentRun>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AgentRun, Document<unknown, {}, AgentRun, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AgentRun & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    error?: import("mongoose").SchemaDefinitionProperty<string | undefined, AgentRun, Document<unknown, {}, AgentRun, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AgentRun & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, AgentRun, Document<unknown, {}, AgentRun, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AgentRun & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<"running" | "completed" | "failed", AgentRun, Document<unknown, {}, AgentRun, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AgentRun & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    runId?: import("mongoose").SchemaDefinitionProperty<string, AgentRun, Document<unknown, {}, AgentRun, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AgentRun & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    runType?: import("mongoose").SchemaDefinitionProperty<"ingestion" | "sprint_plan", AgentRun, Document<unknown, {}, AgentRun, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AgentRun & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    startedAt?: import("mongoose").SchemaDefinitionProperty<Date, AgentRun, Document<unknown, {}, AgentRun, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AgentRun & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    completedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, AgentRun, Document<unknown, {}, AgentRun, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AgentRun & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    stats?: import("mongoose").SchemaDefinitionProperty<{
        transcriptsFetched?: number;
        messagesFetched?: number;
        summariesGenerated?: number;
        llmTokensUsed?: number;
        llmCost?: number;
        agentIterations?: number;
        durationMs?: number;
    } | undefined, AgentRun, Document<unknown, {}, AgentRun, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AgentRun & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    steps?: import("mongoose").SchemaDefinitionProperty<{
        stepName: string;
        startedAt: Date;
        completedAt?: Date;
        durationMs?: number;
        success: boolean;
        error?: string;
        metadata?: Record<string, unknown>;
    }[] | undefined, AgentRun, Document<unknown, {}, AgentRun, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AgentRun & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sprintPlanId?: import("mongoose").SchemaDefinitionProperty<string | undefined, AgentRun, Document<unknown, {}, AgentRun, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AgentRun & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    requestId?: import("mongoose").SchemaDefinitionProperty<string | undefined, AgentRun, Document<unknown, {}, AgentRun, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<AgentRun & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, AgentRun>;
