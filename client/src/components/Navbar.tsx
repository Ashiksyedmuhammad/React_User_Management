import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import Theme from '../components/Theme';

const Navbar = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const theme = useSelector((state: any) => state.theme.mode);

    const handleLogout = () => {
        dispatch(logout());
        console.log('Logout successfully');
        navigate('/login');
    };

  return (
    <>
    <div className='navbar fixed flex items-center justify-center top-5 right-30 left-30 w-screen'>
        <ul className={`flex items-center justify-center gap-x-10 w-[40%] px-2 rounded ${theme === 'dark' ? 'bg-[#323232] shadow-xl' : 'bg-[#e1e1e1] border-[5px] rounded-xl border-[#5c5c5c]'}`}>
            <li className={`text-xl font-semibold uppercase px-3 py-1 ${theme === 'dark' ? 'text-[#4CC988] active:text-[#4cc9887d] bg-[#292929]' : 'text-[#323232] active:text-[#4cc9887d]'}`}><Link to="/home">Home</Link></li>
            <li className={`text-xl font-semibold uppercase px-3 py-1 ${theme === 'dark' ? 'text-[#4CC988] active:text-[#4cc9887d] bg-[#292929]' : 'text-[#323232] active:text-[#4cc9887d]'}`}><Link to="/profile">Profile</Link></li>
            <li className={`text-xl font-semibold ${theme === 'dark' ? 'text-[#4CC988] active:text-[#4cc9887d] bg-[#292929]' : 'text-[#323232] active:text-[#4cc9887d]'}`}><button className='uppercase px-3 py-1' onClick={handleLogout}>Logout</button></li>
        </ul>
    </div>
    </>
  )
}

export default Navbar;