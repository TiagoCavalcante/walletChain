import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import Block from '../../src/model/block.ts';
import Wallet from '../../src/model/wallet.ts';

Deno.test('Unit: can get a block from a wallet', (): void => {
	const wallet: Wallet = new Wallet();

	assertEquals(wallet.getBlock(0), undefined);
});

Deno.test('Unit: can add a block to a wallet', (): void => {
	const wallet: Wallet = new Wallet();
	const block: Block = new Block(0, '0', 0, 0);

	wallet.appendBlock(block);

	assertEquals(wallet.getBlock(0), block);
});

Deno.test('Unit: can remove a block from a wallet', (): void => {
	const wallet: Wallet = new Wallet();
	const block: Block = new Block(0, '0', 0, 0);

	wallet.appendBlock(block);

	wallet.removeBlock(0);

	assertEquals(wallet.getBlock(0), undefined);
});