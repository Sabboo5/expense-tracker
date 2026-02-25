import { Router } from 'express';
import * as transactionController from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from '../schemas/transactionSchemas';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

router
  .route('/')
  .get(validate(transactionQuerySchema), transactionController.getTransactions)
  .post(validate(createTransactionSchema), transactionController.createTransaction);

router.get('/analytics', transactionController.getAnalytics);

router
  .route('/:id')
  .get(transactionController.getTransaction)
  .put(validate(updateTransactionSchema), transactionController.updateTransaction)
  .delete(transactionController.deleteTransaction);

export default router;
