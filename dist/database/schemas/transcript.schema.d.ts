import { Document } from 'mongoose';
export interface TranscriptSegment {
    speaker: string;
    text: string;
    startTime: string;
    endTime: string;
}
export declare class Transcript extends Document {
    date: Date;
    meetingSubject: string;
    meetingId: string;
    segments: TranscriptSegment[];
    rawVttContent?: string;
    dailySummary?: {
        overallSummary: string;
        perPersonSummary: Array<{
            person: string;
            progressItems: string[];
            blockers: string[];
            nextSteps: string[];
        }>;
        actionItems: string[];
        decisions: string[];
        blockers: string[];
        keyTopics: string[];
    };
}
export declare const TranscriptSchema: import("mongoose").Schema<Transcript, import("mongoose").Model<Transcript, any, any, any, (Document<unknown, any, Transcript, any, import("mongoose").DefaultSchemaOptions> & Transcript & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Transcript, any, import("mongoose").DefaultSchemaOptions> & Transcript & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, Transcript>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Transcript, Document<unknown, {}, Transcript, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcript & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    date?: import("mongoose").SchemaDefinitionProperty<Date, Transcript, Document<unknown, {}, Transcript, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcript & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Transcript, Document<unknown, {}, Transcript, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcript & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    meetingId?: import("mongoose").SchemaDefinitionProperty<string, Transcript, Document<unknown, {}, Transcript, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcript & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    meetingSubject?: import("mongoose").SchemaDefinitionProperty<string, Transcript, Document<unknown, {}, Transcript, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcript & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    segments?: import("mongoose").SchemaDefinitionProperty<TranscriptSegment[], Transcript, Document<unknown, {}, Transcript, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcript & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    rawVttContent?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transcript, Document<unknown, {}, Transcript, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcript & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    dailySummary?: import("mongoose").SchemaDefinitionProperty<{
        overallSummary: string;
        perPersonSummary: Array<{
            person: string;
            progressItems: string[];
            blockers: string[];
            nextSteps: string[];
        }>;
        actionItems: string[];
        decisions: string[];
        blockers: string[];
        keyTopics: string[];
    } | undefined, Transcript, Document<unknown, {}, Transcript, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Transcript & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Transcript>;
