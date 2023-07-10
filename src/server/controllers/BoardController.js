const GameModel = require("../models/GameModel");
const UserModel = require("../models/UserModel")
const BoardModel = require("../models/BoardModel")

const BoardController = require("./BoardController");

exports.game_list = (req, res) => {
    GameModel.find((err, games) => {
        res.send(JSON.stringify(games));
      });
};

exports.board_read = (req, res) => {
    BoardModel.findOne({name: boardName, ownerId: username})
  res.send(`NOT IMPLEMENTED: User detail: ${req.params.id}`);
};

exports.game_create = (req, res) => {
    let newGame = new GameModel();
    newGame.host = UserModel.findOne({username: req.params.username});
    newGame.boardId = BoardModel.findOne({name: req.params.board}, "");
    newGame.save();
    res.send("{success:true}");
};
