import { SuperDeno, superoak } from 'https://deno.land/x/superoak@2.3.1/mod.ts';
import { TOTP } from "https://deno.land/x/god_crypto/otp.ts";
import app from '../../src/app.ts';
import { difficulty } from '../../src/model/chain.ts';
import Block from '../../src/model/block.ts';

Deno.test('Integration: can get difficulty', async (): Promise<void> => {
	const request: SuperDeno = await superoak(app);

	await request.get('/difficulty')
		.expect(200)
		.expect('Content-Type', /application\/json/)
		.expect(/{"difficulty":\d/);
});

Deno.test('Integration: can get last block', async (): Promise<void> => {
	const request: SuperDeno = await superoak(app);

	await request.get('/lastBlock')
		.expect(200)
		.expect('Content-Type', /application\/json/)
		.expect(/{"blockNumber":0,"hash":".{32}"}/);
});

Deno.test('Integration: can create a wallet', async (): Promise<void> => {
	const request: SuperDeno = await superoak(app);

	await request.get('/newWallet')
		.expect(201)
		.expect('Content-Type', /application\/json/)
		.expect(/{"number":1,"uri":"otpauth:\/\/totp\/WalletChain:1\?secret=.{7}&period=30&digits=6&algorithm=SHA1&issuer=WalletChain"/);
});