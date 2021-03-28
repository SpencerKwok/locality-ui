import React from "react";
import Cookie from "js-cookie";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
  useHistory,
  useRouteMatch,
} from "react-router-dom";

import CompanySignup from "./Company/Company";
import CustomerSignup from "./Customer/Customer";
import DescriptionImage from "../../common/components/Image/DescriptionImage";
import Stack from "../../common/components/Stack/Stack";

type UserType = "company" | "customer";
interface SignUpProps extends React.HTMLProps<HTMLDivElement> {
  width: number;
  userType?: UserType;
}

function SignUp(props: SignUpProps) {
  const companyId = Cookie.get("companyId");
  if (companyId) {
    return <Redirect to="/dashboard" />;
  }

  const history = useHistory();
  return (
    <Stack direction="row" columnAlign="center">
      <Stack
        direction="column"
        rowAlign="center"
        style={{ marginTop: 24, marginBottom: 24 }}
      >
        <header>
          <h1>Sign Up</h1>
        </header>
        <main>
          {!props.userType && (
            <Stack direction="column" rowAlign="center" spacing={16}>
              <Stack direction="row" columnAlign="center">
                <h4>What describes you best?</h4>
              </Stack>
              <Stack
                direction="row"
                columnAlign="center"
                rowAlign="flex-end"
                spacing={64}
              >
                <DescriptionImage
                  direction="column"
                  rowAlign="center"
                  onClick={() => {
                    history.replace("/signup/company");
                  }}
                  src="https://res.cloudinary.com/hcory49pf/image/upload/v1616922337/signup/storefront.webp"
                  width={300}
                  spacing={12}
                  style={{ width: 400 }}
                >
                  <h4
                    style={{
                      padding: "0px 16px 0px 16px",
                      textAlign: "center",
                    }}
                  >
                    I'm a small business owner looking to reach more customers!
                  </h4>
                </DescriptionImage>
                <DescriptionImage
                  direction="column"
                  rowAlign="center"
                  onClick={() => {
                    history.replace("/signup/customer");
                  }}
                  src="https://res.cloudinary.com/hcory49pf/image/upload/v1616922148/signup/customer.webp"
                  width={400}
                  spacing={12}
                  style={{ width: 400 }}
                >
                  <h4
                    style={{
                      padding: "0px 16px 0px 16px",
                      textAlign: "center",
                    }}
                  >
                    I'm a local looking to support small businesses!
                  </h4>
                </DescriptionImage>
              </Stack>
            </Stack>
          )}
          {props.userType === "company" && (
            <CompanySignup width={props.width} />
          )}
          {props.userType === "customer" && (
            <CustomerSignup width={props.width} />
          )}
        </main>
      </Stack>
    </Stack>
  );
}

export interface SignupRouterProps extends SignUpProps {}

function SignupRouter(props: SignupRouterProps) {
  const { path } = useRouteMatch();

  return (
    <Router>
      <Switch>
        {(["company", "customer"] as Array<UserType>).map((p) => (
          <Route
            exact
            key={p}
            path={`${path}/${p}`}
            children={<SignUp {...props} userType={p} />}
          />
        ))}
        <Route path={path} children={<SignUp {...props} />} />
      </Switch>
    </Router>
  );
}

export default SignupRouter;
