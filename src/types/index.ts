export type Event = {
  _id: string;
  organizerId: string;
  name: string;
  date: string;
  venue: {
    name: string;
    address: string;
  };
  description?: string;
  hashtags: string[];
  paymentAmount: number;
  guestLimitPerDj: number;
  deadlines: {
    guestList: string;
    promoMaterial: string;
    paymentInfo: string;
  };
  createdAt: string;
  status: 'draft' | 'active' | 'completed';
};

export type Timeslot = {
  _id: string;
  eventId: string;
  startTime: string;
  endTime: string;
  djName: string;
  djInstagram: string;
  submissionId?: string;
};

export type Submission = {
  _id: string;
  eventId: string;
  timeslotId: string;
  uniqueLink: string;
  promoMaterials: {
    files: FileUpload[];
    description: string;
  };
  guestList: Guest[];
  paymentInfo: {
    accountHolder: string;
    bankName: string;
    accountNumber: string; // encrypted
    residentNumber: string; // encrypted
    preferDirectContact: boolean;
  };
  submittedAt?: string;
  lastUpdatedAt?: string;
};

export type FileUpload = {
  fileName: string;
  fileType: string;
  fileSize: number;
  convexFileId: string;
  uploadedAt: string;
};

export type Guest = {
  name: string;
  phone?: string;
};

export type User = {
  _id: string;
  email: string;
  name?: string;
  lastLoginAt?: string;
};