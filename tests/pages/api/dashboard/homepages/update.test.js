const faker = require("faker");
const xss = require("xss");

const userId = faker.datatype.number();
const log = jest.fn();
const runMiddlewareBusiness = jest.fn().mockImplementation(async (req) => {
  req.locals = { user: { id: userId } };
});
describe("Update homepages", () => {
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

  it("Database error (getting previous homepages), valid inputs, logged once + server error response", async () => {
    // Arrange
    const homepages = {
      homepage: faker.internet.url(),
      etsyHomepage: `https://www.etsy.com/ca/shop/${encodeURIComponent(
        faker.company.companyName()
      )}`,
      shopifyHomepage: faker.internet.url(),
      squareHomepage: faker.internet.url(),
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      return null;
    });
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/homepages/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        ...homepages,
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

  it("Database error (updating homepages), valid inputs, logged once + server error response", async () => {
    // Arrange
    const homepages = {
      homepage: faker.internet.url(),
      etsyHomepage: `https://www.etsy.com/ca/shop/${encodeURIComponent(
        faker.company.companyName()
      )}`,
      shopifyHomepage: faker.internet.url(),
      squareHomepage: faker.internet.url(),
    };
    const resData = {
      rowCount: 1,
      rows: [
        {
          homepages: JSON.stringify({
            homepage: faker.internet.url(),
            etsyHomepage: faker.internet.url(),
            shopifyHomepage: faker.internet.url(),
            squareHomepage: faker.internet.url(),
          }),
        },
      ],
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      return resData;
    });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      const obj = {};
      Object.keys(homepages).map((k) => {
        obj[k] = homepages[k].replace(/http(?!s)/g, "https");
      });
      expect(params.values).toContainEqual({
        key: "homepages",
        value: JSON.stringify(obj),
      });
      return new Error("Failed to update homepages");
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/homepages/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        ...homepages,
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
    const homepages = {
      homepage: faker.internet.url(),
      etsyHomepage: `https://www.etsy.com/ca/shop/${encodeURIComponent(
        faker.company.companyName()
      )}`,
      shopifyHomepage: faker.internet.url(),
      squareHomepage: faker.internet.url(),
    };
    const resData = {
      rowCount: 1,
      rows: [
        {
          homepages: JSON.stringify({
            homepage: faker.internet.url(),
            etsyHomepage: faker.internet.url(),
            shopifyHomepage: faker.internet.url(),
            squareHomepage: faker.internet.url(),
          }),
        },
      ],
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      return resData;
    });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      const obj = {};
      Object.keys(homepages).map((k) => {
        obj[k] = homepages[k].replace(/http(?!s)/g, "https");
      });
      expect(params.values).toContainEqual({
        key: "homepages",
        value: JSON.stringify(obj),
      });
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/homepages/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        ...homepages,
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

  it("Ignore request id from non-admins, invalid inputs, valid response", async () => {
    // Arrange
    const homepages = {
      homepage: faker.internet.url(),
      etsyHomepage: `https://www.etsy.com/ca/shop/${encodeURIComponent(
        faker.company.companyName()
      )}`,
      shopifyHomepage: faker.internet.url(),
      squareHomepage: faker.internet.url(),
    };
    const resData = {
      rowCount: 1,
      rows: [
        {
          homepages: JSON.stringify({
            homepage: faker.internet.url(),
            etsyHomepage: faker.internet.url(),
            shopifyHomepage: faker.internet.url(),
            squareHomepage: faker.internet.url(),
          }),
        },
      ],
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      return resData;
    });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      const obj = {};
      Object.keys(homepages).map((k) => {
        obj[k] = homepages[k].replace(/http(?!s)/g, "https");
      });
      expect(params.values).toContainEqual({
        key: "homepages",
        value: JSON.stringify(obj),
      });
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/homepages/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: faker.datatype.number(),
        ...homepages,
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

  it("Invalid homepage type (number), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const homepages = {
      homepage: faker.datatype.number(),
      etsyHomepage: `https://www.etsy.com/ca/shop/${encodeURIComponent(
        faker.company.companyName()
      )}`,
      shopifyHomepage: faker.internet.url(),
      squareHomepage: faker.internet.url(),
    };
    const select = jest.fn();
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/homepages/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        ...homepages,
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

  it("Invalid Etsy type (number), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const homepages = {
      homepage: faker.internet.url(),
      etsyHomepage: faker.datatype.number(),
      shopifyHomepage: faker.internet.url(),
      squareHomepage: faker.internet.url(),
    };
    const select = jest.fn();
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/homepages/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        ...homepages,
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

  it("Invalid Shopify homepage type (number), valid inputs, valid response", async () => {
    // Arrange
    const homepages = {
      homepage: faker.internet.url(),
      etsyHomepage: `https://www.etsy.com/ca/shop/${encodeURIComponent(
        faker.company.companyName()
      )}`,
      shopifyHomepage: faker.datatype.number(),
      squareHomepage: faker.internet.url(),
    };
    const select = jest.fn();
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/homepages/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        ...homepages,
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

  it("Invalid Square homepage type (number), valid inputs, valid response", async () => {
    // Arrange
    const homepages = {
      homepage: faker.internet.url(),
      etsyHomepage: `https://www.etsy.com/ca/shop/${encodeURIComponent(
        faker.company.companyName()
      )}`,
      shopifyHomepage: faker.internet.url(),
      squareHomepage: faker.datatype.number(),
    };
    const select = jest.fn();
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/homepages/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        ...homepages,
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

  it("Invalid Etsy homepage (string), valid inputs, valid response", async () => {
    // Arrange
    const homepages = {
      homepage: faker.internet.url(),
      etsyHomepage: faker.internet.url(),
      shopifyHomepage: faker.internet.url(),
      squareHomepage: faker.internet.url(),
    };
    const select = jest.fn();
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/homepages/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        ...homepages,
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

  it("Missing homepage, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const homepages = {
      etsyHomepage: `https://www.etsy.com/ca/shop/${encodeURIComponent(
        faker.company.companyName()
      )}`,
      shopifyHomepage: faker.internet.url(),
      squareHomepage: faker.internet.url(),
    };
    const select = jest.fn();
    const update = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/homepages/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        ...homepages,
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

  it("Missing Etsy homepage, valid inputs, valid response", async () => {
    // Arrange
    const homepages = {
      homepage: faker.internet.url(),
      shopifyHomepage: faker.internet.url(),
      squareHomepage: faker.internet.url(),
    };
    const resData = {
      rowCount: 1,
      rows: [
        {
          homepages: JSON.stringify({
            homepage: faker.internet.url(),
            etsyHomepage: faker.internet.url(),
            shopifyHomepage: faker.internet.url(),
            squareHomepage: faker.internet.url(),
          }),
        },
      ],
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      return resData;
    });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      const obj = {};
      Object.keys(homepages).map((k) => {
        obj[k] = homepages[k].replace(/http(?!s)/g, "https");
      });
      expect(params.values).toContainEqual({
        key: "homepages",
        value: JSON.stringify(obj),
      });
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/homepages/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        ...homepages,
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

  it("Missing Shopify homepage, valid inputs, valid response", async () => {
    // Arrange
    const homepages = {
      homepage: faker.internet.url(),
      etsyHomepage: `https://www.etsy.com/ca/shop/${encodeURIComponent(
        faker.company.companyName()
      )}`,
      squareHomepage: faker.internet.url(),
    };
    const resData = {
      rowCount: 1,
      rows: [
        {
          homepages: JSON.stringify({
            homepage: faker.internet.url(),
            etsyHomepage: faker.internet.url(),
            shopifyHomepage: faker.internet.url(),
            squareHomepage: faker.internet.url(),
          }),
        },
      ],
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      return resData;
    });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      const obj = {};
      Object.keys(homepages).map((k) => {
        obj[k] = homepages[k].replace(/http(?!s)/g, "https");
      });
      expect(params.values).toContainEqual({
        key: "homepages",
        value: JSON.stringify(obj),
      });
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/homepages/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        ...homepages,
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

  it("Missing Square homepage, valid inputs, valid response", async () => {
    // Arrange
    const homepages = {
      homepage: faker.internet.url(),
      etsyHomepage: `https://www.etsy.com/ca/shop/${encodeURIComponent(
        faker.company.companyName()
      )}`,
      shopifyHomepage: faker.internet.url(),
    };
    const resData = {
      rowCount: 1,
      rows: [
        {
          homepages: JSON.stringify({
            homepage: faker.internet.url(),
            etsyHomepage: faker.internet.url(),
            shopifyHomepage: faker.internet.url(),
            squareHomepage: faker.internet.url(),
          }),
        },
      ],
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      return resData;
    });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      const obj = {};
      Object.keys(homepages).map((k) => {
        obj[k] = homepages[k].replace(/http(?!s)/g, "https");
      });
      expect(params.values).toContainEqual({
        key: "homepages",
        value: JSON.stringify(obj),
      });
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/homepages/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        ...homepages,
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

  it("XSS attack (all pages except Etsy), valid inputs, valid response with XSS attack removed", async () => {
    // Arrange
    const homepages = {
      homepage: `www.<script src=”${faker.internet.url()}”/>.com`,
      etsyHomepage: `https://www.etsy.com/ca/shop/${encodeURIComponent(
        faker.company.companyName()
      )}`,
      shopifyHomepage: `${faker.internet.url()}/<script src=”${faker.internet.url()}”></script>`,
      squareHomepage: `www.google<script src=${faker.internet.url()}/>`,
    };
    const resData = {
      rowCount: 1,
      rows: [
        {
          homepages: JSON.stringify({
            homepage: faker.internet.url(),
            etsyHomepage: faker.internet.url(),
            shopifyHomepage: faker.internet.url(),
            squareHomepage: faker.internet.url(),
          }),
        },
      ],
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      return resData;
    });
    const update = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${userId}`);
      const obj = {};
      Object.keys(homepages).map((k) => {
        if (homepages[k].substr(0, 8) === "https://") {
          obj[k] = xss(homepages[k]);
        } else if (homepages[k].substr(0, 7) === "http://") {
          obj[k] = xss(`https://${homepages[k].substr(7)}`);
        } else {
          obj[k] = xss(`https://${homepages[k]}`);
        }
      });
      expect(params.values).toContainEqual({
        key: "homepages",
        value: JSON.stringify(obj),
      });
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
      update,
    }));
    const handler = require("pages/api/dashboard/homepages/update");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        ...homepages,
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
});
