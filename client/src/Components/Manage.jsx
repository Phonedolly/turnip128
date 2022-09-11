import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { onGetAuth, onSilentRefresh } from "../Util/LoginTools";
import ManageCategory from "./ManageCategory";

import "./Manage.scss";

export default function Manage(props) {
  const [isLoggedIn, setLoggedIn] = useState("PENDING");

  const location = useLocation();

  /* 로그인 여부 관리 useEffect() */
  useEffect(() => {
    async function setLoginInfo() {
      await onSilentRefresh().then(
        () => {},
        () => {
          setLoggedIn("NO");
          return;
        }
      );
      onGetAuth().then(
        () => {
          setLoggedIn("YES");
        },
        () => {
          setLoggedIn("NO");
        }
      );
    }
    setLoginInfo();
  }, []);

  if (isLoggedIn === "NO") {
    return <Navigate replace to="/" />;
  } else if (isLoggedIn === "PENDING") {
    return <div>기다리세요</div>;
  }
  return (
    <>
      <div className="common-container manage-container">
        <h1>Management</h1>

        <motion.a
          href="/manage"
          className="manage-tab left"
          whileHover={{ scale: 1.1 }}
        >
          기본 정보
        </motion.a>
        <motion.a href="/manage/category" className="manage-tab middle">
          카테고리 설정
        </motion.a>
        <motion.a href="/manage/statistic" className="manage-tab right">
          통계
        </motion.a>
        <Routes>
          <Route path="/" element={<p>ㅇㅇㅇ</p>}></Route>
          <Route path="/category" element={<ManageCategory />}></Route>
        </Routes>
      </div>
    </>
  );
}
