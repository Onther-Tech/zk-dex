pragma solidity ^0.5.0;

import "./ZkDai.sol";


contract Market is ZkDai {

  enum OrderState {Created, Taken, Settled}

  struct Order {
    bytes32 makerViewingKey;
    bytes32 makerNote;
    bytes32 sourceToken;
    bytes32 targetToken;
    uint price;
    bytes32 takerNoteToMaker;
    bytes32 parentNote;

    OrderState state;
  }

  mapping(bytes32 => Order) public orders;

  event OrderCreated(bytes32 orderHash, bytes32 indexed sourceToken, bytes32 indexed  targetToken, uint price);
<<<<<<< HEAD
=======
  event OrderTaken(bytes32 orderHash, bytes32 takerNoteToMaker, bytes32 parentNote);
  event OrderSettled(bytes32 orderHash, bytes32 takerNoteToMaker, bytes32 parentNote);
>>>>>>> contracts: add settleOrder

  function makeOrder(
    bytes32 makerViewingKey,
    bytes32 makerNote,
    bytes32 sourceToken,
    bytes32 targetToken,
    uint price
  ) external {
    // TODO: verify circuit:makeOrder

    require(sourceToken != targetToken, "Market: cannot make an order with same token pair");
    require(notes[makerNote] == State.Committed, "Market: maker note is not available");

    // TODO: instnatiate with zk-SNARK proofs
    Order memory order = Order({
      makerViewingKey: makerViewingKey,
      makerNote: makerNote,
      sourceToken: sourceToken,
      price: price,
      state: OrderState.Created
    });

    bytes32 orderHash = hashOrder(order);

    orders[orderHash] = order;
    notes[makerNote] = State.Traiding;

    emit NoteStateChange(makerNote, State.Traiding);
    emit OrderCreated(orderHash, sourceToken, targetToken);
  }

  function takeOrder(
    bytes32 orderHash,
    bytes32 takerNoteToMaker,
    bytes32 parentNote
  ) external {
    // TODO: verify circuit:takerOrder

    Order storage order = orders[orderHash];

    require(order.state == OrderState.Created);
    require(notes[parentNote] == State.Committed, "Market: taker note is not available");
    require(notes[takerNoteToMaker] == State.Invalid, "Market: taker send invalid note to maker");

    notes[parentNote] = State.Traiding;
    notes[takerNoteToMaker] = State.Traiding;

    order.takerNoteToMaker = takerNoteToMaker;
    order.parentNote = parentNote;
    order.state = OrderState.Taken;

    emit NoteStateChange(notes[parentNote], State.Traiding);
    emit NoteStateChange(notes[takerNoteToMaker], State.Traiding);
    emit OrderTaken(orderHash, tarketNoteToMaker, parentNote);
  }
<<<<<<< HEAD

  function settleOrder() external {
=======
>>>>>>> contracts: add settleOrder

  function settleOrder(
    bytes32 orderHash,
    bytes32 takerNoteToMaker,
    bytes32 parentNote
  ) external {
    // TODO: verify circuit:settleOrder

    Order storage order = orders[orderHash];

    require(order.state == OrderState.Taken);
    require(notes[parentNote] == State.Spent, "Market: parent note is already spent");
    require(notes[takerNoteToMaker] == State.Committed, "Market: taker note is not available");

    notes[takerNoteToMaker] = State.Spent;

    emit OrderTaken(orderHash, tarketNoteToMaker, parentNote);
  }

  function hashOrder(Order storage order) internal view returns (bytes32) {
    return keccak256(abi.encode(
      order.makerViewingKey,
      order.makerNote,
      order.sourceToken,
      order.targetToken,
      order.price
    ));
  }
}

