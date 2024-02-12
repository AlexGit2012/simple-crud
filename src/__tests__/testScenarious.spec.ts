import { server as myServer } from "../../index";
import request from "supertest";

describe("Scenario 1: check /api/users get and post methods", () => {
  afterAll(() => {
    myServer.close();
  });

  test("responds to /api/users with status code 200", async () => {
    const response = await request(myServer).get("/api/users");
    expect(response.statusCode).toEqual(200);
  });

  test("responds to /api/users with empty array", async () => {
    const response = await request(myServer).get("/api/users");
    expect(response.text).toEqual("[]");
  });

  test("responds to /api/users and create a new user", async () => {
    const response = await request(myServer)
      .post("/api/users")
      .send({ username: "Alexey", age: 25, hobbies: [] });
    const result = JSON.parse(response.text);
    delete result.id;
    expect(result).toEqual({ age: 25, hobbies: [], username: "Alexey" });
  });

  test("responds to /api/users and error status code when create a new user without required fields", async () => {
    const response = await request(myServer)
      .post("/api/users")
      .send({ username: "", age: 25, hobbies: [] });
    const result = JSON.parse(response.text);
    expect(result).toEqual({ message: "Please check all required fields" });
  });

  test("responds to /api/users and throw an error when create a new user without required fields", async () => {
    const response = await request(myServer)
      .post("/api/users")
      .send({ username: "", age: 25, hobbies: [] });
    expect(response.statusCode).toEqual(400);
  });
});

describe("Scenario 2: create/update/delete user flow", () => {
  afterEach(async () => {
    await myServer.close();
  });

  test("create new user", async () => {
    const response = await request(myServer)
      .post("/api/users")
      .send({ username: "Alexey", age: 25, hobbies: [] });
    const result = JSON.parse(response.text);
    delete result.id;
    expect(result).toEqual({ age: 25, hobbies: [], username: "Alexey" });
  });

  test("create and update new user", async () => {
    const responsePost = await request(myServer)
      .post("/api/users")
      .send({ username: "Alexey", age: 25, hobbies: [] });
    const id = JSON.parse(responsePost.text).id;
    const responsePut = await request(myServer)
      .put("/api/users/")
      .send({ id: id, username: "Anton", age: 30, hobbies: ["Dancing"] });
    const result = JSON.parse(responsePut.text);
    expect(result).toEqual({
      id: id,
      username: "Anton",
      age: 30,
      hobbies: ["Dancing"],
    });
  });

  test("create and delete new user", async () => {
    const responsePost = await request(myServer)
      .post("/api/users")
      .send({ username: "Alexey", age: 25, hobbies: [] });
    const id = JSON.parse(responsePost.text).id;
    const responseDelete = await request(myServer)
      .delete("/api/users/")
      .query({ id: id });
    expect(responseDelete.statusCode).toEqual(204);
  });

  test("create, update and delete new user", async () => {
    const responsePost = await request(myServer)
      .post("/api/users")
      .send({ username: "Alexey", age: 25, hobbies: [] });
    const id = JSON.parse(responsePost.text).id;
    const responsePut = await request(myServer)
      .put("/api/users/")
      .send({ id: id, username: "Anton", age: 30, hobbies: ["Dancing"] });
    const idForDelete = JSON.parse(responsePut.text).id;
    const responseDelete = await request(myServer)
      .delete("/api/users/")
      .query({ id: idForDelete });
    expect(responseDelete.statusCode).toEqual(204);
  });
});

describe("Scenario 3: test standard scenario in task description", () => {
  beforeAll(() => {
    myServer.close();
  });

  afterAll(() => {
    myServer.close();
  });

  test("flow from task", async () => {
    const responseDeleteAll = await request(myServer).delete("/api/users");
    expect(responseDeleteAll.statusCode).toEqual(204);

    const responseGet = await request(myServer).get("/api/users");
    expect(responseGet.text).toEqual("[]");

    const responsePost = await request(myServer)
      .post("/api/users")
      .send({ username: "Alexey", age: 25, hobbies: [] });
    const result = JSON.parse(responsePost.text);
    const userID = result.id;
    delete result.id;
    expect(result).toEqual({ age: 25, hobbies: [], username: "Alexey" });

    const responseGetUser = await request(myServer)
      .get("/api/users/")
      .query({ id: userID });
    expect(JSON.parse(responseGetUser.text)).toEqual({
      id: userID,
      age: 25,
      hobbies: [],
      username: "Alexey",
    });

    const responsePut = await request(myServer)
      .put("/api/users/")
      .send({ id: userID, username: "Anton", age: 30, hobbies: ["Dancing"] });
    const resultAfterPut = JSON.parse(responsePut.text);
    expect(resultAfterPut).toEqual({
      id: userID,
      username: "Anton",
      age: 30,
      hobbies: ["Dancing"],
    });

    const responseDelete = await request(myServer)
      .delete("/api/users/")
      .query({ id: userID });
    expect(responseDelete.statusCode).toEqual(204);

    const responseGetDeletedUser = await request(myServer)
      .get("/api/users/")
      .query({ id: userID });
    expect(JSON.parse(responseGetDeletedUser.text)).toEqual({
      message: "User with this ID doesn't exist",
    });
  });
});
