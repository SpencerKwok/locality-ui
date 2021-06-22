import { Fragment } from "react";
import Link from "next/link";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { signOut } from "next-auth/client";

import FacebookLogo from "components/common/images/FacebookLogo";
import InstagramLogo from "components/common/images/InstagramLogo";
import NavigationProps from "./NavigationProps";
import styles from "components/common/navigation/Navigation.module.css";

import type { FC, ReactNode } from "react";

interface NavigationLayoutProps {
  children?: ReactNode;
}

const NavigationLayout: FC<NavigationLayoutProps> = ({ children }) => (
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

const Navigation: FC<NavigationProps> = ({ type }) => {
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
      {((): ReactNode => {
        const navLinks = [];
        const customSignOut = async (): Promise<void> => {
          await signOut({ redirect: false });
          window.location.assign("/signin");
        };
        switch (type) {
          case "business":
            navLinks.push(
              // Need to refresh CSP
              <div
                key="Dashboard"
                onClick={(): void => {
                  window.location.assign("/dashboard?tab=inventory");
                }}
              >
                <span className={`nav-link ${styles.navlink}`}>Dashboard</span>
              </div>
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
};

export default Navigation;
