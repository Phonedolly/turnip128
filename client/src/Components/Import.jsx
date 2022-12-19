import axios from "axios";
import { useLayoutEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Import.module.scss";

export default function Import(props) {
  const [clubID, setClubID] = useState(0);
  const [articleNumber, setArticleNumber] = useState(0);
  const navigate = useNavigate();

  useLayoutEffect(()=>{
    axios.get("/api/getDefaultImportClubID").then(({data})=>{
      setClubID(data.defaultImportClubID);
    })
  },[])
  return (
    <>
      <div className="import-container">
        <h2>네이버 카페에서 게시글을 가져옵니다</h2>
        <div className="input-container">
          <input
            className="common-input url-input"
            type="text"
            placeholder="clubID 입력"
            value={clubID}
            onChange={(e) => {
              setClubID(e.target.value);
            }}
          />
          <input
            className="common-input url-input"
            type="text"
            placeholder="articleNumber 입력"
            onChange={(e) => {
              setArticleNumber(e.target.value);
            }}
          />
          <button
            onClick={() => {
              navigate(`/writer/import/${clubID}/${articleNumber}`);
            }}
            className="common-button"
          >
            가져오기
          </button>
        </div>
      </div>
    </>
  );
}
