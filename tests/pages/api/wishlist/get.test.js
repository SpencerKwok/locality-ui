const faker = require("faker");

const userId = faker.datatype.number();
const log = jest.fn();
const runMiddlewareUser = jest.fn().mockImplementation(async (req) => {
  req.locals = { user: { id: userId } };
});
describe("Get Wishlist", () => {
  beforeAll(() => {
    jest.doMock("lib/api/sumologic", () => ({
      log,
    }));
    jest.doMock("lib/api/middleware", () => ({
      runMiddlewareUser,
    }));
  });

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Database error (getting wishlist), valid inputs, logged once + server error response", async () => {
    // Arrange
    const numObjects = faker.datatype.number({ min: 1, max: 5 });
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`id=${userId}`);
      return null;
    });
    const getObjects = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObjects,
    }));
    const handler = require("pages/api/wishlist/get");
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
    expect(runMiddlewareUser).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(getObjects).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (getting products), valid inputs, logged once + server error response", async () => {
    // Arrange
    const numObjects = faker.datatype.number({ min: 1, max: 5 });
    const objects = Array.from(
      {
        length: numObjects,
      },
      () => `${faker.datatype.number()}_${faker.datatype.number()}`
    );
    const variantIndices = Array.from({ length: numObjects }, () =>
      faker.datatype.number()
    );
    const wishlist = objects.map((x, i) => `${x}_${variantIndices[i]}`);
    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`id=${userId}`);
      return {
        rowCount: 1,
        rows: [{ wishlist: JSON.stringify(wishlist) }],
      };
    });
    const getObjects = jest.fn().mockImplementation(async (ids) => {
      expect(ids).toEqual(objects);
      return null;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObjects,
    }));
    const handler = require("pages/api/wishlist/get");
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
    expect(runMiddlewareUser).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(getObjects).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Invalid method, valid inputs, logged once + client error response", async () => {
    // Arrange
    const select = jest.fn();
    const getObjects = jest.fn();
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObjects,
    }));
    const handler = require("pages/api/wishlist/get");
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
    expect(runMiddlewareUser).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(0);
    expect(getObjects).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const numObjects = faker.datatype.number({ min: 1, max: 5 });
    const objects = Array.from(
      {
        length: numObjects,
      },
      () => `${faker.datatype.number()}_${faker.datatype.number()}`
    );
    const variantIndices = Array.from({ length: numObjects }, () =>
      faker.datatype.number()
    );
    const wishlist = objects.map((x, i) => `${x}_${variantIndices[i]}`);
    const searchData = wishlist.map((id) => {
      const [businessId, productId] = id.split();
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
        objectId: `${businessId}_${productId}`,
      };
    });

    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`id=${userId}`);
      return {
        rowCount: 1,
        rows: [{ wishlist: JSON.stringify(wishlist) }],
      };
    });
    const getObjects = jest.fn().mockImplementation(async (ids) => {
      expect(ids).toEqual(objects);
      return searchData;
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObjects,
    }));
    const handler = require("pages/api/wishlist/get");
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
    expect(runMiddlewareUser).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(getObjects).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({
      products: searchData.map((x, i) => ({
        ...x,
        variantIndex: variantIndices[i],
      })),
    });
  });

  it("Wishlist item refers to non-existent object, valid inputs, valid response with valid objects", async () => {
    // Arrange
    const numObjects = faker.datatype.number({ min: 1, max: 5 });
    const missingItemIndex = faker.datatype.number({
      min: 0,
      max: numObjects - 1,
    });
    const objects = Array.from(
      {
        length: numObjects,
      },
      () => `${faker.datatype.number()}_${faker.datatype.number()}`
    );
    const variantIndices = Array.from({ length: numObjects }, () =>
      faker.datatype.number()
    );
    const wishlist = objects.map((x, i) => `${x}_${variantIndices[i]}`);
    const searchData = wishlist.map((id) => {
      const [businessId, productId] = id.split();
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
        objectId: `${businessId}_${productId}`,
      };
    });

    const select = jest.fn().mockImplementation(async (params) => {
      expect(params.table).toEqual("users");
      expect(params.conditions).toEqual(`id=${userId}`);
      return {
        rowCount: 1,
        rows: [{ wishlist: JSON.stringify(wishlist) }],
      };
    });
    const getObjects = jest.fn().mockImplementation(async (ids) => {
      expect(ids).toEqual(objects);
      return [
        ...searchData.slice(0, missingItemIndex),
        ...searchData.slice(missingItemIndex + 1),
      ];
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObjects,
    }));
    const handler = require("pages/api/wishlist/get");
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
    expect(runMiddlewareUser).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(getObjects).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({
      products: [
        ...searchData.slice(0, missingItemIndex),
        ...searchData.slice(missingItemIndex + 1),
      ].map((x, i) => ({
        ...x,
        variantIndex: variantIndices[i],
      })),
    });
  });
});
