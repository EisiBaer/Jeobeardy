const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GameSchema = new Schema({
  code: { type: String, required: true },
  host: { type: Schema.Types.ObjectId, ref: "User", required: true },
  board: { type: Schema.Types.ObjectId, ref: "Board", required: false },
  players: { type: [Schema.Types.ObjectId], ref: "Player", required: true },
  acceptAnswers: { type: Boolean, required: true, default: false },
  answeredBoardEntries: { type: [Object], default: [] },
  state: { type: String, required: true, default: "CREATED" },
  createdTimestamp: { type: Date, required: true, default: new Date() },
});

// Virtual for player's URL
GameSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/game/${this._id}`;
});

// Export model
module.exports = mongoose.model("Game", GameSchema);
