import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import "./Common.scss";
import "./CommonModal.scss";
import "./CategoryModal.scss";

export default function CategoryModal({
  isModalOpen,
  closeModal,
  categories,
  numsOfPosts,
}) {
  const navigate = useNavigate();

  return (
    <>
      <AnimatePresence>
        {isModalOpen && (
          <div
            className={isModalOpen ? "modal open" : "modal"}
            onClick={closeModal}
          >
            <motion.section
              className="category-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{
                opacity: 0,
                y: window.innerHeight / 2,
              }}
              animate={{
                y: 0,
                opacity: 1,
                transition: { ease: "anticipate", duration: 0.5 },
              }}
              exit={{
                opacity: 0,
                y: window.innerHeight / 2,
                transition: { ease: "anticipate", duration: 0.5 },
              }}
            >
              <div className="category-list">
                {categories.map((eachCategory, index) => (
                  <motion.li
                    className="common-list-item category-item"
                    onClick={() => {
                      closeModal();
                      navigate(`/category/${eachCategory.name}`);
                    }}
                    key={uuidv4()}
                    whileHover={{
                      backgroundColor: "rgb(150, 150, 150, 0.7)",
                      // "@media (prefers-color-scheme: dark)": {
                      //   backgroundColor: "rgba(40, 40, 40, 0.7)",
                      // },
                      transition: { duration: 0.05 },
                    }}
                  >
                    {/* <img src={eachCategory.thumbnailURL} /> */}
                    <p className="category-name">{eachCategory.name}</p>
                    <p className="nums-of-posts">
                      {numsOfPosts[index]}개 포스트
                    </p>
                  </motion.li>
                ))}
              </div>

              {/* <motion.button
                onClick={closeModal}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 1.0 }}
              >
                닫기
              </motion.button> */}
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
