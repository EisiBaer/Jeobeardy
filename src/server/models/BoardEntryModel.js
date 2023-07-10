const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BoardEntrySchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    orderValue: { type: Number },
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
    entryType: { type: String, required: true, enum: ["SimpleQuestion", "PictureQuestion", "MultipleChoice"] },
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    answerId: { type: Schema.Types.ObjectId, ref: "Answer", required: true },
});

// Virtual for player's URL
BoardEntrySchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/board/entry/${this._id}`;
});

// Export model
module.exports = mongoose.model("BoardEntry", BoardEntrySchema);
