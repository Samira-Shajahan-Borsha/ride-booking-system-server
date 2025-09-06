import { envVars } from "../config/env";
import { IAuthProvider, IUser, ROLE } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcrypt from "bcryptjs";

export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExist = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL });

        if (isSuperAdminExist) {
            console.log("Super admin already exists");
            return;
        }

        console.log("Trying to seeding super admin...");

        const hashedPassword = await bcrypt.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND));

        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: envVars.SUPER_ADMIN_EMAIL,
        };

        const payload: Partial<IUser> = {
            name: "Super Admin",
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            role: ROLE.SUPER_ADMIN,
            isVerified: true,
            auths: [authProvider],
        };

        await User.create(payload);
        console.log("Super admin created successfully");
    } catch (error) {
        console.log(`Error while seeding super admin, ${error}`);
    }
};
