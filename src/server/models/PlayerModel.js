const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  points: { type: Number },
  acceptAnswers: { type: Boolean, default: false },
});

// Export model
module.exports = mongoose.model("Player", PlayerSchema);
