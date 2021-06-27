const faker = require("faker");

// Setup
const log = jest.fn();
describe("Product", () => {
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
    const sendMail = jest.fn().mockImplementation(async () => undefined);
    const mockTransporter = {
      sendMail,
    };
    const createTransport = jest.fn().mockImplementation((options) => {
      expect(options.service).toEqual(process.env.EMAIL_SERVICE);
      expect(options.auth.user).toEqual(process.env.EMAIL_USER);
      expect(options.auth.pass).toEqual(process.env.EMAIL_PASSWORD);
      return mockTransporter;
    });
    jest.doMock("nodemailer", () => ({
      createTransport,
    }));
    const handler = require("pages/api/contact");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        email: faker.internet.email(),
        name: faker.name.findName(),
        message: faker.commerce.productDescription(),
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(2);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Invalid email (string), invalid email, logged once + client error response", async () => {
    // Arrange
    const sendMail = jest.fn().mockImplementation(async () => undefined);
    const mockTransporter = {
      sendMail,
    };
    const createTransport = jest.fn().mockImplementation((options) => {
      expect(options.service).toEqual(process.env.EMAIL_SERVICE);
      expect(options.auth.user).toEqual(process.env.EMAIL_USER);
      expect(options.auth.pass).toEqual(process.env.EMAIL_PASSWORD);
      return mockTransporter;
    });
    jest.doMock("nodemailer", () => ({
      createTransport,
    }));
    const handler = require("pages/api/contact");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        email: faker.random.words(),
        name: faker.name.findName(),
        message: faker.commerce.productDescription(),
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid name type (number), invalid name, logged once + client error response", async () => {
    // Arrange
    const sendMail = jest.fn().mockImplementation(async () => undefined);
    const mockTransporter = {
      sendMail,
    };
    const createTransport = jest.fn().mockImplementation((options) => {
      expect(options.service).toEqual(process.env.EMAIL_SERVICE);
      expect(options.auth.user).toEqual(process.env.EMAIL_USER);
      expect(options.auth.pass).toEqual(process.env.EMAIL_PASSWORD);
      return mockTransporter;
    });
    jest.doMock("nodemailer", () => ({
      createTransport,
    }));
    const handler = require("pages/api/contact");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        email: faker.internet.email(),
        name: faker.datatype.number(),
        message: faker.commerce.productDescription(),
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid message type (number), invalid message, logged once + client error response", async () => {
    // Arrange
    const sendMail = jest.fn().mockImplementation(async () => undefined);
    const mockTransporter = {
      sendMail,
    };
    const createTransport = jest.fn().mockImplementation((options) => {
      expect(options.service).toEqual(process.env.EMAIL_SERVICE);
      expect(options.auth.user).toEqual(process.env.EMAIL_USER);
      expect(options.auth.pass).toEqual(process.env.EMAIL_PASSWORD);
      return mockTransporter;
    });
    jest.doMock("nodemailer", () => ({
      createTransport,
    }));
    const handler = require("pages/api/contact");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        email: faker.internet.email(),
        name: faker.name.findName(),
        message: faker.datatype.number(),
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid method, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const sendMail = jest.fn().mockImplementation(async () => undefined);
    const mockTransporter = {
      sendMail,
    };
    const createTransport = jest.fn().mockImplementation((options) => {
      expect(options.service).toEqual(process.env.EMAIL_SERVICE);
      expect(options.auth.user).toEqual(process.env.EMAIL_USER);
      expect(options.auth.pass).toEqual(process.env.EMAIL_PASSWORD);
      return mockTransporter;
    });
    jest.doMock("nodemailer", () => ({
      createTransport,
    }));
    const handler = require("pages/api/contact");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      query: {
        email: faker.internet.email(),
        name: faker.datatype.number(),
        message: faker.commerce.productDescription(),
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("XSS attack (in message), valid inputs, valid response with no XSS attack", async () => {
    // Arrange
    const sendMail = jest.fn().mockImplementation(async (options) => {
      // Throw error if XSS attack is detected
      const optionsStr = JSON.stringify(options);
      expect(optionsStr).not.toMatch(/<(\/?)script(\/?)>/g);
    });
    const mockTransporter = {
      sendMail,
    };
    const createTransport = jest.fn().mockImplementation((options) => {
      expect(options.service).toEqual(process.env.EMAIL_SERVICE);
      expect(options.auth.user).toEqual(process.env.EMAIL_USER);
      expect(options.auth.pass).toEqual(process.env.EMAIL_PASSWORD);
      return mockTransporter;
    });
    jest.doMock("nodemailer", () => ({
      createTransport,
    }));
    const handler = require("pages/api/contact");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        email: faker.internet.email(),
        name: `<script>window.onload = function() {var link=document.getElementsByTagName("a");link[0].href="${faker.internet.url()}";}</script>`,
        message: `<script src=”${faker.internet.url()}”/>`,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1); // log XSS attempt
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(2);
    expect(mockRes.statusCode).toBe(204);
  });
});
