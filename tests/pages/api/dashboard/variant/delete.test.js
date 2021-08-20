/**
 * Delete Variant to Product Unit Tests
 *
 * @group unit
 * @group website
 * @group dashboard
 * @group variant
 * @group variant-delete
 */

const faker = require("faker");
const xss = require("xss");

const userId = faker.datatype.number();
const log = jest.fn();
const runMiddlewareBusiness = jest.fn().mockImplementation(async (req) => {
  req.locals = { user: { id: userId } };
});
describe("Update variant", () => {
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

  it("Database error (getting product), valid inputs, logged once + server error response", async () => {
    // Arrange
    const numVariants = faker.datatype.number({ min: 1, max: 5 });
    const variantIndex = faker.datatype.number({
      min: 0,
      max: numVariants - 1,
    });
    const productId = faker.datatype.number();
    const getObject = jest.fn().mockImplementation(async (params) => {
      expect(params).toEqual(`${userId}_${productId}`);
      return null;
    });
    const partialUpdateObject = jest.fn();
    const deleteResources = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      deleteResources,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        product: {
          id: productId,
          variantIndex,
        },
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(getObject).toHaveBeenCalledTimes(1);
    expect(partialUpdateObject).toHaveBeenCalledTimes(0);
    expect(deleteResources).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (updating product), valid inputs, logged once + server error response", async () => {
    // Arrange
    const numVariants = faker.datatype.number({ min: 1, max: 5 });
    const variantIndex = faker.datatype.number({
      min: 0,
      max: numVariants - 1,
    });
    const productId = faker.datatype.number();
    const variantTags = Array.from({ length: numVariants }, () =>
      faker.random.words()
    );
    const variantImages = Array.from({ length: numVariants }, () =>
      faker.internet.url()
    );
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
    const product = {
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
      variantImages: Array.from(variantImages),
      variantTags: Array.from(variantTags),
      objectId: `${userId}_${productId}`,
    };
    const getObject = jest.fn().mockImplementation(async (params) => {
      expect(params).toEqual(`${userId}_${productId}`);
      return product;
    });
    const partialUpdateObject = jest.fn().mockImplementation(async (params) => {
      expect(params).toEqual({
        objectID: `${userId}_${productId}`,
        variant_images: [
          ...variantImages.slice(0, variantIndex),
          ...variantImages.slice(variantIndex + 1),
        ],
        variant_tags: [
          ...variantTags.slice(0, variantIndex),
          ...variantTags.slice(variantIndex + 1),
        ],
      });
      return new Error("Yikes...");
    });
    const deleteResources = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      deleteResources,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        product: {
          id: productId,
          variantIndex,
        },
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(getObject).toHaveBeenCalledTimes(1);
    expect(partialUpdateObject).toHaveBeenCalledTimes(1);
    expect(deleteResources).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (deleting variant), valid inputs, valid response", async () => {
    // Arrange
    const numVariants = faker.datatype.number({ min: 1, max: 5 });
    const variantIndex = faker.datatype.number({
      min: 0,
      max: numVariants - 1,
    });
    const productId = faker.datatype.number();
    const variantTags = Array.from({ length: numVariants }, () =>
      faker.random.words()
    );
    const variantImages = Array.from({ length: numVariants }, () =>
      faker.internet.url()
    );
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
    const product = {
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
      variantImages: Array.from(variantImages),
      variantTags: Array.from(variantTags),
      objectId: `${userId}_${productId}`,
    };
    const getObject = jest.fn().mockImplementation(async (params) => {
      expect(params).toEqual(`${userId}_${productId}`);
      return product;
    });
    const partialUpdateObject = jest.fn().mockImplementation(async (params) => {
      expect(params).toEqual({
        objectID: `${userId}_${productId}`,
        variant_images: [
          ...variantImages.slice(0, variantIndex),
          ...variantImages.slice(variantIndex + 1),
        ],
        variant_tags: [
          ...variantTags.slice(0, variantIndex),
          ...variantTags.slice(variantIndex + 1),
        ],
      });
      return null;
    });
    const deleteResources = jest.fn().mockImplementation(async (params) => {
      expect(params.length).toEqual(1);
      expect(params[0]).toEqual(`${userId}/${productId}/${variantIndex}`);
      return new Error("Failed to delete extra images, sad");
    });
    jest.doMock("lib/api/cloudinary", () => ({
      deleteResources,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        product: {
          id: productId,
          variantIndex,
        },
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(getObject).toHaveBeenCalledTimes(1);
    expect(partialUpdateObject).toHaveBeenCalledTimes(1);
    expect(deleteResources).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const numVariants = faker.datatype.number({ min: 1, max: 5 });
    const variantIndex = faker.datatype.number({
      min: 0,
      max: numVariants - 1,
    });
    const productId = faker.datatype.number();
    const variantTags = Array.from({ length: numVariants }, () =>
      faker.random.words()
    );
    const variantImages = Array.from({ length: numVariants }, () =>
      faker.internet.url()
    );
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
    const product = {
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
      variantImages: Array.from(variantImages),
      variantTags: Array.from(variantTags),
      objectId: `${userId}_${productId}`,
    };
    const getObject = jest.fn().mockImplementation(async (params) => {
      expect(params).toEqual(`${userId}_${productId}`);
      return product;
    });
    const partialUpdateObject = jest.fn().mockImplementation(async (params) => {
      expect(params).toEqual({
        objectID: `${userId}_${productId}`,
        variant_images: [
          ...variantImages.slice(0, variantIndex),
          ...variantImages.slice(variantIndex + 1),
        ],
        variant_tags: [
          ...variantTags.slice(0, variantIndex),
          ...variantTags.slice(variantIndex + 1),
        ],
      });
      return null;
    });
    const deleteResources = jest.fn().mockImplementation(async (params) => {
      expect(params.length).toEqual(1);
      expect(params[0]).toEqual(`${userId}/${productId}/${variantIndex}`);
      return null;
    });
    jest.doMock("lib/api/cloudinary", () => ({
      deleteResources,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        product: {
          id: productId,
          variantIndex,
        },
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(getObject).toHaveBeenCalledTimes(1);
    expect(partialUpdateObject).toHaveBeenCalledTimes(1);
    expect(deleteResources).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Index out of bounds (small), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const numVariants = faker.datatype.number({ min: 1, max: 5 });
    const variantIndex = -faker.datatype.number({ min: 1 });
    const productId = faker.datatype.number();
    const variantTags = Array.from({ length: numVariants }, () =>
      faker.random.words()
    );
    const variantImages = Array.from({ length: numVariants }, () =>
      faker.internet.url()
    );
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
    const product = {
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
      variantImages: Array.from(variantImages),
      variantTags: Array.from(variantTags),
      objectId: `${userId}_${productId}`,
    };

    const getObject = jest.fn().mockImplementation(async (params) => {
      expect(params).toEqual(`${userId}_${productId}`);
      return product;
    });
    const partialUpdateObject = jest.fn();
    const deleteResources = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      deleteResources,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        product: {
          id: productId,
          variantIndex,
        },
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(getObject).toHaveBeenCalledTimes(0);
    expect(partialUpdateObject).toHaveBeenCalledTimes(0);
    expect(deleteResources).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Index out of bounds (large), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const numVariants = faker.datatype.number({ min: 1, max: 5 });
    const variantIndex = numVariants;
    const productId = faker.datatype.number();
    const variantTags = Array.from({ length: numVariants }, () =>
      faker.random.words()
    );
    const variantImages = Array.from({ length: numVariants }, () =>
      faker.internet.url()
    );
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
    const product = {
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
      variantImages: Array.from(variantImages),
      variantTags: Array.from(variantTags),
      objectId: `${userId}_${productId}`,
    };

    const getObject = jest.fn().mockImplementation(async (params) => {
      expect(params).toEqual(`${userId}_${productId}`);
      return product;
    });
    const partialUpdateObject = jest.fn();
    const deleteResources = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      deleteResources,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        product: {
          id: productId,
          variantIndex,
        },
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(getObject).toHaveBeenCalledTimes(1);
    expect(partialUpdateObject).toHaveBeenCalledTimes(0);
    expect(deleteResources).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Ignore request id from non-admins, valid inputs, valid response", async () => {
    // Arrange
    const numVariants = faker.datatype.number({ min: 1, max: 5 });
    const variantIndex = faker.datatype.number({
      min: 0,
      max: numVariants - 1,
    });
    const productId = faker.datatype.number();
    const variantTags = Array.from({ length: numVariants }, () =>
      faker.random.words()
    );
    const variantImages = Array.from({ length: numVariants }, () =>
      faker.internet.url()
    );
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
    const product = {
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
      variantImages: Array.from(variantImages),
      variantTags: Array.from(variantTags),
      objectId: `${userId}_${productId}`,
    };
    const getObject = jest.fn().mockImplementation(async (params) => {
      expect(params).toEqual(`${userId}_${productId}`);
      return product;
    });
    const partialUpdateObject = jest.fn().mockImplementation(async (params) => {
      expect(params).toEqual({
        objectID: `${userId}_${productId}`,
        variant_images: [
          ...variantImages.slice(0, variantIndex),
          ...variantImages.slice(variantIndex + 1),
        ],
        variant_tags: [
          ...variantTags.slice(0, variantIndex),
          ...variantTags.slice(variantIndex + 1),
        ],
      });
      return null;
    });
    const deleteResources = jest.fn().mockImplementation(async (params) => {
      expect(params.length).toEqual(1);
      expect(params[0]).toEqual(`${userId}/${productId}/${variantIndex}`);
      return null;
    });
    jest.doMock("lib/api/cloudinary", () => ({
      deleteResources,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: faker.datatype.number(),
        product: {
          id: productId,
          variantIndex,
        },
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(0);
    expect(getObject).toHaveBeenCalledTimes(1);
    expect(partialUpdateObject).toHaveBeenCalledTimes(1);
    expect(deleteResources).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(204);
  });

  it("Invalid product id (string), valid inputs, logged once + client error response", async () => {
    // Arrange
    const getObject = jest.fn();
    const partialUpdateObject = jest.fn();
    const deleteResources = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      deleteResources,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        product: {
          id: faker.random.word(),
          variantIndex: faker.datatype.number(),
        },
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(getObject).toHaveBeenCalledTimes(0);
    expect(partialUpdateObject).toHaveBeenCalledTimes(0);
    expect(deleteResources).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid variant index (string), valid inputs, logged once + client error response", async () => {
    // Arrange
    const getObject = jest.fn();
    const partialUpdateObject = jest.fn();
    const deleteResources = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      deleteResources,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        product: {
          id: faker.datatype.number(),
          variantIndex: faker.random.word(),
        },
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(getObject).toHaveBeenCalledTimes(0);
    expect(partialUpdateObject).toHaveBeenCalledTimes(0);
    expect(deleteResources).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing product id, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const getObject = jest.fn();
    const partialUpdateObject = jest.fn();
    const deleteResources = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      deleteResources,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        product: {
          variantIndex: faker.datatype.number(),
        },
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(getObject).toHaveBeenCalledTimes(0);
    expect(partialUpdateObject).toHaveBeenCalledTimes(0);
    expect(deleteResources).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing variant index, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const getObject = jest.fn();
    const partialUpdateObject = jest.fn();
    const deleteResources = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      deleteResources,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/delete");
    const httpMocks = require("node-mocks-http");
    const mockReq = httpMocks.createRequest({
      method: "POST",
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
      body: {
        id: userId,
        product: {
          id: faker.datatype.number(),
        },
      },
    });
    const mockRes = httpMocks.createResponse();

    // Act
    void (await handler.default(mockReq, mockRes));

    // Assert
    expect(log).toHaveBeenCalledTimes(1);
    expect(getObject).toHaveBeenCalledTimes(0);
    expect(partialUpdateObject).toHaveBeenCalledTimes(0);
    expect(deleteResources).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });
});
