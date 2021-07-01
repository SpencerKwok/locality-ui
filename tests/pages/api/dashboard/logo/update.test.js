const faker = require("faker");
const xss = require("xss");
const fs = require("fs");

// Get image data for testing
const imageBase64File = fs.readFileSync(
  "tests/pages/api/dashboard/logo/image.b64"
);
const imageBase64 = imageBase64File.toString();
const userId = faker.datatype.number();
const log = jest.fn();
const runMiddlewareBusiness = jest.fn().mockImplementation(async (req) => {
  req.locals = { user: { id: userId } };
});
describe("Update logo", () => {
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

  it("Database error (uploading image), valid inputs, logged once + server error response", async () => {
    // Arrange
    const url = faker.internet.url();
    const logo = imageBase64;

    const upload = jest.fn().mockImplementation(async (params) => {
      expect(params).toEqual(logo);
      return null;
    });
    const update = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      update,
    }));
    const handler = require("pages/api/dashboard/logo/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        logo,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    const actual = await handler
      .default(mockReq, mockRes)
      .then(() => mockRes.json())
      .then((data) => JSON.parse(data._getData()));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (updating url), valid inputs, logged once + server error response", async () => {
    // Arrange
    const url = faker.internet.url();
    const logo = imageBase64;

    const upload = jest.fn().mockImplementation(async (params) => {
      expect(params).toEqual(logo);
      return url;
    });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      expect(params.values).toEqual([{ key: "logo", value: url }]);
      return new Error("Uh oh, something bad occurred");
    });
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      update,
    }));
    const handler = require("pages/api/dashboard/logo/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        logo,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const url = faker.internet.url();
    const logo = imageBase64;

    const upload = jest
      .fn()
      .mockImplementation(async (params, { public_id }) => {
        expect(params).toEqual(logo);
        expect(public_id).toEqual(`logo/${userId}`);
        return url;
      });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      expect(params.values).toEqual([{ key: "logo", value: url }]);
      return null;
    });
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      update,
    }));
    const handler = require("pages/api/dashboard/logo/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        logo,
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
    expect(upload).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({
      logo: url,
    });
  });

  it("Ignore request id from non-admins, invalid inputs, valid response", async () => {
    // Arrange
    const url = faker.internet.url();
    const logo = imageBase64;

    const upload = jest
      .fn()
      .mockImplementation(async (params, { public_id }) => {
        expect(params).toEqual(logo);
        expect(public_id).toEqual(`logo/${userId}`);
        return url;
      });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      expect(params.values).toEqual([{ key: "logo", value: url }]);
      return null;
    });
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      update,
    }));
    const handler = require("pages/api/dashboard/logo/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: faker.datatype.number(),
        logo,
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
    expect(upload).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({
      logo: url,
    });
  });

  it("Invalid logo type (number), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const upload = jest.fn();
    const update = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      update,
    }));
    const handler = require("pages/api/dashboard/logo/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        logo: faker.datatype.number(),
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledTimes(0);
    expect(update).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing logo, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const upload = jest.fn();
    const update = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      update,
    }));
    const handler = require("pages/api/dashboard/logo/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledTimes(0);
    expect(update).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("XSS attack (logo), valid inputs, valid response", async () => {
    // Arrange
    const url = faker.internet.url();
    const logo = `${imageBase64.substr(
      0,
      343
    )}<script src=”${faker.internet.url()}”/>${imageBase64.substr(343)}`;

    const upload = jest
      .fn()
      .mockImplementation(async (params, { public_id }) => {
        expect(params).toEqual(xss(logo));
        expect(public_id).toEqual(`logo/${userId}`);
        return url;
      });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      expect(params.values).toEqual([{ key: "logo", value: url }]);
      return null;
    });
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      update,
    }));
    const handler = require("pages/api/dashboard/logo/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        logo,
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
    expect(upload).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({
      logo: url,
    });
  });
});
