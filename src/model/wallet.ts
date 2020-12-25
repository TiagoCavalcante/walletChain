import { TOTP } from "https://deno.land/x/god_crypto/otp.ts";
import Block from './block.ts';

class Wallet {
	private coins: Array<Block>;
	public oneTimePassword: TOTP;

	constructor() {
		this.oneTimePassword = new TOTP(TOTP.generateSecret(4));
		this.coins = [];
	}

	public getBlock(blockNumber: number): Block | void {
		for (let i = 0; i < this.coins.length; i++) {
			if (this.coins[i].blockNumber == blockNumber) return this.coins[i];
		}
	}

	public appendBlock(block: Block): void {
		this.coins.push(block);
	}

	public removeBlock(blockNumber: number): void {
		for (let i = 0; i < this.coins.length; i++) {
			if (this.coins[i].blockNumber == blockNumber) {
				this.coins.splice(i, 1);

				return;
			}
		}
	}
}

export default Wallet;