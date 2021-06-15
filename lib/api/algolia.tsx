import { camelCase, mapKeys } from "lodash";

import AlgoliaSearch from "algoliasearch";

import SumoLogic from "./sumologic";
import {
  ALGOLIASEARCH_APPLICATION_ID,
  ALGOLIASEARCH_API_KEY,
  ALGOLIASEARCH_INDEX,
} from "../env";

import type {
  GetObjectOptions,
  Hit,
  ObjectWithObjectID,
  PartialUpdateObjectsOptions,
  SaveObjectsOptions,
  SearchOptions,
  SearchResponse,
} from "@algolia/client-search";
import type { Product } from "../../common/Schema";

const client = AlgoliaSearch(
  ALGOLIASEARCH_APPLICATION_ID || "",
  ALGOLIASEARCH_API_KEY || ""
);
const index = client.initIndex(ALGOLIASEARCH_INDEX || "");

const algoliaClient: {
  deleteObjects: (objectIDs: readonly string[]) => Promise<Error | null>;
  getObject: (
    objectID: string,
    options?: GetObjectOptions
  ) => Promise<FixedLengthArray<[Product, null] | [null, Error]>>;
  partialUpdateObject: (
    object: Readonly<Record<string, any>>,
    options?: PartialUpdateObjectsOptions
  ) => Promise<Error | null>;
  saveObject: (
    object: Readonly<Record<string, any>>,
    options?: SaveObjectsOptions
  ) => Promise<Error | null>;
  saveObjects: (
    object: Readonly<Record<string, any>>[],
    options?: SaveObjectsOptions
  ) => Promise<Error | null>;
  search: (
    query: string,
    options?: SearchOptions
  ) => Promise<
    FixedLengthArray<[SearchResponse<Product>, null] | [null, Error]>
  >;
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
    let error: Error | null = null;
    await index
      .getObject(objectID, options)
      .then((res) => {
        //@ts-ignore
        object = {
          ...mapKeys(res, (v, k) => camelCase(k)),
        };
      })
      .catch((err) => {
        SumoLogic.log({
          level: "error",
          message: `Failed to get object from Algolia: ${err.message}`,
          params: { objectID, options },
        });
        error = err;
      });

    if (error) {
      return [null, error];
    } else if (object) {
      return [object, null];
    }

    SumoLogic.log({
      level: "error",
      message: `Failed to get object from Algolia: Reached code that shouldn't be reachable`,
      params: { objectID, options },
    });

    return [null, new Error("Reached code that shouldn't be reachable")];
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
    let error: Error | null = null;
    let results: SearchResponse<Product> | null = null;
    await index
      .search(query, options)
      .then((res) => {
        results = {
          ...res,
          //@ts-ignore
          hits: res.hits.map((hit) => ({
            ...mapKeys(hit, (v, k) => camelCase(k)),
          })),
        };
      })
      .catch((err) => {
        console.log(err);
        error = err.message;
      });

    if (error) {
      return [null, error];
    } else if (results) {
      return [results, null];
    }

    SumoLogic.log({
      level: "error",
      message: `Failed to search from Algolia: Reached code that shouldn't be reachable`,
      params: { query, options },
    });

    return [null, new Error("Reached code that shouldn't be reachable")];
  },
};

export default algoliaClient;
