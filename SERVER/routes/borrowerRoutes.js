const express = require('express');
const router = express.Router();
const borrowerController = require('../controllers/borrowerController');
const { authenticate, authorize } = require('../middleware/auth');
router.use(authenticate);

router.get('/', borrowerController.getBorrowers);
router.use(authorize('librarian'));
router.get('/:id', borrowerController.getBorrowerById);
router.post('/', borrowerController.createBorrower);
router.put('/:id', borrowerController.updateBorrower);
router.delete('/:id', borrowerController.deleteBorrower);

module.exports = router;
