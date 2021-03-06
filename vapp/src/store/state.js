const state = {
  dexContract: null,
  daiContract: null,
  dexContractInstance: null,
  daiContractInstance: null,
  web3: {
    isListening: false,
    web3Instance: null,
    networkId: null,
    account: '',
    balance: null,
    error: null,
  },
  path: '/',
  key: null,
  viewingKey: null,
  accounts: null,
  notes: null,
  transferNotes: null,
  orders: null,
  orderHistory: null,
  daiAmount: '0',
  doYouWantToBuyOrSell: 'buy',
  doYouWantToMakeOrTake: 'make',
};

export default state;
