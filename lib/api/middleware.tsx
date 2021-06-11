import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";

import SqlString from "sqlstring";
import UIDGenerator from "uid-generator";
import Psql from "./postgresql";

function runMiddlewareHelper(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: any
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

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
    async (
      req: NextApiRequestWithLocals,
      res: NextApiResponse,
      next: (err?: any) => void
    ) => {
      const session = await getSession({ req });
      if (!session || !session.user) {
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
        res.status(403).json({ error: "Invalid credentials" });
        return;
      }

      const user: any = session.user;
      if (!user.isBusiness) {
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
        typeof req.headers["token"] !== "string"
      ) {
        res.status(403).json({ error: "Invalid credentials" });
        return;
      }

      try {
        const id = parseInt(req.headers["id"]);
        const [token, getToken] = await Psql.query(
          SqlString.format("SELECT * FROM tokens WHERE token=E? AND id=?", [
            req.headers["token"],
            id,
          ])
        );
        if (getToken) {
          console.log(getToken);
          res.status(403).json({ error: "Invalid credentials" });
          return;
        }
        if (token.rows[0].length <= 0) {
          res.status(403).json({ error: "Invalid credentials" });
          return;
        }

        req.locals = { user: { id: id } };
        next();
      } catch {
        res.status(403).json({ error: "Invalid credentials" });
        return;
      }
    }
  );
}
