/**
 * Businesses Unit Tests
 *
 * @group unit
 * @group website
 * @group businesses
 */

const faker = require("faker");

const log = jest.fn();
describe("Businesses", () => {
  beforeAll(() => {
    jest.doMock("lib/api/sumologic", () => ({ log }));
  });

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Database error, N/A, logged once + server error response", async () => {
    // Arrange
    const select = jest.fn().mockImplementation(async () => null);
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/businesses");
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
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Health check, N/A, valid response", async () => {
    // Arrange
    const numRows = faker.datatype.number({ min: 1, max: 5 });
    const resData = {
      rowCount: numRows,
      rows: Array.from({ length: numRows }, () => ({
        id: faker.datatype.number(),
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
      })),
    };
    const select = jest.fn().mockImplementation(async (params) => {
      if (params.table !== "businesses") {
        return null;
      } else if (params.orderBy !== "name") {
        return resData;
      }
      return {
        ...resData,
        rows: resData.rows.sort((a, b) => a.name.localeCompare(b.name)),
      };
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/businesses");
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
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({
      businesses: resData.rows
        .map(({ id, name, logo, departments, upload_settings, homepages }) => ({
          id,
          name,
          logo,
          departments: JSON.parse(departments),
          uploadSettings: JSON.parse(upload_settings),
          homepages: JSON.parse(homepages),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    });
  });

  it("Invalid method, N/A, logged once + client error response", async () => {
    // Arrange
    const select = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/businesses");
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
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("No businesses, N/A, valid response", async () => {
    // Arrange
    const resData = {
      rowCount: 0,
      rows: [],
    };
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("businesses");
      return resData;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/businesses");
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
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({
      businesses: [],
    });
  });
});
