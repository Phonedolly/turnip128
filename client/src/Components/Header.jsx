import Flex from "@react-css/flex";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import "./Header.scss";

export default function Header(props) {
  const location = useLocation();
  let headerClassName;

  if (location.pathname === "/") {
    headerClassName = "header scroll";
  } else if (
    location.pathname.endsWith("/edit") &&
    location.pathname.split("/").length === 4
  ) {
    headerClassName = "header not-visible-header";
  } else {
    headerClassName = "header";
  }
  return (
    <div className={headerClassName}>
      <div className="header-content">
        <Link to="/" className="header-link">
          <Flex flexDirection="row" justifyContent="start" className="icon">
            <div className="headerText">Stardue128</div>
            <div className="underLine" />
          </Flex>
        </Link>
        <div className="menu-icons">
          {/* <motion.button
            className="menu-icon info-icon"
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 1.0 }}
          /> */}
          <motion.button
            className="menu-icon search-icon"
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 1.0 }}
            onClick={props.openSearchModal}
          />
        </div>
      </div>
    </div>
  );
}
