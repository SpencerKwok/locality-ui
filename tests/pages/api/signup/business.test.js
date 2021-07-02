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

  it("Database error (adding user), valid inputs, logged once + server error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
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
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn().mockImplementation(async (params) => {
      expect(params.streetAddress).toEqual(address);
      expect(params.city).toEqual(city);
      expect(params.province).toEqual(province);
      expect(params.country).toEqual(country);
      return {
        lat: latitude,
        lng: longitude,
      };
    });
    const insert = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("businesses");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
        expect(params.values).toContainEqual({
          key: "name",
          value: businessName,
        });
        expect(params.values).toContainEqual({
          key: "address",
          value: address,
        });
        expect(params.values).toContainEqual({
          key: "city",
          value: city,
        });
        expect(params.values).toContainEqual({
          key: "province",
          value: province,
        });
        expect(params.values).toContainEqual({
          key: "country",
          value: country,
        });
        expect(params.values).toContainEqual({
          key: "latitude",
          value: latitude,
        });
        expect(params.values).toContainEqual({
          key: "longitude",
          value: longitude,
        });
        expect(params.values.length).toEqual(8);
        return null;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
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
        return new Error("Failed to add user");
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
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(insert).toHaveBeenCalledTimes(2);
    expect(select).toHaveBeenCalledTimes(2);
    expect(getLatLng).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (getting id), valid inputs, logged once + server error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn().mockImplementation(async (params) => {
      expect(params.streetAddress).toEqual(address);
      expect(params.city).toEqual(city);
      expect(params.province).toEqual(province);
      expect(params.country).toEqual(country);
      return {
        lat: latitude,
        lng: longitude,
      };
    });
    const insert = jest.fn();
    const select = jest.fn().mockImplementationOnce(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.orderBy).toEqual("id DESC");
      expect(params.limit).toEqual(1);
      return null;
    });
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(getLatLng).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (getting duplicate user), valid inputs, logged once + server error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
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
    const getLatLng = jest.fn().mockImplementation(async (params) => {
      expect(params.streetAddress).toEqual(address);
      expect(params.city).toEqual(city);
      expect(params.province).toEqual(province);
      expect(params.country).toEqual(country);
      return {
        lat: latitude,
        lng: longitude,
      };
    });
    const insert = jest.fn();
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
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(getLatLng).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (getting location), valid inputs, logged once + server error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
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
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn().mockImplementation(async (params) => {
      expect(params.streetAddress).toEqual(address);
      expect(params.city).toEqual(city);
      expect(params.province).toEqual(province);
      expect(params.country).toEqual(country);
      return null;
    });
    const insert = jest.fn();
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
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (adding business), valid inputs, logged once + server error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
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
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn().mockImplementation(async (params) => {
      expect(params.streetAddress).toEqual(address);
      expect(params.city).toEqual(city);
      expect(params.province).toEqual(province);
      expect(params.country).toEqual(country);
      return {
        lat: latitude,
        lng: longitude,
      };
    });
    const insert = jest.fn().mockImplementationOnce(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.values).toContainEqual({
        key: "id",
        value: highestId + 1,
      });
      expect(params.values).toContainEqual({
        key: "name",
        value: businessName,
      });
      expect(params.values).toContainEqual({
        key: "address",
        value: address,
      });
      expect(params.values).toContainEqual({
        key: "city",
        value: city,
      });
      expect(params.values).toContainEqual({
        key: "province",
        value: province,
      });
      expect(params.values).toContainEqual({
        key: "country",
        value: country,
      });
      expect(params.values).toContainEqual({
        key: "latitude",
        value: latitude,
      });
      expect(params.values).toContainEqual({
        key: "longitude",
        value: longitude,
      });
      expect(params.values.length).toEqual(8);
      return new Error("Failed to add business for some reason");
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
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(getLatLng).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Duplicate user, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
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
    const getLatLng = jest.fn().mockImplementation(async (params) => {
      expect(params.streetAddress).toEqual(address);
      expect(params.city).toEqual(city);
      expect(params.province).toEqual(province);
      expect(params.country).toEqual(country);
      return {
        lat: latitude,
        lng: longitude,
      };
    });
    const insert = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("businesses");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
        expect(params.values).toContainEqual({
          key: "name",
          value: businessName,
        });
        expect(params.values).toContainEqual({
          key: "address",
          value: address,
        });
        expect(params.values).toContainEqual({
          key: "city",
          value: city,
        });
        expect(params.values).toContainEqual({
          key: "province",
          value: province,
        });
        expect(params.values).toContainEqual({
          key: "country",
          value: country,
        });
        expect(params.values).toContainEqual({
          key: "latitude",
          value: latitude,
        });
        expect(params.values).toContainEqual({
          key: "longitude",
          value: longitude,
        });
        expect(params.values.length).toEqual(8);
        return null;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
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
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
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
        businessName,
        address,
        city,
        province,
        country,
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
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
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
    const getLatLng = jest.fn().mockImplementation(async (params) => {
      expect(params.streetAddress).toEqual(address);
      expect(params.city).toEqual(city);
      expect(params.province).toEqual(province);
      expect(params.country).toEqual(country);
      return {
        lat: latitude,
        lng: longitude,
      };
    });
    const insert = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("businesses");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
        expect(params.values).toContainEqual({
          key: "name",
          value: businessName,
        });
        expect(params.values).toContainEqual({
          key: "address",
          value: address,
        });
        expect(params.values).toContainEqual({
          key: "city",
          value: city,
        });
        expect(params.values).toContainEqual({
          key: "province",
          value: province,
        });
        expect(params.values).toContainEqual({
          key: "country",
          value: country,
        });
        expect(params.values).toContainEqual({
          key: "latitude",
          value: latitude,
        });
        expect(params.values).toContainEqual({
          key: "longitude",
          value: longitude,
        });
        expect(params.values.length).toEqual(8);
        return null;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
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
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(insert).toHaveBeenCalledTimes(2);
    expect(select).toHaveBeenCalledTimes(2);
    expect(getLatLng).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
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
    const getLatLng = jest.fn().mockImplementation(async (params) => {
      expect(params.streetAddress).toEqual(address);
      expect(params.city).toEqual(city);
      expect(params.province).toEqual(province);
      expect(params.country).toEqual(country);
      return {
        lat: latitude,
        lng: longitude,
      };
    });
    const insert = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("businesses");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
        expect(params.values).toContainEqual({
          key: "name",
          value: businessName,
        });
        expect(params.values).toContainEqual({
          key: "address",
          value: address,
        });
        expect(params.values).toContainEqual({
          key: "city",
          value: city,
        });
        expect(params.values).toContainEqual({
          key: "province",
          value: province,
        });
        expect(params.values).toContainEqual({
          key: "country",
          value: country,
        });
        expect(params.values).toContainEqual({
          key: "latitude",
          value: latitude,
        });
        expect(params.values).toContainEqual({
          key: "longitude",
          value: longitude,
        });
        expect(params.values.length).toEqual(8);
        return null;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
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
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(insert).toHaveBeenCalledTimes(2);
    expect(select).toHaveBeenCalledTimes(2);
    expect(getLatLng).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Invalid method, valid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const highestId = faker.datatype.number();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
    }));
    const handler = require("pages/api/signup/business");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      query: {
        firstName,
        lastName,
        email,
        businessName,
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid first name (string), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.random.alpha({ count: 256 });
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid last name (string), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.random.alpha({ count: 256 });
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid business name (string), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.random.alpha({ count: 256 });
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid address (string), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = `${faker.datatype.number()} ${faker.random.alpha({
      count: 255,
    })}`;
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid city (string), valid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.random.alphaNumeric({ count: 256 });
    const province = faker.address.state();
    const country = faker.address.country();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid province (string), valid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.random.alphaNumeric({ count: 256 });
    const country = faker.address.country();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid country (string), valid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.random.alphaNumeric({ count: 256 });
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid password (string), valid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const email = faker.internet.email();
    const password = faker.random.alphaNumeric({ count: 256 });
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid email (string), valid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const email = faker.internet.email(faker.random.alpha({ count: 255 }));
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Mismatched passwords (string), valid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const email = faker.internet.email();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
        password1: faker.internet.password(15),
        password2: faker.internet.password(13),
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(addSubscriber).toHaveBeenCalledTimes(0);
    expect(insert).toHaveBeenCalledTimes(0);
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing first name, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        lastName,
        email,
        businessName,
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing last name, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        email,
        businessName,
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing business name invalid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing address, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing city, valid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const province = faker.address.state();
    const country = faker.address.country();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing province, valid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const country = faker.address.country();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing country, valid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing password, valid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const email = faker.internet.email();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(addSubscriber).toHaveBeenCalledTimes(0);
    expect(insert).toHaveBeenCalledTimes(0);
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing email (string), valid inputs, logged once + client error response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const email = `${faker.random.alphaNumeric({ count: 255 })}@outlook.com`;
    const password = faker.internet.password();
    const addSubscriber = jest.fn();
    const getLatLng = jest.fn();
    const insert = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(getLatLng).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("XSS attack (in user data), valid inputs, valid response", async () => {
    // Arrange
    const firstName = `<script>window.onload = function() {var link=document.getElementsByTagName("a");link[0].href="${faker.internet.url()}";}</script>`;
    const lastName = `<script src=”${faker.internet.url()}”/>`;
    const businessName = `<script>window.onload = function() {var link=document.getElementsByTagName("a");link[0].href="${faker.internet.url()}";}</script>`;
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
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
      expect(user.firstName).toEqual(xss(firstName));
      expect(user.lastName).toEqual(xss(lastName));
      return null;
    });
    const getLatLng = jest.fn().mockImplementation(async (params) => {
      expect(params.streetAddress).toEqual(xss(address));
      expect(params.city).toEqual(city);
      expect(params.province).toEqual(province);
      expect(params.country).toEqual(country);
      return {
        lat: latitude,
        lng: longitude,
      };
    });
    const insert = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("businesses");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
        expect(params.values).toContainEqual({
          key: "name",
          value: xss(businessName),
        });
        expect(params.values).toContainEqual({
          key: "address",
          value: address,
        });
        expect(params.values).toContainEqual({
          key: "city",
          value: city,
        });
        expect(params.values).toContainEqual({
          key: "province",
          value: province,
        });
        expect(params.values).toContainEqual({
          key: "country",
          value: country,
        });
        expect(params.values).toContainEqual({
          key: "latitude",
          value: latitude,
        });
        expect(params.values).toContainEqual({
          key: "longitude",
          value: longitude,
        });
        expect(params.values.length).toEqual(8);
        return null;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
        expect(params.values).toContainEqual({ key: "username", value: email });
        expect(params.values).toContainEqual({ key: "email", value: email });
        expect(params.values).toContainEqual({
          key: "first_name",
          value: xss(firstName),
        });
        expect(params.values).toContainEqual({
          key: "last_name",
          value: xss(lastName),
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
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(insert).toHaveBeenCalledTimes(2);
    expect(select).toHaveBeenCalledTimes(2);
    expect(getLatLng).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });

  it("XSS attack (in address), valid inputs, valid response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = `<script>window.onload = function() {var link=document.getElementsByTagName("a");link[0].href="${faker.internet.url()}";}</script>`;
    const city = faker.address.city();
    const province = faker.address.state();
    const country = faker.address.country();
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
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
    const getLatLng = jest.fn().mockImplementation(async (params) => {
      expect(params.streetAddress).toEqual(xss(address));
      expect(params.city).toEqual(city);
      expect(params.province).toEqual(province);
      expect(params.country).toEqual(country);
      return {
        lat: latitude,
        lng: longitude,
      };
    });
    const insert = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("businesses");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
        expect(params.values).toContainEqual({
          key: "name",
          value: businessName,
        });
        expect(params.values).toContainEqual({
          key: "address",
          value: xss(address),
        });
        expect(params.values).toContainEqual({
          key: "city",
          value: city,
        });
        expect(params.values).toContainEqual({
          key: "province",
          value: province,
        });
        expect(params.values).toContainEqual({
          key: "country",
          value: country,
        });
        expect(params.values).toContainEqual({
          key: "latitude",
          value: latitude,
        });
        expect(params.values).toContainEqual({
          key: "longitude",
          value: longitude,
        });
        expect(params.values.length).toEqual(8);
        return null;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
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
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(insert).toHaveBeenCalledTimes(2);
    expect(select).toHaveBeenCalledTimes(2);
    expect(getLatLng).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });

  it("XSS attack (in city), valid inputs, valid response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = `<script src=”${faker.internet.url()}”/>`;
    const province = faker.address.state();
    const country = faker.address.country();
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
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
    const getLatLng = jest.fn().mockImplementation(async (params) => {
      expect(params.streetAddress).toEqual(address);
      expect(params.city).toEqual(xss(city));
      expect(params.province).toEqual(province);
      expect(params.country).toEqual(country);
      return {
        lat: latitude,
        lng: longitude,
      };
    });
    const insert = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("businesses");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
        expect(params.values).toContainEqual({
          key: "name",
          value: businessName,
        });
        expect(params.values).toContainEqual({
          key: "address",
          value: address,
        });
        expect(params.values).toContainEqual({
          key: "city",
          value: xss(city),
        });
        expect(params.values).toContainEqual({
          key: "province",
          value: province,
        });
        expect(params.values).toContainEqual({
          key: "country",
          value: country,
        });
        expect(params.values).toContainEqual({
          key: "latitude",
          value: latitude,
        });
        expect(params.values).toContainEqual({
          key: "longitude",
          value: longitude,
        });
        expect(params.values.length).toEqual(8);
        return null;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
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
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(insert).toHaveBeenCalledTimes(2);
    expect(select).toHaveBeenCalledTimes(2);
    expect(getLatLng).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });

  it("XSS attack (in province), valid inputs, valid response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = `<script>window.onload = function() {var link=document.getElementsByTagName("a");link[0].href="${faker.internet.url()}";}</script>`;
    const country = faker.address.country();
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
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
    const getLatLng = jest.fn().mockImplementation(async (params) => {
      expect(params.streetAddress).toEqual(address);
      expect(params.city).toEqual(city);
      expect(params.province).toEqual(xss(province));
      expect(params.country).toEqual(country);
      return {
        lat: latitude,
        lng: longitude,
      };
    });
    const insert = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("businesses");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
        expect(params.values).toContainEqual({
          key: "name",
          value: businessName,
        });
        expect(params.values).toContainEqual({
          key: "address",
          value: address,
        });
        expect(params.values).toContainEqual({
          key: "city",
          value: city,
        });
        expect(params.values).toContainEqual({
          key: "province",
          value: xss(province),
        });
        expect(params.values).toContainEqual({
          key: "country",
          value: country,
        });
        expect(params.values).toContainEqual({
          key: "latitude",
          value: latitude,
        });
        expect(params.values).toContainEqual({
          key: "longitude",
          value: longitude,
        });
        expect(params.values.length).toEqual(8);
        return null;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
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
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(insert).toHaveBeenCalledTimes(2);
    expect(select).toHaveBeenCalledTimes(2);
    expect(getLatLng).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });

  it("XSS attack (in country), valid inputs, valid response", async () => {
    // Arrange
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const businessName = faker.company.companyName();
    const address = faker.address.streetAddress();
    const city = faker.address.city();
    const province = faker.address.state();
    const country = `<script src=”${faker.internet.url()}”/>`;
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
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
    const getLatLng = jest.fn().mockImplementation(async (params) => {
      expect(params.streetAddress).toEqual(address);
      expect(params.city).toEqual(city);
      expect(params.province).toEqual(province);
      expect(params.country).toEqual(xss(country));
      return {
        lat: latitude,
        lng: longitude,
      };
    });
    const insert = jest
      .fn()
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("businesses");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
        expect(params.values).toContainEqual({
          key: "name",
          value: businessName,
        });
        expect(params.values).toContainEqual({
          key: "address",
          value: address,
        });
        expect(params.values).toContainEqual({
          key: "city",
          value: city,
        });
        expect(params.values).toContainEqual({
          key: "province",
          value: province,
        });
        expect(params.values).toContainEqual({
          key: "country",
          value: xss(country),
        });
        expect(params.values).toContainEqual({
          key: "latitude",
          value: latitude,
        });
        expect(params.values).toContainEqual({
          key: "longitude",
          value: longitude,
        });
        expect(params.values.length).toEqual(8);
        return null;
      })
      .mockImplementationOnce(async (params) => {
        expect(params.table).toEqual("users");
        expect(params.values).toContainEqual({
          key: "id",
          value: highestId + 1,
        });
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
    jest.doMock("lib/api/mapquest", () => ({
      getLatLng,
    }));
    jest.doMock("lib/api/mailchimp", () => ({
      addSubscriber,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      insert,
      select,
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
        businessName,
        address,
        city,
        province,
        country,
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
    expect(insert).toHaveBeenCalledTimes(2);
    expect(select).toHaveBeenCalledTimes(2);
    expect(getLatLng).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });
});
