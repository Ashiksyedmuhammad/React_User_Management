import { useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";
import Navbar from "../components/Navbar";
import customAxios from "../utils/apiClient";
import { Link, useNavigate } from "react-router-dom";
import profile_pic from "../../public/profile_pic.png";
import Theme from "../components/Theme";
import { useSelector } from "react-redux";
import "./Home.css";

interface User {
  name: string;
  email: string;
  image?: string;
}

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const theme = useSelector((state: any) => state.theme.mode);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await customAxios.get("/api/auth/user");
        if (response.status === 200) {
          setUser(response.data);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        navigate("/login");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <>
      <Navbar />
      <div
        className={`main-container w-screen h-screen flex items-start justify-center ${
          theme === "dark"
            ? "bg-[#222222] text-[#DDD8D5]"
            : "bg-[#f1f1f1] text-[#222222]"
        }`}
      >
        <Theme />
        <div
          className={`info-container relative group flex flex-col gap-y-5 items-center justify-center w-[40%] h-[60%] border-[5px] rounded-xl p-5 mt-[10%] ${
            theme === "dark"
              ? "border-[#ddd8d525]"
              : "border-[#5c5c5c] bg-[#e1e1e17e]"
          }`}
        >
          <Link
            to="/profile"
            className="edit-btn flex items-center justify-center rounded absolute top-3 right-3 bg-[#72716f25] hover:bg-[#c6c2bc25] cursor-pointer transition-all duration-300 h-[30px] w-[30px]"
          >
            <MdEdit size={20} />
          </Link>
          <div className="profile-pic border-[5px] rounded-full w-36 h-36 overflow-hidden bg-[#222222] border-[#40404091]">
            <img
              src={user?.image || profile_pic}
              alt="profile picture"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-4xl font-bold">
            {user ? `Hello, ${user.name}` : "Hello, Guest"}
            <span className="inline-block pl-2 group-hover:animate-wave hover:animate-wave transition-transform duration-1000 cursor-default">
              👋
            </span>
          </h2>
          <p className="text-lg text-[#7f7f7f] font-semibold">
            {user ? user.email : "email"}
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
