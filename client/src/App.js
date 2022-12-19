import React from "react";
import { Route, Routes, BrowserRouter, useLocation } from "react-router-dom";
import Art from "./Components/Art";
import Curator from "./Components/Curator";
import Header from "./Components/Header"
import Footer from './Components/Footer'
import { Login } from "./Components/Login";
import Writer from "./Components/Writer";
import Manage from "./Components/Manage";

import "./App.scss"

function App() {
  const location = useLocation();

  return (
    <>
      <div className="App">
        <Header />
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Curator mode="recent-navigator" />}>
            <Route
              path=":moreIndex"
              element={<Curator mode="recent-navigator" />}
            ></Route>
          </Route>
          <Route
            path="/category/:categoryName/"
            element={<Curator mode="category-navigator" />}
          >
            <Route
              path=":moreIndex"
              element={<Curator mode="category-navigator" />}
            ></Route>
          </Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/post/:postURL" element={<Art />}></Route>
          <Route path="/post/:postURL/edit" element={<Writer isEdit={true} />} />
          <Route path="/writer" element={<Writer />}></Route>
          <Route path="/writer/import/:clubID/:articleNumber" element={<Writer isImport={true} />} />
          <Route path="/manage/*" element={<Manage />}></Route>
        </Routes>
        <Footer />
      </div>
    </>
  );
}

export default App;
