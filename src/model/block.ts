import { createHash } from 'https://deno.land/std@0.82.0/hash/mod.ts';

class Block {
	public blockNumber: number;
	public lastHash: string;
	public walletNumber: number;
	public proofNumber: number;
	public hash: string;

	constructor(blockNumber: number, lastHash: string, walletNumber: number, proofNumber: number) {
		this.blockNumber = blockNumber;
		this.lastHash = lastHash;
		this.walletNumber = walletNumber;
		this.proofNumber = proofNumber;
		this.hash = createHash('md5').update(`${lastHash}${walletNumber}${proofNumber}`).toString();
	};
}

export default Block;