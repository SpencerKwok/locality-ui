/**
 * Update Departments Unit Tests
 *
 * @group unit
 * @group website
 * @group dashboard
 * @group departments
 * @group departments-update
 */

const faker = require("faker");
const xss = require("xss");

const userId = faker.datatype.number();
const log = jest.fn();
const runMiddlewareBusiness = jest.fn().mockImplementation(async (req) => {
  req.locals = { user: { id: userId } };
});
describe("Update departments", () => {
  beforeAll(() => {
    jest.doMock("lib/api/sumologic", () => ({
      log,
    }));
    jest.doMock("lib/api/middleware", () => ({
      runMiddlewareBusiness,
    }));
  });

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Database error, valid inputs, logged once + server error response", async () => {
    // Arrange
    const departments = Array.from(
      {
        length: faker.datatype.number({ min: 1, max: 5 }),
      },
      () => faker.commerce.department()
    );
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      expect(params.values).toContainEqual({
        key: "departments",
        value: JSON.stringify(departments),
      });
      return new Error("Uh oh...");
    });
    jest.doMock("lib/api/postgresql", () => ({
      update,
    }));
    const handler = require("pages/api/dashboard/departments/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        departments,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const departments = Array.from(
      {
        length: faker.datatype.number({ min: 1, max: 5 }),
      },
      () => faker.commerce.department()
    );
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      expect(params.values).toContainEqual({
        key: "departments",
        value: JSON.stringify(departments),
      });
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      update,
    }));
    const handler = require("pages/api/dashboard/departments/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        departments,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Ignore request id from non-admins, invalid inputs, valid response", async () => {
    // Arrange
    const departments = Array.from(
      {
        length: faker.datatype.number({ min: 1, max: 5 }),
      },
      () => faker.commerce.department()
    );
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      expect(params.values).toContainEqual({
        key: "departments",
        value: JSON.stringify(departments),
      });
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      update,
    }));
    const handler = require("pages/api/dashboard/departments/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: faker.datatype.number(),
        departments,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Invalid id type (string), invalid inputs, valid response with session id", async () => {
    // Arrange
    const departments = Array.from(
      {
        length: faker.datatype.number({ min: 1, max: 5 }),
      },
      () => faker.commerce.department()
    );
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      expect(params.values).toContainEqual({
        key: "departments",
        value: JSON.stringify(departments),
      });
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      update,
    }));
    const handler = require("pages/api/dashboard/departments/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: faker.random.word(),
        departments,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Invalid departments type (string), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const departments = faker.commerce.department();
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      update,
    }));
    const handler = require("pages/api/dashboard/departments/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        departments,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid method, valid inputs, logged once + client error response", async () => {
    // Arrange
    const departments = Array.from(
      {
        length: faker.datatype.number({ min: 1, max: 5 }),
      },
      () => faker.commerce.department()
    );
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      update,
    }));
    const handler = require("pages/api/dashboard/departments/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      query: {
        id: userId,
        departments,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(400);
  });

  it("XSS attack, valid inputs, valid response", async () => {
    // Arrange
    const departments = Array.from(
      {
        length: faker.datatype.number({ min: 1, max: 5 }),
      },
      () => `<script src=”${faker.internet.url()}”/>`
    );
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      expect(params.values).toContainEqual({
        key: "departments",
        value: JSON.stringify(departments.map((x) => xss(x))),
      });
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      update,
    }));
    const handler = require("pages/api/dashboard/departments/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        departments,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(204);
  });
});
