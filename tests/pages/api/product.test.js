const faker = require("faker");

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

  it("Product does not exist, invalid id, logged once + client error response", async () => {
    // Arrange
    const id = `${faker.datatype.number()}_${faker.datatype.number()}`;
    const getObject = jest.fn().mockImplementation(async (params) => {
      if (params === id) {
        return null;
      }

      // Should never reach here
      throw new Error();
    });
    jest.doMock("lib/api/algolia", () => ({
      getObject,
    }));
    const handler = require("pages/api/product");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id,
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
    expect(getObject).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Database error, valid inputs, logged once + client error response", async () => {
    // Arrange
    const id = `${faker.datatype.number()}_${faker.datatype.number()}`;
    const getObject = jest.fn().mockImplementation(async (params) => {
      if (params === id) {
        return null;
      }

      // Should never reach here
      throw new Error();
    });
    jest.doMock("lib/api/algolia", () => ({
      getObject,
    }));
    const handler = require("pages/api/product");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id,
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
    expect(getObject).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
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
    const resData = {
      name: faker.commerce.productName(),
      business: faker.company.companyName(),
      description,
      description_length: description.length,
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
      price_range: [faker.commerce.price(), faker.commerce.price()].sort(
        (a, b) => a - b
      ),
      tags,
      tags_length: tags.join("").length,
      variant_images: Array.from(
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
      variant_tags: Array.from(
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
    const getObject = jest.fn().mockImplementation((id) => {
      if (id === resData.objectId) {
        return resData;
      }

      // Should never reach here
      throw new Error();
    });
    jest.doMock("lib/api/algolia", () => ({
      getObject,
    }));
    const handler = require("pages/api/product");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id: resData.objectId,
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
    expect(getObject).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({
      product: {
        name: resData.name,
        business: resData.business,
        description: resData.description,
        descriptionLength: resData.description_length,
        departments: resData.departments,
        link: resData.link,
        priceRange: resData.price_range,
        tags: resData.tags,
        tagsLength: resData.tags_length,
        variantImages: resData.variant_images,
        variantTags: resData.variant_tags,
        objectId: resData.objectId,
      },
    });
  });

  it("Invalid method, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const getObject = jest.fn();
    jest.doMock("lib/api/algolia", () => ({
      getObject,
    }));
    const handler = require("pages/api/product");
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
    expect(getObject).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid id type (number), invalid id, logged once + client error response", async () => {
    // Arrange
    const getObject = jest.fn();
    jest.doMock("lib/api/algolia", () => ({
      getObject,
    }));
    const handler = require("pages/api/product");
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
    expect(getObject).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid id type (string), invalid id, logged once + client error response", async () => {
    // Arrange
    const getObject = jest.fn();
    jest.doMock("lib/api/algolia", () => ({
      getObject,
    }));
    const handler = require("pages/api/product");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id: `${faker.random.word()}_${faker.random.word()}`,
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
    expect(getObject).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });
});
