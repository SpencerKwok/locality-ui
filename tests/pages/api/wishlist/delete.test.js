/**
 * Delete from Wishlist Unit Tests
 *
 * @group unit
 * @group website
 * @group wishlist
 * @group wishlist-delete
 */

const faker = require("faker");

const email = faker.internet.email();
const log = jest.fn();
const runMiddlewareUser = jest.fn().mockImplementation(async (req) => {
  req.locals = { user: { email } };
});
describe("Delete from Wishlist", () => {
  beforeAll(() => {
    jest.doMock("lib/api/sumologic", () => ({
      log,
    }));
    jest.doMock("lib/api/middleware", () => ({
      runMiddlewareUser,
    }));
  });

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Database error (getting wishlist), valid inputs, logged once + server error response", async () => {
    // Arrange
    const objectId = `${faker.datatype.number()}_${faker.datatype.number()}_${faker.datatype.number()}`;
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      return null;
    });
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/wishlist/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: objectId,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(runMiddlewareUser).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (updating wishlist), valid inputs, logged once + server error response", async () => {
    // Arrange
    const numObjects = faker.datatype.number({ min: 1, max: 5 });
    const wishlist = Array.from(
      {
        length: numObjects,
      },
      () =>
        `${faker.datatype.number()}_${faker.datatype.number()}_${faker.datatype.number()}`
    );
    const objectId =
      wishlist[faker.datatype.number({ min: 0, max: numObjects - 1 })];
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      return {
        rowCount: 1,
        rows: [{ wishlist: JSON.stringify(wishlist) }],
      };
    });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      expect(params.values[0].key).toEqual("wishlist");
      expect(params.values[0].value).toEqual(
        JSON.stringify(wishlist.filter((x) => x !== objectId))
      );
      return new Error("Yippers, something went wrong");
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/wishlist/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: objectId,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(runMiddlewareUser).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Invalid method, valid inputs, logged once + client error response", async () => {
    // Arrange
    const select = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/wishlist/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      query: {
        id: `${faker.datatype.number()}_${faker.datatype.number()}_${faker.datatype.number()}`,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(runMiddlewareUser).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid object id (number), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const select = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/wishlist/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: faker.datatype.number(),
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(runMiddlewareUser).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid object id (string), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const select = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/wishlist/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: faker.random.words(),
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(runMiddlewareUser).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const numObjects = faker.datatype.number({ min: 1, max: 5 });
    const wishlist = Array.from(
      {
        length: numObjects,
      },
      () =>
        `${faker.datatype.number()}_${faker.datatype.number()}_${faker.datatype.number()}`
    );
    const objectId =
      wishlist[faker.datatype.number({ min: 0, max: numObjects - 1 })];
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      return {
        rowCount: 1,
        rows: [{ wishlist: JSON.stringify(wishlist) }],
      };
    });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      expect(params.values[0].key).toEqual("wishlist");
      expect(params.values[0].value).toEqual(
        JSON.stringify(wishlist.filter((x) => x !== objectId))
      );
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/wishlist/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: objectId,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(runMiddlewareUser).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });
});
