import { Context, RouterContext } from 'https://deno.land/x/oak/mod.ts';
import Chain, { difficulty } from '../model/chain.ts';

let chain: Chain = new Chain();

export function addWallet(context: Context): void {
	context.response.status = 201;
	context.response.body = chain.addWallet();
};

export async function addBlock(context: RouterContext): Promise<void> {
	const { value } = context.request.body({ type: 'json' });
	const { oneTimePassword, lastHash, walletNumber, proofNumber } = await value;

	const hasAddedBlock: boolean = chain.addBlock(oneTimePassword, lastHash, walletNumber, proofNumber);

	if (hasAddedBlock) {
		context.response.status = 201;
	}
	else {
		context.response.status = 400;
		context.response.body = { message: 'the hash doesn\'t ends with the right number of 0s or the one time password is wrong' };
	}
};

export async function transferBlock(context: Context): Promise<void> {
	const { value } = context.request.body({ type: 'json' });
	const { senderOneTimePassword, senderWalletNumber, receiverWalletNumber, blockNumber } = await value;

	const hasTranferedBlock: boolean = chain.transferBlock(senderOneTimePassword, senderWalletNumber, receiverWalletNumber, blockNumber);

	if (hasTranferedBlock) {
		context.response.status = 201;
	}
	else {
		context.response.status = 400;
		context.response.body = { message: 'the one time passwords is wrong or one of the wallets doesn\'t exist or the sender\'s wallet doesn\'t has this block' };
	}
};

export function getDifficulty(context: RouterContext): void {
	context.response.status = 200;
	context.response.body = { difficulty };
};

export function getLastBlock(context: RouterContext): void {
	context.response.status = 200;
	context.response.body = { blockNumber: chain.lastBlock.blockNumber, hash: chain.lastBlock.hash };
}