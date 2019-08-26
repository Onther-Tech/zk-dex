const BN = require('bn.js');
const { PublicKey, PrivateKey } = require('babyjubjub');
const crypto = require('crypto');
const Web3Utils = require('web3-utils');

function getSk() {
  let sk = PrivateKey.getRandObj().field;
  return sk;
}

function getPrivKey(sk) {
  return new PrivateKey(sk);
}

function getPubKey(privKey) {
  return PublicKey.fromPrivate(privKey);
}

function getAddress(sk) {
  const privKey = getPrivKey(sk);
  const pubKey = getPubKey(privKey);
  const pubKeyX = Web3Utils.padLeft(pubKey.p.x.n.toString(16, 64), 64)
  const pubKeyY = Web3Utils.padLeft(pubKey.p.y.n.toString(16, 64), 64)
  
  const params = pubKeyX + pubKeyY

  const buf = Buffer.from(params, 'hex');
  const digest = crypto.createHash('sha256').update(buf).digest('hex');

  return digest.slice(24);
}

module.exports = {
  getSk,
  getPrivKey,
  getPubKey,
  getAddress,
}