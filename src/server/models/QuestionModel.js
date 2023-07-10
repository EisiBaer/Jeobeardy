const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    value: { type: String, required: true, maxLength: 255 },
});

// Virtual for player's URL
QuestionSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/question/${this._id}`;
});

// Export model
module.exports = mongoose.model("Question", QuestionSchema);
