import serverAxios from '@/router/server-axios'
import type { UsersResponse } from 'sleepapi-common'

class AdminServiceImpl {
  public async getUsers(): Promise<UsersResponse> {
    const response = await serverAxios.get<UsersResponse>('admin/users')
    return response.data
  }

  public async verifyAdmin() {
    const response = await serverAxios.get('admin/verify')
    return response.status === 200
  }
}

export const AdminService = new AdminServiceImpl()
