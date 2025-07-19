import React, { useEffect, useState } from 'react'
import axios from '../utils/urlProxy'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../redux/slices/authSlice'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios';
import Theme from '../components/Theme';

interface LoginResponse {
  token: string;
  refreshToken: string;
  name: string;
  email: string;
  isAdmin: boolean;
  message: string;
}

const LoginPage: React.FC = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const theme = useSelector((state: any) => state.theme.mode);
  const token = localStorage.getItem('token');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
      if (token) {
        navigate('/home');
      }
  }, [token, navigate]);

  const validateEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEmail = e.target.value.trim();
    setEmail(inputEmail);

    const validate = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

    if ((emailMessage || errorMessage) && !validate(inputEmail)) {
      setEmailMessage('Please enter a valid email!');
    } else {
      setEmailMessage('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const validate = (email: string) => {
      return (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(email);
    };

    const inputPassword = password.trim();

    setEmailMessage('');
    setPasswordMessage('');

    let isValid = true;

    if (!email) {
        setEmailMessage('Please enter the email');
        isValid = false;
    } else if (!validate(email)) {
      setEmailMessage('Please enter a valid email');
      isValid = false;
    }

    if (!inputPassword) {
        setPasswordMessage('Please enter the password');
        isValid = false;
    } else if (inputPassword.length < 6) {
        setPasswordMessage('Minimum 6 characters');
        isValid = false;
    }

    if (isValid) {

        try {
            const response = await axios.post<LoginResponse>('/api/auth/login', { 
                email, 
                password: inputPassword 
            });

            console.log('Response: ', response)

            if (response.status !== 200) {
                return setErrorMessage(response.data.message);
            }

            if (response.data) {
              const { token, refreshToken, name, email, isAdmin } = response.data;

              dispatch(login({ name, email, token, refreshToken }));
              if (isAdmin) {
                navigate('/admin/dashboard');
              } else {
                navigate('/home');
              }
            }
        } catch (error: unknown) {
          // setIsLoading(false);
          if (error instanceof AxiosError) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            setErrorMessage(errorMessage);
          } else {
            console.error('Login failed:', error);
            setErrorMessage('An unexpected error occurred');
          }
        } finally {
          // setIsLoading(false);
        }
    }
};

  return (
    <>
    <div className={`relative main-container w-screen h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#222222] text-[#DDD8D5]' : 'bg-[#f1f1f1] text-[#222222]'}`}>
      <Theme />
      <div className={`login-form border-[5px] ${theme === 'dark' ? 'border-[#ddd8d525]' : 'border-[#5c5c5c]'} transition-all duration-300 rounded-xl max-w-xl w-[400px] p-3`}>
      <div className='login-title flex items-center justify-start gap-x-2 p-4 pb-8 text-5xl font-bold'>
        <h2 className={`${theme === 'dark' ? '' : 'text-[#414141]'}`}>Login</h2> 
        {isLoading && <div className="tenor-gif-embed" data-postid="18368917" data-share-method="host" data-aspect-ratio="1" data-width="10%"></div>}
      </div>
      {errorMessage && <span className='p-3 opacity-75 font-semibold text-red-400'>{errorMessage}</span>}
      <hr className='opacity-20'/>
        <form onSubmit={handleLogin} className='py-5'>
          <div className="input-field flex flex-col p-3 gap-y-2">
            {emailMessage ? <label htmlFor="email" className='opacity-75 font-semibold text-red-400'>{emailMessage}</label>
            : <label htmlFor="email" className='opacity-75 font-semibold'>Email</label>}
            <input
            type="text" 
            name="email" 
            id="email" 
            value={email}
            onChange={validateEmail}
            className={`transition-all duration-300 bg-transparent px-3 py-1 text-xl font-semibold border-b-[3px] ${emailMessage || errorMessage ? 'border-red-400' : theme === 'dark' ? 'border-[#DDD8D5]' : 'border-[#222222]'} border-opacity-20 focus:border-opacity-75 outline-none`}/>
          </div>
          <div className="input-field flex flex-col p-3 gap-y-2">
            {passwordMessage ? <label htmlFor="password" className='opacity-75 font-semibold text-red-400'>{passwordMessage}</label>
            : <label htmlFor="password" className='opacity-75 font-semibold'>Password</label>}
            <input 
            type="password" 
            name="password" 
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`transition-all duration-300 bg-transparent px-3 py-1  text-xl font-semibold border-b-[3px] ${passwordMessage || errorMessage ? 'border-red-400' : theme === 'dark' ? 'border-[#DDD8D5]' : 'border-[#222222]'} border-opacity-20 focus:border-opacity-75 outline-none`}/>
          </div>
          <div className="btns flex items-center justify-between mx-3 mb-2 mt-5">
            <button type='submit' 
            className={`px-4 transition-all duration-300 py-1 text-xl font-bold rounded-md border-[3px] ${theme === 'dark' ? 'text-[#4CC988] active:text-[#4cc9887d] active:border-[#ddd8d556] border-[#ddd8d556] hover:border-[#ddd8d58d]' : 'text-[#222222] active:text-[#4cc9887d] active:border-[#222222] border-[#696969] hover:border-[#222222]'}`}>
              Submit</button>
            <div className='new-user text-[14px]'><span className='opacity-60 pr-2'>Not Registered?</span><Link to="/register" 
            className={`${theme === 'dark' ? 'text-[#4CC988]' : 'text-[#414141]'} font-semibold pr-1 hover:underline`}>Register Now</Link></div>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}

export default LoginPage;