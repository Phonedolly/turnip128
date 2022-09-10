import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { onSilentRefresh, onLoginSuccess, onGetAuth } from "../Util/LoginTools";
import { useEffect } from "react";

export const Login = (props) => {
  const [isLoggedIn, setLoggedIn] = useState("PENDING");
  const [id, setID] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function setLoginInfo() {
      await onSilentRefresh().then(
        () => {},
        () => {}
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

  const onLogin = () => {
    const data = {
      id,
      password,
    };
    axios.post("/api/auth/login", data).then(
      (res) => {
        onLoginSuccess(res);
        alert("로그인 성공");
        navigate("/");
        navigate(0);
      },
      (err) => {
        alert("로그인 정보가 맞지 않습니다.");
      }
    );
  };

  const onLogout = () => {
    axios.get("/api/auth/logout").then(
      () => alert("로그아웃 되었습니다"),
      () => {
        alert("로그아웃 실패");
      }
    );
  };
  if (isLoggedIn === "YES") {
    return <>이미 로그인되어 있습니다</>;
  }
  return (
    <>
      <input
        placeholder="ID"
        type="text"
        name="username"
        onChange={(e) => setID(e.target.value)}
        required
      ></input>
      <input
        placeholder="Password"
        type="password"
        name="password"
        onChange={(e) => setPassword(e.target.value)}
        required
      ></input>
      <button onClick={onLogin}>로그인</button>
      {/* <button onClick={onSilentRefresh} />
      <button onClick={onGetAuth} /> */}
      <button onClick={onLogout}>로그아웃</button>
    </>
  );
};
