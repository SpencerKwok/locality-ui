import React from "react";
import styled, { keyframes } from "styled-components";
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

const fadeIn = keyframes`
  0% {
      opacity: 0;
  }
  100% {
      opacity: 1;
  }
`;

const AnimatedStack = styled(Stack)`
  animation: ${fadeIn} 0.5s linear;
`;

function SignUp(props: SignUpProps) {
  const companyId = Cookie.get("companyId");
  const username = Cookie.get("username");
  if (companyId) {
    return <Redirect to="/dashboard" />;
  } else if (username) {
    return <Redirect to="/" />;
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
            <AnimatedStack direction="column" rowAlign="center" spacing={16}>
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
                    I'm a local business owner looking to reach more customers!
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
                    I'm a local looking to support local businesses!
                  </h4>
                </DescriptionImage>
              </Stack>
            </AnimatedStack>
          )}
          {props.userType === "company" && (
            <AnimatedStack direction="column" rowAlign="center">
              <CompanySignup width={props.width} />
            </AnimatedStack>
          )}
          {props.userType === "customer" && (
            <AnimatedStack direction="column" rowAlign="center">
              <CustomerSignup width={props.width} />
            </AnimatedStack>
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
