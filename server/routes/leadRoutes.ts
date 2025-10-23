import { Router } from 'express';
import { leadController } from '../controllers/leadController.js';
import { requireRole } from '../middleware/auth.js';
import { validateIntParam, validateResourceExists, validateStage } from '../middleware/validation.js';

const router = Router();

// Individual Lead Creation Route with Deduplication
router.post('/individual', leadController.createIndividualLead);

// Bulk assign leads route
router.post('/bulk-assign', requireRole(['partner', 'admin']), leadController.bulkAssignLeads);

// Specific routes must come BEFORE generic :id route to avoid incorrect matching
router.get('/all', leadController.getAllLeads);
router.get('/my', leadController.getMyLeads);
router.get('/stage/:stage', validateStage, leadController.getLeadsByStage);
router.get('/assigned', requireRole(['intern']), leadController.getAssignedLeads);
router.get('/assigned/:userId', requireRole(['partner', 'admin']), leadController.getLeadsByAssignee);

// Lead CRUD routes
router.post('/', leadController.createLead);
router.get('/:id', validateIntParam('id'), validateResourceExists('lead'), leadController.getLead);
router.put('/:id', requireRole(['partner', 'admin']), validateResourceExists('lead'), leadController.updateLead);

// Lead stage management
router.patch('/:id/stage', validateResourceExists('lead'), leadController.updateLeadStage);
router.patch('/:id/reject', validateResourceExists('lead'), leadController.rejectLead);

// Lead assignment routes
router.post('/:id/assign', requireRole(['partner', 'admin']), validateResourceExists('lead'), leadController.assignLead);
router.post('/:id/assign-interns', requireRole(['partner', 'admin']), validateResourceExists('lead'), leadController.assignInternsToLead);
router.patch('/:id/assign-intern', requireRole(['analyst', 'partner', 'admin']), validateIntParam('id'), validateResourceExists('lead'), leadController.assignInternToLead);

export { router as leadRoutes };