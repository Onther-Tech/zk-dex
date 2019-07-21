const fs = require('fs');
const BN = require('bn.js');

function sleep(t) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, t * 1000);
  });
}

const rx2 = /([0-9]+)[,]/gm
function parseProof(file) {
  let proofJson = fs.readFileSync(file, 'utf8');
  proofJson.match(rx2).forEach(p => {
    proofJson = proofJson.replace(p, `"${p.slice(0, p.length-1)}",`)
  })
  proofJson = JSON.parse(proofJson);
  const proof = proofJson.proof;
  const input = proofJson.input;
  input.forEach((i, key) => {
    if (typeof i == 'number') i = i.toString();
    input[key] = '0x' + new BN(i, 10).toString('hex')
  })

  const _proof = [];
  Object.keys(proof).forEach(key => _proof.push(proof[key]));
  _proof.push(input);
  return _proof;
}

function parseProofObj(obj) {
  const proof = obj.proof;
  const input = obj.input;

  const _proof = [];
  Object.keys(proof).forEach(key => _proof.push(proof[key]));
  _proof.push(input);
  return _proof;
}

function marshal (str) {
  if (str.slice(0, 2) === '0x') return str;
  return '0x'.concat(str);
}

function unmarshal (str) {
  if (str.slice(0, 2) === '0x') return str.slice(2);
  return str;
}

function calcHash(h0, h1) {
  return marshal(unmarshal(h0) + unmarshal(h1));
}

function split32BytesTo16BytesArr(b) {
  const v = web3.utils.toBN(b).toString(16);
  return [
    marshal(v.slice(0, 32)),
    marshal(v.slice(32)),
  ];
}

function reduceParams(params) {
  return params
    .map(p => web3.utils.toBN(p, 16).toString(10))
    .reduce((a, b) => `${a} ${b}`, "").trim();
}

module.exports = {
  sleep,
  parseProof,
  parseProofObj,
  calcHash,
  marshal,
  unmarshal,
  split32BytesTo16BytesArr,
  reduceParams,
}