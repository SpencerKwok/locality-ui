import React from "react";
import styled from "styled-components";

import { Nav, Navbar } from "react-bootstrap";

export interface NavigationProps extends React.HTMLProps<HTMLDivElement> {}

const StyledNavLink = styled(Nav.Link)`
  color: white !important;
`;

const StyledNavbar = styled(Navbar)`
  background-color: #449ed7;
`;

function Navigation(props: NavigationProps) {
  return (
    <StyledNavbar variant="dark">
      <Nav className="ml-auto">
        <StyledNavLink href="/">Home</StyledNavLink>
        <StyledNavLink href="/demo">Demo</StyledNavLink>
        <StyledNavLink href="/about">About Us</StyledNavLink>
        <StyledNavLink href="/contact">Contact Us</StyledNavLink>
      </Nav>
    </StyledNavbar>
  );
}

export default Navigation;
