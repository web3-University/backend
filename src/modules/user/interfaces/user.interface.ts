/**
 * 用户接口定义
 */
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
