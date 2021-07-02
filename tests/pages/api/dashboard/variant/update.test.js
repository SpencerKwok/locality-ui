const faker = require("faker");
const xss = require("xss");
const fs = require("fs");

// Get image data for testing
const imageFiles = [
  fs.readFileSync("tests/pages/api/dashboard/variant/image1.b64").toString(),
  fs.readFileSync("tests/pages/api/dashboard/variant/image2.b64").toString(),
  fs.readFileSync("tests/pages/api/dashboard/variant/image3.b64").toString(),
];
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
    const productId = faker.datatype.number();
    const variantIndex = faker.datatype.number();
    const newVariantTag = faker.random.words();
    const newVariantImage =
      imageFiles[faker.datatype.number({ min: 0, max: 2 })];
    const getObject = jest.fn().mockImplementation(async (params) => {
      expect(params).toEqual(`${userId}_${productId}`);
      return null;
    });
    const partialUpdateObject = jest.fn();
    const upload = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantImage: newVariantImage,
          variantTag: newVariantTag,
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
    expect(upload).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (upload variant image), valid inputs, logged once + server error response", async () => {
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
    const newVariantTag = faker.random.words();
    const newVariantImage =
      imageFiles[faker.datatype.number({ min: 0, max: 2 })];
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
    const upload = jest
      .fn()
      .mockImplementation(async (params, { public_id }) => {
        expect(params).toEqual(newVariantImage);
        expect(public_id).toEqual(`${userId}/${productId}/${variantIndex}`);
        return null;
      });
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantImage: newVariantImage,
          variantTag: newVariantTag,
        },
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
    expect(getObject).toHaveBeenCalledTimes(1);
    expect(partialUpdateObject).toHaveBeenCalledTimes(0);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Database error (updating product), valid inputs, logged once + server error response", async () => {
    // Arrange
    const url = faker.internet.url();
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
    const newVariantTag = faker.random.words();
    const newVariantImage =
      imageFiles[faker.datatype.number({ min: 0, max: 2 })];
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
          url,
          ...variantImages.slice(variantIndex + 1),
        ],
        variant_tags: [
          ...variantTags.slice(0, variantIndex),
          newVariantTag,
          ...variantTags.slice(variantIndex + 1),
        ],
      });
      return new Error("Failed to update object");
    });
    const upload = jest
      .fn()
      .mockImplementation(async (params, { public_id }) => {
        expect(params).toEqual(newVariantImage);
        expect(public_id).toEqual(`${userId}/${productId}/${variantIndex}`);
        return url;
      });
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantImage: newVariantImage,
          variantTag: newVariantTag,
        },
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
    expect(getObject).toHaveBeenCalledTimes(1);
    expect(partialUpdateObject).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(500);
  });

  it("Health check, valid inputs, valid response", async () => {
    // Arrange
    const url = faker.internet.url();
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
    const newVariantTag = faker.random.words();
    const newVariantImage =
      imageFiles[faker.datatype.number({ min: 0, max: 2 })];
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
          url,
          ...variantImages.slice(variantIndex + 1),
        ],
        variant_tags: [
          ...variantTags.slice(0, variantIndex),
          newVariantTag,
          ...variantTags.slice(variantIndex + 1),
        ],
      });
      return null;
    });
    const upload = jest
      .fn()
      .mockImplementation(async (params, { public_id }) => {
        expect(params).toEqual(newVariantImage);
        expect(public_id).toEqual(`${userId}/${productId}/${variantIndex}`);
        return url;
      });
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantImage: newVariantImage,
          variantTag: newVariantTag,
        },
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
    expect(partialUpdateObject).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({ variantImage: url });
  });

  it("Index out of bounds (small), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const variantIndex = -faker.datatype.number({ min: 1 });
    const productId = faker.datatype.number();
    const newVariantTag = faker.random.words();
    const newVariantImage =
      imageFiles[faker.datatype.number({ min: 0, max: 2 })];
    const getObject = jest.fn();
    const partialUpdateObject = jest.fn();
    const upload = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantImage: newVariantImage,
          variantTag: newVariantTag,
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
    expect(upload).toHaveBeenCalledTimes(0);
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
    const newVariantTag = faker.random.words();
    const newVariantImage =
      imageFiles[faker.datatype.number({ min: 0, max: 2 })];
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
    const upload = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantImage: newVariantImage,
          variantTag: newVariantTag,
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
    expect(upload).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Ignore request id from non-admins, invalid inputs, valid response", async () => {
    // Arrange
    const url = faker.internet.url();
    const productId = faker.datatype.number();
    const numVariants = faker.datatype.number({ min: 1, max: 5 });
    const variantIndex = faker.datatype.number({
      min: 0,
      max: numVariants - 1,
    });
    const variantTags = Array.from({ length: numVariants }, () =>
      faker.random.words()
    );
    const variantImages = Array.from({ length: numVariants }, () =>
      faker.internet.url()
    );
    const newVariantTag = faker.random.words();
    const newVariantImage =
      imageFiles[faker.datatype.number({ min: 0, max: 2 })];
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
          url,
          ...variantImages.slice(variantIndex + 1),
        ],
        variant_tags: [
          ...variantTags.slice(0, variantIndex),
          newVariantTag,
          ...variantTags.slice(variantIndex + 1),
        ],
      });
      return null;
    });
    const upload = jest
      .fn()
      .mockImplementation(async (params, { public_id }) => {
        expect(params).toEqual(newVariantImage);
        expect(public_id).toEqual(`${userId}/${productId}/${variantIndex}`);
        return url;
      });
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantImage: newVariantImage,
          variantTag: newVariantTag,
        },
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
    expect(partialUpdateObject).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({ variantImage: url });
  });

  it("Invalid product id (string), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const variantIndex = faker.datatype.number();
    const newVariantTag = faker.random.words();
    const newVariantImage =
      imageFiles[faker.datatype.number({ min: 0, max: 2 })];

    const getObject = jest.fn();
    const partialUpdateObject = jest.fn();
    const upload = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantIndex,
          variantImage: newVariantImage,
          variantTag: newVariantTag,
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
    expect(upload).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid variant index (string), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const variantIndex = faker.random.word();
    const productId = faker.datatype.number();
    const newVariantTag = faker.random.words();
    const newVariantImage =
      imageFiles[faker.datatype.number({ min: 0, max: 2 })];
    const getObject = jest.fn();
    const partialUpdateObject = jest.fn();
    const upload = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantImage: newVariantImage,
          variantTag: newVariantTag,
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
    expect(upload).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid variant image (number), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const variantIndex = faker.datatype.number();
    const newVariantTag = faker.random.words();
    const getObject = jest.fn();
    const partialUpdateObject = jest.fn();
    const upload = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantIndex,
          variantImage: faker.datatype.number(),
          variantTag: newVariantTag,
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
    expect(upload).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Invalid variant tag (number), invalid inputs, logged once + client error response", async () => {
    // Arrange
    const variantIndex = faker.datatype.number();
    const newVariantImage =
      imageFiles[faker.datatype.number({ min: 0, max: 2 })];
    const getObject = jest.fn();
    const partialUpdateObject = jest.fn();
    const upload = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantIndex,
          variantImage: newVariantImage,
          variantTag: faker.datatype.number(),
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
    expect(upload).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing variant index, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const newVariantImage =
      imageFiles[faker.datatype.number({ min: 0, max: 2 })];
    const newVariantTag = faker.random.words();
    const getObject = jest.fn();
    const partialUpdateObject = jest.fn();
    const upload = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantTag: newVariantTag,
          variantImage: newVariantImage,
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
    expect(upload).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing variant image, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const variantIndex = faker.datatype.number();
    const newVariantTag = faker.random.words();
    const getObject = jest.fn();
    const partialUpdateObject = jest.fn();
    const upload = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantIndex,
          variantTag: newVariantTag,
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
    expect(upload).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("Missing variant tag, invalid inputs, logged once + client error response", async () => {
    // Arrange
    const variantIndex = faker.datatype.number();
    const newVariantImage =
      imageFiles[faker.datatype.number({ min: 0, max: 2 })];
    const getObject = jest.fn();
    const partialUpdateObject = jest.fn();
    const upload = jest.fn();
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantIndex,
          variantImage: newVariantImage,
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
    expect(upload).toHaveBeenCalledTimes(0);
    expect(mockRes.statusCode).toBe(400);
  });

  it("XSS attack, valid inputs, valid response", async () => {
    // Arrange
    const url = faker.internet.url();
    const productId = faker.datatype.number();
    const numVariants = faker.datatype.number({ min: 1, max: 5 });
    const variantIndex = faker.datatype.number({
      min: 0,
      max: numVariants - 1,
    });
    const variantTags = Array.from({ length: numVariants }, () =>
      faker.random.words()
    );
    const variantImages = Array.from({ length: numVariants }, () =>
      faker.internet.url()
    );
    const newVariantTag = `<script>window.onload = function() {var link=document.getElementsByTagName("a");link[0].href="${faker.internet.url()}";}</script>`;
    const newVariantImage = `<script src=”${faker.internet.url()}”/>`;
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
          url,
          ...variantImages.slice(variantIndex + 1),
        ],
        variant_tags: [
          ...variantTags.slice(0, variantIndex),
          xss(newVariantTag),
          ...variantTags.slice(variantIndex + 1),
        ],
      });
      return null;
    });
    const upload = jest
      .fn()
      .mockImplementation(async (params, { public_id }) => {
        expect(params).toEqual(xss(newVariantImage));
        expect(public_id).toEqual(`${userId}/${productId}/${variantIndex}`);
        return url;
      });
    jest.doMock("lib/api/cloudinary", () => ({
      upload,
    }));
    jest.doMock("lib/api/algolia", () => ({
      getObject,
      partialUpdateObject,
    }));
    const handler = require("pages/api/dashboard/variant/update");
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
          variantImage: newVariantImage,
          variantTag: newVariantTag,
        },
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
    expect(partialUpdateObject).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(mockRes.statusCode).toBe(200);
    expect(actual).toEqual({ variantImage: url });
  });
});
