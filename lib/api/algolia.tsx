import { camelCase, mapKeys } from "lodash";

import AlgoliaSearch from "algoliasearch";

import SumoLogic from "lib/api/sumologic";
import {
  ALGOLIASEARCH_APPLICATION_ID,
  ALGOLIASEARCH_API_KEY,
  ALGOLIASEARCH_INDEX,
} from "lib/env";

import type {
  ChunkOptions,
  GetObjectOptions,
  ObjectWithObjectID,
  PartialUpdateObjectsOptions,
  SaveObjectsOptions,
  SearchOptions,
  SearchResponse,
} from "@algolia/client-search";
import type { RequestOptions } from "@algolia/transporter";
import type { Product } from "common/Schema";

const client = AlgoliaSearch(
  ALGOLIASEARCH_APPLICATION_ID ?? "",
  ALGOLIASEARCH_API_KEY ?? ""
);
const index = client.initIndex(ALGOLIASEARCH_INDEX ?? "");

const algoliaClient: {
  deleteObjects: (objectIDs: ReadonlyArray<string>) => Promise<Error | null>;
  getObject: (
    objectID: string,
    options?: GetObjectOptions & RequestOptions
  ) => Promise<Product | null>;
  getObjects: (
    objectIDs: Array<string>,
    options?: GetObjectOptions & RequestOptions
  ) => Promise<Array<Product | null> | null>;
  partialUpdateObject: (
    object: Readonly<Record<string, any>>,
    options?: ChunkOptions & PartialUpdateObjectsOptions & RequestOptions
  ) => Promise<Error | null>;
  saveObject: (
    object: Readonly<Record<string, any>>,
    options?: ChunkOptions & RequestOptions & SaveObjectsOptions
  ) => Promise<Error | null>;
  saveObjects: (
    object: Array<Readonly<Record<string, any>>>,
    options?: ChunkOptions & RequestOptions & SaveObjectsOptions
  ) => Promise<Error | null>;
  search: (
    query: string,
    options?: RequestOptions & SearchOptions
  ) => Promise<SearchResponse<Product> | null>;
} = {
  deleteObjects: async (objectIDs) => {
    let error: Error | null = null;
    await index.deleteObjects(objectIDs).catch((err) => {
      SumoLogic.log({
        level: "error",
        message: `Failed to delete objects from Algolia: ${err.message}`,
        params: { objectIDs },
      });
      error = err;
    });
    return error;
  },
  getObject: async (objectID, options) => {
    let object: Product | null = null;
    await index
      .getObject(objectID, options)
      .then((res?: ObjectWithObjectID) => {
        if (res) {
          //@ts-expect-error: Algolia objects use snake case
          // while objects on the front end use camel case.
          // We know the conversion is valid, so we ignore
          // typescript here
          object = {
            ...mapKeys(res, (v, k) => camelCase(k)),
          };
        }
      })
      .catch((err) => {
        SumoLogic.log({
          level: "error",
          message: `Failed to get object from Algolia: ${err.message}`,
          params: { objectID, options },
        });
      });
    return object;
  },
  getObjects: async (objectIDs, options) => {
    let objects: Array<Product> | null = null;
    await index
      .getObjects(objectIDs, options)
      .then((res) => {
        //@ts-expect-error: Algolia objects use snake case
        // while objects on the front end use camel case.
        // We know the conversion is valid, so we ignore
        // typescript here
        objects = res.results.filter(Boolean).map((product) => ({
          ...mapKeys(product, (v, k) => camelCase(k)),
        }));
      })
      .catch((err) => {
        SumoLogic.log({
          level: "error",
          message: `Failed to get objects from Algolia: ${err.message}`,
          params: { objectIDs, options },
        });
      });
    return objects;
  },
  partialUpdateObject: async (object, options) => {
    let error: Error | null = null;
    await index.partialUpdateObject(object, options).catch((err) => {
      SumoLogic.log({
        level: "error",
        message: `Failed to partial update object from Algolia: ${err.message}`,
        params: { object, options },
      });
      error = err;
    });
    return error;
  },
  saveObject: async (object, options) => {
    let error: Error | null = null;
    await index.saveObject(object, options).catch((err) => {
      SumoLogic.log({
        level: "error",
        message: `Failed to save object from Algolia: ${err.message}`,
        params: { object, options },
      });
      error = err;
    });
    return error;
  },
  saveObjects: async (objects, options) => {
    let error: Error | null = null;
    await index.saveObjects(objects, options).catch((err) => {
      SumoLogic.log({
        level: "error",
        message: `Failed to save objects from Algolia: ${err.message}`,
        params: { objects, options },
      });
      error = err;
    });
    return error;
  },
  search: async (query, options) => {
    let results: SearchResponse<Product> | null = null;
    await index
      .search(query, options)
      .then((res) => {
        results = {
          ...res,
          //@ts-expect-error: Algolia objects use snake case
          // while objects on the front end use camel case.
          // We know the conversion is valid, so we ignore
          // typescript here
          hits: res.hits.map((hit) => ({
            ...mapKeys(hit, (v, k) => camelCase(k)),
          })),
        };
      })
      .catch((err) => {
        SumoLogic.log({
          level: "error",
          message: `Failed to save objects from Algolia: ${err.message}`,
          params: { query, options },
        });
      });
    return results;
  },
};

export default algoliaClient;
