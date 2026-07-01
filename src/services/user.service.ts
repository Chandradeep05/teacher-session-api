import { User } from '../models/User';
import { CreateUserInput } from '../validators/user.validator';

export const createUser = async (data: CreateUserInput) => {
  const user = await User.create(data);
  return user;
};

export const findUserById = async (id: string) => {
  return User.findById(id).lean();
};
