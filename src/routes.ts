import { Router } from 'https://deno.land/x/oak/mod.ts';
import { addWallet, addBlock, transferBlock, getDifficulty, getLastBlock } from './controller/chain.ts';

const router = new Router();

router.get('/newWallet', addWallet);
router.post('/newBlock', addBlock);
router.post('/transferBlock', transferBlock);
router.get('/difficulty', getDifficulty);
router.get('/lastBlock', getLastBlock);

export default router;