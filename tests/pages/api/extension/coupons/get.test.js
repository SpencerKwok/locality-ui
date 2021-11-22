/**
 * Get Coupons Tests
 *
 * @group unit
 * @group extension
 * @group coupons
 * @group coupons-get
 */

const faker = require("faker");

const domain = faker.internet.domainName();
const origin = `https://${domain}`;
const log = jest.fn();
describe("Get Coupons", () => {
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

  it("Database error (getting coupons url), valid inputs, logged once + server error response", async () => {
    // Arrange
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("coupons");
      expect(params.conditions).toContain(`domain=E'${domain}'`);
      expect(params.conditions).toContain("expiration > NOW()");
      expect(params.conditions).toContain("AND");
      expect(params.orderBy).toContain('"order" ASC');
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/extension/coupons/get");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        origin,
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
    const handler = require("pages/api/extension/coupons/get");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        origin,
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
    const coupons = [
      {
        coupon: faker.random.word(),
      },
      {
        coupon: faker.random.word(),
      },
    ];
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("coupons");
      expect(params.conditions).toContain(`domain=E'${domain}'`);
      expect(params.conditions).toContain("expiration > NOW()");
      expect(params.conditions).toContain("AND");
      return {
        rowCount: 2,
        rows: coupons,
      };
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/extension/coupons/get");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        origin,
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
      coupons: coupons.map(({ coupon, is_stackable }) => ({
        coupon,
        isStackable: is_stackable,
      })),
    });
  });

  it("No coupons, valid inputs, valid response", async () => {
    // Arrange
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("coupons");
      expect(params.conditions).toContain(`domain=E'${domain}'`);
      expect(params.conditions).toContain("expiration > NOW()");
      expect(params.conditions).toContain("AND");
      return {
        rowCount: 0,
        rows: [],
      };
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/extension/coupons/get");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        origin,
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
      coupons: [],
    });
  });
});
