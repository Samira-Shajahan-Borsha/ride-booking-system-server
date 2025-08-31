import { Types } from "mongoose";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  DRIVER = "DRIVER",
  RIDER = "RIDER",
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IAuthProvider {
  provider: "credentials" | "google";
  providerId: string;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: Role;
  isVerified: boolean;
  isDeleted: boolean;
  isActive: IsActive;
  auths: IAuthProvider[];
}
