pragma solidity ^0.4.25;

import {Verifier as SpendNoteVerifier} from "./verifiers/SpendNoteVerifier.sol";
import "./ZkDaiBase.sol";


contract SpendNotes is SpendNoteVerifier, ZkDaiBase {
  uint8 internal constant NUM_PUBLIC_INPUTS = 9;

  bytes32 public constant EMPTY_NOTE_HASH = 0xbecedd494a23f6178d5b0fbd7aa6698b218367c9810c013e41649ad9d375a63a;

  /**
  * @dev Hashes the submitted proof and adds it to the submissions mapping that tracks
  *      submission time, type, public inputs of the zkSnark and the submitter
  *      public input
  *       - [0, 1]  = old note hash
  *       - [2, 3]  = new note 1 hash
  *       - [4, 5]  = new note 2 hash
  *       - [6, 7]  = original note hash (in case of smart note)
  *       - [8]     = output
*/
  function submit(
    uint256[2] a,
    uint256[2] a_p,
    uint256[2][2] b,
    uint256[2] b_p,
    uint256[2] c,
    uint256[2] c_p,
    uint256[2] h,
    uint256[2] k,
    uint256[9] input,
    bytes memory encryptedNote1,
    bytes memory encryptedNote2
  )
    internal
  {
    require(development || spendVerifyTx(a, a_p, b, b_p, c, c_p, h, k, input), "Failed to verify circuit");
    bytes32[4] memory _notes = get4Notes(input);

    // check that the first note (among public params) is valid and
    // new notes should not be existing at this point
    require(notes[_notes[0]] == State.Valid, "Note is either invalid or already spent");
    require(notes[_notes[1]] == State.Invalid, "output note1 is already minted");
    require(notes[_notes[2]] == State.Invalid, "output note2 is already minted");
    require(_notes[3] == EMPTY_NOTE_HASH || notes[_notes[3]] != State.Invalid, "original is already minted");

    notes[_notes[0]] = State.Spent;
    notes[_notes[1]] = State.Valid;
    notes[_notes[2]] = State.Valid;

    encryptedNotes[_notes[1]] = encryptedNote1;
    encryptedNotes[_notes[2]] = encryptedNote2;

    emit NoteStateChange(_notes[0], State.Spent);
    emit NoteStateChange(_notes[1], State.Valid);
    emit NoteStateChange(_notes[2], State.Valid);
  }

  function get4Notes(uint256[9] input)
    internal
    pure
    returns(bytes32[4] notes)
  {
    notes[0] = calcHash(input[0], input[1]);
    notes[1] = calcHash(input[2], input[3]);
    notes[2] = calcHash(input[4], input[5]);
    notes[3] = calcHash(input[6], input[7]);
  }

  function isEmptyHash(bytes32 note) internal pure returns (bool) {
    return true;
  }
}