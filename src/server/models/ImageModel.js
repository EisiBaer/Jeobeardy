const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  categoryIndex: { type: Number, required: true },
  boardEntryIndex: { type: Number, required: true },
  questionIndex: { type: Number, required: true },
  filename: { type: String, required: true, },
});

// Export model
module.exports = mongoose.model("Image", ImageSchema);
