import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import "./Common.scss";
import "./CommonModal.scss";
import "./CategoryModal.scss";

export default function CategoryModal({ isModalOpen, closeModal, categories }) {
  const navigate = useNavigate();

  return (
    <>
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className={isModalOpen ? "modal open" : "modal"}
            initial={{
              y: window.innerHeight / 2,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { ease: "anticipate", duration: 0.7},
            }}
            exit={{
              y: window.innerHeight / 2,
              opacity: 0,
            }}
            onClick={closeModal}
          >
            <motion.section
              onClick={(e) => e.stopPropagation()}
              initial={{
                opacity: 0,
                y: window.innerHeight / 2,
              }}
              animate={{
                y: "0",
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                y: window.innerHeight / 2,
              }}
            >
              <div className="category-list">
                {categories.map((eachCategory) => (
                  <motion.li
                    className="common-list-item category-item"
                    onClick={() => {
                      closeModal();
                      navigate(`/category/${eachCategory.name}`);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 1.0 }}
                    key={uuidv4()}
                  >
                    {/* <img src={eachCategory.thumbnailURL} /> */}
                    <p>{eachCategory.name}</p>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
