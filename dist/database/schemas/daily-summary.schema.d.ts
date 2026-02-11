import { Document } from 'mongoose';
export declare class DailySummary extends Document {
    date: Date;
    transcriptId: string;
    overallSummary: string;
    actionItems: string[];
    decisions: string[];
    blockers: string[];
    perPersonSummary: Array<{
        name: string;
        summary: string;
        nextSteps: string[];
    }>;
    upcomingWork: Array<{
        task: string;
        owner: string;
        status: string;
        targetSprint: string;
        priority: string;
    }>;
    generatedAt: Date;
}
export declare const DailySummarySchema: import("mongoose").Schema<DailySummary, import("mongoose").Model<DailySummary, any, any, any, (Document<unknown, any, DailySummary, any, import("mongoose").DefaultSchemaOptions> & DailySummary & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, DailySummary, any, import("mongoose").DefaultSchemaOptions> & DailySummary & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, DailySummary>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DailySummary, Document<unknown, {}, DailySummary, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DailySummary & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    date?: import("mongoose").SchemaDefinitionProperty<Date, DailySummary, Document<unknown, {}, DailySummary, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DailySummary & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, DailySummary, Document<unknown, {}, DailySummary, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DailySummary & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    transcriptId?: import("mongoose").SchemaDefinitionProperty<string, DailySummary, Document<unknown, {}, DailySummary, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DailySummary & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    overallSummary?: import("mongoose").SchemaDefinitionProperty<string, DailySummary, Document<unknown, {}, DailySummary, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DailySummary & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    actionItems?: import("mongoose").SchemaDefinitionProperty<string[], DailySummary, Document<unknown, {}, DailySummary, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DailySummary & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    decisions?: import("mongoose").SchemaDefinitionProperty<string[], DailySummary, Document<unknown, {}, DailySummary, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DailySummary & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    blockers?: import("mongoose").SchemaDefinitionProperty<string[], DailySummary, Document<unknown, {}, DailySummary, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DailySummary & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    perPersonSummary?: import("mongoose").SchemaDefinitionProperty<{
        name: string;
        summary: string;
        nextSteps: string[];
    }[], DailySummary, Document<unknown, {}, DailySummary, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DailySummary & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    upcomingWork?: import("mongoose").SchemaDefinitionProperty<{
        task: string;
        owner: string;
        status: string;
        targetSprint: string;
        priority: string;
    }[], DailySummary, Document<unknown, {}, DailySummary, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DailySummary & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    generatedAt?: import("mongoose").SchemaDefinitionProperty<Date, DailySummary, Document<unknown, {}, DailySummary, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DailySummary & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, DailySummary>;
