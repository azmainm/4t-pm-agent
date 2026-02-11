import { Document } from 'mongoose';
export declare class TeamsMessage extends Document {
    messageId: string;
    source: 'channel' | 'chat';
    channelOrChatId: string;
    channelOrChatName: string;
    senderName: string;
    senderEmail: string;
    content: string;
    timestamp: Date;
    replyToId?: string;
}
export declare const TeamsMessageSchema: import("mongoose").Schema<TeamsMessage, import("mongoose").Model<TeamsMessage, any, any, any, (Document<unknown, any, TeamsMessage, any, import("mongoose").DefaultSchemaOptions> & TeamsMessage & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, TeamsMessage, any, import("mongoose").DefaultSchemaOptions> & TeamsMessage & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, TeamsMessage>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TeamsMessage, Document<unknown, {}, TeamsMessage, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TeamsMessage & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, TeamsMessage, Document<unknown, {}, TeamsMessage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TeamsMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    timestamp?: import("mongoose").SchemaDefinitionProperty<Date, TeamsMessage, Document<unknown, {}, TeamsMessage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TeamsMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    messageId?: import("mongoose").SchemaDefinitionProperty<string, TeamsMessage, Document<unknown, {}, TeamsMessage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TeamsMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    content?: import("mongoose").SchemaDefinitionProperty<string, TeamsMessage, Document<unknown, {}, TeamsMessage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TeamsMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    source?: import("mongoose").SchemaDefinitionProperty<"channel" | "chat", TeamsMessage, Document<unknown, {}, TeamsMessage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TeamsMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    channelOrChatId?: import("mongoose").SchemaDefinitionProperty<string, TeamsMessage, Document<unknown, {}, TeamsMessage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TeamsMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    channelOrChatName?: import("mongoose").SchemaDefinitionProperty<string, TeamsMessage, Document<unknown, {}, TeamsMessage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TeamsMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    senderName?: import("mongoose").SchemaDefinitionProperty<string, TeamsMessage, Document<unknown, {}, TeamsMessage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TeamsMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    senderEmail?: import("mongoose").SchemaDefinitionProperty<string, TeamsMessage, Document<unknown, {}, TeamsMessage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TeamsMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    replyToId?: import("mongoose").SchemaDefinitionProperty<string | undefined, TeamsMessage, Document<unknown, {}, TeamsMessage, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TeamsMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, TeamsMessage>;
