import { useEffect, useState } from 'react';
import { MdEdit, MdDelete, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { AiOutlineUserAdd } from "react-icons/ai";
import { IoLogOut } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import profile_pic from '../../public/profile_pic.png';
import customAxios from '../utils/apiClient';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import AddUserModal from '../components/AddUserModal';
import EditUserModal from '../components/EditUserModal';
import { useDebounce } from 'use-debounce';

interface User {
    _id: string;
    userId: string;
    name: string;
    email: string;
    image?: string;
}

interface UsersResponse {
    users: User[];
    totalUsers: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

const AdminDashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editDetails, setEditDetails] = useState<Partial<User> | null>({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 4;
 
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [ debouncedSearch ] = useDebounce(searchTerm, 500);

    const clearEditDetails = () => setEditDetails({});

    // Fetch users function with pagination
    const fetchUsers = async (page: number = currentPage): Promise<void> => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setLoading(true);
        try {
            const response = await customAxios.get('/api/admin/users', {
                params: { 
                    searchTerm: debouncedSearch,
                    page: page,
                    limit: itemsPerPage
                }
            });
            
            console.log('API Response: ', response.data);
            
            if (response.status === 200) {
                const data: UsersResponse = response.data;
                setUsers(data.users);
                setTotalUsers(data.totalUsers);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
                setHasNextPage(data.hasNextPage);
                setHasPrevPage(data.hasPrevPage);
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    // Fetch users when search term changes (reset to page 1)
    useEffect(() => {
        setCurrentPage(1);
        fetchUsers(1);
    }, [debouncedSearch]);

    // Fetch users when page changes
    useEffect(() => {
        if (currentPage >= 1) {
            fetchUsers(currentPage);
        }
    }, [currentPage]);

    // Search function
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value.toLowerCase();
        setSearchTerm(searchValue);
    };

    // Logout
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Delete user
    const deleteUser = async (): Promise<void> => {
        try {
            console.log('User Id: ', deleteId);
            const response = await customAxios.delete(`/api/admin/deleteUser/${deleteId}`);
            if (response.status === 200) {
                setIsDeleteModalOpen(false);
                setDeleteId(null);
                
                // If current page becomes empty after deletion, go to previous page
                if (users.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchUsers(currentPage);
                }
            }
        } catch (error) {
            console.error("Failed to delete the user:", error);
        }
    };

    // Pagination handlers
    const handlePreviousPage = () => {
        if (hasPrevPage) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (hasNextPage) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePageClick = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    // Refresh users after add/edit operations
    const refreshUsers = () => {
        fetchUsers(currentPage);
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + users.length;

    return (
    <div className='relative w-screen h-screen'>
        <div className={`w-screen h-screen bg-[#222222] flex flex-col items-center text-[#ddd5d5] p-5 ${isAddModalOpen || isEditModalOpen || isDeleteModalOpen ? 'blur-sm' : ''}`}>
            <div className="header flex flex-col sm:flex-row items-center justify-center gap-x-2">
                <h2 className="text-5xl font-extrabold mb-5">Users List</h2>
                <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={handleSearch} 
                    placeholder="Search by name" 
                    className="text-[#fff] mx-3 rounded-md px-3 py-1 outline-none border-2 border-[#ddd5d5] bg-transparent"
                />
                <div className="btns flex items-center justify-center ml-5">
                    <div className='add-btn items-center justify-center gap-x-1 cursor-pointer flex pl-2 bg-[#343434] hover:bg-[#404040] font-bold px-3 py-1 mx-1 rounded-md transition-all duration-300'
                    onClick={() => setIsAddModalOpen(true)}>
                        <AiOutlineUserAdd />
                        <h2>Add User</h2>
                    </div>
                    <div className='add-btn items-center justify-center gap-x-1 cursor-pointer flex pl-2 bg-[#343434] hover:bg-[#6a1f1f] font-bold px-3 py-1 mx-1 rounded-md transition-all duration-300'
                    onClick={handleLogout}>
                        <IoLogOut />
                        <h2>Logout</h2>
                    </div>
                </div>
            </div>

            {/* Users List with Pagination */}
            <div className="w-full max-w-7xl bg-[#292929] rounded-xl p-5">
                {/* Loading indicator */}
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ddd5d5]"></div>
                        <span className="ml-2 text-[#7f7f7f]">Loading users...</span>
                    </div>
                )}

                {/* Users Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {users.length === 0 && !loading && (
                            <h2 className='text-3xl text-center col-span-full'>
                                {searchTerm ? 'No users found matching your search!' : 'No users found!'}
                            </h2>
                        )}
                        {users.map(user => (
                            <div key={user._id} className="relative group flex flex-col items-center justify-center bg-[#373737] rounded-lg p-5">
                                <div className="absolute top-3 right-12 bg-[#72716f25] hover:bg-[#c6c2bc25] cursor-pointer p-1 rounded transition-all duration-300"
                                onClick={() => {
                                    setIsEditModalOpen(true);
                                    setEditDetails({
                                        userId: user._id,
                                        name: user.name,
                                        email: user.email,
                                        image: user.image
                                    });
                                }}>
                                    <MdEdit size={20} />
                                </div>
                                <button className="absolute top-3 right-3 bg-[#72716f25] hover:bg-[#6a1f1f] p-1 rounded transition-all duration-300"
                                onClick={() => {
                                    setIsDeleteModalOpen(true);
                                    setDeleteId(user._id);
                                }}>
                                    <MdDelete size={20} />
                                </button>
                                <img src={user?.image || profile_pic} alt="profile picture" className="w-24 h-24 rounded-full mb-4" />
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold"><span className='text-[#7f7f7f]'>Name: </span>{user.name}</h3>
                                    <p className="text-lg text-[#7f7f7f]">Email: {user.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && totalUsers > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#404040]">
                        {/* Results Info */}
                        <div className="text-[#7f7f7f] text-sm">
                            Showing {startIndex + 1} to {endIndex} of {totalUsers} users
                        </div>

                        {/* Pagination Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Previous Button */}
                            <button
                                onClick={handlePreviousPage}
                                disabled={!hasPrevPage || loading}
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    !hasPrevPage || loading
                                        ? 'bg-[#404040] text-[#7f7f7f] cursor-not-allowed'
                                        : 'bg-[#404040] text-white hover:bg-[#4a4a4a] hover:scale-105'
                                }`}
                            >
                                <MdChevronLeft size={16} />
                                Previous
                            </button>

                            {/* Page Numbers */}
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1 mx-2">
                                    {getPageNumbers().map((page, index) => (
                                        <div key={index}>
                                            {page === '...' ? (
                                                <span className="px-2 py-1 text-[#7f7f7f]">...</span>
                                            ) : (
                                                <button
                                                    onClick={() => handlePageClick(page as number)}
                                                    disabled={loading}
                                                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-110 ${
                                                        currentPage === page
                                                            ? 'bg-[#5a5a5a] text-white ring-2 ring-[#7f7f7f]'
                                                            : 'bg-[#404040] text-white hover:bg-[#4a4a4a]'
                                                    } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                                                >
                                                    {page}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Next Button */}
                            <button
                                onClick={handleNextPage}
                                disabled={!hasNextPage || loading}
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    !hasNextPage || loading
                                        ? 'bg-[#404040] text-[#7f7f7f] cursor-not-allowed'
                                        : 'bg-[#404040] text-white hover:bg-[#4a4a4a] hover:scale-105'
                                }`}
                            >
                                Next
                                <MdChevronRight size={16} />
                            </button>
                        </div>

                        {/* Page info */}
                        <div className="text-[#7f7f7f] text-sm">
                            Page {currentPage} of {totalPages}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {isAddModalOpen && (
            <AddUserModal 
                isOpen={() => isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)} 
                fetchUsers={refreshUsers}
            />
        )}

        {isEditModalOpen && (
            <EditUserModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                fetchUsers={refreshUsers}
                editDetails={editDetails}
                clearEditDetails={clearEditDetails}
            />
        )}

        {isDeleteModalOpen && (
            <div className="flex flex-col shadow-md delete-confirmation absolute top-20 left-[50%] translate-x-[-50%] p-5 rounded-lg text-[#DDD8D5] border-[5px] border-[#ddd8d525] bg-[#222222]">
                <p className='text-base'>Are you sure you want to delete the user?</p>
                <div className="btns flex items-center justify-end pt-3 gap-x-1">
                    <button 
                        className='rounded-md px-3 py-1 bg-[#363636] hover:bg-[#484848] transition-all duration-300' 
                        onClick={() => setIsDeleteModalOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        className='px-3 py-1 bg-[#363636] rounded-md hover:text-red-400 transition-all duration-300' 
                        onClick={deleteUser}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        )}
    </div>
    );
};

export default AdminDashboard;