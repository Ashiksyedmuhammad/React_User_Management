import { CgDarkMode } from "react-icons/cg";
import { useDispatch, useSelector } from "react-redux";
import { switchTheme } from "../redux/slices/themeSlice";

const Theme = () => {

    const dispatch = useDispatch();

    const theme = useSelector((state: any) => state.theme.mode);

  return (
    <>
    <button className={`absolute right-10 top-10 border-2 border-transparent shadow-md rounded-full active:border-[#4CC988] hover:scale-110 transition-all duration-200 ${theme === 'light' ? 'rotate-180' : ''}`}
    onClick={() => dispatch(switchTheme())}>
        <CgDarkMode size={30} />
    </button>
    </>
  )
}

export default Theme;