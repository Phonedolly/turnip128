import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Art from "./Art";
import Curator from "./Curator";
import { Login } from "./Login";
import Writer from "./Writer";

import { AnimatePresence } from "framer-motion";
import Manage from "./Manage";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Curator />}></Route>
        <Route path="/:moreSitemapCount" element={<Curator />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/post/:postURL" element={<Art />}></Route>
        <Route path="/post/:postURL/edit" element={<Writer isEdit={true} />} />
        <Route path="/writer" element={<Writer />}></Route>
        <Route path="/manage/*" element={<Manage />}></Route>
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
