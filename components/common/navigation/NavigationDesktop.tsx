import { Fragment } from "react";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Link from "next/link";
import { signOut } from "next-auth/client";

import FacebookLogo from "components/common/images/FacebookLogo";
import InstagramLogo from "components/common/images/InstagramLogo";
import NavigationProps from "components/common/navigation/NavigationProps";
import styles from "components/common/navigation/Navigation.module.css";

import type { FC, ReactFragment, ReactNode } from "react";

interface NavigationLayoutProps {
  children?: ReactNode;
}

const NavigationLayout: FC<NavigationLayoutProps> = ({ children }) => (
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
      {((): ReactFragment => {
        const navLinks = Array<JSX.Element>();
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
};

export default Navigation;
