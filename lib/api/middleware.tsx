import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import SqlString from "sqlstring";

import Psql from "lib/api/postgresql";
import SumoLogic from "lib/api/sumologic";

const runMiddlewareHelper = (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (req: NextApiRequestWithLocals, res: NextApiResponse, result: any) => any
) => {
  return new Promise((resolve, reject) => {
    const newReq = Object.assign(req, { locals: { user: {} } });
    fn(newReq, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export type NextApiRequestWithLocals = NextApiRequest & {
  locals: {
    user: any;
  };
};

export async function runMiddlewareUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddlewareHelper(
    req,
    res,
    async (req, res, next: (err?: any) => void) => {
      const session = await getSession({ req });
      if (!session || !session.user) {
        SumoLogic.log({
          level: "warning",
          message: "Attempted user request with invalid credentials",
          params: { req },
        });
        res.status(403).json({ error: "Invalid credentials" });
        return;
      }

      req.locals = { user: session.user };
      next();
    }
  );
}

export async function runMiddlewareBusiness(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddlewareHelper(
    req,
    res,
    async (
      req: NextApiRequestWithLocals,
      res: NextApiResponse,
      next: (err?: any) => void
    ) => {
      const session = await getSession({ req });
      if (!session || !session.user) {
        SumoLogic.log({
          level: "warning",
          message: "Attempted business request with invalid credentials",
          params: { req },
        });
        res.status(403).json({ error: "Invalid credentials" });
        return;
      }

      const user: any = session.user;
      if (!user.isBusiness) {
        SumoLogic.log({
          level: "warning",
          message: "Attempted business request with invalid credentials",
          params: { req },
        });
        res.status(403).json({ error: "Invalid credentials" });
        return;
      }

      req.locals = { user };
      next();
    }
  );
}

export async function runMiddlewareExtension(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddlewareHelper(
    req,
    res,
    async (
      req: NextApiRequestWithLocals,
      res: NextApiResponse,
      next: (err?: any) => void
    ) => {
      if (
        typeof req.headers["id"] !== "string" ||
        typeof req.headers["token"] !== "string" ||
        !req.headers["id"].match(/\d+/g)
      ) {
        SumoLogic.log({
          level: "warning",
          message: "Attempted extension user request with invalid credentials",
          params: { req },
        });
        res.status(403).json({ error: "Invalid credentials" });
        return;
      }

      const id = parseInt(req.headers["id"]);
      const token = await Psql.select<never>({
        table: "tokens",
        values: ["*"],
        conditions: SqlString.format("token=E? AND id=?", [
          req.headers["token"],
          id,
        ]),
      });
      if (!token) {
        SumoLogic.log({
          level: "warning",
          message: "Failed to SELECT from Heroku PSQL: Missing response",
          params: { req },
        });
        res.status(403).json({ error: "Invalid credentials" });
        return;
      }
      if (token.rowCount <= 0) {
        SumoLogic.log({
          level: "warning",
          message: "Attempted extension user request with invalid credentials",
          params: { req },
        });
        res.status(403).json({ error: "Invalid credentials" });
        return;
      }

      req.locals = { user: { id: id } };
      next();
    }
  );
}
