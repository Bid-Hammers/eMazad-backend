`use strict`;

const { itemModel, userModel, bidModel, commentModel, replyModel, favoriteModel } = require("../models/index");

const console = require("console");

const excludedAttributes = ["password", "email", "role", "createdAt", "updatedAt", "token"];

const itemIncludes = [
  { model: userModel, attributes: { exclude: excludedAttributes } },
  { model: bidModel, include: [{ model: userModel, attributes: { exclude: excludedAttributes } }] },
  {
    model: commentModel,
    include: [
      { model: userModel, attributes: { exclude: excludedAttributes } },
      { model: replyModel, include: [{ model: userModel, attributes: { exclude: excludedAttributes } }] },
    ],
  },
  { model: favoriteModel, include: [{ model: userModel, attributes: { exclude: excludedAttributes } }] },
];

const itemsIncludes = [
  { model: userModel, attributes: { exclude: excludedAttributes } },
  { model: bidModel, include: [{ model: userModel, attributes: { exclude: excludedAttributes } }] },
  { model: favoriteModel, include: [{ model: userModel, attributes: { exclude: excludedAttributes } }] },
];

const getItems = async (req, res) => {
  try {
    let status = req.params.status;
    let category = req.params.category;
    let subCategory = req.params.subCategory;
    let { page, limit } = req.query;

    let handelWhere = {};
    if (status && !category && !subCategory) {
      status === "all" ? null : (handelWhere = { status: status });
    }
    if (status && category && !subCategory) {
      status === "all"
        ? (handelWhere = { category: category })
        : (handelWhere = { status: status, category: category });
    }
    if (status && category && subCategory) {
      status === "all"
        ? (handelWhere = { category: category, subCategory: subCategory })
        : (handelWhere = { status: status, category: category, subCategory: subCategory });
    }

    const items = await itemModel.findAll({
      where: handelWhere,
      include: itemsIncludes,
      limit: limit,
      offset: page * limit,
      order: [
        status === "standby" ? ["startDate", "ASC"] : status === "active" ? ["endDate", "ASC"] : ["endDate", "DESC"],
        [bidModel, "createdAt", "DESC"],
      ],
    });

    const count = await itemModel.count({ where: handelWhere });

    res.status(200).json({ items, count });
  } catch (err) {
    console.log("Error in GeneralRoutes.readItems: ", err.message);
  }
};

const getOneItem = async (req, res) => {
  try {
    const id = req.params.id;

    const item = await itemModel.findOne({
      where: { id: id },
      include: itemIncludes,
      order: [
        [bidModel, "createdAt", "DESC"],
        [commentModel, "createdAt", "DESC"],
        [commentModel, replyModel, "createdAt", "ASC"],
      ],
    });
    res.status(200).json(item);
  } catch (err) {
    console.log("Error in GeneralRoutes.readOneItem: ", err.message);
  }
};

const addItem = async (req, res) => {
  try {
    const item = await itemModel.create(req.body);
    const output = await itemModel.findOne({
      where: { id: item.id },
      include: itemIncludes,
    });
    res.status(201).json(output);
  } catch (err) {
    console.log("Error in GeneralRoutes.addItem: ", err.message);
  }
};

// update item by id
const updateItem = async (req, res) => {
  try {
    const id = req.params.id;
    const obj = req.body;
    await itemModel.update(obj, { where: { id: id } });
    const output = await itemModel.findOne({
      where: { id: id },
      include: itemIncludes,
    });
    res.status(202).json(output);
  } catch (err) {
    console.log("Error in GeneralRoutes.updateItem: ", err.message);
  }
};

// get trending items
const getTrendingItems = async (req, res) => {
  try {
    const items = await itemModel.findAll({
      where: { status: "active" },
      include: itemsIncludes,
    });
    const sortedItems = items.sort((a, b) => a.endDate - b.endDate);
    res.status(200).json(sortedItems);
  } catch (err) {
    console.log("Error in GeneralRoutes.getTrendingItems: ", err.message);
  }
};

module.exports = { getItems, getOneItem, addItem, updateItem, getTrendingItems };
