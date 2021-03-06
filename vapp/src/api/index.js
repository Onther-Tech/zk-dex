import axios from 'axios';

function createInstance () {
  return axios.create({
    baseURL: 'http://127.0.0.1:3000',
  });
}

const instance = createInstance();

// get
async function getViewingKey (key) {
  const res = await instance.get(`/vk/${key}`);
  return res.data.vk;
}

async function getAccounts (key) {
  const res = await instance.get(`/accounts/${key}`);
  return JSON.parse(res.data.accounts);
}

async function getNoteByNoteHash (account, hash) {
  const res = await instance.get(`/notes/${account}/${hash}`);
  return res.data.note;
}

async function getNotes (account) {
  const res = await instance.get(`/notes/${account}`);
  return JSON.parse(res.data.notes);
}

async function getTransferNotes (account) {
  const res = await instance.get(`/notes/transfer/${account}`);
  return JSON.parse(res.data.notes);
}

async function getOrderHistory (account) {
  const res = await instance.get(`/orders/history/${account}`);
  if (res.data === null) {
    return null;
  } else {
    return JSON.parse(res.data.orders);
  }
}

async function getOrder (id) {
  const res = await instance.get(`/orders/${id}`);
  if (res.data === null) {
    return null;
  } else {
    return res.data.order;
  }
}

async function getOrders () {
  const res = await instance.get('/orders');
  if (res.data === null) {
    return null;
  } else {
    return JSON.parse(res.data.orders);
  }
}

// post
async function addAccount (key, account) {
  const res = await instance.post('/accounts/import', {
    key,
    account,
  });
  return res.data.accounts;
}

async function addNote (account, note) {
  const res = await instance.post('/notes', {
    account,
    note,
  });
  return res.data.notes;
}

async function addTransferNote (account, note) {
  const res = await instance.post('/notes/transfer', {
    account,
    note,
  });
  return res.data.notes;
}

async function addOrderHistory (account, history) {
  const res = await instance.post(`/orders/history/${account}`, {
    history,
  });
  return res.data.history;
}

async function addOrder (order) {
  const res = await instance.post('/orders', {
    order,
  });
  return res.data.orders;
}

async function setViewingKey (key, vk) {
  return instance.post('/vk', {
    key,
    vk,
  });
}

function createAccount (passphrase) {
  return instance.post('/accounts', {
    passphrase,
  });
}

function unlockAccount (passphrase, keystore) {
  return instance.post('/accounts/unlock', {
    passphrase,
    keystore,
  });
}

function generateProof (params) {
  return instance.post('/circuits', params);
}

// put
async function updateNoteState (noteOwner, noteHash, noteState) {
  const res = await instance.put('/notes', {
    noteOwner,
    noteHash,
    noteState,
  });
  return res.data.notes;
}

async function updateOrderHistory (account, order) {
  const res = await instance.put(`/orders/${account}`, {
    order,
  });
  return res.data.history;
}

async function updateOrderHistoryState (account, orderId, orderState) {
  const res = await instance.put(`/orders/state/${account}`, {
    orderId,
    orderState,
  });
  return res.data.history;
}

async function updateOrderState (orderId, orderState) {
  const res = await instance.put('/orders', {
    orderId,
    orderState,
  });
  return res.data.orders;
}

async function updateOrderTaker (orderId, orderTaker) {
  const res = await instance.put('/orders/taker', {
    orderId,
    orderTaker,
  });
  return res.data.orders;
}

async function deleteAccount (key, address) {
  const res = await instance.delete('/accounts', {
    data: {
      key,
      address,
    },
  });
  return res.data.accounts;
}

export {
  getViewingKey,
  getAccounts,
  getNoteByNoteHash,
  getNotes,
  getTransferNotes,
  getOrder,
  getOrderHistory,
  getOrders,
  addAccount,
  unlockAccount,
  addNote,
  addTransferNote,
  addOrderHistory,
  addOrder,
  setViewingKey,
  createAccount,
  generateProof,
  updateNoteState,
  updateOrderHistory,
  updateOrderHistoryState,
  updateOrderState,
  updateOrderTaker,
  deleteAccount,
};
