/**
 * Business Signup Unit Tests
 *
 * @group unit
 * @group website
 * @group signup
 * @group signup-business
 */

const bcrypt = require("bcryptjs");
const faker = require("faker");
const xss = require("xss");

const log = jest.fn();
describe("Business signup", () => {
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
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email();
    const phoneNumber = faker.phone.phoneNumber();
    const businessName = faker.company.companyName();
    const businessHomepage = faker.internet.url();
    const sendMail = jest
      .fn()
      .mockImplementationOnce(async (options) => {
        const { from, to, html } = options;
        expect(from).toEqual(process.env.EMAIL_USER);
        expect(to).toEqual(process.env.EMAIL_USER);
        expect(html.includes(firstName)).toEqual(true);
        expect(html.includes(lastName)).toEqual(true);
        expect(html.includes(email)).toEqual(true);
        expect(html.includes(phoneNumber)).toEqual(true);
        expect(html.includes(businessName)).toEqual(true);
        expect(html.includes(businessHomepage)).toEqual(true);
      })
      .mockImplementationOnce(async (options) => {
        const { from, to, html } = options;
        expect(from).toEqual(process.env.EMAIL_USER);
        expect(to).toEqual(email);
        expect(html.includes(firstName)).toEqual(true);
        expect(html.includes(lastName)).toEqual(true);
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
    const addSubscriber = jest.fn().mockImplementation(async (user, listId) => {
      expect(user.email).toEqual(email);
      expect(user.firstName).toEqual(firstName);
      expect(user.lastName).toEqual(lastName);
      return null;
    });
    jest.doMock("nodemailer", () => ({
      createTransport,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    const handler = require("pages/api/signup/business");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        firstName,
        lastName,
        email,
        phoneNumber,
        businessName,
        businessHomepage,
        subscribe: true,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(addSubscriber).toHaveBeenCalledTimes(1);
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(2);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Invalid method, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email();
    const phoneNumber = faker.phone.phoneNumber();
    const businessName = faker.company.companyName();
    const businessHomepage = faker.internet.url();
    const sendMail = jest
      .fn()
      .mockImplementationOnce(async (options) => {
        const { from, to, html } = options;
        expect(from).toEqual(process.env.EMAIL_USER);
        expect(to).toEqual(process.env.EMAIL_USER);
        expect(html.includes(firstName)).toEqual(true);
        expect(html.includes(lastName)).toEqual(true);
        expect(html.includes(email)).toEqual(true);
        expect(html.includes(phoneNumber)).toEqual(true);
        expect(html.includes(businessName)).toEqual(true);
        expect(html.includes(businessHomepage)).toEqual(true);
      })
      .mockImplementationOnce(async (options) => {
        const { from, to, html } = options;
        expect(from).toEqual(process.env.EMAIL_USER);
        expect(to).toEqual(email);
        expect(html.includes(firstName)).toEqual(true);
        expect(html.includes(lastName)).toEqual(true);
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
    const addSubscriber = jest.fn().mockImplementation(async (user, listId) => {
      expect(user.email).toEqual(email);
      expect(user.firstName).toEqual(firstName);
      expect(user.lastName).toEqual(lastName);
      return null;
    });
    jest.doMock("nodemailer", () => ({
      createTransport,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    const handler = require("pages/api/signup/business");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        firstName,
        lastName,
        email,
        phoneNumber,
        businessName,
        businessHomepage,
        subscribe: true,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(addSubscriber).toHaveBeenCalledTimes(0);
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Sign up without subscribing, valid inputs, valid response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email();
    const phoneNumber = faker.phone.phoneNumber();
    const businessName = faker.company.companyName();
    const businessHomepage = faker.internet.url();
    const sendMail = jest
      .fn()
      .mockImplementationOnce(async (options) => {
        const { from, to, html } = options;
        expect(from).toEqual(process.env.EMAIL_USER);
        expect(to).toEqual(process.env.EMAIL_USER);
        expect(html.includes(firstName)).toEqual(true);
        expect(html.includes(lastName)).toEqual(true);
        expect(html.includes(email)).toEqual(true);
        expect(html.includes(phoneNumber)).toEqual(true);
        expect(html.includes(businessName)).toEqual(true);
        expect(html.includes(businessHomepage)).toEqual(true);
      })
      .mockImplementationOnce(async (options) => {
        const { from, to, html } = options;
        expect(from).toEqual(process.env.EMAIL_USER);
        expect(to).toEqual(email);
        expect(html.includes(firstName)).toEqual(true);
        expect(html.includes(lastName)).toEqual(true);
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
    const addSubscriber = jest.fn().mockImplementation(async (user, listId) => {
      expect(user.email).toEqual(email);
      expect(user.firstName).toEqual(firstName);
      expect(user.lastName).toEqual(lastName);
      return null;
    });
    jest.doMock("nodemailer", () => ({
      createTransport,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    const handler = require("pages/api/signup/business");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        firstName,
        lastName,
        email,
        phoneNumber,
        businessName,
        businessHomepage,
        subscribe: false,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(addSubscriber).toHaveBeenCalledTimes(0);
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(2);
    expect(mockRes.statusCode).toBe(204);
  });

  it("XSS attack, valid inputs, valid response with no XSS attack", async () => {
    // Arrange
    const firstName = `<script>window.onload = function() {var link=document.getElementsByTagName("a");link[0].href="${faker.internet.url()}";}</script>`;
    const lastName = `<script src=”${faker.internet.url()}”/>`;
    const email = faker.internet.email();
    const phoneNumber = `<script>window.onload = function() {var link=document.getElementsByTagName("a");link[0].href="${faker.internet.url()}";}</script>`;
    const businessName = `<script src=”${faker.internet.url()}”/>`;
    const businessHomepage = `<script>window.onload = function() {var link=document.getElementsByTagName("a");link[0].href="${faker.internet.url()}";}</script>`;
    const sendMail = jest.fn().mockImplementation(async (options) => {
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
    const addSubscriber = jest.fn().mockImplementation(async (user, listId) => {
      expect(user.email).toEqual(email);
      expect(user.firstName).toEqual(xss(firstName));
      expect(user.lastName).toEqual(xss(lastName));
      return null;
    });
    jest.doMock("nodemailer", () => ({
      createTransport,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    const handler = require("pages/api/signup/business");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        firstName,
        lastName,
        email,
        phoneNumber,
        businessName,
        businessHomepage,
        subscribe: true,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1); // log XSS attempt
    expect(addSubscriber).toHaveBeenCalledTimes(1);
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(2);
    expect(mockRes.statusCode).toBe(204);
  });
});
