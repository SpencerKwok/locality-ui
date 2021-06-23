describe("Business", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Simple", () => {
    const log = jest.fn();
    jest.doMock("lib/api/sumologic", () => ({
      log,
    }));
    const select = jest.fn().mockImplementation(async () => {
      return {
        command: "",
        fields: [],
        rowCount: 1,
        rows: [
          {
            id: 0,
            name: "Locality",
            address: "6408 Chelmsford Street",
            city: "Richmond",
            province: "British Columbia",
            country: "Canada",
            latitude: "49.15655",
            longitude: "-123.15441",
            logo: "https://res.cloudinary.com/hzu2rm8bn/image/upload/v1623910137/logo/0.webp",
            departments: "[]",
            upload_settings: "{}",
            homepages: '{"homepage":""}',
            next_product_id: 24879,
          },
        ],
        oid: -1,
      };
    });
    jest.doMock("lib/api/postgresql", () => ({
      select,
    }));

    const handler = require("pages/api/business");
    const httpMocks = require("node-mocks-http");

    const mockReq = httpMocks.createRequest({
      method: "GET",
      query: {
        id: "0",
      },
      headers: {
        "content-type": "application/json",
        charset: "utf-8",
      },
    });
    const mockRes = httpMocks.createResponse();

    mockReq.method = "GET";
    mockReq.query.id = "0";
    mockReq.cookies["content-type"] = "application/json";
    mockReq.cookies["charset"] = "utf-8";

    return handler
      .default(mockReq, mockRes)
      .then(() => {
        expect(log).toHaveBeenCalledTimes(0);
        expect(select).toHaveBeenCalledTimes(1);
        expect(mockRes.statusCode).toBe(200);
        return mockRes.json();
      })
      .then((data) => {
        const actual = JSON.parse(data._getData());
        expect(actual).toEqual({
          business: {
            id: 0,
            name: "Locality",
            address: "6408 Chelmsford Street",
            city: "Richmond",
            province: "British Columbia",
            country: "Canada",
            logo: "https://res.cloudinary.com/hzu2rm8bn/image/upload/v1623910137/logo/0.webp",
            departments: [],
            uploadSettings: {},
            homepages: { homepage: "" },
          },
        });
      });
  });
});
