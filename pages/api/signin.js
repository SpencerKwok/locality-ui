import EmailValidator from "email-validator";
import Xss from "xss";
import { signIn } from "next-auth/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const email = Xss(req.body.email || "");
  if (!EmailValidator.validate(email)) {
    res.status(400).json({
      error: "Invalid email",
    });
    return;
  }

  const password = req.body.password;
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Invalid password" });
    return;
  }

  const response = await signIn("credentials", {
    email: values.email,
    password: values.password,
    redirect: false,
  });

  console.log(response);
  console.log(req.headers);

  res.status(200).end();
}
