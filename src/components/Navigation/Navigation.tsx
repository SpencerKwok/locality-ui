import React from "react";
import styled from "styled-components";
import Cookie from "js-cookie";
import { Button, Nav, Navbar } from "react-bootstrap";

import NavigationDAO from "./NavigationDAO";

export interface NavigationProps extends React.HTMLProps<HTMLDivElement> {}

const StyledNavLink = styled(Nav.Link)`
  color: white !important;
`;

const StyledNavbar = styled(Navbar)`
  background-color: #449ed7;
`;

const StyledButton = styled(Button)`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
`;

function Navigation(props: NavigationProps) {
  const companyId = Cookie.get("companyId");

  return (
    <StyledNavbar variant="dark">
      <Nav className="ml-auto">
        <StyledNavLink href="/">Home</StyledNavLink>
        <StyledNavLink href="/demo">Demo</StyledNavLink>
        <StyledNavLink href="/about">About Us</StyledNavLink>
        <StyledNavLink href="/contact">Contact Us</StyledNavLink>
        {companyId ? (
          <React.Fragment>
            <StyledButton
              variant="primary"
              href="/dashboard"
              style={{ marginLeft: 12 }}
            >
              Dashboard
            </StyledButton>
            <StyledButton
              variant="primary"
              style={{ marginLeft: 12 }}
              onClick={async () => {
                await NavigationDAO.getInstance()
                  .signout({})
                  .then(({ redirectTo }) => {
                    window.location.href = redirectTo;
                  })
                  .catch((err) => console.log(err));
              }}
            >
              Sign out
            </StyledButton>
          </React.Fragment>
        ) : (
          <StyledButton
            variant="primary"
            href="/signin"
            style={{ marginLeft: 12 }}
          >
            Sign in
          </StyledButton>
        )}
      </Nav>
    </StyledNavbar>
  );
}

export default Navigation;
