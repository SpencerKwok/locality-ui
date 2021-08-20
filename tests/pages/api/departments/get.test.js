/**
 * Get Departments Unit Tests
 *
 * @group unit
 * @group website
 * @group departments
 */

const faker = require("faker");

const log = jest.fn();
describe("Get departments", () => {
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

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const departments = Array.from(
      { length: faker.datatype.number({ min: 1, max: 100 }) },
      () => faker.commerce.department()
    );
    const getTaxonomy = jest.fn().mockReturnValue(departments);
    jest.doMock("lib/api/etsy", () => ({
      getTaxonomy,
    }));
    const handler = require("pages/api/departments/get");
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
    const actual = await handler
      .default(mockReq, mockRes)
      .then(() => mockRes.json())
      .then((data) => JSON.parse(data._getData()));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(200);
    expect(Object.keys(actual)).toEqual(["departments"]);
    expect(actual).toEqual({ departments });
  });

  it("Invalid method, valid inputs, logged once + client error response", async () => {
    // Arrange
    const getTaxonomy = jest.fn();
    jest.doMock("lib/api/etsy", () => ({
      getTaxonomy,
    }));
    const handler = require("pages/api/departments/get");
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
    expect(getTaxonomy).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });
});
