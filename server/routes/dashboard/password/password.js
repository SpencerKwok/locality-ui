import bcrypt from "bcryptjs";
import psql from "../../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import sqlString from "sqlstring";

const router = Router();
router.post(
  "/update",
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 5 minutes
    max: 5,
    message:
      "Too many password update requests from this IP, please try again after 5 minutes",
  }),
  async (req, res) => {
    const username = req.cookies["username"];
    const [user, psqlError] = await psql.query(
      sqlString.format("SELECT password FROM users WHERE username=E?", [
        username,
      ])
    );
    if (psqlError) {
      res.send(JSON.stringify({ error: psqlError }));
    } else if (user.rows.length === 0) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "User does not exist" },
        })
      );
    } else {
      const hashedPassword = user.rows[0].password;
      bcrypt.compare(
        req.body.currentPassword,
        hashedPassword,
        async (bcryptError, result) => {
          if (bcryptError) {
            res.end(
              JSON.stringify({
                error: { code: 400, message: bcryptError.message },
              })
            );
          } else if (result) {
            const newPasswordHash = await bcrypt.hash(
              req.body.newPassword,
              parseInt(process.env.SALT)
            );
            const [_, psqlError] = await psql.query(
              sqlString.format(
                "UPDATE users SET password=? WHERE username=E?",
                [newPasswordHash, username]
              )
            );
            if (psqlError) {
              res.end(
                JSON.stringify({
                  error: { code: 400, message: psqlError.message },
                })
              );
            } else {
              res.end(JSON.stringify({}));
            }
          } else {
            res.end(
              JSON.stringify({
                error: { code: 403, message: "Incorrect Password" },
              })
            );
          }
        }
      );
    }
  }
);

export default router;
