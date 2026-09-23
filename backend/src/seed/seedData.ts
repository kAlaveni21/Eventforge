import User from '../models/User.js';
import Venue from '../models/Venue.js';
import Speaker from '../models/Speaker.js';
import Event from '../models/Event.js';
import Session from '../models/Session.js';
import Ticket from '../models/Ticket.js';
import Coupon from '../models/Coupon.js';
import Registration from '../models/Registration.js';
import Attendance from '../models/Attendance.js';
import Sponsor from '../models/Sponsor.js';
import SponsorshipPackage from '../models/SponsorshipPackage.js';
import Announcement from '../models/Announcement.js';
import Feedback from '../models/Feedback.js';
import { generateQRCode } from '../utils/generateQRCode.js';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Starting database seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Venue.deleteMany({}),
      Speaker.deleteMany({}),
      Event.deleteMany({}),
      Session.deleteMany({}),
      Ticket.deleteMany({}),
      Coupon.deleteMany({}),
      Registration.deleteMany({}),
      Attendance.deleteMany({}),
      Sponsor.deleteMany({}),
      SponsorshipPackage.deleteMany({}),
      Announcement.deleteMany({}),
      Feedback.deleteMany({}),
    ]);

    console.log('[Seed] Cleared existing collections');

    // 1. Users with distinct roles (password is password123)
    const adminUser = await User.create({
      name: 'Alexander Vance',
      email: 'admin@eventforge.com',
      password: 'password123',
      role: 'PLATFORM_ADMIN',
      company: 'EventForge Global Technologies',
      title: 'Chief Operations Officer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });

    const organizerUser = await User.create({
      name: 'Elena Rostova',
      email: 'organizer@eventforge.com',
      password: 'password123',
      role: 'EVENT_ORGANIZER',
      company: 'Apex Summit Group',
      title: 'Lead Event Director',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    });

    const staffUser = await User.create({
      name: 'Marcus Chen',
      email: 'staff@eventforge.com',
      password: 'password123',
      role: 'EVENT_STAFF',
      company: 'Apex Summit Group',
      title: 'Operations & Check-in Coordinator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    });

    const speakerUser = await User.create({
      name: 'Dr. Aris Thorne',
      email: 'speaker@eventforge.com',
      password: 'password123',
      role: 'SPEAKER',
      company: 'Quantum Intelligence Labs',
      title: 'VP of AI Research',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    });

    const attendeeUser = await User.create({
      name: 'Sophia Patel',
      email: 'attendee@eventforge.com',
      password: 'password123',
      role: 'ATTENDEE',
      company: 'NextGen Innovations',
      title: 'Senior Solutions Architect',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    });

    const sponsorUser = await User.create({
      name: 'David Sterling',
      email: 'sponsor@eventforge.com',
      password: 'password123',
      role: 'SPONSOR',
      company: 'CloudMatrix Networks',
      title: 'Head of Global Partnerships',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    });

    console.log('[Seed] Users seeded (all 6 roles created)');

    // 2. Venues
    const venue1 = await Venue.create({
      name: 'San Francisco Horizon Convention Center',
      location: 'San Francisco, California',
      address: '747 Howard Street, San Francisco, CA 94103',
      capacity: 3500,
      rooms: [
        { name: 'Grand Ballroom A', capacity: 1500, floor: 'Level 1' },
        { name: 'Innovation Hall B', capacity: 800, floor: 'Level 2' },
        { name: 'Tech Workshop 101', capacity: 250, floor: 'Level 3' },
        { name: 'Executive Boardroom', capacity: 60, floor: 'Level 4' },
      ],
      facilities: ['Gigabit Wi-Fi 7', '4K LED Stage Backdrop', 'Simultaneous Translation', 'Hybrid Live Stream Rig', 'VIP Lounges'],
      availability: true,
      contactPerson: {
        name: 'Rachel Adams',
        phone: '+1 (415) 555-0199',
        email: 'events@sfhorizon.com',
      },
      createdBy: adminUser._id,
    });

    const venue2 = await Venue.create({
      name: 'Metropolitan Tech Hub & Pavilion',
      location: 'New York, New York',
      address: '601 Lexington Avenue, New York, NY 10022',
      capacity: 2200,
      rooms: [
        { name: 'Main Amphitheater', capacity: 1200, floor: 'Concourse A' },
        { name: 'Summit Room East', capacity: 450, floor: 'Floor 12' },
        { name: 'Developer Sandbox C', capacity: 300, floor: 'Floor 14' },
      ],
      facilities: ['Acoustic Soundproofing', 'Robotic Camera Tracking', 'Catering Kitchens', 'High-density Power Pods'],
      availability: true,
      createdBy: adminUser._id,
    });

    console.log('[Seed] Venues seeded');

    // 3. Speakers
    const speaker1 = await Speaker.create({
      name: 'Dr. Aris Thorne',
      designation: 'VP of AI Research',
      company: 'Quantum Intelligence Labs',
      bio: 'Leading pioneer in autonomous enterprise agents and neuro-symbolic architectures with over 18 years of technical research leadership.',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      expertise: ['Generative AI', 'Large Language Models', 'Distributed Systems'],
      socialLinks: {
        twitter: 'https://x.com/aristhorne',
        linkedin: 'https://linkedin.com/in/aristhorne',
        github: 'https://github.com/aristhorne',
      },
      availability: ['Day 1 Morning', 'Day 2 Keynote'],
      user: speakerUser._id,
    });

    const speaker2 = await Speaker.create({
      name: 'Maya Lin-Sanders',
      designation: 'Chief Technology Officer',
      company: 'Aether Cloud Infrastructure',
      bio: 'Architecting globally distributed zero-trust mesh networks and edge computing platforms handling tens of millions of concurrent requests.',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      expertise: ['Cloud Architecture', 'Kubernetes', 'Cybersecurity'],
      socialLinks: {
        twitter: 'https://x.com/mayalinsanders',
        linkedin: 'https://linkedin.com/in/mayalinsanders',
      },
      availability: ['Day 1 Afternoon', 'Day 2 Morning'],
    });

    const speaker3 = await Speaker.create({
      name: 'Julian Montgomery',
      designation: 'Head of Product Strategy',
      company: 'Veloce Data Dynamics',
      bio: 'Specialist in scaling enterprise developer platforms and transforming legacy monoliths into high-velocity micro-service topologies.',
      profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      expertise: ['Product Engineering', 'Developer Experience', 'High-Scale Systems'],
      availability: ['Day 1 Morning', 'Day 2 Afternoon'],
    });

    console.log('[Seed] Speakers seeded');

    // 4. Events
    const event1 = await Event.create({
      title: 'Global Tech Summit 2026: The AI Frontier',
      description: 'The premier annual gathering of enterprise architects, AI researchers, and technology executives. Discover breakthrough developments in generative systems, edge compute, and digital infrastructure while connecting with over 2,000 corporate peers.',
      eventType: 'Conference',
      category: 'Technology',
      startDate: new Date('2026-10-14T08:30:00Z'),
      endDate: new Date('2026-10-16T18:00:00Z'),
      registrationStart: new Date('2026-08-01T00:00:00Z'),
      registrationEnd: new Date('2026-10-13T23:59:59Z'),
      venue: venue1._id,
      organizer: organizerUser._id,
      capacity: 2500,
      status: 'PUBLISHED',
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      speakers: [speaker1._id, speaker2._id, speaker3._id],
      assignedStaff: [staffUser._id],
      attendees: [attendeeUser._id],
    });

    const event2 = await Event.create({
      title: 'FinTech Disrupt & Enterprise Banking 2026',
      description: 'Exploring the future of decentralized ledgers, real-time cross-border settlements, regulatory compliance pipelines, and next-generation algorithmic risk management.',
      eventType: 'Conference',
      category: 'Finance',
      startDate: new Date('2026-11-05T09:00:00Z'),
      endDate: new Date('2026-11-06T17:00:00Z'),
      registrationStart: new Date('2026-08-15T00:00:00Z'),
      registrationEnd: new Date('2026-11-04T23:59:59Z'),
      venue: venue2._id,
      organizer: organizerUser._id,
      capacity: 1500,
      status: 'PUBLISHED',
      bannerImage: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1200&q=80',
      speakers: [speaker2._id],
      assignedStaff: [staffUser._id],
      attendees: [],
    });

    console.log('[Seed] Events seeded');

    // 5. Sessions for Event 1 (with distinct rooms and times to demonstrate conflict-free scheduling)
    const session1 = await Session.create({
      title: 'Opening Keynote: Autonomous Agents in Enterprise Topologies',
      description: 'How multi-agent systems and foundational models are redefining the modern corporate software stack from back-office pipelines to customer touchpoints.',
      event: event1._id,
      speaker: speaker1._id,
      room: 'Grand Ballroom A',
      date: new Date('2026-10-14T09:00:00Z'),
      startTime: '09:00',
      endTime: '10:15',
      capacity: 1200,
      category: 'Artificial Intelligence',
      attendees: [attendeeUser._id],
    });

    const session2 = await Session.create({
      title: 'Zero-Trust Architecture in Multi-Cloud Environments',
      description: 'Battle-tested strategies for implementing end-to-end cryptographic verification across AWS, Azure, and private cloud enclaves.',
      event: event1._id,
      speaker: speaker2._id,
      room: 'Innovation Hall B',
      date: new Date('2026-10-14T10:45:00Z'),
      startTime: '10:45',
      endTime: '12:00',
      capacity: 600,
      category: 'Cybersecurity & Cloud',
      attendees: [attendeeUser._id],
    });

    const session3 = await Session.create({
      title: 'Scaling Real-Time Event Driven Data Pipelines',
      description: 'Hands-on architectural dissection of high-throughput streaming systems processing billions of messages per minute.',
      event: event1._id,
      speaker: speaker3._id,
      room: 'Tech Workshop 101',
      date: new Date('2026-10-14T13:30:00Z'),
      startTime: '13:30',
      endTime: '15:00',
      capacity: 200,
      category: 'Engineering & Scalability',
      attendees: [],
    });

    // Link sessions to Event 1
    event1.sessions = [session1._id, session2._id, session3._id] as any;
    await event1.save();

    console.log('[Seed] Sessions seeded');

    // 6. Tickets for Event 1
    const ticketStandard = await Ticket.create({
      event: event1._id,
      name: 'Standard',
      price: 149,
      quantity: 1500,
      sold: 1,
      benefits: [
        'Full Conference Pass for 3 Days',
        'Access to General Keynotes & Breakouts',
        'Exhibition Hall & Sponsor Networking',
        'Official Digital Certificate & Recordings',
      ],
    });

    const ticketVIP = await Ticket.create({
      event: event1._id,
      name: 'VIP',
      price: 399,
      quantity: 350,
      sold: 0,
      benefits: [
        'All Standard Tier Benefits',
        'VIP Lounge & Priority Front-Row Seating',
        'Exclusive Executive Networking Reception',
        'Direct 1-on-1 Speaker Q&A Sessions',
        'Premium Branded Welcome Swag Bag',
      ],
    });

    const ticketEarlyBird = await Ticket.create({
      event: event1._id,
      name: 'Early Bird',
      price: 99,
      quantity: 500,
      sold: 0,
      benefits: ['Full Conference Pass for 3 Days', 'General Keynotes & Exhibition Pass'],
    });

    const ticketStudent = await Ticket.create({
      event: event1._id,
      name: 'Student',
      price: 49,
      quantity: 150,
      sold: 0,
      benefits: ['Full Conference Pass', 'Student Mentorship Workshop Entry'],
    });

    const ticketCorporate = await Ticket.create({
      event: event1._id,
      name: 'Corporate',
      price: 999,
      quantity: 50,
      sold: 0,
      benefits: [
        'Package of 5 All-Access Standard Passes',
        'Dedicated Meeting Room for 2 Hours',
        'Company Logo in Attendee Digital Booklet',
      ],
    });

    console.log('[Seed] Tickets seeded (all 5 categories)');

    // 7. Coupons
    const coupon1 = await Coupon.create({
      code: 'FORGE20',
      discountPercent: 20,
      validUntil: new Date('2026-12-31'),
      maxUses: 500,
      usedCount: 1,
      event: event1._id,
      isActive: true,
    });

    const coupon2 = await Coupon.create({
      code: 'WELCOME50',
      discountPercent: 50,
      validUntil: new Date('2026-12-31'),
      maxUses: 100,
      usedCount: 0,
      event: event1._id,
      isActive: true,
    });

    console.log('[Seed] Coupons seeded (FORGE20, WELCOME50)');

    // 8. Registration for Attendee User
    const regId = 'EF-GTS26-DEMO01';
    const qrData = JSON.stringify({
      regId,
      eventId: event1._id.toString(),
      eventTitle: event1.title,
      attendeeId: attendeeUser._id.toString(),
      attendeeName: attendeeUser.name,
      ticketType: ticketStandard.name,
      timestamp: Date.now(),
    });
    const qrCodeUrl = await generateQRCode(qrData);

    const registration1 = await Registration.create({
      registrationId: regId,
      attendee: attendeeUser._id,
      event: event1._id,
      ticket: ticketStandard._id,
      coupon: coupon1._id,
      amount: 119.2, // 149 - 20%
      status: 'CONFIRMED',
      approvalStatus: 'APPROVED',
      qrCode: qrCodeUrl,
      registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    console.log('[Seed] Registration seeded with QR code');

    // 9. Attendance record
    const attendance1 = await Attendance.create({
      event: event1._id,
      attendee: attendeeUser._id,
      registration: registration1._id,
      checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      checkedInBy: staffUser._id,
      sessionsAttended: [
        {
          session: session1._id,
          attendedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      ],
    });

    console.log('[Seed] Attendance record seeded');

    // 10. Sponsorship Package & Sponsor
    const sponsor1 = await Sponsor.create({
      companyName: 'CloudMatrix Networks',
      contactPerson: 'David Sterling',
      email: 'sponsor@eventforge.com',
      phone: '+1 (212) 555-0812',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
      website: 'https://cloudmatrix.example.com',
      package: 'Platinum',
      assignedDeliverables: [
        { title: 'Main Stage Overhead Banner & Logo Projection', status: 'COMPLETED' },
        { title: '20-Minute Keynote Presentation Slot Confirmation', status: 'COMPLETED' },
        { title: 'Exhibition Hall Booth Space (30x30 Floor Placement)', status: 'IN_PROGRESS' },
        { title: 'Distribution of 10 VIP Attendee Passes', status: 'COMPLETED' },
        { title: 'Full-Page Feature in Event Mobile App Guide', status: 'PENDING' },
      ],
      paymentStatus: 'COMPLETED',
      event: event1._id,
      user: sponsorUser._id,
    });

    const sponsor2 = await Sponsor.create({
      companyName: 'Nexus Sentinel Security',
      contactPerson: 'Elena Garcia',
      email: 'partnerships@nexussentinel.example.com',
      phone: '+1 (415) 555-0433',
      logo: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=300&q=80',
      website: 'https://nexussentinel.example.com',
      package: 'Gold',
      assignedDeliverables: [
        { title: 'Stage Signage Placement', status: 'COMPLETED' },
        { title: 'Exhibition Booth (20x20)', status: 'IN_PROGRESS' },
        { title: 'Workshop Track Sponsorship', status: 'PENDING' },
      ],
      paymentStatus: 'COMPLETED',
      event: event1._id,
    });

    event1.sponsors = [sponsor1._id, sponsor2._id] as any;
    await event1.save();

    console.log('[Seed] Sponsors seeded');

    // 11. Announcements
    await Announcement.create({
      event: event1._id,
      title: 'Welcome to Global Tech Summit 2026!',
      message: 'Doors open tomorrow at 08:00 AM. Please have your QR code ready in the EventForge app for rapid badge printout and lanyard collection.',
      targetAudience: 'All Attendees',
      createdBy: organizerUser._id,
    });

    await Announcement.create({
      event: event1._id,
      title: 'VIP Executive Lounge & Green Room Details',
      message: 'Speakers and VIP ticket holders are invited to the 4th-floor lounge for breakfast briefings and private meeting pods starting at 07:30 AM.',
      targetAudience: 'Speakers',
      createdBy: organizerUser._id,
    });

    console.log('[Seed] Announcements seeded');

    // 12. Feedback
    await Feedback.create({
      event: event1._id,
      session: session1._id,
      attendee: attendeeUser._id,
      rating: 5,
      comment: 'Incredible keynote by Dr. Thorne. The breakdown of multi-agent coordination models was brilliant and immediately applicable.',
    });

    console.log('[Seed] Feedback seeded');
    console.log('[Seed] Database seeding completed successfully! 🎉');
    return true;
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    throw error;
  }
};
