/**
 * Products Unit Tests
 *
 * @group unit
 * @group website
 * @group products
 */

const faker = require("faker");

const log = jest.fn();
describe("Products", () => {
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

  it("Business does not exist, invalid id, logged once + client error response", async () => {
    // Arrange
    const id = faker.datatype.number();
    const resData = {
      rowCount: 0,
      rows: [],
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${id}`);
      return resData;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/products");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id: `${id}`,
      },
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
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Database error (getting business), valid inputs, logged once + server error response", async () => {
    // Arrange
    const id = faker.datatype.number();
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${id}`);
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/products");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id: `${id}`,
      },
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
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (getting products), valid inputs, logged once + server error response", async () => {
    // Arrange
    const id = faker.datatype.number();
    const resData = {
      rowCount: 1,
      rows: [
        {
          id,
        },
      ],
    };
    const select = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("businesses");
        expect(params.conditions).toEqual(`id=${id}`);
        return resData;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("products");
        expect(params.conditions).toEqual(`business_id=${id}`);
        return null;
      });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/products");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id: `${id}`,
      },
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
    expect(select).toHaveBeenCalledTimes(2);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const id = faker.datatype.number();
    const numRows = faker.datatype.number({ min: 1, max: 5 });
    const businessesResData = {
      rowCount: 1,
      rows: [
        {
          id,
        },
      ],
    };
    const productsResData = {
      rowCount: numRows,
      rows: Array.from({ length: numRows }, () => ({
        object_id: `${id}_${faker.datatype.number()}`,
        name: faker.commerce.productName(),
        preview: faker.image.imageUrl(
          faker.datatype.number(),
          faker.datatype.number(),
          faker.commerce.department(),
          true
        ),
      })),
    };

    const select = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("businesses");
        expect(params.conditions).toEqual(`id=${id}`);
        return businessesResData;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("products");
        expect(params.conditions).toEqual(`business_id=${id}`);
        expect(
          params.values.includes("CONCAT(business_id, '_', id) AS object_id")
        ).toEqual(true);
        return productsResData;
      });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/products");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id: `${id}`,
      },
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
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
    expect(select).toHaveBeenCalledTimes(2);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({
      products: productsResData.rows.map(({ object_id, name, preview }) => ({
        objectId: object_id,
        name,
        preview,
      })),
    });
  });

  it("Invalid method, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const select = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/products");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: `${faker.datatype.number()}`,
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

  it("Invalid id type (number), invalid id, logged once + client error response", async () => {
    // Arrange
    const select = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/products");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id: faker.datatype.number(),
      },
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid id type (string), invalid id, logged once + client error response", async () => {
    // Arrange
    const select = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/products");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id: faker.random.word(),
      },
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });
});
