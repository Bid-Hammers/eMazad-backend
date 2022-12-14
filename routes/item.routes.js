"use strict";
const express = require("express");
const router = express.Router();
const { Item, Notification, bidModel } = require("../models/index");
// const uploadItemImg = require("../middlewares/upload-itemImg");

const { getItems, getOneItem, addItem, updateItem, getTrendingItems } = require("../controller/itemController");
const bearerAuth = require("../middlewares/bearer-auth");

// Routes
router.post("/item", bearerAuth, addItem);
router.put("/item/:id", bearerAuth, updateItem);
router.delete("/item/:id", bearerAuth, deleteItem);
router.put("/itemhide/:id", bearerAuth, hideItem);

// get items by category and status
router.get("/items", getItems);
router.get("/items/:status", getItems);
router.get("/items/:status/:category", getItems);
router.get("/items/:status/:category/:subCategory", getItems);
router.get("/item/:id", getOneItem);
router.get("/trending", getTrendingItems);

// function to delete an item by id
async function deleteItem(req, res) {
  const id = req.params.id;
  let deletedItem = await Item.delete(id);
  res.status(204).json({ deletedItem });
}

// function to hide an item
async function hideItem(req, res) {
  const id = req.params.id;
  const item = await Item.hide(id);
  res.status(200).json(item);
}

// Update item status automatically based on the date
setInterval(async () => {
  try {
    const currentDate = new Date();
    const items = await Item.read();

    items.map(async (item) => {
      // change status from standby to active when the start date is reached
      if (item.status === "standby" && item.startDate < currentDate) {
        await Item.update(item.id, { status: "active" });

        await Notification.create({
          userId: item.userId,
          itemId: item.id,
          notiMessage: `Your item ${item.itemTitle} is now active`,
        });
      }

      // change status from active to sold after the end date is reached
      if (item.status === "active" && item.endDate < currentDate) {
        await Item.update(item.id, { status: "sold" });

        if (item.latestBid > 0) {
          const itemBids = await bidModel.findOne({
            where: { itemId: item.id, bidprice: item.latestBid },
          });
          await Notification.create({
            userId: itemBids.userId,
            itemId: item.id,
            notiMessage: `You won the bid for ${item.itemTitle}`,
          });
        }
        await Notification.create({
          userId: item.userId,
          itemId: item.id,
          notiMessage: `The auction for your item ${item.itemTitle} is over`,
        });
      }

      // change status from sold to expired after 30 days from the end date
      if (item.status === "sold" && item.endDate < currentDate - 30 * 24 * 60 * 60 * 1000) {
        await Item.update(item.id, { status: "expired" });
      }
    });
  } catch (err) {
    console.log(err);
  }
}, 10000);

module.exports = router;
