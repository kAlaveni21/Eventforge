export type UserRole =
  | 'PLATFORM_ADMIN'
  | 'EVENT_ORGANIZER'
  | 'EVENT_STAFF'
  | 'SPEAKER'
  | 'ATTENDEE'
  | 'SPONSOR';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  title?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isActive: boolean;
}

export interface VenueRoom {
  name: string;
  capacity: number;
  floor?: string;
}

export interface Venue {
  _id: string;
  name: string;
  location: string;
  address: string;
  capacity: number;
  rooms: VenueRoom[];
  facilities: string[];
  availability: boolean;
  contactPerson?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

export interface Speaker {
  _id: string;
  name: string;
  designation: string;
  company: string;
  bio: string;
  profileImage: string;
  expertise: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  availability?: string[];
  presentationMaterial?: Array<{
    title: string;
    fileUrl: string;
    uploadedAt: string;
  }>;
}

export interface Session {
  _id: string;
  title: string;
  description: string;
  event: string | Event;
  speaker?: Speaker;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  category: string;
  attendees: string[];
}

export interface Ticket {
  _id: string;
  event: string;
  name: 'VIP' | 'Early Bird' | 'Standard' | 'Student' | 'Corporate' | string;
  price: number;
  quantity: number;
  sold: number;
  benefits: string[];
}

export interface Coupon {
  _id: string;
  code: string;
  discountPercent: number;
  discountAmount?: number;
}

export interface Registration {
  _id: string;
  registrationId: string;
  attendee: User;
  event: Event;
  ticket: Ticket;
  coupon?: Coupon;
  amount: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  qrCode?: string;
  registeredAt: string;
}

export interface AttendanceRecord {
  _id: string;
  event: string | Event;
  attendee: User;
  registration: Registration;
  checkInTime: string;
  checkOutTime?: string;
  sessionsAttended: Array<{
    session: Session;
    attendedAt: string;
  }>;
  checkedInBy?: User;
}

export interface SponsorDeliverable {
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string;
}

export interface Sponsor {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  logo: string;
  website?: string;
  package: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  assignedDeliverables: SponsorDeliverable[];
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  event: string | Event;
  brandAssets?: string[];
}

export interface Announcement {
  _id: string;
  event: string | Event;
  title: string;
  message: string;
  targetAudience: 'All Attendees' | 'Speakers' | 'Staff' | 'Sponsors';
  createdBy: User;
  createdAt: string;
}

export interface Feedback {
  _id: string;
  event: string;
  session?: Session;
  attendee: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  eventType: 'Conference' | 'Workshop' | 'Exhibition' | 'Seminar' | 'Corporate Event' | 'Networking Event';
  category: string;
  startDate: string;
  endDate: string;
  registrationStart: string;
  registrationEnd: string;
  venue?: Venue;
  organizer: User;
  capacity: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  bannerImage: string;
  sponsors?: Sponsor[];
  speakers?: Speaker[];
  sessions?: Session[];
  attendees?: string[];
  assignedStaff?: User[];
  tickets?: Ticket[];
  createdAt: string;
}
