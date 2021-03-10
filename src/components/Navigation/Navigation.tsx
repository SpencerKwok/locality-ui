import React from "react";
import styled from "styled-components";
import Cookie from "js-cookie";
import { Button, Nav, Navbar } from "react-bootstrap";
import { ReactComponent as InstagramLogo } from "./instagram-logo.svg";

import NavigationDAO from "./NavigationDAO";

export interface NavigationProps extends React.HTMLProps<HTMLDivElement> {
  width: number;
}

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

  if (props.width <= 600) {
    return (
      <StyledNavbar collapseOnSelect expand="lg" variant="dark">
        <a
          href="https://www.instagram.com/locality.info/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <InstagramLogo />
        </a>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <StyledNavLink href="/">Home</StyledNavLink>
            <StyledNavLink href="/demo">Demo</StyledNavLink>
            <StyledNavLink href="/about">About Us</StyledNavLink>
            <StyledNavLink href="/contact">Contact Us</StyledNavLink>
            {companyId ? (
              <React.Fragment>
                <StyledNavLink href="/dashboard">Dashboard</StyledNavLink>
                <StyledNavLink
                  onClick={async () => {
                    await NavigationDAO.getInstance()
                      .signout({})
                      .then(({ error, redirectTo }) => {
                        if (error) {
                          console.log(error.message);
                        } else if (redirectTo) {
                          window.location.href = redirectTo;
                        }
                      })
                      .catch((err) => console.log(err));
                  }}
                >
                  Sign out
                </StyledNavLink>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <StyledNavLink href="/signin">Sign in</StyledNavLink>
                <StyledNavLink href="/signout">Sign up</StyledNavLink>
              </React.Fragment>
            )}
          </Nav>
        </Navbar.Collapse>
      </StyledNavbar>
    );
  }

  return (
    <StyledNavbar variant="dark">
      <a
        href="https://www.instagram.com/locality.info/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <InstagramLogo />
      </a>
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
                  .then(({ error, redirectTo }) => {
                    if (error) {
                      console.log(error.message);
                    } else if (redirectTo) {
                      window.location.href = redirectTo;
                    }
                  })
                  .catch((err) => console.log(err));
              }}
            >
              Sign out
            </StyledButton>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <StyledButton
              variant="primary"
              href="/signin"
              style={{ marginLeft: 12 }}
            >
              Sign in
            </StyledButton>
            <StyledButton
              variant="primary"
              href="/signup"
              style={{ marginLeft: 12 }}
            >
              Sign up
            </StyledButton>
          </React.Fragment>
        )}
      </Nav>
    </StyledNavbar>
  );
}

export default Navigation;
