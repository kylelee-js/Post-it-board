import { firestoreDB } from "firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
} from "@firebase/firestore";
import React, { useState, useEffect } from "react";
import PostIt from "../components/PostIt";
import "../styles/App.css";
import { motion, Variants } from "framer-motion";
import styled from "styled-components";
import PostItModal from "components/PostItModal";
import { useRecoilState } from "recoil";
import { likedPostIdArr, userState, writeOpenState } from "atoms";
import { AnimatePresence } from "framer-motion";

const PostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.widthoffset}, 1fr);
`;
const Shade = styled(motion.div)`
  z-index: -999;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
`;
const WriteButton = styled.button`
  cursor: pointer;
  width: 100px;
  border: none;
  color: white;
  background-color: orange;
  padding: 5px;
  font-size: 15px;
  border-radius: 10px;
  margin: 10px;
  font-family: "SpoqaHanSansNeo";
`;

const ButtonMenu = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 300px;
`;

const Home = ({ userObj }) => {
  let [offset, setOffset] = useState(0);
  const [postArry, setPostArry] = useState([]);
  // const [likedPostId, setLikedPostId] = useRecoilState(likedPostIdArr);
  const [likedPostId, setLikedPostId] = useState([]);
  const [isSorted, setIsSorted] = useState(false);
  const [isModalOn, setIsModalOn] = useRecoilState(writeOpenState);
  const [userInfoState, setUserInfoState] = useRecoilState(userState);

  const onSortClick = () => {
    setIsSorted((prev) => !prev);
    console.log(isSorted);
  };
  const onWriteClick = () => {
    setIsModalOn((prev) => !prev);
  };

  useEffect(() => {
    try {
      const qu = query(
        collection(firestoreDB, "UserInfo"),
        where("id", "==", userObj.uid)
      );
      const userSnapshot = onSnapshot(qu, (snapshot) => {
        const userInfoArry = snapshot.docs.map((elem) => ({
          ...elem.data(),
        }));
        const { likePost } = userInfoArry[0];
        const { nickname } = userInfoArry[0];
        setLikedPostId(likePost);
        setUserInfoState({ id: userObj.uid, nickname: nickname });
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth < 600) {
      setOffset(1);
    } else if (window.innerWidth <= 930) {
      setOffset(2);
    } else if (window.innerWidth < 1200) {
      setOffset(3);
    } else if (window.innerWidth > 1200) {
      setOffset(4);
    }
    const setResponsiveOffset = () => {
      if (window.innerWidth < 600) {
        setOffset(1);
      } else if (window.innerWidth <= 930) {
        setOffset(2);
      } else if (window.innerWidth < 1200) {
        setOffset(3);
      } else if (window.innerWidth > 1200) {
        setOffset(4);
      }
    };
    // resize ????????? ????????? ???????????? ??????????????? ????????? ??? ?????????
    window.addEventListener("resize", setResponsiveOffset);

    // ?????? ????????? ???????????? ???????????? ????????? ????????? ???????????????.
    return () => window.removeEventListener("resize", setResponsiveOffset);
  }, []);

  // 4) ????????? snapshot ?????????
  useEffect(() => {
    // ?????? ??????
    const sortOrder = "uploadedAt";
    // ????????? ??????
    const q = query(
      collection(firestoreDB, "Post"),
      orderBy(sortOrder, "desc")
    );
    const postSnapshot = onSnapshot(q, (snapshot) => {
      const docArry = snapshot.docs.map((elem) => ({
        id: elem.id,
        ...elem.data(),
      }));
      setPostArry(docArry);
    });
  }, [isSorted]);

  return (
    <>
      <AnimatePresence>
        <ButtonMenu>
          <button className="defaultButton" onClick={onSortClick}>
            Sort by {isSorted ? "Time" : "Like"}
          </button>
          <WriteButton onClick={onWriteClick}>??? ??? ????????????</WriteButton>
        </ButtonMenu>

        <div className="flexContainer">
          {/* <Shade
            layoutId="PostitModal"
          /> */}

          {isModalOn && <PostItModal userObj={userObj} />}

          <PostGrid widthoffset={offset}>
            {postArry
              .sort((a, b) => {
                if (isSorted) {
                  return b.like - a.like;
                } else {
                  return b.uploadedAt - a.uploadedAt;
                }
              })
              .map((element, idx) => {
                if (idx == 0) {
                  return (
                    <PostIt
                      key={element.id}
                      postObj={element}
                      isOwner={userObj.uid === element.author}
                      uid={userObj.uid}
                      isLikedbyCurrentUser={likedPostId.includes(element.id)}
                      layoutId="PostitModal"
                    />
                  );
                } else {
                  return (
                    <PostIt
                      key={element.id}
                      postObj={element}
                      isOwner={userObj.uid === element.author}
                      uid={userObj.uid}
                      isLikedbyCurrentUser={likedPostId.includes(element.id)}
                    />
                  );
                }
              })}
          </PostGrid>
        </div>
      </AnimatePresence>
    </>
  );
};

export default Home;
