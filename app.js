//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();
const port = 3000;
//const url = 'mongodb://127.0.0.1:27017/toDoListDB';
const url = 'mongodb+srv://julian89net:wuN8i50sc59lXcjH@cluster0.zmamtu8.mongodb.net/toDoListDB';

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model('Item', itemsSchema);
const customItemsSchema = new mongoose.Schema({
  title: String,
  name: String
});
const CustomItem = mongoose.model('CustomItem', customItemsSchema);

main().catch(err => console.log(err));

async function main() {
  try {
      await mongoose.connect(url);
      console.log('connection ok');
  } finally {
      // mongoose.connection.close();
  }
}

async function initOnce() {
  try {
    const item1 = new Item({
      name: "Buy food"
    });
    const item2 = new Item({
      name: "Cook food"
    });
    const item3 = new Item({
      name: "Eat food"
    });
    await Item.insertMany([item1, item2, item3]);
    console.log('done');
  } catch(error) {
    console.log(error);
  } 
}

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/", function(req, res) {
  res.redirect("/list");
});

app.get("/list", function(req, res) {
  const day = date.getDate();
  Item.find().exec().then(function(items) {
    if (items.length == 0) {
      initOnce().then(() =>
        res.redirect('/list')
      ).catch(err => console.log(err));
    } else {
      res.render("list", {listTitle: day, newListItems: items});
    }
  });
});

app.post("/list", function(req, res) {
  if (!Object.keys(req.query).length) {
    const item = req.body.newItem;
    const itemObj = new Item({
      name: item
    });
    Item.insertMany([itemObj]).then(function () {
      res.redirect("/list");
    });
  } else if (req.query.delete) {
    let idObj = { _id: req.body.deleteItem };
    Item.deleteOne(idObj).then(function () {
      res.redirect("/list");
    })
  }
});

app.get("/:title", function(req, res) {
  const title = _.capitalize(req.params.title);
  CustomItem.find({title: title}).exec().then(function(items) {
    res.render("list", {listTitle: title, newListItems: items});
  });
});

app.post("/:title", function(req, res) {
  const title = _.capitalize(req.params.title);
  if (!Object.keys(req.query).length) {
    const item = req.body.newItem;
    const customItemObj = new CustomItem({
      title: title,
      name: item
    });
    CustomItem.insertMany([customItemObj]).then(function () {
      res.redirect("/" + title);
    });
  } else if (req.query.delete) {
    let idObj = { title: title, _id: req.body.deleteItem };
    CustomItem.deleteOne(idObj).then(function () {
      res.redirect("/" + title);
    })
  }
});

app.listen(port, function() {
  console.log(`Server started on port ${port}`);
});
