import { User, CreateUserRequest, UpdateUserRequest } from '@/@types/user.types';
import { nanoid } from 'nanoid';
import { apiClient } from '@/lib/api/client';
import { ensureSuccess, type LaravelApiResponse } from '@/lib/api/response';

type UserApiModel = {
  id: number;
  name: string;
};

type UsersResponse = LaravelApiResponse<UserApiModel[]>;

// Mock Data Storage
let userDB: User[] = [
  {
    id: '1',
    userId: 'ADMIN',
    name: 'Administrator',
    role: 'Direksi',
    companyId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'ACCOUNTING',
    name: 'Staff Accounting',
    role: 'Accounting',
    companyId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'WAREHOUSE',
    name: 'Kepala Gudang',
    role: 'Warehouse',
    companyId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    userId: 'OWNER',
    name: 'Bapak Direktur',
    role: 'Direksi',
    companyId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getUsers(companyId: string): Promise<User[]> {
  await delay(500);
  // Multi-company isolation
  return userDB.filter((u) => u.companyId === companyId);
}

export async function createUser(payload: CreateUserRequest): Promise<User> {
  await delay(500);

  // Duplicate Check (Hardened)
  const exists = userDB.some((u) => u.userId === payload.userId && u.companyId === payload.companyId);
  if (exists) {
    throw new Error(`User ID "${payload.userId}" sudah digunakan`);
  }

  const newUser: User = {
    id: nanoid(),
    userId: payload.userId,
    name: payload.name,
    role: payload.role,
    companyId: payload.companyId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Immutable Update
  userDB = [...userDB, newUser];
  return newUser;
}

export async function updateUser(payload: UpdateUserRequest): Promise<User> {
  await delay(500);

  const index = userDB.findIndex((u) => u.id === payload.id);
  if (index === -1) throw new Error('User tidak ditemukan');

  // Immutable Update
  const updatedUser = {
    ...userDB[index],
    name: payload.name,
    role: payload.role,
    updatedAt: new Date().toISOString(),
  };

  // Only update password if provided
  // Note: In a real app, this is where hashing would occur
  if (payload.password) {
    // Mocking password update logic
    console.log(`Password for user ${updatedUser.userId} updated`);
  }

  userDB = [...userDB.slice(0, index), updatedUser, ...userDB.slice(index + 1)];

  return updatedUser;
}

export async function deleteUser(id: string): Promise<void> {
  await delay(500);
  // Immutable Update
  userDB = userDB.filter((u) => u.id !== id);
}

// === API: User list for selector ===
export interface UserOption {
  id: number;
  name: string;
}

export async function fetchUsersOptions(): Promise<UserOption[]> {
  const response = await apiClient.get<UsersResponse>('/wapi/users');
  const data = ensureSuccess(response.data);
  return (data ?? []).map((u) => ({ id: u.id, name: u.name }));
}
