"use strict";

const server = require("../server");
const supertest = require("supertest");
const request = supertest(server.app);
const db = require("../models");
require("dotenv").config();

// test for creating an item
describe("Item Test", () => {
  const users = {};
  const items = {};

  beforeAll(async () => {
    // await db.sequelize.sync({ force: true });

    // create a user before all tests and get the token from it
    const user1 = {
      userName: "userItem1",
      fullName: "userItem1",
      email: "userItem1@test.com",
      password: "123",
      phoneNumber: "5",
      gender: "male",
      birthDate: "1994-10-26",
      image: ["https://clementjames.org/wp-content/uploads/2019/09/avatar-1577909_960_720-1.png"],
      status: "active",
      role: "user",
    };

    const response = await request.post("/signup").send(user1);
    users.user1 = response.body;

    const item1 = {
      itemTitle: "item1",
      itemDescription: "item1",
      itemImage: ["https://clementjames.org/wp-content/uploads/2019/09/avatar-1577909_960_720-1.png"],
      category: "clothes",
      userId: users.user1.id,
      latestBid: 5,
      initialPrice: 10,
      startDate: "2020-09-26T00:00:00.000Z",
      endDate: "2025-10-26T00:00:00.000Z",
      status: "active",
      subCategory: "shoes",
      itemCondition: "New",
    };

    const item2 = { ...item1, itemCondition: "Used" };

    const itemResponse = await request.post("/item").send(item1);
    items.item1 = itemResponse.body;
    items.qais = item1;
    items.saeed = item2;
  });

  it("should create an item", async () => {
    const response = await request.post("/item").send(items.qais);
    // .set('Authorization', `Bearer ${auth.token}`);
    expect(response.status).toEqual(201);
    expect(response.body.itemTitle).toEqual(items.qais.itemTitle);
    expect(response.body.itemDescription).toEqual(items.qais.itemDescription);
    expect(response.body.category).toEqual(items.qais.category);
    expect(response.body.latestBid).toEqual(items.qais.latestBid);
    expect(response.body.initialPrice).toEqual(items.qais.initialPrice);
    expect(response.body.startDate).toEqual(items.qais.startDate);
    expect(response.body.endDate).toEqual(items.qais.endDate);
    expect(response.body.status).toEqual(items.qais.status);
    expect(response.body.subCategory).toEqual(items.qais.subCategory);
    expect(response.body.itemCondition).toEqual(items.qais.itemCondition);
  });

  // create new item item2
  it("should create an item", async () => {
    const response = await request.post("/item").send(items.qais);
    expect(response.status).toEqual(201);
  });

  // test for getting one item by id
  it("should get one item", async () => {
    const response = await request.get(`/item/${items.item1.id}`);
    expect(response.status).toEqual(200);
    expect(response.body.itemTitle).toEqual(items.qais.itemTitle);
    expect(response.body.itemDescription).toEqual(items.qais.itemDescription);
    expect(response.body.category).toEqual(items.qais.category);
    expect(response.body.latestBid).toEqual(items.qais.latestBid);
    expect(response.body.initialPrice).toEqual(items.qais.initialPrice);
    expect(response.body.startDate).toEqual(items.qais.startDate);
    expect(response.body.endDate).toEqual(items.qais.endDate);
    expect(response.body.status).toEqual(items.qais.status);
    expect(response.body.subCategory).toEqual(items.qais.subCategory);
    expect(response.body.itemCondition).toEqual(items.qais.itemCondition);
  });

  // test hiding an item by id
  it("should hide an item", async () => {
    const response = await request.put(`/itemhide/${items.item1.id}`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([1]);
  });

  // check the status of the item after hiding it
  it("should get one item", async () => {
    const response = await request.get(`/item/${items.item1.id}`);
    expect(response.status).toEqual(200);
    expect(response.body.status).toEqual("deleted");
  });

  // test for getting all items
  it("should get all items", async () => {
    const response = await request.get("/items");
    expect(response.status).toEqual(200);
  });

  // test for getting all items by status
  it("should get all items by status", async () => {
    const response = await request.get("/items/active");
    expect(response.status).toEqual(200);
    expect(response.body[0].status).toEqual("active");
  });

  // test for getting all items by status and category
  it("should get all items by status and category", async () => {
    const response = await request.get("/items/active/clothes");
    expect(response.status).toEqual(200);
    expect(response.body[0].status).toEqual("active");
    expect(response.body[0].category).toEqual("clothes");
  });

  // test for getting all items by status and category and subCategory
  it("should get all items by status and category and subCategory", async () => {
    const response = await request.get("/items/active/clothes/shoes");
    expect(response.status).toEqual(200);
    expect(response.body[0].subCategory).toEqual("shoes");
  });

  // test route not found
  it("should give error 404 when trying to reach a wrong route", async () => {
    const response = await request.get("/items/active/clothes/shoes/New");
    expect(response.status).toEqual(404);
  });

  // update item
  it("should update an item", async () => {
    const response = await request.put(`/item/${items.item1.id}`).send(items.saeed);
    expect(response.status).toEqual(202);
    expect(response.body).toEqual([1]);
  });

  // check the updated item
  it("should get one item", async () => {
    const response = await request.get(`/item/${items.item1.id}`);
    expect(response.status).toEqual(200);
    expect(response.body.itemTitle).toEqual(items.saeed.itemTitle);
    expect(response.body.itemDescription).toEqual(items.saeed.itemDescription);
    expect(response.body.category).toEqual(items.saeed.category);
    expect(response.body.latestBid).toEqual(items.saeed.latestBid);
    expect(response.body.initialPrice).toEqual(items.saeed.initialPrice);
    expect(response.body.startDate).toEqual(items.saeed.startDate);
    expect(response.body.endDate).toEqual(items.saeed.endDate);
    expect(response.body.status).toEqual(items.saeed.status);
    expect(response.body.subCategory).toEqual(items.saeed.subCategory);
    expect(response.body.itemCondition).toEqual(items.saeed.itemCondition);
  });

  // test for getting all items by status and category and subCategory and itemCondition
  it("should get all items by status and category and subCategory and itemCondition", async () => {
    const response = await request.get("/items/all");
    expect(response.status).toEqual(200);
  });

  // test for getting all items by status and category and subCategory and itemCondition
  it("should get all items by status and category and subCategory and itemCondition", async () => {
    const response = await request.get("/items/all/clothes");
    expect(response.status).toEqual(200);
  });

  // grt one by id not found
  it("should get one item", async () => {
    const response = await request.get("/item/105");
    expect(response.body).toEqual(null);
  });

  // test deleting an item by id -- CANNOT be done without UPLOADED IMAGES
  it("should delete an item", async () => {
    const response = await request.delete(`/item/${items.item1.id}`);
    expect(response.status).toEqual(204);
    expect(response.body).toEqual({});
  });

  // test deleting an item by id it works 
  it("should delete an item", async () => {
    const response = await request.get(`/item/${items.item1.id}`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(null);
  });

});
