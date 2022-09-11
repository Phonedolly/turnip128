import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { onGetAuth, onSilentRefresh } from "../Util/LoginTools";

export default function Manage(props) {
  const [isLoggedIn, setLoggedIn] = useState("PENDING");
  const [categories, setCategories] = useState([]);

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

  /* 카테고리를 받아오는 useEffect() */
  useEffect(() => {
    async function getCategories() {
      setCategories((await axios.get("/api/getCategories")).data.categories);
    }

    getCategories();
    console.log(categories);
  }, []);

  /* 카테고리 변경 사항을 서버에 전송하는 useEffect() */
  useEffect(() => {
    async function updateCategory() {
      await axios.post("/api/updateCategories", categories);
    }
    updateCategory();
  }, [categories]);

  const handleDragChange = (result) => {
    if (!result.destination) {
      return;
    }
    console.log(result);
    const items = [...categories];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const indexAlimentedItems = items.map((eachItem, index) => ({
      ...eachItem,
      index: index,
    }));
    console.log(indexAlimentedItems);
    setCategories(() => indexAlimentedItems);
  };

  if (isLoggedIn === "NO") {
    return <Navigate replace to="/" />;
  } else if (isLoggedIn === "PENDING") {
    return <div>기다리세요</div>;
  }
  return (
    <>
      <div>
        <h1>Management</h1>
        <h2>카테고리</h2>
        <DragDropContext onDragEnd={handleDragChange}>
          <Droppable droppableId="categories">
            {(provided) => (
              <ul
                className="categories"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {categories.map((eachCategory, index) => (
                  <Draggable
                    key={eachCategory._id}
                    draggableId={eachCategory._id}
                    index={index}
                  >
                    {(provided) => (
                      <li
                        className="common-list-item"
                        ref={provided.innerRef}
                        {...provided.dragHandleProps}
                        {...provided.draggableProps}
                      >
                        {eachCategory.name}
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </>
  );
}
