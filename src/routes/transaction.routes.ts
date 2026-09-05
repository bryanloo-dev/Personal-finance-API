import {Router} from "express";
import {authenticate} from "../middleware/auth.middleware";
import {
    createTransaction,
    deleteTransaction,
    listTransactions
} from "../controllers/transaction.controller";

const router = Router();

router.use(authenticate);

router.get("/", listTransactions);
router.get("/", createTransaction);
router.get("/:id", deleteTransaction);

export default router;