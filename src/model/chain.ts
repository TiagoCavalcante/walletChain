import Block from './block.ts';
import Wallet from './wallet.ts';

const difficulty: number = 4;

class Chain {
	private chain: Array<Wallet>;
	public lastBlock: Block;

	constructor() {
		this.chain = [];
		// generate genesis block
		const block = new Block(0, '0', 0, 0);
		// create genesis wallet 
		this.addWallet();
		// append genesis block
		this.chain[0].appendBlock(block);
		this.lastBlock = block;
	}

	/**
	 * create a new wallet
	 * @returns an object with the number of the wallet and it's URI (for generate OTP)
	 */
	public addWallet(): { number: number; uri: string; } {
		this.chain.push(new Wallet());

		return {
			number: this.chain.length - 1,
			uri: this.chain[this.chain.length - 1].oneTimePassword.uri(`${this.chain.length - 1}`, 'WalletChain')
		};
	}

	/**
	 * add a block to a wallet if its hash ends with '0' repeated difficulty times
	 * @param oneTimePassword the miner wallet's OTP
	 * @param lastHash the hash of the block before this one
	 * @param walletNumber the miner wallet's number
	 * @param proofNumber the proof of work number
	 * @returns true if the block was added and false if not
	 */
	public addBlock(oneTimePassword: number, lastHash: string, walletNumber: number, proofNumber: number): boolean {
		const block = new Block(this.chain.length - 1, lastHash, walletNumber, proofNumber);

		if (block.hash.startsWith('0'.repeat(difficulty)) && block.lastHash == this.lastBlock.hash && this.chain[walletNumber]?.oneTimePassword.verify(`${oneTimePassword}`)) {
			this.chain[walletNumber].appendBlock(block);
			this.lastBlock = block;

			return true;
		}

		return false;
	}

	/**
	 * transfer a block from a wallet to another one if the OTP is correct, the sender wallet exists and has the block to be sent and the receiver wallet exists
	 * @param blockNumber the number of the block to be transfered
	 * @returns true if the block was transfered and false if not
	 */
	public transferBlock(senderOneTimePassword: number, senderWalletNumber: number, receiverWalletNumber: number, blockNumber: number): boolean {
		if (this.chain[senderWalletNumber]?.oneTimePassword.verify(`${senderOneTimePassword}`) && this.chain[senderWalletNumber]?.getBlock(blockNumber) && receiverWalletNumber < this.chain.length) {
			this.chain[receiverWalletNumber].appendBlock(this.chain[senderWalletNumber].getBlock(blockNumber) as Block);
			this.chain[senderWalletNumber].removeBlock(blockNumber);

			return true;
		}

		return false;
	}
}

export default Chain;
export { difficulty };