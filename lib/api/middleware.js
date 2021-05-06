import { getSession } from "next-auth/client";

function runMiddlewareHelper(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export async function runMiddlewareUser(req, res) {
  await runMiddlewareHelper(req, res, async (req, res, next) => {
    const session = await getSession({ req });
    if (!session || !session.user) {
      res.status(403).json({ error: "Invalid user credentials" });
      return;
    }

    req.locals = { user: session.user };
    next();
  });
}

export async function runMiddlewareBusiness(req, res) {
  await runMiddlewareHelper(req, res, async (req, res, next) => {
    const session = await getSession({ req });
    if (!session || !session.user || !session.user.isBusiness) {
      res.status(403).json({ error: "Invalid business credentials" });
      return;
    }

    req.locals = { user: session.user };
    next();
  });
}
