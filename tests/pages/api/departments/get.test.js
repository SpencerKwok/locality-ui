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
    expect(actual.departments).toBeInstanceOf(Array);
    actual.departments.forEach((value) => {
      expect(typeof value).toEqual("string");
    });
  });

  it("Invalid method, valid inputs, logged once + client error response", async () => {
    // Arrange
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
    expect(mockRes.statusCode).toBe(400);
  });
});
