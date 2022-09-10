import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <>
      <p>없는 페이지입니다.</p>
      <Link to="/">홈으로 돌아가기</Link>
    </>
  );
}
