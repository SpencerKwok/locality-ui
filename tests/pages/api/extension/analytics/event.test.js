/**
 * Analytic Event Capture Unit Tests
 *
 * @group unit
 * @group extension
 * @group analytics
 * @group analytics-events
 */

const faker = require("faker");
const xss = require("xss");

const log = jest.fn();
describe("Analytics Event", () => {
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

  it("Failed to send event, valid inputs, logged once + valid response", async () => {
    // Arrange
    const name = faker.random.words();
    const params = {
      param1: faker.random.words(),
      param2: faker.datatype.number(),
      param3: faker.datatype.boolean(),
    };
    const sendEvent = jest.fn().mockImplementation(async (n, p) => {
      expect(n).toEqual(name);
      expect(p).toEqual(params);
      return new Error("Failed to send event");
    });
    jest.doMock("lib/api/googleanalytics", () => ({
      sendEvent,
    }));
    const handler = require("pages/api/extension/analytics/event");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        name,
        ...params,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const name = faker.random.words();
    const params = {
      param1: faker.random.words(),
      param2: faker.datatype.number(),
      param3: faker.datatype.boolean(),
    };
    const sendEvent = jest.fn().mockImplementation(async (n, p) => {
      expect(n).toEqual(name);
      expect(p).toEqual(params);
      return null;
    });
    jest.doMock("lib/api/googleanalytics", () => ({
      sendEvent,
    }));
    const handler = require("pages/api/extension/analytics/event");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        name,
        ...params,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Invalid method, valid inputs, logged once + client error response", async () => {
    // Arrange
    const name = faker.random.words();
    const params = {
      param1: faker.random.words(),
      param2: faker.datatype.number(),
      param3: faker.datatype.boolean(),
    };
    const sendEvent = jest.fn();
    jest.doMock("lib/api/googleanalytics", () => ({
      sendEvent,
    }));
    const handler = require("pages/api/extension/analytics/event");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      query: {
        name,
        ...params,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing name, invalid inputs, logged once + valid response", async () => {
    // Arrange
    const params = {
      param1: faker.random.words(),
      param2: faker.datatype.number(),
      param3: faker.datatype.boolean(),
    };
    const sendEvent = jest.fn();
    jest.doMock("lib/api/googleanalytics", () => ({
      sendEvent,
    }));
    const handler = require("pages/api/extension/analytics/event");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: params,
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(204);
  });

  it("XSS attack (using params), valid inputs, valid response", async () => {
    // Arrange
    const name = faker.random.words();
    const params = {
      param1: `<script>window.onload = function() {var link=document.getElementsByTagName("a");link[0].href="${faker.internet.url()}";}</script>`,
      param2: `<script src=”${faker.internet.url()}”/>`,
    };
    const sendEvent = jest.fn().mockImplementation(async (n, p) => {
      expect(n).toEqual(name);
      expect(p).toEqual({
        param1: xss(params.param1),
        param2: xss(params.param2),
      });
      return null;
    });
    jest.doMock("lib/api/googleanalytics", () => ({
      sendEvent,
    }));
    const handler = require("pages/api/extension/analytics/event");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        name,
        ...params,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });
});
