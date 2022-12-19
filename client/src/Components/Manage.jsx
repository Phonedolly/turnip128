import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { onGetAuth, onSilentRefresh } from "../Util/LoginTools";
import ManageCategory from "./ManageCategory";

import "./Manage.scss";
import Import from "./Import";

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

        <Link to="/manage" className="manage-tab left">
          기본 정보
        </Link>
        <Link to="/manage/category" className="manage-tab middle">
          카테고리 설정
        </Link>
        <Link to="/manage/statistic" className="manage-tab middle">
          통계
        </Link>
        <Link to="/manage/import" className="manage-tab right">
          가져오기
        </Link>
        <Routes>
          <Route path="/" element={<p>ㅇㅇㅇ</p>}></Route>
          <Route path="/category" element={<ManageCategory />}></Route>
          <Route path="/import" element={<Import />}></Route>
        </Routes>
      </div>
    </>
  );
}
