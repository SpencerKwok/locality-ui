import { Children, Fragment, useState } from "react";

import ThemeContext from "components/common/Theme";
import styles from "components/common/tabs/Tabs.module.css";

import type { FC } from "react";

export interface TabsProps {
  defaultActiveKey?: string;
  activeKey?: string;
  onSelect?: (key: string) => void;
}

const Tabs: FC<TabsProps> = ({
  defaultActiveKey,
  activeKey,
  children,
  onSelect,
}) => {
  const [key, setKey] = useState(defaultActiveKey);

  if (activeKey !== undefined && key !== activeKey) {
    setKey(activeKey);
  }

  return (
    <ThemeContext.Consumer>
      {({ color }): JSX.Element => (
        <Fragment>
          <nav className={styles["tabs"]}>
            {Children.map(children, (child: any) => {
              const { eventKey, title } = child.props;
              if (typeof eventKey !== "string" || typeof title !== "string") {
                return null;
              }

              return (
                <a
                  className={
                    styles[`nav-tab${key === eventKey ? "-active" : ""}`]
                  }
                  onClick={(): void => {
                    setKey(eventKey);
                    onSelect?.call(this, eventKey);
                  }}
                  style={{
                    color: color.text.dark,
                  }}
                >
                  {title}
                </a>
              );
            })}
          </nav>
          <div>
            {Children.map(children, (child: any) => {
              const { eventKey } = child.props;
              if (key !== eventKey) {
                return null;
              }
              return child as JSX.Element;
            })}
          </div>
        </Fragment>
      )}
    </ThemeContext.Consumer>
  );
};

export default Tabs;
