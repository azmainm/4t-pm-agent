export interface TeamMember {
    name: string;
    jiraAccountId: string;
    role: 'Lead' | 'Dev';
}
export declare const rosterConfig: (() => {
    members: TeamMember[];
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    members: TeamMember[];
}>;
