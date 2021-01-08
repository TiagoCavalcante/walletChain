import { assert, assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { TOTP } from "https://deno.land/x/god_crypto/otp.ts";
import Block from '../../src/model/block.ts';
import Chain, { difficulty } from '../../src/model/chain.ts';

Deno.test('Unit: can add a wallet to a chain', (): void => {
	const chain: Chain = new Chain();

	const walletData: { number: number; uri: string; } = chain.addWallet();

	assertEquals(walletData.number, 1);
});

Deno.test('Unit: can add a block to a chain', (): void => {
	const chain: Chain = new Chain();

	const walletData: { number: number; uri: string; } = chain.addWallet();

	// mining the block
	/**
	 * the proof of work number
	 */
	let proofNumber: number = 0;

	while (!(new Block(1, chain.lastBlock.hash, 1, proofNumber).hash.startsWith('0'.repeat(difficulty)))) ++proofNumber;

	// slice the uri to get the secret
	const oneTimePassword: TOTP = new TOTP(walletData.uri.slice(-62, -55), 8, 'sha256', 15);

	assert(chain.addBlock(parseInt(oneTimePassword.generate()), chain.lastBlock.hash, walletData.number, proofNumber));
});

Deno.test('Unit: can\'t add a block with wrong hash to a chain', (): void => {
	const chain: Chain = new Chain();

	const walletData: { number: number; uri: string; } = chain.addWallet();

	// mining the block
	/**
	 * the proof of work number
	 */
	let proofNumber: number = 0;

	while (!(new Block(1, chain.lastBlock.hash, 1, proofNumber).hash.startsWith('0'.repeat(difficulty)))) ++proofNumber;

	// slice the uri to get the secret
	const oneTimePassword: TOTP = new TOTP(walletData.uri.slice(-62, -55), 8, 'sha256', 15);

	// proof number - 1 generate a wrong hash
	assert(!chain.addBlock(parseInt(oneTimePassword.generate()), chain.lastBlock.hash, 1, proofNumber - 1));
});

Deno.test('Unit: can transfer a block', (): void => {
	const chain: Chain = new Chain();

	const senderWalletData: { number: number; uri: string; } = chain.addWallet();

	// slice the uri to get the secret
	const senderOneTimePassword: TOTP = new TOTP(senderWalletData.uri.slice(-62, -55), 8, 'sha256', 15);

	const receiverWalletData: { number: number; uri: string; } = chain.addWallet();

	// mining the block
	/**
	 * the proof of work number
	 */
	let proofNumber: number = 0;

	while (!(new Block(1, chain.lastBlock.hash, 1, proofNumber).hash.startsWith('0'.repeat(difficulty)))) ++proofNumber;

	chain.addBlock(parseInt(senderOneTimePassword.generate()), chain.lastBlock.hash, senderWalletData.number, proofNumber);

	assert(chain.transferBlock(parseInt(senderOneTimePassword.generate()), senderWalletData.number, receiverWalletData.number, chain.lastBlock.blockNumber));
});

Deno.test('Unit: can\' transfer a block with wrong one time password', (): void => {
	const chain: Chain = new Chain();

	const senderWalletData: { number: number; uri: string; } = chain.addWallet();

	// slice the uri to get the secret
	const senderOneTimePassword: TOTP = new TOTP(senderWalletData.uri.slice(-62, -55), 8, 'sha256', 15);

	const receiverWalletData: { number: number; uri: string; } = chain.addWallet();

	// mining the block
	/**
	 * the proof of work number
	 */
	let proofNumber: number = 0;

	while (!(new Block(1, chain.lastBlock.hash, 1, proofNumber).hash.startsWith('0'.repeat(difficulty)))) ++proofNumber;

	chain.addBlock(parseInt(senderOneTimePassword.generate()), chain.lastBlock.hash, senderWalletData.number, proofNumber);

	assert(!chain.transferBlock(parseInt(senderOneTimePassword.generate()) + 1, senderWalletData.number, receiverWalletData.number, chain.lastBlock.blockNumber));
})