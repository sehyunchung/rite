export * from './effect-schemas';
export * from './file-validation';
export * from './file-upload-effect';
export * from './crypto-effects';
export interface Event {
    id: string;
    name: string;
    venue: string;
    date: string;
    budget: number;
    paymentPerDJ: number;
    guestLimitPerDJ: number;
    description?: string;
    instagramHashtags?: string[];
    promoDeadline: string;
    guestListDeadline: string;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}
export interface Timeslot {
    id: string;
    eventId: string;
    startTime: string;
    endTime: string;
    djName?: string;
    instagramHandle?: string;
    submissionToken: string;
    status: 'available' | 'booked' | 'submitted';
    createdAt: string;
}
export interface Submission {
    id: string;
    timeslotId: string;
    djName: string;
    instagramHandle: string;
    guestList: GuestEntry[];
    paymentInfo: PaymentInfo;
    promoMaterials?: string[];
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected';
}
export interface GuestEntry {
    name: string;
    phoneNumber?: string;
}
export interface PaymentInfo {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    residentRegistrationNumber: string;
}
export interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    createdAt: string;
}
export interface InstagramConnection {
    id: string;
    userId: string;
    instagramUserId: string;
    username: string;
    accountType: 'BUSINESS' | 'CREATOR';
    profilePictureUrl?: string;
    accessToken: string;
    connectedAt: string;
}
//# sourceMappingURL=index.d.ts.map