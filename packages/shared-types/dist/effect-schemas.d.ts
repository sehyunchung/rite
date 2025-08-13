import { Schema as S } from 'effect';
export declare const TimeslotSchema: S.Struct<{
    _id: typeof S.String;
    eventId: typeof S.String;
    startTime: typeof S.String;
    endTime: typeof S.String;
    djName: typeof S.String;
    djInstagram: typeof S.String;
    submissionToken: typeof S.String;
}>;
export declare const VenueSchema: S.Struct<{
    name: typeof S.NonEmptyString;
    address: typeof S.NonEmptyString;
}>;
export declare const DeadlinesSchema: S.Struct<{
    guestList: typeof S.String;
    promoMaterials: typeof S.String;
}>;
export declare const PaymentSchema: S.Struct<{
    amount: S.filter<typeof S.Number>;
    perDJ: S.filter<typeof S.Number>;
    currency: typeof S.String;
    dueDate: typeof S.String;
}>;
export declare const EventPhaseSchema: S.Literal<["draft", "planning", "finalized", "day_of", "completed", "cancelled"]>;
export declare const EventCapabilitiesSchema: S.Struct<{
    canEdit: typeof S.Boolean;
    canPublish: typeof S.Boolean;
    canAcceptSubmissions: typeof S.Boolean;
    canGenerateContent: typeof S.Boolean;
    canFinalize: typeof S.Boolean;
    showUrgentBanner: typeof S.Boolean;
    showDayOfFeatures: typeof S.Boolean;
}>;
export declare const EventWithTimeslotsSchema: S.Struct<{
    _id: typeof S.String;
    name: typeof S.NonEmptyString;
    organizerId: typeof S.String;
    date: typeof S.String;
    venue: S.Struct<{
        name: typeof S.NonEmptyString;
        address: typeof S.NonEmptyString;
    }>;
    description: S.optional<typeof S.String>;
    hashtags: S.optional<typeof S.String>;
    deadlines: S.Struct<{
        guestList: typeof S.String;
        promoMaterials: typeof S.String;
    }>;
    payment: S.Struct<{
        amount: S.filter<typeof S.Number>;
        perDJ: S.filter<typeof S.Number>;
        currency: typeof S.String;
        dueDate: typeof S.String;
    }>;
    guestLimitPerDJ: S.filter<typeof S.Number>;
    status: S.Literal<["draft", "active", "completed"]>;
    phase: S.optional<S.Literal<["draft", "planning", "finalized", "day_of", "completed", "cancelled"]>>;
    capabilities: S.optional<S.Struct<{
        canEdit: typeof S.Boolean;
        canPublish: typeof S.Boolean;
        canAcceptSubmissions: typeof S.Boolean;
        canGenerateContent: typeof S.Boolean;
        canFinalize: typeof S.Boolean;
        showUrgentBanner: typeof S.Boolean;
        showDayOfFeatures: typeof S.Boolean;
    }>>;
    createdAt: typeof S.String;
    timeslots: S.NonEmptyArray<S.Struct<{
        _id: typeof S.String;
        eventId: typeof S.String;
        startTime: typeof S.String;
        endTime: typeof S.String;
        djName: typeof S.String;
        djInstagram: typeof S.String;
        submissionToken: typeof S.String;
    }>>;
    submissionCount: S.optional<S.filter<typeof S.Number>>;
}>;
export declare const EventFormSchema: S.Struct<{
    name: typeof S.NonEmptyString;
    date: typeof S.String;
    venue: S.Struct<{
        name: typeof S.NonEmptyString;
        address: typeof S.NonEmptyString;
    }>;
    description: S.optional<typeof S.String>;
    hashtags: S.optional<typeof S.String>;
    deadlines: S.Struct<{
        guestList: typeof S.String;
        promoMaterials: typeof S.String;
    }>;
    payment: S.Struct<{
        amount: S.filter<typeof S.Number>;
        perDJ: S.filter<typeof S.Number>;
        currency: typeof S.String;
        dueDate: typeof S.String;
    }>;
    guestLimitPerDJ: S.filter<typeof S.Number>;
    timeslots: S.NonEmptyArray<S.Struct<{
        startTime: typeof S.String;
        endTime: typeof S.String;
        djName: typeof S.NonEmptyString;
        djInstagram: typeof S.NonEmptyString;
    }>>;
}>;
export type EventId = string & {
    readonly _brand: 'EventId';
};
export type TimeslotId = string & {
    readonly _brand: 'TimeslotId';
};
export type UserId = string & {
    readonly _brand: 'UserId';
};
export declare const EventIdSchema: S.brand<typeof S.String, "EventId">;
export declare const TimeslotIdSchema: S.brand<typeof S.String, "TimeslotId">;
export declare const UserIdSchema: S.brand<typeof S.String, "UserId">;
export declare const GuestEntrySchema: S.Struct<{
    name: typeof S.NonEmptyString;
    phoneNumber: S.optional<typeof S.String>;
}>;
export declare const PaymentInfoSchema: S.Struct<{
    bankName: typeof S.NonEmptyString;
    accountNumber: typeof S.NonEmptyString;
    accountHolder: typeof S.NonEmptyString;
    residentRegistrationNumber: typeof S.NonEmptyString;
}>;
export declare const SubmissionSchema: S.Struct<{
    _id: typeof S.String;
    eventId: typeof S.String;
    timeslotId: typeof S.String;
    djName: typeof S.NonEmptyString;
    djInstagram: typeof S.NonEmptyString;
    guestList: S.Array$<S.Struct<{
        name: typeof S.NonEmptyString;
        phoneNumber: S.optional<typeof S.String>;
    }>>;
    paymentInfo: S.Struct<{
        bankName: typeof S.NonEmptyString;
        accountNumber: typeof S.NonEmptyString;
        accountHolder: typeof S.NonEmptyString;
        residentRegistrationNumber: typeof S.NonEmptyString;
    }>;
    promoMaterials: S.optional<S.Array$<typeof S.String>>;
    submittedAt: typeof S.String;
    status: S.Literal<["pending", "approved", "rejected"]>;
}>;
export type ValidatedEvent = S.Schema.Type<typeof EventWithTimeslotsSchema>;
export type ValidatedTimeslot = S.Schema.Type<typeof TimeslotSchema>;
export type ValidatedEventForm = S.Schema.Type<typeof EventFormSchema>;
export type ValidatedSubmission = S.Schema.Type<typeof SubmissionSchema>;
export declare const validateEvent: (u: unknown, overrideOptions?: import("effect/SchemaAST").ParseOptions) => import("effect/Effect").Effect<{
    readonly _id: string;
    readonly name: string;
    readonly organizerId: string;
    readonly date: string;
    readonly venue: {
        readonly name: string;
        readonly address: string;
    };
    readonly description?: string | undefined;
    readonly hashtags?: string | undefined;
    readonly deadlines: {
        readonly guestList: string;
        readonly promoMaterials: string;
    };
    readonly payment: {
        readonly amount: number;
        readonly perDJ: number;
        readonly currency: string;
        readonly dueDate: string;
    };
    readonly guestLimitPerDJ: number;
    readonly status: "draft" | "completed" | "active";
    readonly phase?: "draft" | "planning" | "finalized" | "day_of" | "completed" | "cancelled" | undefined;
    readonly capabilities?: {
        readonly canEdit: boolean;
        readonly canPublish: boolean;
        readonly canAcceptSubmissions: boolean;
        readonly canGenerateContent: boolean;
        readonly canFinalize: boolean;
        readonly showUrgentBanner: boolean;
        readonly showDayOfFeatures: boolean;
    } | undefined;
    readonly createdAt: string;
    readonly timeslots: readonly [{
        readonly _id: string;
        readonly eventId: string;
        readonly startTime: string;
        readonly endTime: string;
        readonly djName: string;
        readonly djInstagram: string;
        readonly submissionToken: string;
    }, ...{
        readonly _id: string;
        readonly eventId: string;
        readonly startTime: string;
        readonly endTime: string;
        readonly djName: string;
        readonly djInstagram: string;
        readonly submissionToken: string;
    }[]];
    readonly submissionCount?: number | undefined;
}, import("effect/ParseResult").ParseError, never>;
export declare const validateEventForm: (u: unknown, overrideOptions?: import("effect/SchemaAST").ParseOptions) => import("effect/Effect").Effect<{
    readonly name: string;
    readonly date: string;
    readonly venue: {
        readonly name: string;
        readonly address: string;
    };
    readonly description?: string | undefined;
    readonly hashtags?: string | undefined;
    readonly deadlines: {
        readonly guestList: string;
        readonly promoMaterials: string;
    };
    readonly payment: {
        readonly amount: number;
        readonly perDJ: number;
        readonly currency: string;
        readonly dueDate: string;
    };
    readonly guestLimitPerDJ: number;
    readonly timeslots: readonly [{
        readonly startTime: string;
        readonly endTime: string;
        readonly djName: string;
        readonly djInstagram: string;
    }, ...{
        readonly startTime: string;
        readonly endTime: string;
        readonly djName: string;
        readonly djInstagram: string;
    }[]];
}, import("effect/ParseResult").ParseError, never>;
export declare const validateTimeslot: (u: unknown, overrideOptions?: import("effect/SchemaAST").ParseOptions) => import("effect/Effect").Effect<{
    readonly _id: string;
    readonly eventId: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly djName: string;
    readonly djInstagram: string;
    readonly submissionToken: string;
}, import("effect/ParseResult").ParseError, never>;
export declare const validateSubmission: (u: unknown, overrideOptions?: import("effect/SchemaAST").ParseOptions) => import("effect/Effect").Effect<{
    readonly _id: string;
    readonly eventId: string;
    readonly djName: string;
    readonly djInstagram: string;
    readonly guestList: readonly {
        readonly name: string;
        readonly phoneNumber?: string | undefined;
    }[];
    readonly promoMaterials?: readonly string[] | undefined;
    readonly status: "pending" | "approved" | "rejected";
    readonly timeslotId: string;
    readonly paymentInfo: {
        readonly bankName: string;
        readonly accountNumber: string;
        readonly accountHolder: string;
        readonly residentRegistrationNumber: string;
    };
    readonly submittedAt: string;
}, import("effect/ParseResult").ParseError, never>;
//# sourceMappingURL=effect-schemas.d.ts.map