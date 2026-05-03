import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Gig } from '../models/Gig';

const router = Router();

/**
 * Seed data — realistic Indian construction/informal work gigs
 * Used when MongoDB is unavailable (demo mode)
 */
const demoGigs = [
    {
        gigId: 'gig-001',
        title: 'Masonry Work — Residential Building',
        description: 'Need experienced masons for a 3-storey residential building construction in Andheri West. Must have NSQF L3 certification or equivalent experience. Bricks, mortar, and tools provided on-site. Meals included.',
        skill: 'Masonry',
        location: 'Andheri West, Mumbai',
        workHoursEstimate: 240,
        payAmount: 36000,
        payType: 'fixed',
        posterDid: 'did:polygon:0x7F2c...A91B',
        posterName: 'Jan Shikshan Sansthan, Mumbai',
        startDate: '2026-03-20',
        duration: '6 weeks',
        status: 'open',
        applicants: [],
        createdAt: new Date('2026-03-10'),
    },
    {
        gigId: 'gig-002',
        title: 'Plumber Needed — Society Maintenance',
        description: 'Looking for a certified plumber for ongoing maintenance work at a 200-flat housing society. Tasks include pipe fitting, leak repairs, and new bathroom installations. Flexible hours.',
        skill: 'Plumbing',
        location: 'Powai, Mumbai',
        workHoursEstimate: 160,
        payAmount: 800,
        payType: 'daily',
        posterDid: 'did:polygon:0x3E1a...C72D',
        posterName: 'Green Valley CHS Ltd.',
        startDate: '2026-03-18',
        duration: '4 weeks',
        status: 'open',
        applicants: [],
        createdAt: new Date('2026-03-09'),
    },
    {
        gigId: 'gig-003',
        title: 'Electrical Wiring — Commercial Office',
        description: 'Complete electrical wiring for a 5000 sq ft office space in BKC. Must have NSQF L4 certification in domestic electrical wiring. Safety gear mandatory. Team of 3 electricians needed.',
        skill: 'Electrical',
        location: 'BKC, Mumbai',
        workHoursEstimate: 320,
        payAmount: 55000,
        payType: 'fixed',
        posterDid: 'did:polygon:0x9B4f...E56A',
        posterName: 'NSDC Skill Centre, Mumbai',
        startDate: '2026-04-01',
        duration: '8 weeks',
        status: 'open',
        applicants: [],
        createdAt: new Date('2026-03-08'),
    },
    {
        gigId: 'gig-004',
        title: 'Shuttering Carpentry — Metro Project',
        description: 'Shuttering carpenters required for Mumbai Metro Line 6 extension. Daily wages with overtime. Safety training provided. Must be available for full 12-week duration. PF and insurance covered.',
        skill: 'Carpentry',
        location: 'Jogeshwari, Mumbai',
        workHoursEstimate: 480,
        payAmount: 900,
        payType: 'daily',
        posterDid: 'did:polygon:0x2D7c...B83F',
        posterName: 'L&T Construction',
        startDate: '2026-03-25',
        duration: '12 weeks',
        status: 'open',
        applicants: [],
        createdAt: new Date('2026-03-07'),
    },
    {
        gigId: 'gig-005',
        title: 'Tile & Stone Laying — Villa Project',
        description: 'Need skilled tile layers for a luxury villa project in Lonavala. Italian marble and vitrified tile work. Transport from Pune provided. Accommodation available on-site.',
        skill: 'Tile Laying',
        location: 'Lonavala, Maharashtra',
        workHoursEstimate: 200,
        payAmount: 42000,
        payType: 'fixed',
        posterDid: 'did:polygon:0x5A3e...D19C',
        posterName: 'Shapoorji Pallonji Group',
        startDate: '2026-04-10',
        duration: '5 weeks',
        status: 'open',
        applicants: [],
        createdAt: new Date('2026-03-06'),
    },
    {
        gigId: 'gig-006',
        title: 'Welding — Industrial Shed Construction',
        description: 'Arc and gas welding for a 10,000 sq ft industrial shed in MIDC Bhiwandi. Must have own safety gear. Experience with structural steel required. Overtime available.',
        skill: 'Welding',
        location: 'MIDC Bhiwandi, Maharashtra',
        workHoursEstimate: 280,
        payAmount: 750,
        payType: 'daily',
        posterDid: 'did:polygon:0x8C2b...F47E',
        posterName: 'PMKVY Training Partner',
        startDate: '2026-03-22',
        duration: '7 weeks',
        status: 'open',
        applicants: [],
        createdAt: new Date('2026-03-05'),
    },
    {
        gigId: 'gig-007',
        title: 'Painting — Interior & Exterior, School Building',
        description: 'Interior and exterior painting for a government school renovation. Includes wall preparation, primer, and 2 coats of emulsion paint. All materials supplied. Team of 4-5 painters needed.',
        skill: 'Painting',
        location: 'Thane, Maharashtra',
        workHoursEstimate: 180,
        payAmount: 28000,
        payType: 'fixed',
        posterDid: 'did:polygon:0x1F9d...A23B',
        posterName: 'Municipal Corporation of Thane',
        startDate: '2026-04-05',
        duration: '4 weeks',
        status: 'open',
        applicants: [],
        createdAt: new Date('2026-03-04'),
    },
    {
        gigId: 'gig-008',
        title: 'Bar Bending — High-Rise Tower Foundation',
        description: 'Experienced bar benders needed for reinforcement work on a 40-storey tower foundation. Must be able to read structural drawings. Hard hat and safety boots mandatory. Canteen on-site.',
        skill: 'Bar Bending',
        location: 'Worli, Mumbai',
        workHoursEstimate: 360,
        payAmount: 48000,
        payType: 'fixed',
        posterDid: 'did:polygon:0x4E6a...C85D',
        posterName: 'Godrej Properties',
        startDate: '2026-03-15',
        duration: '9 weeks',
        status: 'open',
        applicants: [],
        createdAt: new Date('2026-03-03'),
    },
];

/**
 * GET /api/gigs
 * List all open gigs, optionally filtered by skill
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const { skill } = req.query;

        let gigs: any[] = [];
        try {
            const filter: any = { status: 'open' };
            if (skill && typeof skill === 'string') {
                filter.skill = { $regex: skill, $options: 'i' };
            }
            gigs = await Gig.find(filter)
                .select('-applicants')
                .sort({ createdAt: -1 });
        } catch (dbError) {
            // Fallback to demo data if MongoDB unavailable
            console.warn('[DB] MongoDB unavailable — returning demo gigs');
            gigs = demoGigs;
            if (skill && typeof skill === 'string') {
                gigs = gigs.filter((g) =>
                    g.skill.toLowerCase().includes((skill as string).toLowerCase())
                );
            }
        }

        // If DB returned empty, use demo data
        if (gigs.length === 0) {
            gigs = demoGigs;
            if (skill && typeof skill === 'string') {
                gigs = gigs.filter((g) =>
                    g.skill.toLowerCase().includes((skill as string).toLowerCase())
                );
            }
        }

        res.json({
            success: true,
            data: {
                count: gigs.length,
                gigs,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/gigs/:gigId
 * Get gig details by ID
 */
router.get('/:gigId', async (req: Request, res: Response) => {
    try {
        const { gigId } = req.params;

        let gig: any = null;
        try {
            gig = await Gig.findOne({ gigId });
        } catch (dbError) {
            console.warn('[DB] MongoDB unavailable — searching demo gigs');
        }

        // Fallback to demo data
        if (!gig) {
            gig = demoGigs.find((g) => g.gigId === gigId);
        }

        if (!gig) {
            res.status(404).json({ success: false, error: 'Gig not found' });
            return;
        }

        res.json({ success: true, data: gig });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/gigs
 * Post a new gig (for issuers/employers)
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            title,
            description,
            skill,
            location,
            workHoursEstimate,
            payAmount,
            payType,
            posterDid,
            posterName,
            startDate,
            duration,
        } = req.body;

        if (!title || !description || !skill || !location || !payAmount || !posterDid || !posterName) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: title, description, skill, location, payAmount, posterDid, posterName',
            });
            return;
        }

        const gigId = `gig-${uuidv4().slice(0, 8)}`;

        try {
            const gig = new Gig({
                gigId,
                title,
                description,
                skill,
                location,
                workHoursEstimate: Number(workHoursEstimate) || 0,
                payAmount: Number(payAmount),
                payType: payType || 'fixed',
                posterDid,
                posterName,
                startDate,
                duration,
                status: 'open',
            });
            await gig.save();
        } catch (dbError) {
            console.warn('[DB] Could not save gig — running in demo mode');
        }

        res.status(201).json({
            success: true,
            data: {
                gigId,
                title,
                skill,
                location,
                payAmount,
                status: 'open',
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/gigs/:gigId/apply
 * Worker applies to a gig with their DID
 */
router.post('/:gigId/apply', async (req: Request, res: Response) => {
    try {
        const { gigId } = req.params;
        const { workerDid } = req.body;

        if (!workerDid) {
            res.status(400).json({ success: false, error: 'workerDid required' });
            return;
        }

        try {
            const gig = await Gig.findOne({ gigId });
            if (!gig) {
                res.status(404).json({ success: false, error: 'Gig not found' });
                return;
            }

            if (gig.status !== 'open') {
                res.status(400).json({ success: false, error: 'Gig is no longer open' });
                return;
            }

            // Check if already applied
            const alreadyApplied = gig.applicants.some((a) => a.workerDid === workerDid);
            if (alreadyApplied) {
                res.status(400).json({ success: false, error: 'Already applied to this gig' });
                return;
            }

            gig.applicants.push({ workerDid, appliedAt: new Date() });
            await gig.save();

            res.json({
                success: true,
                data: {
                    gigId,
                    workerDid,
                    appliedAt: new Date().toISOString(),
                    totalApplicants: gig.applicants.length,
                },
            });
        } catch (dbError) {
            // Demo mode: just acknowledge
            console.warn('[DB] MongoDB unavailable — demo apply');
            res.json({
                success: true,
                data: {
                    gigId,
                    workerDid,
                    appliedAt: new Date().toISOString(),
                    totalApplicants: 1,
                    note: 'Demo mode — application not persisted',
                },
            });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
