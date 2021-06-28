const bcrypt = require("bcryptjs");
const faker = require("faker");

const log = jest.fn();
describe("User signup", () => {
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

  it("Database error (getting id), valid inputs, logged once + server error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.orderBy).toEqual("id DESC");
      expect(params.limit).toEqual(1);
      return null;
    });
    const insert = jest.fn();
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
    }));
    const handler = require("pages/api/signup/user");
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
        password1: password,
        password2: password,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(addSubscriber).toHaveBeenCalledTimes(0);
    expect(insert).toHaveBeenCalledTimes(0);
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (getting duplicate user), valid inputs, logged once + server error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const highestId = faker.datatype.number();
    const idRes = {
      rowCount: 1,
      rows: [
        {
          id: highestId,
        },
      ],
    };
    const addSubscriber = jest.fn();
    const select = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.orderBy).toEqual("id DESC");
        expect(params.limit).toEqual(1);
        return idRes;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.conditions).toEqual(`email=E'${email}'`);
        return null;
      });
    const insert = jest.fn();
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
    }));
    const handler = require("pages/api/signup/user");
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
        password1: password,
        password2: password,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(addSubscriber).toHaveBeenCalledTimes(0);
    expect(insert).toHaveBeenCalledTimes(0);
    expect(select).toHaveBeenCalledTimes(2);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (adding user), valid inputs, logged once + server error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const highestId = faker.datatype.number();
    const idRes = {
      rowCount: 1,
      rows: [
        {
          id: highestId,
        },
      ],
    };
    const existingUserRes = {
      rowCount: 0,
      rows: [],
    };
    const addSubscriber = jest.fn().mockImplementation(async (user, listId) => {
      expect(user.email).toEqual(email);
      expect(user.firstName).toEqual(firstName);
      expect(user.lastName).toEqual(lastName);
      return null;
    });
    const select = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.orderBy).toEqual("id DESC");
        expect(params.limit).toEqual(1);
        return idRes;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.conditions).toEqual(`email=E'${email}'`);
        return existingUserRes;
      });
    const insert = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.values).toContainEqual({ key: "id", value: highestId + 1 });
      expect(params.values).toContainEqual({ key: "username", value: email });
      expect(params.values).toContainEqual({ key: "email", value: email });
      expect(params.values).toContainEqual({
        key: "first_name",
        value: firstName,
      });
      expect(params.values).toContainEqual({
        key: "last_name",
        value: lastName,
      });
      expect(params.values.length).toEqual(6);

      let numPasswords = 0;
      for (const { key, value } of params.values) {
        if (key === "password") {
          expect(await bcrypt.compare(password, value)).toEqual(true);
          numPasswords += 1;
        }
      }
      expect(numPasswords).toEqual(1);
      return new Error("Yippers, failed to create the user for some reason");
    });
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
    }));
    const handler = require("pages/api/signup/user");
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
        password1: password,
        password2: password,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(addSubscriber).toHaveBeenCalledTimes(0);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(2);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Duplicate user, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const highestId = faker.datatype.number();
    const idRes = {
      rowCount: 1,
      rows: [
        {
          id: highestId,
        },
      ],
    };
    const existingUserRes = {
      rowCount: 1,
      rows: [
        {
          first_name: firstName,
          last_name: lastName,
          email,
        },
      ],
    };
    const addSubscriber = jest.fn().mockImplementation(async (user, listId) => {
      expect(user.email).toEqual(email);
      expect(user.firstName).toEqual(firstName);
      expect(user.lastName).toEqual(lastName);
      return null;
    });
    const select = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.orderBy).toEqual("id DESC");
        expect(params.limit).toEqual(1);
        return idRes;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.conditions).toEqual(`email=E'${email}'`);
        return existingUserRes;
      });
    const insert = jest.fn();
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
    }));
    const handler = require("pages/api/signup/user");
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
        password1: password,
        password2: password,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(addSubscriber).toHaveBeenCalledTimes(0);
    expect(insert).toHaveBeenCalledTimes(0);
    expect(select).toHaveBeenCalledTimes(2);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Fail to subscribe user to MailChimp, valid inputs, logged once + valid response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const highestId = faker.datatype.number();
    const idRes = {
      rowCount: 1,
      rows: [
        {
          id: highestId,
        },
      ],
    };
    const existingUserRes = {
      rowCount: 0,
      rows: [],
    };
    const addSubscriber = jest.fn().mockImplementation(async (user, listId) => {
      expect(user.email).toEqual(email);
      expect(user.firstName).toEqual(firstName);
      expect(user.lastName).toEqual(lastName);
      return new Error("Yippers, something went wrong");
    });
    const select = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.orderBy).toEqual("id DESC");
        expect(params.limit).toEqual(1);
        return idRes;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.conditions).toEqual(`email=E'${email}'`);
        return existingUserRes;
      });
    const insert = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.values).toContainEqual({ key: "id", value: highestId + 1 });
      expect(params.values).toContainEqual({ key: "username", value: email });
      expect(params.values).toContainEqual({ key: "email", value: email });
      expect(params.values).toContainEqual({
        key: "first_name",
        value: firstName,
      });
      expect(params.values).toContainEqual({
        key: "last_name",
        value: lastName,
      });
      expect(params.values.length).toEqual(6);

      let numPasswords = 0;
      for (const { key, value } of params.values) {
        if (key === "password") {
          expect(await bcrypt.compare(password, value)).toEqual(true);
          numPasswords += 1;
        }
      }
      expect(numPasswords).toEqual(1);
      return null;
    });
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
    }));
    const handler = require("pages/api/signup/user");
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
        password1: password,
        password2: password,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(addSubscriber).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(2);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const highestId = faker.datatype.number();
    const idRes = {
      rowCount: 1,
      rows: [
        {
          id: highestId,
        },
      ],
    };
    const existingUserRes = {
      rowCount: 0,
      rows: [],
    };
    const addSubscriber = jest.fn().mockImplementation(async (user, listId) => {
      expect(user.email).toEqual(email);
      expect(user.firstName).toEqual(firstName);
      expect(user.lastName).toEqual(lastName);
      return null;
    });
    const select = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.orderBy).toEqual("id DESC");
        expect(params.limit).toEqual(1);
        return idRes;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.conditions).toEqual(`email=E'${email}'`);
        return existingUserRes;
      });
    const insert = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.values).toContainEqual({ key: "id", value: highestId + 1 });
      expect(params.values).toContainEqual({ key: "username", value: email });
      expect(params.values).toContainEqual({ key: "email", value: email });
      expect(params.values).toContainEqual({
        key: "first_name",
        value: firstName,
      });
      expect(params.values).toContainEqual({
        key: "last_name",
        value: lastName,
      });
      expect(params.values.length).toEqual(6);

      let numPasswords = 0;
      for (const { key, value } of params.values) {
        if (key === "password") {
          expect(await bcrypt.compare(password, value)).toEqual(true);
          numPasswords += 1;
        }
      }
      expect(numPasswords).toEqual(1);
      return null;
    });
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
    }));
    const handler = require("pages/api/signup/user");
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
        password1: password,
        password2: password,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(addSubscriber).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(2);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Invalid method, valid inputs, logged once + client error response", async () => {
    // Arrange
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/signup/user");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      query: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password1: password,
        password2: password,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(addSubscriber).toHaveBeenCalledTimes(0);
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });
});
