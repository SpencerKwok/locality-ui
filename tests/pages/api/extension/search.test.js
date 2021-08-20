/**
 * Search Unit Tests
 *
 * @group unit
 * @group extension
 * @group search
 */

const { decode } = require("html-entities");
const faker = require("faker");

const log = jest.fn();
describe("Search", () => {
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

  it("Database error, valid inputs, logged once + valid response with no wishlist", async () => {
    // Arrange
    const userId = faker.datatype.number();
    const token = faker.datatype.uuid();
    const query = faker.random.words();
    const filters = `departments:${faker.commerce.department()} OR business:${faker.company.companyName()}`;
    const page = 5;
    const numHits = faker.datatype.number({
      min: 1,
      max: 5,
    });
    const searchData = {
      hits: Array.from(
        {
          length: numHits,
        },
        () => {
          const description = faker.commerce.productDescription();
          const tags = Array.from(
            {
              length: faker.datatype.number({
                min: 0,
                max: 5,
              }),
            },
            () => faker.random.words()
          );

          return {
            name: faker.commerce.productName(),
            business: faker.company.companyName(),
            description,
            descriptionLength: description.length,
            departments: Array.from(
              {
                length: faker.datatype.number({
                  min: 0,
                  max: 5,
                }),
              },
              () => faker.commerce.department()
            ),
            link: faker.internet.url(),
            priceRange: [faker.commerce.price(), faker.commerce.price()].sort(
              (a, b) => a - b
            ),
            tags,
            tagsLength: tags.join("").length,
            variantImages: Array.from(
              {
                length: faker.datatype.number({
                  min: 1,
                  max: 5,
                }),
              },
              () =>
                faker.image.imageUrl(
                  faker.datatype.number(),
                  faker.datatype.number(),
                  faker.commerce.department(),
                  true
                )
            ),
            variantTags: Array.from(
              {
                length: faker.datatype.number({
                  min: 0,
                  max: 5,
                }),
              },
              () => faker.random.words()
            ),
            objectId: `${faker.datatype.number()}_${faker.datatype.number()}`,
          };
        }
      ),
    };
    const getBestVariant = jest.fn().mockImplementation((q, hit) => hit);
    const search = jest.fn().mockImplementation((q, options) => {
      expect(q).toEqual(decode(query));
      expect(options.filters).toEqual(decode(filters));
      expect(options.page).toEqual(page);
      return searchData;
    });
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`id=${userId}`);
      return null;
    });
    jest.doMock("lib/api/algolia", () => ({
      search,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    jest.doMock("lib/api/search", () => ({
      getBestVariant,
    }));
    const handler = require("pages/api/extension/search");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        id: userId,
        token: token,
      },
      query: {
        q: query,
        filters: filters,
        pg: `${page}`,
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
    expect(search).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(getBestVariant).toHaveBeenCalledTimes(numHits);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual(searchData);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const userId = faker.datatype.number();
    const token = faker.datatype.uuid();
    const query = faker.random.words();
    const filters = `departments:${faker.commerce.department()} OR business:${faker.company.companyName()}`;
    const page = faker.datatype.number();
    const wishlistResData = {
      rowCount: 1,
      rows: [{ wishlist: JSON.stringify([]) }],
    };
    const numHits = faker.datatype.number({
      min: 1,
      max: 5,
    });
    const searchData = {
      hits: Array.from(
        {
          length: numHits,
        },
        () => {
          const description = faker.commerce.productDescription();
          const tags = Array.from(
            {
              length: faker.datatype.number({
                min: 0,
                max: 5,
              }),
            },
            () => faker.random.words()
          );

          return {
            name: faker.commerce.productName(),
            business: faker.company.companyName(),
            description,
            descriptionLength: description.length,
            departments: Array.from(
              {
                length: faker.datatype.number({
                  min: 0,
                  max: 5,
                }),
              },
              () => faker.commerce.department()
            ),
            link: faker.internet.url(),
            priceRange: [faker.commerce.price(), faker.commerce.price()].sort(
              (a, b) => a - b
            ),
            tags,
            tagsLength: tags.join("").length,
            variantImages: Array.from(
              {
                length: faker.datatype.number({
                  min: 1,
                  max: 5,
                }),
              },
              () =>
                faker.image.imageUrl(
                  faker.datatype.number(),
                  faker.datatype.number(),
                  faker.commerce.department(),
                  true
                )
            ),
            variantTags: Array.from(
              {
                length: faker.datatype.number({
                  min: 0,
                  max: 5,
                }),
              },
              () => faker.random.words()
            ),
            objectId: `${faker.datatype.number()}_${faker.datatype.number()}`,
          };
        }
      ),
    };
    const getBestVariant = jest.fn().mockImplementation((q, hit) => hit);
    const search = jest.fn().mockImplementation((q, options) => {
      expect(q).toEqual(decode(query));
      expect(options.filters).toEqual(decode(filters));
      expect(options.page).toEqual(page);
      return searchData;
    });
    const select = jest.fn().mockImplementationOnce(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`id=${userId}`);
      return wishlistResData;
    });
    jest.doMock("lib/api/algolia", () => ({
      search,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    jest.doMock("lib/api/search", () => ({
      getBestVariant,
    }));
    const handler = require("pages/api/extension/search");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        id: userId,
        token: token,
      },
      query: {
        q: query,
        filters: filters,
        pg: `${page}`,
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
    expect(search).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(getBestVariant).toHaveBeenCalledTimes(numHits);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual(searchData);
  });

  it("Invalid method, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const getBestVariant = jest.fn().mockImplementation((q, hit) => hit);
    const search = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/algolia", () => ({
      search,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    jest.doMock("lib/api/search", () => ({
      getBestVariant,
    }));
    const handler = require("pages/api/extension/search");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        q: faker.random.words(),
        filters: `departments:${faker.commerce.department()} OR business:${faker.company.companyName()}`,
        pg: `${faker.datatype.number()}`,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(getBestVariant).toHaveBeenCalledTimes(0);
    expect(search).toHaveBeenCalledTimes(0);
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid query (number), invalid query, logged once + client error response", async () => {
    // Arrange
    const getBestVariant = jest.fn().mockImplementation((q, hit) => hit);
    const search = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/algolia", () => ({
      search,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    jest.doMock("lib/api/search", () => ({
      getBestVariant,
    }));
    const handler = require("pages/api/extension/search");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      query: {
        q: faker.datatype.number(),
        filters: "",
        pg: `${faker.datatype.number()}`,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(getBestVariant).toHaveBeenCalledTimes(0);
    expect(search).toHaveBeenCalledTimes(0);
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid filters (number), invalid filters, valid response with filters ignored", async () => {
    // Arrange
    const userId = faker.datatype.number();
    const token = faker.datatype.uuid();
    const query = faker.random.words();
    const filters = faker.datatype.number();
    const wishlistResData = {
      rowCount: 1,
      rows: [{ wishlist: JSON.stringify([]) }],
    };
    const numHits = faker.datatype.number({
      min: 1,
      max: 5,
    });
    const searchData = {
      hits: Array.from(
        {
          length: numHits,
        },
        () => {
          const description = faker.commerce.productDescription();
          const tags = Array.from(
            {
              length: faker.datatype.number({
                min: 0,
                max: 5,
              }),
            },
            () => faker.random.words()
          );

          return {
            name: faker.commerce.productName(),
            business: faker.company.companyName(),
            description,
            descriptionLength: description.length,
            departments: Array.from(
              {
                length: faker.datatype.number({
                  min: 0,
                  max: 5,
                }),
              },
              () => faker.commerce.department()
            ),
            link: faker.internet.url(),
            priceRange: [faker.commerce.price(), faker.commerce.price()].sort(
              (a, b) => a - b
            ),
            tags,
            tagsLength: tags.join("").length,
            variantImages: Array.from(
              {
                length: faker.datatype.number({
                  min: 1,
                  max: 5,
                }),
              },
              () =>
                faker.image.imageUrl(
                  faker.datatype.number(),
                  faker.datatype.number(),
                  faker.commerce.department(),
                  true
                )
            ),
            variantTags: Array.from(
              {
                length: faker.datatype.number({
                  min: 0,
                  max: 5,
                }),
              },
              () => faker.random.words()
            ),
            objectId: `${faker.datatype.number()}_${faker.datatype.number()}`,
          };
        }
      ),
    };
    const getBestVariant = jest.fn().mockImplementation((q, hit) => hit);
    const search = jest.fn().mockImplementation((q, options) => {
      expect(q).toEqual(decode(query));
      expect(options.filters).toEqual("");
      return searchData;
    });
    const select = jest.fn().mockImplementationOnce(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`id=${userId}`);
      return wishlistResData;
    });
    jest.doMock("lib/api/search", () => ({
      getBestVariant,
    }));
    jest.doMock("lib/api/algolia", () => ({
      search,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/extension/search");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        id: userId,
        token: token,
      },
      query: {
        q: query,
        filters: filters,
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
    expect(getBestVariant).toHaveBeenCalledTimes(numHits);
    expect(search).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual(searchData);
  });

  it("Invalid page (number), invalid page, valid response with page ignored", async () => {
    // Arrange
    const userId = faker.datatype.number();
    const token = faker.datatype.uuid();
    const query = faker.random.words();
    const wishlistResData = {
      rowCount: 1,
      rows: [{ wishlist: JSON.stringify([]) }],
    };
    const numHits = faker.datatype.number({
      min: 1,
      max: 5,
    });
    const searchData = {
      hits: Array.from(
        {
          length: numHits,
        },
        () => {
          const description = faker.commerce.productDescription();
          const tags = Array.from(
            {
              length: faker.datatype.number({
                min: 0,
                max: 5,
              }),
            },
            () => faker.random.words()
          );

          return {
            name: faker.commerce.productName(),
            business: faker.company.companyName(),
            description,
            descriptionLength: description.length,
            departments: Array.from(
              {
                length: faker.datatype.number({
                  min: 0,
                  max: 5,
                }),
              },
              () => faker.commerce.department()
            ),
            link: faker.internet.url(),
            priceRange: [faker.commerce.price(), faker.commerce.price()].sort(
              (a, b) => a - b
            ),
            tags,
            tagsLength: tags.join("").length,
            variantImages: Array.from(
              {
                length: faker.datatype.number({
                  min: 1,
                  max: 5,
                }),
              },
              () =>
                faker.image.imageUrl(
                  faker.datatype.number(),
                  faker.datatype.number(),
                  faker.commerce.department(),
                  true
                )
            ),
            variantTags: Array.from(
              {
                length: faker.datatype.number({
                  min: 0,
                  max: 5,
                }),
              },
              () => faker.random.words()
            ),
            objectId: `${faker.datatype.number()}_${faker.datatype.number()}`,
          };
        }
      ),
    };

    const getBestVariant = jest.fn().mockImplementation((q, hit) => hit);
    const search = jest.fn().mockImplementation((q, options) => {
      expect(q).toEqual(decode(query));
      expect(options.page).toEqual(0);
      return searchData;
    });
    const select = jest.fn().mockImplementationOnce(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`id=${userId}`);
      return wishlistResData;
    });
    jest.doMock("lib/api/search", () => ({
      getBestVariant,
    }));
    jest.doMock("lib/api/algolia", () => ({
      search,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/extension/search");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        id: userId,
        token: token,
      },
      query: {
        q: query,
        pg: faker.datatype.number(),
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
    expect(getBestVariant).toHaveBeenCalledTimes(numHits);
    expect(search).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual(searchData);
  });

  it("Missing query, invalid query, logged once + client error response", async () => {
    // Arrange
    const getBestVariant = jest.fn().mockImplementation((q, hit) => hit);
    const search = jest.fn();
    const select = jest.fn();
    jest.doMock("lib/api/search", () => ({
      getBestVariant,
    }));
    jest.doMock("lib/api/algolia", () => ({
      search,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));

    const handler = require("pages/api/extension/search");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      query: {
        filters: "",
        pg: `${faker.datatype.number()}`,
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(getBestVariant).toHaveBeenCalledTimes(0);
    expect(search).toHaveBeenCalledTimes(0);
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("With IP, valid inputs, valid response", async () => {
    // Arrange
    const userId = faker.datatype.number();
    const token = faker.datatype.uuid();
    const query = faker.random.words();
    const ip = faker.internet.ip();
    const filters = `departments:${faker.commerce.department()} OR business:${faker.company.companyName()}`;
    const page = faker.datatype.number();
    const wishlistResData = {
      rowCount: 1,
      rows: [{ wishlist: JSON.stringify([]) }],
    };
    const numHits = faker.datatype.number({
      min: 1,
      max: 5,
    });
    const searchData = {
      hits: Array.from(
        {
          length: numHits,
        },
        () => {
          const description = faker.commerce.productDescription();
          const tags = Array.from(
            {
              length: faker.datatype.number({
                min: 0,
                max: 5,
              }),
            },
            () => faker.random.words()
          );

          return {
            name: faker.commerce.productName(),
            business: faker.company.companyName(),
            description,
            descriptionLength: description.length,
            departments: Array.from(
              {
                length: faker.datatype.number({
                  min: 0,
                  max: 5,
                }),
              },
              () => faker.commerce.department()
            ),
            link: faker.internet.url(),
            priceRange: [faker.commerce.price(), faker.commerce.price()].sort(
              (a, b) => a - b
            ),
            tags,
            tagsLength: tags.join("").length,
            variantImages: Array.from(
              {
                length: faker.datatype.number({
                  min: 1,
                  max: 5,
                }),
              },
              () =>
                faker.image.imageUrl(
                  faker.datatype.number(),
                  faker.datatype.number(),
                  faker.commerce.department(),
                  true
                )
            ),
            variantTags: Array.from(
              {
                length: faker.datatype.number({
                  min: 0,
                  max: 5,
                }),
              },
              () => faker.random.words()
            ),
            objectId: `${faker.datatype.number()}_${faker.datatype.number()}`,
          };
        }
      ),
    };
    const getBestVariant = jest
      .fn()
      .mockImplementation((q, hit) => ({ ...hit }));
    const search = jest.fn().mockImplementation((q, options) => {
      expect(q).toEqual(decode(query));
      expect(options.filters).toEqual(decode(filters));
      expect(options.page).toEqual(page);
      expect(options.aroundLatLngViaIP).toEqual(true);
      expect(options.headers["x-forwarded-for"]).toEqual(ip);
      return searchData;
    });
    const select = jest.fn().mockImplementationOnce(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`id=${userId}`);
      return wishlistResData;
    });
    jest.doMock("lib/api/search", () => ({
      getBestVariant,
    }));
    jest.doMock("lib/api/algolia", () => ({
      search,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/extension/search");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        "x-forwarded-for": ip,
        id: userId,
        token: token,
      },
      query: {
        q: query,
        filters: filters,
        pg: `${page}`,
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
    expect(getBestVariant).toHaveBeenCalledTimes(numHits);
    expect(search).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual(searchData);
  });

  it("With wishlist, valid inputs, valid response", async () => {
    // Arrange
    const query = faker.random.words();
    const token = faker.datatype.uuid();
    const userId = faker.datatype.number();
    const businessId = faker.datatype.number();
    const productId = faker.datatype.number();
    const variantIndex = faker.datatype.number();
    const description = faker.commerce.productDescription();
    const tags = Array.from(
      {
        length: faker.datatype.number({
          min: 0,
          max: 5,
        }),
      },
      () => faker.random.words()
    );
    const wishlist = {
      rowCount: 1,
      rows: [
        {
          wishlist: JSON.stringify([
            `${businessId}_${productId}_${variantIndex}`,
          ]),
        },
      ],
    };
    const searchData = {
      hits: [
        {
          name: faker.commerce.productName(),
          business: faker.company.companyName(),
          description,
          descriptionLength: description.length,
          departments: Array.from(
            {
              length: faker.datatype.number({
                min: 0,
                max: 5,
              }),
            },
            () => faker.commerce.department()
          ),
          link: faker.internet.url(),
          priceRange: [faker.commerce.price(), faker.commerce.price()].sort(
            (a, b) => a - b
          ),
          tags,
          tagsLength: tags.join("").length,
          variantImages: Array.from(
            {
              length: faker.datatype.number({
                min: 1,
                max: 5,
              }),
            },
            () =>
              faker.image.imageUrl(
                faker.datatype.number(),
                faker.datatype.number(),
                faker.commerce.department(),
                true
              )
          ),
          variantTags: Array.from(
            {
              length: faker.datatype.number({
                min: 0,
                max: 5,
              }),
            },
            () => faker.random.words()
          ),
          objectId: `${businessId}_${productId}`,
        },
      ],
    };
    const getBestVariant = jest
      .fn()
      .mockImplementation((q, hit) => ({ ...hit, variantIndex }));
    const search = jest.fn().mockImplementation((q, options) => {
      expect(q).toEqual(decode(query));
      expect(options.page).toEqual(0);
      return searchData;
    });
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`id=${userId}`);
      return wishlist;
    });
    jest.doMock("lib/api/search", () => ({
      getBestVariant,
    }));
    jest.doMock("lib/api/algolia", () => ({
      search,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    const handler = require("pages/api/extension/search");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
        id: userId,
        token: token,
      },
      query: {
        q: query,
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
    expect(getBestVariant).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({
      hits: [
        {
          ...searchData.hits[0],
          variantIndex,
          wishlist: true,
        },
      ],
    });
  });

  it("With best variant, valid inputs, valid response", async () => {
    // Arrange
    const query = "bluu shirt";
    const businessId = faker.datatype.number();
    const productId = faker.datatype.number();
    const description = faker.commerce.productDescription();
    const tags = Array.from(
      {
        length: faker.datatype.number({
          min: 0,
          max: 5,
        }),
      },
      () => faker.random.words()
    );
    const searchData = {
      hits: [
        {
          name: faker.commerce.productName(),
          business: faker.company.companyName(),
          description,
          descriptionLength: description.length,
          departments: Array.from(
            {
              length: faker.datatype.number({
                min: 0,
                max: 5,
              }),
            },
            () => faker.commerce.department()
          ),
          link: faker.internet.url(),
          priceRange: [faker.commerce.price(), faker.commerce.price()].sort(
            (a, b) => a - b
          ),
          tags,
          tagsLength: tags.join("").length,
          variantImages: Array.from(
            {
              length: 3,
            },
            () =>
              faker.image.imageUrl(
                faker.datatype.number(),
                faker.datatype.number(),
                faker.commerce.department(),
                true
              )
          ),
          variantTags: ["red", "blue", "green"],
          objectId: `${businessId}_${productId}`,
        },
      ],
    };
    const search = jest.fn().mockImplementation((q, options) => {
      expect(q).toEqual(decode(query));
      expect(options.page).toEqual(0);
      return searchData;
    });
    const select = jest.fn();
    jest.doMock("lib/api/algolia", () => ({
      search,
    }));
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    jest.doMock("lib/api/search", () => ({
      ...jest.requireActual("lib/api/search"),
    }));
    const handler = require("pages/api/extension/search");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      query: {
        q: query,
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
    expect(search).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({
      hits: [
        {
          ...searchData.hits[0],
          variantIndex: 1,
        },
      ],
    });
  });
});
