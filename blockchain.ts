import * as CryptoJS from "crypto-js";

class Block {
    public index:        number;
    public hash:         string;
    public previousHash: string;
    public timestamp:    number;
    public data:         string;

    constructor(_index: number, _hash: string, _previousHash: string, _timestamp: number, _data: string) {
        this.index        = _index;
        this.hash         = _hash;
        this.previousHash = _previousHash;
        this.timestamp    = _timestamp;
        this.data         = _data; 
    }
}

const genesisBlock: Block = new Block(
    0, "c09e61daa85a461a9dc5a65ef2173231aba8cc43d0e2486d9d9402068bb755ac", null, 1631179024, "genesis block"
);

let blockchain: Block[] = [genesisBlock];

const getBlockchain = (): Block[] => blockchain;

const getLastBlock = (): Block => blockchain[blockchain.length -1];

const calculateHash = (_index: number, _previousHash: string, _timestamp: number, _data: string): string => 
    CryptoJS.SHA256(_index + _previousHash + _timestamp + _data).toString();

const calculateHashForBlock = (_block: Block): string =>
    calculateHash(_block.index, _block.previousHash, _block.timestamp, _block.data);

const generateBlock = (_data: string): Block => {
    const lastBlock:    Block  = getLastBlock();
    const newIndex:     number = lastBlock.index + 1;
    const newTimestamp: number = new Date().getTime() / 1000;
    const newHash:      string = calculateHash(newIndex, lastBlock.hash, newTimestamp, _data);
    const newBlock:     Block  = new Block(newIndex, newHash, lastBlock.hash, newTimestamp, _data);

    return newBlock;
};

// Block is valid if: 
const isValid = (_newBlock: Block, _lastBlock: Block): boolean => {
    // - Index of new block is + 1 of last block
    if (_lastBlock.index + 1 !== _newBlock.index) {
        console.log("Index not valid");
        return false;

    // - The previousHash == the hash of the last block
    } else if (_lastBlock.hash !== _newBlock.previousHash) {
        console.log("Hash of last block not valid");
        return false;

    // - The hash of the new block is valid
    } else if (calculateHashForBlock(_newBlock) !== _newBlock.hash) {
        console.log(typeof(_newBlock.hash) + " " + typeof calculateHashForBlock(_newBlock));
        console.log("Hash not valid: " + calculateHashForBlock(_newBlock) + " " + _newBlock.hash);
        return false;
    }
    return true;
};

const isValidBlockStructure = (_block: Block): boolean => {
    return typeof _block.index        === "number"
        && typeof _block.hash         === "string"
        && typeof _block.previousHash === "string"
        && typeof _block.timestamp    === "number"
        && typeof _block.data         === "string"
};

const isValidBlockchain = (_blockchain: Block[]): boolean => {
    const isValidGenesis = (_block: Block): boolean => {
        return JSON.stringify(_block) === JSON.stringify(genesisBlock);
    };

    if (!isValidGenesis(_blockchain[0])) {
        return false;
    }

    for (let i = 1; i < _blockchain.length; i++) {
        if (!isValid(_blockchain[i], _blockchain[i - 1])) {
            return false;
        }
    }
    return true;
}


const addBlockToChain = (_block: Block): boolean => {
    if (isValid(_block, getLastBlock())) {
        blockchain.push(_block);
        return true;
    }
    return false;
};

const replaceChain = (_blockchain: Block[]) => {
    if (isValidBlockchain(_blockchain) && _blockchain.length > getBlockchain().length) {
        console.log("New blockchain valid. Replacing current...");
        blockchain = _blockchain;
        broadcastLatest();
    } else {
        console.log("New blockchain not valid");
    }
}

export {Block, getBlockchain, getLastBlock, generateBlock, isValidBlockStructure, replaceChain, addBlockToChain};