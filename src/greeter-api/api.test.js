
const request = require("supertest");

const app = require("./api");

describe("Test /greet", () => {
  test("Default should return 'Hello World'", async () => {
    const response = await request(app).get("/greet")
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ greeting: 'Hello World' })
  });

  test("Query param 'Adam' should 'Hello Adam'", async () => {
    const response = await request(app).get("/greet?suffix=Adam")
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ greeting: 'Hello Adam' })
  });
});

describe("Test /greet/:suffix", () => {
  test("Path param 'Adam' should return 'Hello Adam'", async () => {
    const response = await request(app).get("/greet/Adam")
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ greeting: 'Hello Adam' })
  });
});
