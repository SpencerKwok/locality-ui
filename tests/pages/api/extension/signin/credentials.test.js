const bcrypt = require("bcryptjs");
const faker = require("faker");
const { SALT } = require("lib/env");

const log = jest.fn();
describe("Credentials sign in", () => {
  beforeAll(() => {
    jest.doMock("lib/api/sumologic", () => ({
      log,
    }));
  });

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Database error (getting user), valid inputs, logged once + server error response", async () => {
    // Arrange
    const id = faker.datatype.number();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const compare = jest.fn();
    const deleteFn = jest.fn();
    const insert = jest.fn();
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      delete: deleteFn,
      insert,
      select,
    }));
    jest.doMock("bcryptjs", () => ({ compare }));
    const handler = require("pages/api/extension/signin/credentials");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        email,
        password,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(compare).toHaveBeenCalledTimes(0);
    expect(deleteFn).toHaveBeenCalledTimes(0);
    expect(insert).toHaveBeenCalledTimes(0);
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (delete old token), valid inputs, valid response", async () => {
    // Arrange
    const id = faker.datatype.number();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const passwordHash = await bcrypt.hash(password, parseInt(SALT));
    const existingUserRes = {
      rowCount: 1,
      rows: [
        {
          id,
          email,
          password: passwordHash,
        },
      ],
    };
    const compare = jest.fn().mockImplementation(bcrypt.compare);
    const deleteFn = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("tokens");
      expect(params.conditions).toEqual(`id=${id}`);
      return new Error("Yikes, something went wrong");
    });
    const insert = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("tokens");
      expect(params.values).toContainEqual({
        key: "id",
        value: id,
      });
      expect(params.values.length).toEqual(2);
      let numTokens = 0;
      for (const { key, value } of params.values) {
        if (key === "token") {
          expect(value).toMatch(/[a-zA-Z0-9]+/g);
          numTokens += 1;
        }
      }
      expect(numTokens).toEqual(1);
      return null;
    });
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      return existingUserRes;
    });
    jest.doMock("lib/api/postgresql", () => ({
      delete: deleteFn,
      insert,
      select,
    }));
    jest.doMock("bcryptjs", () => ({ compare }));
    const handler = require("pages/api/extension/signin/credentials");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        email,
        password,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(compare).toHaveBeenCalledTimes(1);
    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledTimes(0);
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (add new token), valid inputs, valid response", async () => {
    // Arrange
    const id = faker.datatype.number();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const passwordHash = await bcrypt.hash(password, parseInt(SALT));
    const existingUserRes = {
      rowCount: 1,
      rows: [
        {
          id,
          email,
          password: passwordHash,
        },
      ],
    };
    const compare = jest.fn().mockImplementation(bcrypt.compare);
    const deleteFn = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("tokens");
      expect(params.conditions).toEqual(`id=${id}`);
      return null;
    });
    const insert = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("tokens");
      expect(params.values).toContainEqual({
        key: "id",
        value: id,
      });
      expect(params.values.length).toEqual(2);
      let numTokens = 0;
      for (const { key, value } of params.values) {
        if (key === "token") {
          expect(value).toMatch(/[a-zA-Z0-9]+/g);
          numTokens += 1;
        }
      }
      expect(numTokens).toEqual(1);
      return new Error("Uh oh, tragedy struck");
    });
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      return existingUserRes;
    });
    jest.doMock("lib/api/postgresql", () => ({
      delete: deleteFn,
      insert,
      select,
    }));
    jest.doMock("bcryptjs", () => ({ compare }));
    const handler = require("pages/api/extension/signin/credentials");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        email,
        password,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(compare).toHaveBeenCalledTimes(1);
    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const id = faker.datatype.number();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const passwordHash = await bcrypt.hash(password, parseInt(SALT));
    const existingUserRes = {
      rowCount: 1,
      rows: [
        {
          id,
          email,
          password: passwordHash,
        },
      ],
    };
    const compare = jest.fn().mockImplementation(bcrypt.compare);
    const deleteFn = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("tokens");
      expect(params.conditions).toEqual(`id=${id}`);
      return null;
    });
    const insert = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("tokens");
      expect(params.values).toContainEqual({
        key: "id",
        value: id,
      });
      expect(params.values.length).toEqual(2);
      let numTokens = 0;
      for (const { key, value } of params.values) {
        if (key === "token") {
          expect(value).toMatch(/[a-zA-Z0-9]+/g);
          numTokens += 1;
        }
      }
      expect(numTokens).toEqual(1);
      return null;
    });
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      return existingUserRes;
    });
    jest.doMock("lib/api/postgresql", () => ({
      delete: deleteFn,
      insert,
      select,
    }));
    jest.doMock("bcryptjs", () => ({ compare }));
    const handler = require("pages/api/extension/signin/credentials");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        email,
        password,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    const actual = await handler
      .default(mockReq, mockRes)
      .then(() => mockRes.json())
      .then((data) => JSON.parse(data._getData()));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(compare).toHaveBeenCalledTimes(1);
    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(Object.keys(actual)).toEqual(["id", "token"]);
    expect(actual.id).toEqual(id);
    expect(actual.token).toMatch(/[a-zA-Z0-9]+/g);
  });

  it("Invalid method, valid inputs, logged once + client error response", async () => {
    // Arrange
    const id = faker.datatype.number();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const passwordHash = await bcrypt.hash(password, parseInt(SALT));
    const existingUserRes = {
      rowCount: 1,
      rows: [
        {
          id,
          email,
          password: passwordHash,
        },
      ],
    };
    const compare = jest.fn();
    const deleteFn = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      delete: deleteFn,
      insert,
      select,
    }));
    jest.doMock("bcryptjs", () => ({ compare }));
    const handler = require("pages/api/extension/signin/credentials");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        email,
        password,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(compare).toHaveBeenCalledTimes(0);
    expect(deleteFn).toHaveBeenCalledTimes(0);
    expect(insert).toHaveBeenCalledTimes(0);
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });
});
