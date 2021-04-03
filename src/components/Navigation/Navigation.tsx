import React from "react";
import styled from "styled-components";
import Cookie from "js-cookie";
import { Button, Nav, Navbar } from "react-bootstrap";
import { ReactComponent as InstagramLogo } from "./instagram-logo.svg";
import { ReactComponent as FacebookLogo } from "./facebook-logo.svg";

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
  const username = Cookie.get("username");

  if (props.width <= (companyId ? 800 : 680)) {
    return (
      <StyledNavbar collapseOnSelect expand="lg" variant="dark">
        <span>
          <InstagramLogo />
          <FacebookLogo
            width={96}
            height={96}
            style={{ margin: "-32px -32px -32px -16px" }}
          />
        </span>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <StyledNavLink href="/">Home</StyledNavLink>
            <StyledNavLink href="/extension">Extension</StyledNavLink>
            <StyledNavLink href="/about">About Us</StyledNavLink>
            <StyledNavLink href="/contact">Contact Us</StyledNavLink>
            {companyId && (
              <StyledNavLink href="/dashboard">Dashboard</StyledNavLink>
            )}
            {username ? (
              <React.Fragment>
                <StyledNavLink href="/wishlist">Wish List</StyledNavLink>
                <StyledNavLink
                  onClick={async () => {
                    await NavigationDAO.getInstance()
                      .signout({})
                      .then(({ error }) => {
                        if (error) {
                          console.log(error.message);
                        } else {
                          // Clearing cookie on front end too
                          // since they aren't cleared in
                          // safari for whatever reason
                          Cookie.remove("firstName");
                          Cookie.remove("lastName");
                          Cookie.remove("username");
                          Cookie.remove("companyId");
                          window.location.href = "/signin";
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
                <StyledNavLink href="/signup">Sign up</StyledNavLink>
              </React.Fragment>
            )}
          </Nav>
        </Navbar.Collapse>
      </StyledNavbar>
    );
  }

  return (
    <StyledNavbar variant="dark">
      <span>
        <InstagramLogo />
        <FacebookLogo
          width={96}
          height={96}
          style={{ margin: "-32px -32px -32px -16px" }}
        />
      </span>
      <Nav className="ml-auto">
        <StyledNavLink href="/">Home</StyledNavLink>
        <StyledNavLink href="/extension">Extension</StyledNavLink>
        <StyledNavLink href="/about">About Us</StyledNavLink>
        <StyledNavLink href="/contact">Contact Us</StyledNavLink>
        {companyId && (
          <StyledButton
            variant="primary"
            href="/dashboard"
            style={{ marginLeft: 12 }}
          >
            Dashboard
          </StyledButton>
        )}
        {username ? (
          <React.Fragment>
            <StyledButton
              variant="primary"
              href="/wishlist"
              style={{ marginLeft: 12 }}
            >
              Wish List
            </StyledButton>
            <StyledButton
              variant="primary"
              style={{ marginLeft: 12 }}
              onClick={async () => {
                await NavigationDAO.getInstance()
                  .signout({})
                  .then(({ error }) => {
                    if (error) {
                      console.log(error.message);
                    } else {
                      window.location.href = "/signin";
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
