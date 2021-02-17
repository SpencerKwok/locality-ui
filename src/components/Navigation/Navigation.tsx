import React from "react";
import styled from "styled-components";
import Cookie from "js-cookie";

import { Button, Nav, Navbar } from "react-bootstrap";

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
  const firstName = Cookie.get("firstName");
  const lastName = Cookie.get("lastName");

  return (
    <StyledNavbar variant="dark">
      <Nav className="ml-auto">
        <StyledNavLink href="/">Home</StyledNavLink>
        <StyledNavLink href="/demo">Demo</StyledNavLink>
        <StyledNavLink href="/about">About Us</StyledNavLink>
        <StyledNavLink href="/contact">Contact Us</StyledNavLink>
        {firstName && lastName ? (
          <React.Fragment>
            <StyledButton
              variant="primary"
              href="/inventory"
              style={{ marginLeft: 12 }}
            >
              Manage Inventory
            </StyledButton>
            <StyledButton
              variant="primary"
              href="/signin"
              style={{ marginLeft: 12 }}
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
