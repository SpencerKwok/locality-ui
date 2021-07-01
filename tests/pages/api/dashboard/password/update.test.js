const bcrypt = require("bcryptjs");
const faker = require("faker");

const email = faker.internet.email();
const log = jest.fn();
const runMiddlewareBusiness = jest.fn().mockImplementation(async (req) => {
  req.locals = { user: { email: email } };
});
describe("Update password", () => {
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

  it("Database error (getting old password), valid inputs, logged once + server error response", async () => {
    // Arrange
    const currentPassword = faker.internet.password();
    const newPassword = faker.internet.password();
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      return null;
    });
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/password/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        currentPassword,
        newPassword1: newPassword,
        newPassword2: newPassword,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (setting new password), valid inputs, logged once + server error response", async () => {
    // Arrange
    const currentPassword = faker.internet.password();
    const currentPasswordHash = bcrypt.hashSync(currentPassword);
    const newPassword = faker.internet.password();
    const userData = {
      rowCount: 1,
      rows: [
        {
          password: currentPasswordHash,
        },
      ],
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      return userData;
    });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      expect(params.values.length).toEqual(1);
      expect(params.values[0].key).toEqual("password");
      expect(bcrypt.compareSync(newPassword, params.values[0].value)).toEqual(
        true
      );
      return new Error("Something went wrong yippers");
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/password/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        currentPassword,
        newPassword1: newPassword,
        newPassword2: newPassword,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const currentPassword = faker.internet.password();
    const currentPasswordHash = bcrypt.hashSync(currentPassword);
    const newPassword = faker.internet.password();
    const userData = {
      rowCount: 1,
      rows: [
        {
          password: currentPasswordHash,
        },
      ],
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      return userData;
    });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      expect(params.values.length).toEqual(1);
      expect(params.values[0].key).toEqual("password");
      expect(bcrypt.compareSync(newPassword, params.values[0].value)).toEqual(
        true
      );
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/password/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        currentPassword,
        newPassword1: newPassword,
        newPassword2: newPassword,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(select).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Invalid current password type (number), valid inputs, logged once + client error response", async () => {
    // Arrange
    const currentPassword = faker.datatype.number();
    const newPassword = faker.internet.password();
    const select = jest.fn();
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/password/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        currentPassword,
        newPassword1: newPassword,
        newPassword2: newPassword,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(0);
    expect(update).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid new password type (number), valid inputs, logged once + client error response", async () => {
    // Arrange
    const currentPassword = faker.internet.password();
    const newPassword = faker.datatype.number();
    const select = jest.fn();
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/password/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        currentPassword,
        newPassword1: newPassword,
        newPassword2: newPassword,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(0);
    expect(update).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Mismatching new passwords, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const currentPassword = faker.internet.password();
    const select = jest.fn();
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/password/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        currentPassword,
        newPassword1: faker.internet.password(10),
        newPassword2: faker.internet.password(9),
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(0);
    expect(update).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Mismatching current password, valid inputs, logged once + unauthorized error response", async () => {
    // Arrange
    const currentPassword = faker.internet.password(12);
    const currentPasswordHash = bcrypt.hashSync(currentPassword);
    const newPassword = faker.internet.password();
    const userData = {
      rowCount: 1,
      rows: [
        {
          password: currentPasswordHash,
        },
      ],
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`email=E'${email}'`);
      return userData;
    });
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/password/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        currentPassword: faker.internet.password(10),
        newPassword1: newPassword,
        newPassword2: newPassword,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(403);
  });
});
