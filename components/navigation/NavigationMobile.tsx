import React from "react";
import Link from "next/link";
import { Nav, Navbar } from "react-bootstrap";

import FacebookLogo from "../common/images/FacebookLogo";
import InstagramLogo from "../common/images/InstagramLogo";
import styles from "./Navigation.module.css";

export default function Navigation() {
  return (
    <Navbar
      className={styles.navbar}
      collapseOnSelect
      expand="lg"
      variant="dark"
    >
      <span>
        <a
          href="https://www.instagram.com/locality.info/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <InstagramLogo width={42} style={{ marginRight: 12 }} />
        </a>
        <a
          href="https://www.facebook.com/locality.info/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FacebookLogo width={42} />
        </a>
      </span>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto">
          <Link href="/">
            <span className={`nav-link ${styles.navlink}`}>Home</span>
          </Link>
          <Link href="/extension">
            <span className={`nav-link ${styles.navlink}`}>Extension</span>
          </Link>
          <Link href="/about">
            <span className={`nav-link ${styles.navlink}`}>About Us</span>
          </Link>
          <Link href="/contact">
            <span className={`nav-link ${styles.navlink}`}>Contact Us</span>
          </Link>
          <Link href="/signin">
            <span className={`nav-link ${styles.navlink}`}>Sign in</span>
          </Link>
          <Link href="/signup">
            <span className={`nav-link ${styles.navlink}`}>Sign up</span>
          </Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
