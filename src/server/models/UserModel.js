const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { 
    type: String,
    required: true,
    maxLength: 100,
    unique: true,
   },
  password: { type: String, required: true, },
  boards: [{ type: Schema.Types.ObjectId, ref: "Board" }],
});

// Virtual for player's URL
UserSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/user/${this._id}`;
});

// Export model
module.exports = mongoose.model("User", UserSchema);
