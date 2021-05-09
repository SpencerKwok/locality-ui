import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";

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
        res.status(403).json({ error: "Invalid user credentials" });
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
        res.status(403).json({ error: "Invalid business credentials" });
        return;
      }

      const user: any = session.user;
      if (!user.isBusiness) {
        res.status(403).json({ error: "Invalid business credentials" });
        return;
      }

      req.locals = { user };
      next();
    }
  );
}
