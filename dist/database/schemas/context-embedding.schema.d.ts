import { Document } from 'mongoose';
export declare class ContextEmbedding extends Document {
    text: string;
    embedding: number[];
    sourceType: 'transcript' | 'message' | 'document';
    sourceId: string;
    date: Date;
    metadata?: Record<string, unknown>;
}
export declare const ContextEmbeddingSchema: import("mongoose").Schema<ContextEmbedding, import("mongoose").Model<ContextEmbedding, any, any, any, (Document<unknown, any, ContextEmbedding, any, import("mongoose").DefaultSchemaOptions> & ContextEmbedding & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, ContextEmbedding, any, import("mongoose").DefaultSchemaOptions> & ContextEmbedding & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, ContextEmbedding>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ContextEmbedding, Document<unknown, {}, ContextEmbedding, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ContextEmbedding & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    date?: import("mongoose").SchemaDefinitionProperty<Date, ContextEmbedding, Document<unknown, {}, ContextEmbedding, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ContextEmbedding & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, ContextEmbedding, Document<unknown, {}, ContextEmbedding, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ContextEmbedding & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    text?: import("mongoose").SchemaDefinitionProperty<string, ContextEmbedding, Document<unknown, {}, ContextEmbedding, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ContextEmbedding & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, unknown> | undefined, ContextEmbedding, Document<unknown, {}, ContextEmbedding, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ContextEmbedding & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sourceType?: import("mongoose").SchemaDefinitionProperty<"message" | "document" | "transcript", ContextEmbedding, Document<unknown, {}, ContextEmbedding, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ContextEmbedding & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    embedding?: import("mongoose").SchemaDefinitionProperty<number[], ContextEmbedding, Document<unknown, {}, ContextEmbedding, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ContextEmbedding & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sourceId?: import("mongoose").SchemaDefinitionProperty<string, ContextEmbedding, Document<unknown, {}, ContextEmbedding, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ContextEmbedding & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ContextEmbedding>;
