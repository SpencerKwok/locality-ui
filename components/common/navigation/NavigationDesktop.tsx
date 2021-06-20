import { Fragment, ReactNode } from "react";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Link from "next/link";
import { signOut } from "next-auth/client";

import FacebookLogo from "../images/FacebookLogo";
import InstagramLogo from "../images/InstagramLogo";
import NavigationProps from "./NavigationProps";
import styles from "./Navigation.module.css";

interface NavigationLayoutProps {
  children?: ReactNode;
}

const NavigationLayout = ({ children }: NavigationLayoutProps) => (
  <Navbar className={styles.navbar} variant="dark">
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
    <Nav className="ml-auto">{children}</Nav>
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
              // Need to refresh CSP
              <div
                key="Dashboard"
                onClick={() => {
                  window.location.assign("/dashboard?tab=inventory");
                }}
              >
                <Button className={styles["nav-button"]}>Dashboard</Button>
              </div>
            );
          case "user":
            navLinks.push(
              <Link key="Wish List" href="/wishlist">
                <Button className={styles["nav-button"]}>Wish List</Button>
              </Link>
            );
            navLinks.push(
              <Button
                key="Sign out"
                className={styles["nav-button"]}
                onClick={customSignOut}
              >
                Sign out
              </Button>
            );
            break;
          case "none":
            navLinks.push(
              <Link key="Sign in" href="/signin">
                <Button className={styles["nav-button"]}>Sign in</Button>
              </Link>
            );
            navLinks.push(
              <Link key="Sign up" href="/signup">
                <Button className={styles["nav-button"]}>Sign up</Button>
              </Link>
            );
            break;
        }
        return <Fragment>{navLinks.map((link) => link)}</Fragment>;
      })()}
    </NavigationLayout>
  );
}
