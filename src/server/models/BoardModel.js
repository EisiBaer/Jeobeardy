const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BoardSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, maxLength: 100 },
  categories: { type: [Object], required: false, default: [] },
});

// Virtual for player's URL
BoardSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/board/${this._id}`;
});

BoardSchema.virtual("setFromPostObject").set( function( postObject ){
  this.name = postObject.boardName;
  this.categories = postObject.categories;
})

// Export model
module.exports = mongoose.model("Board", BoardSchema);
