import { Fragment, ReactNode } from "react";
import Link from "next/link";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { signOut } from "next-auth/client";

import FacebookLogo from "../images/FacebookLogo";
import InstagramLogo from "../images/InstagramLogo";
import NavigationProps from "./NavigationProps";
import styles from "./Navigation.module.css";

interface NavigationLayoutProps {
  children?: ReactNode;
}

const NavigationLayout = ({ children }: NavigationLayoutProps) => (
  <Navbar className={styles.navbar} collapseOnSelect expand="lg" variant="dark">
    <span>
      <a
        href="https://www.instagram.com/mylocality.shop/"
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
      <Nav className="mr-auto">{children}</Nav>
    </Navbar.Collapse>
  </Navbar>
);

export default function Navigation({ type }: NavigationProps) {
  return (
    <NavigationLayout>
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
      {(() => {
        const navLinks = [];
        const customSignOut = async () => {
          await signOut({ redirect: false });
          window.location.pathname = "/signin";
        };
        switch (type) {
          case "business":
            navLinks.push(
              <Link key="Dashboard" href="/dashboard">
                <span className={`nav-link ${styles.navlink}`}>Dashboard</span>
              </Link>
            );
          case "user":
            navLinks.push(
              <Link key="Wish List" href="/wishlist">
                <span className={`nav-link ${styles.navlink}`}>Wish List</span>
              </Link>
            );
            navLinks.push(
              <span
                key="Sign out"
                className={`nav-link ${styles.navlink}`}
                onClick={customSignOut}
              >
                Sign out
              </span>
            );
            break;
          case "none":
            navLinks.push(
              <Link key="Sign in" href="/signin">
                <span className={`nav-link ${styles.navlink}`}>Sign in</span>
              </Link>
            );
            navLinks.push(
              <Link key="Sign out" href="/signup">
                <span className={`nav-link ${styles.navlink}`}>Sign up</span>
              </Link>
            );
            break;
        }
        return <Fragment>{navLinks.map((link) => link)}</Fragment>;
      })()}
    </NavigationLayout>
  );
}
