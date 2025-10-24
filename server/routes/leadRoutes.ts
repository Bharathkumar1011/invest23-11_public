import { Router } from 'express';
import { leadController } from '../controllers/leadController.js';
import { requireRole } from '../middleware/auth.js';
import { validateIntParam, validateResourceExists, validateStage } from '../middleware/validation.js';

const router = Router();

// Individual Lead Creation Route with Deduplication
router.post('/individual', requireRole(['analyst', 'partner', 'admin']), leadController.createIndividualLead);

// Bulk assign leads route
router.post('/bulk-assign', requireRole(['partner', 'admin']), leadController.bulkAssignLeads);

// Specific routes must come BEFORE generic :id route to avoid incorrect matching
router.get('/all', requireRole(['analyst', 'partner', 'admin']), leadController.getAllLeads);
router.get('/my', requireRole(['analyst', 'partner', 'admin']), leadController.getMyLeads);
router.get('/stage/:stage', requireRole(['analyst', 'partner', 'admin']), validateStage, leadController.getLeadsByStage);
router.get('/assigned', requireRole(['intern']), leadController.getAssignedLeads);
router.get('/assigned/:userId', requireRole(['partner', 'admin']), leadController.getLeadsByAssignee);

// Lead CRUD routes
router.post('/', requireRole(['analyst', 'partner', 'admin']), leadController.createLead);
router.get('/:id', requireRole(['analyst', 'partner', 'admin', 'intern']), validateIntParam('id'), validateResourceExists('lead'), leadController.getLead);
router.put('/:id', requireRole(['partner', 'admin']), validateResourceExists('lead'), leadController.updateLead);

// Lead stage management
router.patch('/:id/stage', requireRole(['analyst', 'partner', 'admin']), validateResourceExists('lead'), leadController.updateLeadStage);
router.patch('/:id/reject', requireRole(['analyst', 'partner', 'admin']), validateResourceExists('lead'), leadController.rejectLead);

// Lead assignment routes
router.post('/:id/assign', requireRole(['partner', 'admin']), validateResourceExists('lead'), leadController.assignLead);
router.post('/:id/assign-interns', requireRole(['partner', 'admin']), validateResourceExists('lead'), leadController.assignInternsToLead);
router.patch('/:id/assign-intern', requireRole(['analyst', 'partner', 'admin']), validateIntParam('id'), validateResourceExists('lead'), leadController.assignInternToLead);

export { router as leadRoutes };