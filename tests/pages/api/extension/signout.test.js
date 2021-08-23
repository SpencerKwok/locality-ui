/**
 * Signout Unit Tests
 *
 * @group unit
 * @group extension
 * @group signout
 */

const faker = require("faker");

const email = faker.internet.email();
const log = jest.fn();
const runMiddlewareExtension = jest.fn().mockImplementation(async (req) => {
  req.locals = { user: { email: email } };
});
describe("Signout", () => {
  beforeAll(() => {
    jest.doMock("lib/api/sumologic", () => ({
      log,
    }));
    jest.doMock("lib/api/middleware", () => ({
      runMiddlewareExtension,
    }));
  });

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Database error, valid inputs, logged once + valid response", async () => {
    // Arrange
    const deleteFn = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("tokens");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      return new Error("Failed to delete authentication tokens, sad");
    });
    jest.doMock("lib/api/postgresql", () => ({
      delete: deleteFn,
    }));
    const handler = require("pages/api/extension/signout");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const deleteFn = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("tokens");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      delete: deleteFn,
    }));
    const handler = require("pages/api/extension/signout");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Invalid method, valid inputs, logged once + client error response", async () => {
    // Arrange
    const deleteFn = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      delete: deleteFn,
    }));
    const handler = require("pages/api/extension/signout");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(deleteFn).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });
});
