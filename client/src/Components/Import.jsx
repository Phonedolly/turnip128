import axios from "axios";
import { useState } from "react";
import "./Import.scss";

export default function Import(props) {
  const [progress, setProgress] = useState(false);
  const handleSubmit = async () => {
    setProgress(() => true);
    await axios
      .get(`https://cafe.naver.com/fx8300/973184`)
    //   .then(({ data }) => data.result.article.contentHtml);
    .then(({data})=>{
        console.log(data);
    })
    setProgress(() => false);
  };

  return (
    <>
      <div className="import-container">
        <h2>네이버 카페에서 게시글을 가져옵니다</h2>
        <div className="input-container">
          <input
            className="common-input url-input"
            type="text"
            placeholder="링크 입력"
            disabled={progress === true}
          />
          <button
            onClick={(e) => {
              handleSubmit(e.target.value);
            }}
            className="common-button"
            disabled={progress === true}
          >
            가져오기
          </button>
        </div>
      </div>
    </>
  );
}
