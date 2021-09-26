/**
 * Get Checkout Tests
 *
 * @group unit
 * @group extension
 * @group checkout
 * @group checkout-get
 */

const faker = require("faker");

const domain = faker.internet.domainName();
const checkoutUrl = faker.internet.url();
const log = jest.fn();
describe("Get Checkout", () => {
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

  it("Database error (getting checkout url), valid inputs, logged once + server error response", async () => {
    // Arrange
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("checkout");
      expect(params.conditions).toEqual(`domain=E'${domain}'`);
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/extension/checkout/get");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      query: {
        domain: domain,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Invalid method, valid inputs, logged once + client error response", async () => {
    // Arrange
    const select = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/extension/checkout/get");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      query: {
        domain: domain,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("checkout");
      expect(params.conditions).toEqual(`domain=E'${domain}'`);
      return {
        rowCount: 1,
        rows: [{ checkout_url: checkoutUrl }],
      };
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/extension/checkout/get");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      query: {
        domain: domain,
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
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({
      checkoutUrl,
    });
  });

  it("No checkout url, valid inputs, logged once + client error response", async () => {
    // Arrange
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("checkout");
      expect(params.conditions).toEqual(`domain=E'${domain}'`);
      return {
        rowCount: 0,
        rows: [],
      };
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/extension/checkout/get");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      query: {
        domain: domain,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(400);
  });
});
