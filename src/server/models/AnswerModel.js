const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    value: { type: String, required: true, maxLength: 255 },
});

// Virtual for player's URL
AnswerSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/answer/${this._id}`;
});

// Export model
module.exports = mongoose.model("Answer", AnswerSchema);
