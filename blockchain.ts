import * as CryptoJS from "crypto-js";


const BLOCK_GENERATION_INTERVAL: number = 10;
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;

class Block {
    public index:        number;
    public hash:         string;
    public previousHash: string;
    public timestamp:    number;
    public data:         string;
    public difficulty:   number;
    public nonce:        number;

    constructor(
          _index:        number
        , _hash:         string
        , _previousHash: string
        , _timestamp:    number
        , _data:         string
        , _difficulty:   number
        , _nonce:        number
        ){
        this.index        = _index;
        this.hash         = _hash;
        this.previousHash = _previousHash;
        this.timestamp    = _timestamp;
        this.data         = _data; 
        this.difficulty   = _difficulty;
        this.nonce        = _nonce;
    }
}

const genesisBlock: Block = new Block(
     0
    ,"c09e61daa85a461a9dc5a65ef2173231aba8cc43d0e2486d9d9402068bb755ac"
    ,""
    ,1631179024
    ,"genesis block"
    ,0
    ,0
);

let blockchain: Block[] = [genesisBlock];

const getBlockchain = (): Block[] => blockchain;

const getLastBlock = (): Block => blockchain[blockchain.length -1];

const calculateHash = (
        _index:         number
        ,_previousHash: string
        ,_timestamp:    number
        ,_data:         string
        ,_difficulty:   number
        ,_nonce:        number
        ): string => CryptoJS.SHA256(
                        _index        + 
                        _previousHash + 
                        _timestamp    + 
                        _data         +
                        _difficulty   +
                        _nonce
                    ).toString();

const calculateHashForBlock = (_block: Block): string =>
    calculateHash(
         _block.index
        ,_block.previousHash
        ,_block.timestamp
        ,_block.data
        ,_block.difficulty
        ,_block.nonce
    );



const findBlock = (
         _index:        number
        ,_previousHash: string
        ,_timestamp:    number
        ,_data:         string
        ,_difficulty:   number
    ): Block => {
        let nonce: number = 0;
        while (true) {
            const hash: string = 
              calculateHash(
                 _index
                ,_previousHash
                ,_timestamp
                ,_data
                ,_difficulty
                ,nonce
            )
            if (hashMatchesDifficulty(hash, _difficulty)) {
                return new Block(
                             _index
                            ,_previousHash
                            ,_timestamp
                            ,_data
                            ,_difficulty
                            ,nonce
                )
            }
            nonce++;
        }

const getCurrentTimestamp = (): number => Math.round(new Date().getTime() / 1000);
    
    const generateBlock = (_data: string): Block => {
    const lastBlock:    Block  = getLastBlock();
    const newIndex:     number = lastBlock.index + 1;
    const newTimestamp: number = getCurrentTimestamp()
    const newHash:      string = calculateHash(
                                    newIndex
                                    ,lastBlock.hash
                                    ,newTimestamp
                                    ,_data
                                );

    const newBlock:     Block  = new Block(
                                        newIndex
                                        ,newHash
                                        ,lastBlock.hash
                                        ,newTimestamp
                                        ,_data
                                    );

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

const hashMatchesDifficulty = (_hash: string, _difficulty: number): boolean => {
    const hashInBinary:   string = hexToBinary(_hash);
    const requiredPrefix: string = '0'.repeat(_difficulty);

    return hashInBinary.startsWith(requiredPrefix);
}

const getDifficulty = (_blockchain: Block[]): number => {
    const latestBlock: Block = _blockchain[blockchain.length - 1];
    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 % latestBlock.index !== 0) {
        return getAdjustedDifficulty(latestBlock, _blockchain);
    } else {
        return latestBlock.difficulty;
    }
};

const getAdjustedDifficulty = (_latestBlock: Block, _blockchain: Block[])  => {
    const prevAdjustmentBlock: Block = _blockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken: number = _latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1;
    } else if ( timeTaken > timeExpected * 2) {
        return prevAdjustmentBlock.difficulty - 1;
    } else {
        return prevAdjustmentBlock.difficulty;
    }
} 

export {
     Block
    ,getBlockchain
    ,getLastBlock
    ,generateBlock
    ,isValidBlockStructure
    ,replaceChain
    ,addBlockToChain
};