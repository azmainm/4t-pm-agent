import { Document } from 'mongoose';
export declare class SprintPlan extends Document {
    sprintStartDate: Date;
    sprintEndDate: Date;
    planData: {
        sprintDateRange: {
            start: string;
            end: string;
        };
        primaryGoals: string[];
        notes: string[];
        ownerBreakdown: Array<{
            name: string;
            focuses: Array<{
                focusName: string;
                goal: string;
                tasks: Array<{
                    title: string;
                    description: string;
                    points: number;
                    priority: string;
                    acceptanceCriteria: string[];
                }>;
            }>;
        }>;
    };
    onedriveFileId?: string;
    onedriveFileName?: string;
    status: 'draft' | 'generated' | 'approved' | 'archived';
    approvedAt?: Date;
    extractedText?: string;
    jiraIssueKeys?: string[];
}
export declare const SprintPlanSchema: import("mongoose").Schema<SprintPlan, import("mongoose").Model<SprintPlan, any, any, any, (Document<unknown, any, SprintPlan, any, import("mongoose").DefaultSchemaOptions> & SprintPlan & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, SprintPlan, any, import("mongoose").DefaultSchemaOptions> & SprintPlan & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, SprintPlan>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SprintPlan, Document<unknown, {}, SprintPlan, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SprintPlan & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, SprintPlan, Document<unknown, {}, SprintPlan, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SprintPlan & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<"draft" | "generated" | "approved" | "archived", SprintPlan, Document<unknown, {}, SprintPlan, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SprintPlan & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sprintStartDate?: import("mongoose").SchemaDefinitionProperty<Date, SprintPlan, Document<unknown, {}, SprintPlan, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SprintPlan & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sprintEndDate?: import("mongoose").SchemaDefinitionProperty<Date, SprintPlan, Document<unknown, {}, SprintPlan, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SprintPlan & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    planData?: import("mongoose").SchemaDefinitionProperty<{
        sprintDateRange: {
            start: string;
            end: string;
        };
        primaryGoals: string[];
        notes: string[];
        ownerBreakdown: Array<{
            name: string;
            focuses: Array<{
                focusName: string;
                goal: string;
                tasks: Array<{
                    title: string;
                    description: string;
                    points: number;
                    priority: string;
                    acceptanceCriteria: string[];
                }>;
            }>;
        }>;
    }, SprintPlan, Document<unknown, {}, SprintPlan, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SprintPlan & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    onedriveFileId?: import("mongoose").SchemaDefinitionProperty<string | undefined, SprintPlan, Document<unknown, {}, SprintPlan, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SprintPlan & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    onedriveFileName?: import("mongoose").SchemaDefinitionProperty<string | undefined, SprintPlan, Document<unknown, {}, SprintPlan, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SprintPlan & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    approvedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, SprintPlan, Document<unknown, {}, SprintPlan, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SprintPlan & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    extractedText?: import("mongoose").SchemaDefinitionProperty<string | undefined, SprintPlan, Document<unknown, {}, SprintPlan, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SprintPlan & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    jiraIssueKeys?: import("mongoose").SchemaDefinitionProperty<string[] | undefined, SprintPlan, Document<unknown, {}, SprintPlan, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<SprintPlan & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, SprintPlan>;
