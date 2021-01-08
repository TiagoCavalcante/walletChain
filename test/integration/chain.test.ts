import { SuperDeno, superoak, IResponse } from 'https://deno.land/x/superoak@2.3.1/mod.ts';
import { TOTP } from "https://deno.land/x/god_crypto@v1.4.8/src/otp/totp.ts";
import app from '../../src/app.ts';
import Block from '../../src/model/block.ts';

Deno.test('Integration: can get difficulty', async (): Promise<void> => {
	let request: SuperDeno = await superoak(app);

	await request.get('/difficulty')
		.expect(200)
		.expect('Content-Type', /application\/json/)
		.expect(/{"difficulty":\d/);
});

Deno.test('Integration: can get last block', async (): Promise<void> => {
	let request: SuperDeno = await superoak(app);

	await request.get('/lastBlock')
		.expect(200)
		.expect('Content-Type', /application\/json/)
		.expect(/{"blockNumber":0,"hash":".{32}"}/);
});

Deno.test('Integration: can create a wallet', async (): Promise<void> => {
	let request: SuperDeno = await superoak(app);

	await request.get('/newWallet')
		.expect(201)
		.expect('Content-Type', /application\/json/)
		.expect(/{"number":1,"uri":"otpauth:\/\/totp\/WalletChain:1\?secret=.{7}&period=15&digits=8&algorithm=SHA256&issuer=WalletChain"/);
});

Deno.test('Integration: can add a block', async (): Promise<void> => {
	let request: SuperDeno = await superoak(app);

	let walletData: { number: number; uri: string; } = { number: 0, uri: '' };
	let lastBlock: { blockNumber: number, hash: string; } = { blockNumber: 0, hash: '' };
	let difficulty: number = 0;

	await request.get('/newWallet')
		.expect(201)
		.expect((result: IResponse): void => {
			walletData = result.body;
		});
	const walletOneTimePassword = new TOTP(walletData.uri.slice(-62, -55), 8, 'sha256', 15);

	request = await superoak(app);
	await request.get('/lastBlock')
		.expect(200)
		.expect((result: IResponse): void => {
			lastBlock = result.body;
		});

	request = await superoak(app);
	await request.get('/difficulty')
		.expect(200)
		.expect((result: IResponse): void => {
			difficulty = result.body.difficulty;
		});

	// mining the block
	/**
	 * the proof of work number
	 */
	let proofNumber: number = 0;

	while (!(new Block(lastBlock.blockNumber + 1, lastBlock.hash, walletData.number, proofNumber).hash.startsWith('0'.repeat(difficulty)))) ++proofNumber;

	request = await superoak(app);
	await request.post('/newBlock')
		.send({
			oneTimePassword: walletOneTimePassword.generate(),
			lastHash: lastBlock.hash,
			walletNumber: walletData.number,
			proofNumber: proofNumber
		})
		.expect(201);
});

Deno.test('Integration: can\'t add a block with wrong hash', async (): Promise<void> => {
	let request: SuperDeno = await superoak(app);

	let walletData: { number: number; uri: string; } = { number: 0, uri: '' };
	let lastBlock: { blockNumber: number, hash: string; } = { blockNumber: 0, hash: '' };
	let difficulty: number = 0;

	await request.get('/newWallet')
		.expect(201)
		.expect((result: IResponse): void => {
			walletData = result.body;
		});
	const walletOneTimePassword = new TOTP(walletData.uri.slice(-62, -55), 8, 'sha256', 15);

	request = await superoak(app);
	await request.get('/lastBlock')
		.expect(200)
		.expect((result: IResponse): void => {
			lastBlock = result.body;
		});

	request = await superoak(app);
	await request.get('/difficulty')
		.expect(200)
		.expect((result: IResponse): void => {
			difficulty = result.body.difficulty;
		});

	// mining the block
	/**
	 * the proof of work number
	 */
	let proofNumber: number = 0;

	while (!(new Block(lastBlock.blockNumber + 1, lastBlock.hash, walletData.number, proofNumber).hash.startsWith('0'.repeat(difficulty)))) ++proofNumber;

	request = await superoak(app);
	await request.post('/newBlock')
		.send({
			oneTimePassword: walletOneTimePassword.generate(),
			lastHash: lastBlock.hash,
			walletNumber: walletData.number,
			proofNumber: proofNumber - 1
		})
		.expect(400);
});

Deno.test('Integration: can transfer a block', async (): Promise<void> => {
	let request: SuperDeno = await superoak(app);

	let firstWalletData: { number: number; uri: string; } = { number: 0, uri: '' };
	let secondWalletData: { number: number; uri: string; } = { number: 0, uri: '' };
	let lastBlock: { blockNumber: number, hash: string; } = { blockNumber: 0, hash: '' };
	let difficulty: number = 0;

	await request.get('/newWallet')
		.expect(201)
		.expect((result: IResponse): void => {
			firstWalletData = result.body;
		});
	const firstWalletOneTimePassword = new TOTP(firstWalletData.uri.slice(-62, -55), 8, 'sha256', 15);

	request = await superoak(app);
	await request.get('/newWallet')
		.expect(201)
		.expect((result: IResponse): void => {
			secondWalletData = result.body;
		});
	const secondWalletOneTimePassword = new TOTP(secondWalletData.uri.slice(-62, -55), 8, 'sha256', 15);

	request = await superoak(app);
	await request.get('/lastBlock')
		.expect(200)
		.expect((result: IResponse): void => {
			lastBlock = result.body;
		});

	request = await superoak(app);
	await request.get('/difficulty')
		.expect(200)
		.expect((result: IResponse): void => {
			difficulty = result.body.difficulty;
		});

	// mining the block
	/**
	 * the proof of work number
	 */
	let proofNumber: number = 0;

	while (!(new Block(lastBlock.blockNumber + 1, lastBlock.hash, firstWalletData.number, proofNumber).hash.startsWith('0'.repeat(difficulty)))) ++proofNumber;

	request = await superoak(app);
	await request.post('/newBlock')
		.send({
			oneTimePassword: firstWalletOneTimePassword.generate(),
			lastHash: lastBlock.hash,
			walletNumber: firstWalletData.number,
			proofNumber: proofNumber
		})
		.expect(201);

	request = await superoak(app);
	await request.get('/lastBlock')
		.expect(200)
		.expect((result: IResponse): void => {
			lastBlock = result.body;
		});

	request = await superoak(app);
	await request.post('/transferBlock')
		.send({
			senderOneTimePassword: firstWalletOneTimePassword.generate(),
			senderWalletNumber: firstWalletData.number,
			receiverWalletNumber: secondWalletData.number,
			blockNumber: lastBlock.blockNumber
		})
		.expect(201);

	request = await superoak(app);
	await request.post('/transferBlock')
		.send({
			senderOneTimePassword: secondWalletOneTimePassword.generate(),
			senderWalletNumber: secondWalletData.number,
			receiverWalletNumber: firstWalletData.number,
			blockNumber: lastBlock.blockNumber
		})
		.expect(201);
});

Deno.test('Integration: can\' transfer a block with wrong one time password', async (): Promise<void> => {
	let request: SuperDeno = await superoak(app);

	let firstWalletData: { number: number; uri: string; } = { number: 0, uri: '' };
	let secondWalletData: { number: number; uri: string; } = { number: 0, uri: '' };
	let lastBlock: { blockNumber: number, hash: string; } = { blockNumber: 0, hash: '' };
	let difficulty: number = 0;

	await request.get('/newWallet')
		.expect(201)
		.expect((result: IResponse): void => {
			firstWalletData = result.body;
		});
	const firstWalletOneTimePassword = new TOTP(firstWalletData.uri.slice(-62, -55), 8, 'sha256', 15);

	request = await superoak(app);
	await request.get('/newWallet')
		.expect(201)
		.expect((result: IResponse): void => {
			secondWalletData = result.body;
		});

	request = await superoak(app);
	await request.get('/lastBlock')
		.expect(200)
		.expect((result: IResponse): void => {
			lastBlock = result.body;
		});

	request = await superoak(app);
	await request.get('/difficulty')
		.expect(200)
		.expect((result: IResponse): void => {
			difficulty = result.body.difficulty;
		});

	// mining the block
	/**
	 * the proof of work number
	 */
	let proofNumber: number = 0;

	while (!(new Block(lastBlock.blockNumber + 1, lastBlock.hash, firstWalletData.number, proofNumber).hash.startsWith('0'.repeat(difficulty)))) ++proofNumber;

	request = await superoak(app);
	await request.post('/newBlock')
		.send({
			oneTimePassword: firstWalletOneTimePassword.generate(),
			lastHash: lastBlock.hash,
			walletNumber: firstWalletData.number,
			proofNumber: proofNumber
		})
		.expect(201);

	request = await superoak(app);
	await request.get('/lastBlock')
		.expect(200)
		.expect((result: IResponse): void => {
			lastBlock = result.body;
		});

	request = await superoak(app);
	await request.post('/transferBlock')
		.send({
			senderOneTimePassword: firstWalletOneTimePassword.generate() + 1,
			senderWalletNumber: firstWalletData.number,
			receiverWalletNumber: secondWalletData.number,
			blockNumber: lastBlock.blockNumber
		})
		.expect(400);
});