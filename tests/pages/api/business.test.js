/**
 * Business Unit Tests
 *
 * @group unit
 * @group website
 * @group business
 */

const faker = require("faker");

const log = jest.fn();
describe("Business", () => {
  beforeAll(() => {
    jest.doMock("lib/api/sumologic", () => ({ log }));
  });

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Business does not exist, invalid id, logged once + client error response", async () => {
    // Arrange
    const id = faker.datatype.number();
    const resData = {
      rowCount: 0,
      rows: [],
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${id}`);
      return resData;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/business");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id: `${id}`,
      },
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
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Database error, valid inputs, logged once + server error response", async () => {
    // Arrange
    const id = faker.datatype.number();
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${id}`);
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/business");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id: `${id}`,
      },
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
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const id = faker.datatype.number();
    const resData = {
      rowCount: 1,
      rows: [
        {
          id,
          name: faker.company.companyName(),
          address: faker.address.streetAddress(),
          city: faker.address.city(),
          province: faker.address.state(),
          country: faker.address.country(),
          latitude: faker.address.latitude(),
          longitude: faker.address.longitude(),
          logo: faker.image.imageUrl(
            faker.datatype.number(),
            faker.datatype.number(),
            faker.commerce.department(),
            true
          ),
          departments: JSON.stringify(
            Array.from(
              {
                length: faker.datatype.number({
                  min: 0,
                  max: 5,
                }),
              },
              () => faker.commerce.department()
            )
          ),
          upload_settings: JSON.stringify({
            etsy: {
              includeTags: Array.from(
                {
                  length: faker.datatype.number({
                    min: 0,
                    max: 5,
                  }),
                },
                () => faker.random.words()
              ),
              excludeTags: Array.from(
                {
                  length: faker.datatype.number({
                    min: 0,
                    max: 5,
                  }),
                },
                () => faker.random.words()
              ),
            },
            shopify: {
              includeTags: Array.from(
                {
                  length: faker.datatype.number({
                    min: 0,
                    max: 5,
                  }),
                },
                () => faker.random.words()
              ),
              excludeTags: Array.from(
                {
                  length: faker.datatype.number({
                    min: 0,
                    max: 5,
                  }),
                },
                () => faker.random.words()
              ),
              departmentMapping: Array.from(
                {
                  length: faker.datatype.number({
                    min: 0,
                    max: 5,
                  }),
                },
                () => ({
                  key: faker.random.words(),
                  value: faker.random.words(),
                })
              ),
            },
            square: {
              includeTags: Array.from(
                {
                  length: faker.datatype.number({
                    min: 0,
                    max: 5,
                  }),
                },
                () => faker.random.words()
              ),
              excludeTags: Array.from(
                {
                  length: faker.datatype.number({
                    min: 0,
                    max: 5,
                  }),
                },
                () => faker.random.words()
              ),
              departmentMapping: Array.from(
                {
                  length: faker.datatype.number({
                    min: 0,
                    max: 5,
                  }),
                },
                () => ({
                  key: faker.random.words(),
                  value: faker.random.words(),
                })
              ),
            },
          }),
          homepages: JSON.stringify({
            homepage: faker.internet.url(),
            etsyHomepage:
              faker.datatype.boolean() === true
                ? faker.internet.url()
                : undefined,
            shopifyHomepage:
              faker.datatype.boolean() === true
                ? faker.internet.url()
                : undefined,
            squareHomepage:
              faker.datatype.boolean() === true
                ? faker.internet.url()
                : undefined,
          }),
          next_product_id: faker.datatype.number(),
        },
      ],
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      expect(params.conditions).toEqual(`id=${id}`);
      return resData;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/business");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id: `${id}`,
      },
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
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({
      business: {
        id,
        name: resData.rows[0].name,
        logo: resData.rows[0].logo,
        departments: JSON.parse(resData.rows[0].departments),
        uploadSettings: JSON.parse(resData.rows[0].upload_settings),
        homepages: JSON.parse(resData.rows[0].homepages),
      },
    });
  });

  it("Invalid method, valid inputs, logged once + client error response", async () => {
    // Arrange
    const select = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/business");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: faker.datatype.number(),
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid id type (number), invalid id, logged once + client error response", async () => {
    // Arrange
    const select = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/business");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id: faker.datatype.number(),
      },
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid id type (string), invalid id, logged once + client error response", async () => {
    // Arrange
    const select = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/business");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id: faker.random.word(),
      },
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });
});
