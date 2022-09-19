import Flex from "@react-css/flex";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

import "./Header.scss";
import { useEffect, useLayoutEffect } from "react";
import axios from "axios";
import { useState } from "react";
import SearchModal from "./SearchModal";
import CategoryModal from "./CategoryModal";

export default function Header(props) {
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [implicitMenus, setImplicitMenus] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  let headerClassName;

  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

  const openSearchModal = () => {
    setSearchModalOpen(true);
    document.body.style.cssText = `
    position: fixed; 
    top: -${window.scrollY}px;
    overflow-y: scroll;
    width: 100%;`;
  };
  const closeSearchModal = () => {
    setSearchModalOpen(false);
    document.body.style.cssText = "";
    window.scrollTo(0, parseInt(window.scrollY || "0", 10) * -1);
  };

  const openCategoryModal = () => {
    setCategoryModalOpen(true);
    document.body.style.cssText = `
    position: fixed; 
    top: -${window.scrollY}px;
    overflow-y: scroll;
    width: 100%;`;
  };
  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    document.body.style.cssText = "";
    window.scrollTo(0, parseInt(window.scrollY || "0", 10) * -1);
  };

  useLayoutEffect(() => {
    axios.get("/api/category/getCategories").then((res) => {
      setCategories(res.data.categories);

      const implicit = res.data.categories.reduce((prev, cur) => {
        if (!cur.isShowExplicitly) {
          return prev.concat(cur);
        } else {
          return prev;
        }
      }, []);
      setImplicitMenus(implicit);
    });
  }, []);

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
    <>
      <div className={headerClassName}>
        <div className="header-content">
          <Link to="/" className="header-link">
            <Flex flexDirection="row" justifyContent="start" className="icon">
              <div className="headerText">Stardue128</div>
              <div className="underLine" />
            </Flex>
          </Link>
          <div className="menu">
            <div className="menu-categories-explicitly">
              <motion.div
                className="menu-category"
                key={uuidv4()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 1.0 }}
              ></motion.div>
              {categories.map((eachMenu) => {
                return (
                  <motion.div
                    className="menu-category"
                    key={uuidv4()}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 1.0 }}
                  >
                    <Link
                      to={`/category/${eachMenu.name}`}
                      className="menu-category-link"
                    >
                      {eachMenu.name}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            <div className="menu-icons">
              <motion.button
                className="menu-icon search-icon"
                whileHover={{ scale: 1.5 }}
                whileTap={{ scale: 1.0 }}
                onClick={openSearchModal}
              />
              <motion.button
                className="menu-icon category-icon"
                whileHover={{ scale: 1.5 }}
                whileTap={{ scale: 1.0 }}
                onClick={openCategoryModal}
              />
            </div>
          </div>
        </div>
      </div>
      <CategoryModal
        isModalOpen={isCategoryModalOpen}
        closeModal={closeCategoryModal}
        categories={categories}
      />
      <SearchModal
        isModalOpen={isSearchModalOpen}
        closeModal={closeSearchModal}
      />
    </>
  );
}
