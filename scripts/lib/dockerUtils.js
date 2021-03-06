const Docker = require('dockerode');
const BN = require('bn.js');
const Web3Utils = require('web3-utils');
const util = require('./util');

const { constants } = require('./Note');
const {
  getMintAndBurnCmd,
  getTransferCmd,
  getConvertCmd,
  getMakeOrderCmd,
  getTakeOrderCmd,
  getSettleOrderCmd,
} = require('../helper/cmdHelper');

const docker = new Docker();

const SCALING_FACTOR = new BN('1000000000000000000');

let c; // zokrates docker container
const cName = 'zokrates';
const cmdBase = './genProof.sh';

async function execute(circuitName, cmd) {
  // set generated proof file when compute is complete.
  const workingDir = `/home/zokrates/circuits/${circuitName}`; // zokerates container Path

  const exec = await c.exec({
    //  Cmd: ['bash', '-c', "ls -al"],
    Cmd: cmd.split(' '),
    WorkingDir: workingDir,
    AttachStdout: true,
    AttachStderr: true,
  });

  return new Promise(async (resolve, reject) => {
    await exec.start({ hijack: true, stdin: true }, (err, stream) => {
      if (err) {
        console.error(`Failed to execute ${cmd}`, err); // err null
        return reject(err);
      }

      let proof;
      const chunks = [];

      stream.on('end', (err) => {
        if (err) {
          console.error(`Failed to execute ${cmd}`, err); // err null
          return reject(err);
        }

        try {
          proof = chunks[chunks.length - 1];
          const i = proof.indexOf('{');
          proof = proof.slice(i);
          proof = JSON.parse(proof);
        } catch (e) {
          return reject(new Error(`Failed to parse proof json: ${e.message}`));
        }

        if (!proof) {
          return reject(new Error('proof is empty'));
        }

        return resolve(proof);
      });

      stream.on('data', (data) => {
        // console.log(data.toString());
        chunks.push(data.toString());
      });
    });
  });
}

const convert = v => Web3Utils.toBN(v || '0x00', 16);

async function getMintNBurnProof(note, sk) {
  const cmdArgs = getMintAndBurnCmd(
    convert(note.owner0),
    convert(note.owner1),
    convert(note.value),
    convert(note.token),
    convert(note.viewingKey),
    convert(note.salt),
    convert(sk),
  );

  const proof = await execute('mintNBurnNote', `${cmdBase} ${cmdArgs}`);
  return util.parseProofObj(proof);
}

async function getTransferProof(oldNote0, oldNote1, newNote, changeNote, sk0, sk1) {
  if (!oldNote1) {
    oldNote1 = constants.EMPTY_NOTE;
    sk1 = '0x00';
  }

  const cmdArgs = getTransferCmd(
    convert(oldNote0.owner0),
    convert(oldNote0.owner1),
    convert(oldNote0.value),
    convert(oldNote0.token),
    convert(oldNote0.viewingKey),
    convert(oldNote0.salt),
    convert(oldNote1.owner0),
    convert(oldNote1.owner1),
    convert(oldNote1.value),
    convert(oldNote1.token),
    convert(oldNote1.viewingKey),
    convert(oldNote1.salt),
    convert(newNote.owner0),
    convert(newNote.owner1),
    convert(newNote.value),
    convert(newNote.token),
    convert(newNote.viewingKey),
    convert(newNote.salt),
    convert(changeNote.owner0),
    convert(changeNote.owner1),
    convert(changeNote.value),
    convert(changeNote.token),
    convert(changeNote.viewingKey),
    convert(changeNote.salt),
    convert(sk0),
    convert(sk1),
  );

  const proof = await execute('transferNote', `${cmdBase} ${cmdArgs}`);
  return util.parseProofObj(proof);
}

async function getConvertProof(smartNote, originNote, note, sk) {
  const cmdArgs = getConvertCmd(
    convert(smartNote.owner0),
    null,
    convert(smartNote.value),
    convert(smartNote.token),
    convert(smartNote.viewingKey),
    convert(smartNote.salt),
    convert(originNote.owner0),
    convert(originNote.owner1),
    convert(originNote.value),
    convert(originNote.token),
    convert(originNote.viewingKey),
    convert(originNote.salt),
    convert(note.owner0),
    convert(note.owner1),
    convert(note.value),
    convert(note.token),
    convert(note.viewingKey),
    convert(note.salt),
    convert(sk),
  );

  const proof = await execute('convertNote', `${cmdBase} ${cmdArgs}`);
  return util.parseProofObj(proof);
}

async function getMakeOrderProof(makerNote, sk) {
  const cmdArgs = getMakeOrderCmd(
    convert(makerNote.owner0),
    convert(makerNote.owner1),
    convert(makerNote.value),
    convert(makerNote.token),
    convert(makerNote.viewingKey),
    convert(makerNote.salt),
    convert(sk),
  );

  const proof = await execute('makeOrder', `${cmdBase} ${cmdArgs}`);
  return util.parseProofObj(proof);
}

async function getTakeOrderProof(parentNote, stakeNote, sk) {
  const cmdArgs = getTakeOrderCmd(
    convert(parentNote.owner0),
    convert(parentNote.owner1),
    convert(parentNote.value),
    convert(parentNote.token),
    convert(parentNote.viewingKey),
    convert(parentNote.salt),
    convert(stakeNote.owner0),
    null,
    convert(stakeNote.value),
    convert(stakeNote.token),
    convert(stakeNote.viewingKey),
    convert(stakeNote.salt),
    convert(sk),
  );

  const proof = await execute('takeOrder', `${cmdBase} ${cmdArgs}`);
  return util.parseProofObj(proof);
}

async function getSettleOrderProof(makerNote, stakeNote, rewardNote, paymentNote, changeNote, price, sk) {
  const cmdArgs = getSettleOrderCmd(
    convert(makerNote.owner0),
    convert(makerNote.owner1),
    convert(makerNote.value),
    convert(makerNote.token),
    convert(makerNote.viewingKey),
    convert(makerNote.salt),
    convert(stakeNote.owner0),
    null,
    convert(stakeNote.value),
    convert(stakeNote.token),
    convert(stakeNote.viewingKey),
    convert(stakeNote.salt),
    convert(rewardNote.owner0),
    null,
    convert(rewardNote.value),
    convert(rewardNote.token),
    convert(rewardNote.viewingKey),
    convert(rewardNote.salt),
    convert(paymentNote.owner0),
    null,
    convert(paymentNote.value),
    convert(paymentNote.token),
    convert(paymentNote.viewingKey),
    convert(paymentNote.salt),
    convert(changeNote.owner0),
    null,
    convert(changeNote.value),
    convert(changeNote.token),
    convert(changeNote.viewingKey),
    convert(changeNote.salt),
    convert(price),
    convert(util.getQuotient(Web3Utils.toBN(makerNote.value).mul(Web3Utils.toBN(price)), SCALING_FACTOR)),
    convert(util.getRemainder(Web3Utils.toBN(makerNote.value).mul(Web3Utils.toBN(price)), SCALING_FACTOR)),
    convert(util.getQuotient(Web3Utils.toBN(stakeNote.value), Web3Utils.toBN(price))),
    convert(util.getRemainder(Web3Utils.toBN(stakeNote.value), Web3Utils.toBN(price))),
    convert(sk),
  );

  const proof = await execute('settleOrder', `${cmdBase} ${cmdArgs}`);
  return util.parseProofObj(proof);
}

function initialized() {
  const MAX_TRY = 100;
  let i = 0;

  return new Promise((resolve, reject) => {
    const timer = () => setTimeout(() => {
      i++;
      if (i >= MAX_TRY) {
        reject("Out of time");
      }

      if (!c) return timer();
      return resolve();
    }, 500);

    timer();
  });
}

(async () => {
  try {
    const containers = await docker.listContainers();

    c = containers
      .filter(c => c.Names[0].includes(cName))[0];

    console.log('zokrates docker container running ', c.Id);
    c = await docker.getContainer(c.Id);
  } catch (e) {
    console.error('Failed to connect docker container', e);
    process.exit(-1);
  }
})();

module.exports = {
  getMintNBurnProof,
  getTransferProof,
  getConvertProof,
  getMakeOrderProof,
  getTakeOrderProof,
  getSettleOrderProof,
  initialized,
};
