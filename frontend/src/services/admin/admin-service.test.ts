import serverAxios from '@/router/server-axios'
import { AdminService } from '@/services/admin/admin-service'

vi.mock('axios')

vi.mock('@/router/server-axios', () => ({
  default: {
    put: vi.fn(() => ({ data: 'successful response' })),
    get: vi.fn(() => ({ data: { teams: [] } })),
    delete: vi.fn(() => undefined)
  }
}))

afterEach(() => {
  vi.clearAllMocks()
})

describe('AdminServiceImpl', () => {
  describe('getUsers', () => {
    it('should return users data', async () => {
      const mockResponse = {
        data: {
          users: [
            {
              id: 1,
              external_id: '000000000000000000000000000000000000',
              name: 'some-name',
              role: 'default',
              created_at: '2023-01-01T00:00:00.000Z',
              updated_at: '2023-01-01T00:00:00.000Z',
              last_login: '2023-01-01T00:00:00.000Z',
              version: 1,
              avatar: undefined
            }
          ]
        }
      }

      serverAxios.get = vi.fn().mockResolvedValue(mockResponse)

      const result = await AdminService.getUsers()
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('verifyAdmin', () => {
    it('should return true if admin is verified', async () => {
      serverAxios.get = vi.fn().mockResolvedValue({ status: 200 })

      const result = await AdminService.verifyAdmin()
      expect(result).toBe(true)
    })

    it('should return false if admin is not verified', async () => {
      serverAxios.get = vi.fn().mockResolvedValue({ status: 403 })

      const result = await AdminService.verifyAdmin()
      expect(result).toBe(false)
    })
  })
})
