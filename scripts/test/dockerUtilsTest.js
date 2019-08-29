const { expect } = require('chai');
const BN = require('bn.js');
const Web3Utils = require('web3-utils');

const util = require('../lib/util');
const {
  constants, 
  Note,
} = require('../lib/Note');

const {
  getSk,
  getAddress,
} = require('../helper/accountHelper');

const {
  getMintNBurnProof,
  getTransferProof,
  getConvertProof,
  getMakeOrderProof,
  getTakeOrderProof,
  getSettleOrderProof,
  initialized,
} = require('../lib/dockerUtils');


const SCALING_FACTOR = new BN('1000000000000000000');
    
let sk;
let address;
let viewingKey;
let salt;

let oldDAINote;
let oldDAINote1;
let newDAINote;
let changeNote;

let makerNoteValue;
let parentNoteValue;
let stakeNoteValue;
let rewardNoteValue;
let paymentNoteValue;
let changeNoteValue;

let makerNote;
let parentNote;
let stakeNote;
let rewardNote;
let paymentNote;
let price;


describe('dockerUtils', function() {

  before(async() => {
    sk = getSk()
    sk_hex = sk.n.toString(16, 64);
    address = getAddress(sk);
    viewingKey = Web3Utils.randomHex(32);
    salt = Web3Utils.randomHex(16);

    let oldDAIValue = Web3Utils.toHex(new BN(5000).mul(SCALING_FACTOR));
    let oldDAIValue1 = Web3Utils.toHex(new BN(5000).mul(SCALING_FACTOR));
    let newDAIValue = Web3Utils.toHex(new BN(7000).mul(SCALING_FACTOR));
    let changeValue = Web3Utils.toHex(new BN(3000).mul(SCALING_FACTOR));

    oldDAINote = new Note(address, oldDAIValue, constants.DAI_TOKEN_TYPE, viewingKey, salt);
    oldDAINote1 = new Note(address, oldDAIValue1, constants.DAI_TOKEN_TYPE, viewingKey, salt);
    newDAINote = new Note(address, newDAIValue, constants.DAI_TOKEN_TYPE, viewingKey, salt);
    changeNote = new Note(address, changeValue, constants.DAI_TOKEN_TYPE, viewingKey, salt);

    let smartValue = Web3Utils.toHex(new BN(10000).mul(SCALING_FACTOR));
    let originValue = Web3Utils.toHex(new BN(50000).mul(SCALING_FACTOR));
    let noteValue = Web3Utils.toHex(new BN(10000).mul(SCALING_FACTOR));

    originNote = new Note(address, originValue, constants.DAI_TOKEN_TYPE, viewingKey, salt);
    smartNote = new Note(originNote.hash(), smartValue, constants.DAI_TOKEN_TYPE, viewingKey, salt);
    note = new Note(address, noteValue, constants.DAI_TOKEN_TYPE, viewingKey, salt);

    parentNoteValue = Web3Utils.toHex(new BN(20000).mul(SCALING_FACTOR));
    parentNote = new Note(address, parentNoteValue, constants.DAI_TOKEN_TYPE, viewingKey, salt);

    makerNoteValue = Web3Utils.toHex(new BN(100).mul(SCALING_FACTOR));
    stakeNoteValue = Web3Utils.toHex(new BN(20000).mul(SCALING_FACTOR));

    makerNote = new Note(address, makerNoteValue, constants.ETH_TOKEN_TYPE, viewingKey, salt);
    stakeNote = new Note(makerNote.hash(), stakeNoteValue, constants.DAI_TOKEN_TYPE, viewingKey, salt);

    await initialized();
    
  });

  it('should get proof of mintNBurn', async () => {
    proof = await getMintNBurnProof(oldDAINote, sk_hex)
    console.log(proof);
  });

  it('should get proof of trasnfer', async () => {
    proof = await getTransferProof(oldDAINote, oldDAINote1, newDAINote, changeNote, sk_hex)
    console.log(proof);
  });

  it('should get proof of convert', async () => {
    proof = await getConvertProof(smartNote, originNote, note, sk_hex)
    console.log(proof);
  });
  
  it('should get proof of makeOrder', async () => {
    proof = await getMakeOrderProof(oldDAINote, sk_hex)
    console.log(proof);
  });

  it('should get proof of takeOrder', async () => {
    proof = await getTakeOrderProof(parentNote, stakeNote, makerNote.hash(), sk_hex)
    console.log(proof);
  });

  describe('when makerNote.value >= stakeNote.value * price', function () {
    before(async() => {
      makerNoteValue = Web3Utils.toHex(new BN(100).mul(SCALING_FACTOR));
      stakeNoteValue = Web3Utils.toHex(new BN(5000).mul(SCALING_FACTOR));
      rewardNoteValue = Web3Utils.toHex(new BN(50).mul(SCALING_FACTOR));
      paymentNoteValue = Web3Utils.toHex(new BN(5000).mul(SCALING_FACTOR));
      changeNoteValue = Web3Utils.toHex(new BN(50).mul(SCALING_FACTOR));
  
      price = Web3Utils.toHex(new BN(100).mul(SCALING_FACTOR));

      makerNote = new Note(address, makerNoteValue, constants.ETH_TOKEN_TYPE, viewingKey, salt);
      stakeNote = new Note(makerNote.hash(), stakeNoteValue, constants.DAI_TOKEN_TYPE, viewingKey, salt);
      rewardNote = new Note(parentNote.hash(), rewardNoteValue, constants.ETH_TOKEN_TYPE, viewingKey, salt);
      paymentNote = new Note(makerNote.hash(), paymentNoteValue, constants.DAI_TOKEN_TYPE, viewingKey, salt);
      changeNote = new Note(makerNote.hash(), changeNoteValue, constants.ETH_TOKEN_TYPE, viewingKey, salt);
    })
    
    it('should get proof of settleOrder when makerNote.value >= stakeNote.value * price', async () => {
      proof = await getSettleOrderProof(makerNote, stakeNote, rewardNote, paymentNote, changeNote, price, sk_hex)
      console.log(proof);
    });
  })

  describe('makerNote.value < stakeNote.value * price', function () {
    before(async() => {
      makerNoteValue = Web3Utils.toHex(new BN(100).mul(SCALING_FACTOR));
      stakeNoteValue = Web3Utils.toHex(new BN(20000).mul(SCALING_FACTOR));
      rewardNoteValue = Web3Utils.toHex(new BN(100).mul(SCALING_FACTOR));
      paymentNoteValue = Web3Utils.toHex(new BN(10000).mul(SCALING_FACTOR));
      changeNoteValue = Web3Utils.toHex(new BN(10000).mul(SCALING_FACTOR));
  
      price = Web3Utils.toHex(new BN(100).mul(SCALING_FACTOR));

      makerNote = new Note(address, makerNoteValue, constants.ETH_TOKEN_TYPE, viewingKey, salt);
      stakeNote = new Note(makerNote.hash(), stakeNoteValue, constants.DAI_TOKEN_TYPE, viewingKey, salt);
      rewardNote = new Note(parentNote.hash(), rewardNoteValue, constants.ETH_TOKEN_TYPE, viewingKey, salt);
      paymentNote = new Note(makerNote.hash(), paymentNoteValue, constants.DAI_TOKEN_TYPE, viewingKey, salt);
      changeNote = new Note(parentNote.hash(), changeNoteValue, constants.DAI_TOKEN_TYPE, viewingKey, salt);
    })

    it('should get proof of settleOrder when makerNote.value < stakeNote.value * price', async () => {
      proof = await getSettleOrderProof(makerNote, stakeNote, rewardNote, paymentNote, changeNote, price, sk_hex)
      console.log(proof);
    });
  })
});