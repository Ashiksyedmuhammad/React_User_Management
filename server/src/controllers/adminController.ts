import { Request, Response } from 'express';
import User, { IUser } from '../models/userModel';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const searchTerm = req.query.searchTerm as string || '';
        const page = Number(req.query.page) as number || 1;
        const limit = Number(req.query.limit) as number || 4;

        const skip = (page - 1) * limit;

        console.log('page: ', page, ' limit: ', limit, ' skip: ', skip);
        
        const query = searchTerm ?
        {
            isAdmin: false,
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
            ],
        }
        : { isAdmin: false }
        const users = await User.find(query).skip(skip).limit(limit);

        if (!users) {
            res.status(404).json({ message: 'Users not found!' });
            console.log('No users were found');
            return;
        }

        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);
        const currentPage = page;
        const hasNextPage = page < totalPages ? true : false;
        const hasPrevPage = page > 1 ? true : false;

        res.status(200).json({
            users,
            totalUsers,
            totalPages,
            currentPage,
            hasNextPage,
            hasPrevPage
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error });
    }
};

export const editUser = async  (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const { name, email, image } =  req.body;

        const response = await User.findByIdAndUpdate(userId, { name, email, image });
        res.status(200).json({message: 'Updated user successfully'});
    } catch (error) {
        res.status(500).json({ message: 'Failed to update the user', error });
    }
}

export const deleteUser = async  (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;

        const response = await User.findByIdAndDelete(userId);
        res.status(200).json({message: 'Deleted user successfully'});
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete the user', error });
    }
}