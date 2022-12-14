import axios from "axios";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import CommonInput from "./CommonInput";

import "./ManageCategory.scss";

export default function ManageCategory(props) {
  const [categories, setCategories] = useState([]);
  const [inputCategoryName, setInputCategoryName] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState({});

  /* 카테고리를 받아오는 useEffect() */
  useEffect(() => {
    getCategories();
  }, []);

  /* 카테고리 변경 사항을 서버에 전송하는 useEffect() */
  useEffect(() => {
    updateCategory();
  }, [categories]);

  const getCategories = async () => {
    setCategories(
      (await axios.get("/api/category/getCategories")).data.categories
    );
  };

  const updateCategory = async () => {
    await axios.post("/api/category/updateCategories", { categories });
  };

  const createCategory = async (e) => {
    await axios
      .post("/api/category/createCategory", {
        name: inputCategoryName,
        thumbnailURL: thumbnailImage.imageLocation
      })
      .then(
        (res) => {
          if (res.data.successfullyCreateCategory) {
            alert("카테고리를 생성하였습니다");
            getCategories();
          }
        },
        (err) => {
          alert("에러가 발생하였습니다");
        }
      );
  };

  const handleImageInput = async (e) => {
    const formData = new FormData();
    formData.append("filename", e.target.files[0].name);
    formData.append("img", e.target.files[0]);

    axios
      .post("/api/category/uploadImage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(
        (res) => {
          setThumbnailImage(res.data);
        },
        (err) => {
          alert("이미지 업로드 실패");
        }
      );
  };

  const handleDragChange = (result) => {
    if (!result.destination) {
      return;
    }
    const items = [...categories];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const indexAlimentedItems = items.map((eachItem, alignedIndex) => ({
      ...eachItem,
      index: alignedIndex,
    }));
    setCategories(() => indexAlimentedItems);
  };

  const handleDeleteCategory = async (e) => {
    if (window.confirm("이 카테고리를 삭제합니다")) {
      axios
        .post("/api/category/deleteCategory", {
          targetCategory: e.target.value,
        })
        .then(
          (res) => {
            if (res.data.successfullyDeleteCategory) {
              alert("카테고리를 삭제했습니다");
              getCategories();
            } else if (
              !res.data.successfullyDeleteCategory &&
              res.data.hasOneOrMorePost
            ) {
              alert(
                `아직 이 카테고리를 이용하는 포스트가 ${res.data.remainPosts}개 있습니다`
              );
            }
          },
          (err) => {
            alert("서버에서 에러가 발생하였습니다");
          }
        );
    } else {
      return;
    }
  };

  return (
    <>
      <div className="manage-category-container">
        <div className="manage-category-upper">
          <div className="create-category-resource">
            <input type="file" accept="image/*" onChange={handleImageInput} />
            <img
              src={thumbnailImage.imageLocation}
              className="uploaded-category-thumbnail"
              alt={thumbnailImage.imageLocation}
            />
            <CommonInput
              onChange={(e) => {
                setInputCategoryName(e.target.value);
              }}
            />
            <button
              className="common-button create-category-button"
              onClick={createCategory}
            >
              카테고리 생성
            </button>
          </div>
        </div>
        <p>드래그해서 카테고리 순서를 조정하세요</p>
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
                        className="common-list-item category-item"
                        ref={provided.innerRef}
                        {...provided.dragHandleProps}
                        {...provided.draggableProps}
                      >
                        <img
                          src={eachCategory.thumbnailURL}
                          className="category-item-thumbnail"
                        />
                        {eachCategory.name}
                        <button
                          className="common-button delete-category-button"
                          onClick={handleDeleteCategory}
                          value={eachCategory._id}
                        >
                          삭제
                        </button>
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
