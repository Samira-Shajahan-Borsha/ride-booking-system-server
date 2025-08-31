import { envVars } from "../../config/env";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password: plainPassword, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(plainPassword as string, Number(envVars.BCRYPT_SALT_ROUND));

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const createdUser = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  const { password, ...user } = createdUser.toObject();

  return user;
};

const getAllUsers = async () => {
  const allUsers = await User.find({});

  const users = allUsers?.map((user) => {
    const { password, ...usersWithoutPassword } = user.toObject();
    return usersWithoutPassword;
  });

  console.log(users, "users");

  const totalUsers = await User.countDocuments();

  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};

export const UserService = {
  createUser,
  getAllUsers,
};
