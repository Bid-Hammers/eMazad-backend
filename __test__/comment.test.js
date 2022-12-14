"use strict";

const server = require("../server");
const supertest = require("supertest");
const request = supertest(server.app);

describe("Comment Test", () => {
  const users = {};
  const items = {};

  beforeAll(async () => {
    // create a user before all tests and get the token from it
    const user1 = {
      userName: "userComment1",
      fullName: "userComment1",
      email: "userComment1@test.com",
      password: "123",
      phoneNumber: "33333333",
      gender: "male",
      birthDate: "1994-10-26",
      image: "https://clementjames.org/wp-content/uploads/2019/09/avatar-1577909_960_720-1.png",
      status: "active",
      role: "user",
    };

    const user2 = { ...user1, userName: "userComment2", email: "userComment2@test.com", phoneNumber: "44444444" };

    const response = await request.post("/signup").send(user1);
    const response2 = await request.post("/signup").send(user2);
    users.user1 = response.body;
    users.user2 = response2.body;

    const item1 = {
      itemTitle: "item1",
      itemDescription: "item1",
      itemImage: ["https://clementjames.org/wp-content/uploads/2019/09/avatar-1577909_960_720-1.png"],
      category: "clothes",
      userId: users.user1.id,
      latestBid: 5,
      initialPrice: 10,
      startDate: "2021-10-26T00:00:00.000Z",
      endDate: "2025-10-26T00:00:00.000Z",
      status: "active",
      subCategory: "shoes",
      itemCondition: "New",
    };

    const item2 = { ...item1, itemCondition: "Used" };

    const itemOne = await request.post("/item").send(item1);
    const itemTwo = await request.post("/item").send(item2);
    items.item1 = itemOne.body;
    items.item2 = itemTwo.body;
  });

  it("should create a new comment", async () => {
    const comment1 = {
      userId: users.user1.id,
      itemId: items.item1.id,
      comment: "test comment 1",
    };

    const response = await request.post("/comment").send(comment1);
    expect(response.status).toEqual(201);
    expect(response.body.comment).toEqual(comment1.comment);
  });

  it("should get all comments", async () => {
    const response = await request.get("/comment");
    expect(response.status).toEqual(200);
  });

  it("should update a comment", async () => {
    const updateResponse = await request.put(`/comment/1`).send({
      userId: users.user1.id,
      itemId: items.item1.id,
      comment: "updated comment",
    });
    expect(updateResponse.status).toEqual(202);
  });

  it("should delete a comment", async () => {
    const deleteResponse = await request.delete(`/comment/1`);
    expect(deleteResponse.status).toEqual(204);
  });
});
