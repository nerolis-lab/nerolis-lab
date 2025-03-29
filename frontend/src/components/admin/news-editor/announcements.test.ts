/* eslint-disable @typescript-eslint/no-explicit-any */
import Announcements from '@/components/admin/news-editor/announcements.vue'
import { NotificationService } from '@/services/notification-service/notification-service'
import { mount } from '@vue/test-utils'
import type { NewsNotification } from 'sleepapi-common'
import { NotificationType } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/inbox/notifications/news/news-notification.vue', () => ({
  default: {
    name: 'NewsNotificationComponent',
    props: ['notification', 'previewMode'],
    template:
      '<div data-testid="news-notification">{{ notification.news.title }} - {{ notification.news.content }}</div>'
  }
}))

vi.mock('@/services/notification-service/notification-service', () => ({
  NotificationService: {
    createNews: vi.fn(),
    getNewsHistory: vi.fn()
  }
}))

vi.mock('@/services/utils/date/date-utils', () => ({
  DateUtils: {
    formatDate: vi.fn().mockReturnValue('March 1, 2025')
  }
}))

vi.mock('@/composables/use-breakpoint/use-breakpoint', () => ({
  useBreakpoint: vi.fn().mockReturnValue({
    isMobile: false
  })
}))

vi.mock('@/stores/user-store', () => ({
  useUserStore: vi.fn().mockReturnValue({
    externalId: 'user-123',
    name: 'Test User',
    avatar: 'default',
    friendCode: 'ABC123'
  })
}))

vi.mock('@/stores/avatar-store/avatar-store', () => ({
  useAvatarStore: vi.fn().mockReturnValue({
    getAvatarPath: vi.fn().mockImplementation((path) => `/images/avatars/${path}`)
  })
}))

describe('Announcements.vue', () => {
  const mockNewsHistory: NewsNotification[] = [
    {
      author: 'Admin User',
      authorAvatar: 'admin-avatar',
      title: 'Test Announcement 1',
      content: 'This is test announcement 1 content',
      created_at: '2025-02-01T12:00:00Z'
    },
    {
      author: 'Another Admin',
      authorAvatar: 'another-avatar',
      title: 'Test Announcement 2',
      content: 'This is test announcement 2 content',
      created_at: '2025-02-15T12:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(NotificationService.getNewsHistory).mockResolvedValue(mockNewsHistory)
    vi.mocked(NotificationService.createNews).mockResolvedValue(undefined)
  })

  it('renders the component with create tab selected by default', async () => {
    const wrapper = mount(Announcements)

    expect(wrapper.find('.v-tabs').exists()).toBe(true)
    expect(wrapper.findAll('.v-tab').length).toBe(2)

    const tabs = wrapper.findAll('.v-tab')
    expect(tabs[0].text()).toContain('Create New')
    expect(tabs[1].text()).toContain('History')

    expect(wrapper.vm.announcementTab).toBe('create')

    expect(wrapper.html()).toContain('Title')
    expect(wrapper.html()).toContain('Body')

    expect(wrapper.find('[data-testid="news-notification"]').exists()).toBeTruthy()

    expect(wrapper.html()).toContain('Reset')
    expect(wrapper.html()).toContain('Publish')
  })

  it('updates preview when modifying title and content', async () => {
    const wrapper = mount(Announcements)

    const vm = wrapper.vm as any

    vm.title = 'Test Title'
    vm.content = 'Test Content'

    await wrapper.vm.$nextTick()

    const preview = wrapper.find('[data-testid="news-notification"]')
    expect(preview.text()).toContain('Test Title')
    expect(preview.text()).toContain('Test Content')

    expect(vm.previewKey).toBeGreaterThan(0)
  })

  it('validates form fields correctly', async () => {
    const wrapper = mount(Announcements)
    const vm = wrapper.vm as any

    expect(vm.isValid).toBe(false)

    vm.title = 'Test Title'
    expect(vm.isValid).toBe(false) // Still invalid, content missing

    vm.content = 'Short'
    expect(vm.isValid).toBe(false) // Content too short

    vm.content = 'This is a proper content text'
    expect(vm.isValid).toBe(true) // Now valid

    const longTitle = 'A'.repeat(256)
    vm.title = longTitle
    expect(vm.isValid).toBe(false) // Title too long
  })

  it('publishes news when form is submitted', async () => {
    const wrapper = mount(Announcements)
    const vm = wrapper.vm as any

    vm.title = 'Test Title'
    vm.content = 'This is test content for the announcement'

    await vm.publishNews()

    expect(NotificationService.createNews).toHaveBeenCalledWith({
      title: 'Test Title',
      content: 'This is test content for the announcement',
      authorExternalId: 'user-123'
    })

    expect(vm.title).toBe('')
    expect(vm.content).toBe('')

    expect(vm.showSnackbar).toBe(true)
    expect(vm.snackbarText).toContain('published successfully')
    expect(vm.snackbarColor).toBe('success')
  })

  it('handles publishing errors correctly', async () => {
    vi.mocked(NotificationService.createNews).mockRejectedValueOnce(new Error('API Error'))

    const wrapper = mount(Announcements)
    const vm = wrapper.vm as any

    vm.title = 'Test Title'
    vm.content = 'This is test content for the announcement'

    await vm.publishNews()

    expect(vm.showSnackbar).toBe(true)
    expect(vm.snackbarText).toContain('Error publishing')
    expect(vm.snackbarColor).toBe('error')

    expect(vm.title).toBe('Test Title')
    expect(vm.content).toBe('This is test content for the announcement')
  })

  it('resets form when reset method is called', async () => {
    const wrapper = mount(Announcements)
    const vm = wrapper.vm as any

    vm.title = 'Test Title'
    vm.content = 'This is test content'

    await vm.reset()

    expect(vm.title).toBe('')
    expect(vm.content).toBe('')
  })

  it('loads news history when switching to history tab', async () => {
    const wrapper = mount(Announcements)
    const vm = wrapper.vm as any

    expect(NotificationService.getNewsHistory).not.toHaveBeenCalled()

    vm.announcementTab = 'history'
    await vm.loadNewsHistory()

    expect(NotificationService.getNewsHistory).toHaveBeenCalled()
    expect(vm.newsHistory).toEqual(mockNewsHistory)
    expect(vm.isLoading).toBe(false)
  })

  it('handles news history loading errors', async () => {
    vi.mocked(NotificationService.getNewsHistory).mockRejectedValueOnce(new Error('API Error'))

    const wrapper = mount(Announcements)
    const vm = wrapper.vm as any

    vm.announcementTab = 'history'
    await vm.loadNewsHistory()

    expect(vm.showSnackbar).toBe(true)
    expect(vm.snackbarText).toContain('Error loading announcements')
    expect(vm.snackbarColor).toBe('error')

    expect(vm.isLoading).toBe(false)
  })

  it('opens detail dialog when viewing news details', async () => {
    const wrapper = mount(Announcements)
    const vm = wrapper.vm as any

    vm.viewNewsDetails(mockNewsHistory[0])

    expect(vm.detailDialog).toBe(true)
    expect(vm.selectedNews).toEqual(mockNewsHistory[0])
  })

  it('creates proper notification objects for previews', () => {
    const wrapper = mount(Announcements)
    const vm = wrapper.vm as any

    vm.title = 'Preview Title'
    vm.content = 'Preview Content'

    expect(vm.previewNotification).toEqual(
      expect.objectContaining({
        externalId: 'preview',
        template: NotificationType.News,
        news: expect.objectContaining({
          title: 'Preview Title',
          content: 'Preview Content',
          author: 'Test User'
        })
      })
    )

    expect(vm.selectedNewsNotification).toEqual(vm.previewNotification)

    vm.selectedNews = mockNewsHistory[0]

    expect(vm.selectedNewsNotification).toEqual(
      expect.objectContaining({
        externalId: 'history-preview',
        template: NotificationType.News,
        news: expect.objectContaining({
          title: 'Test Announcement 1',
          content: 'This is test announcement 1 content',
          author: 'Admin User'
        })
      })
    )
  })
})
