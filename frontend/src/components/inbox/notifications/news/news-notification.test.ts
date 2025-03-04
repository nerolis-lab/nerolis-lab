import NewsNotification from '@/components/inbox/notifications/news/news-notification.vue'
import { NotificationService } from '@/services/notification-service/notification-service'
import { DateUtils } from '@/services/utils/date/date-utils'
import { mount } from '@vue/test-utils'
import type { UserNotification } from 'sleepapi-common'
import { NotificationType } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/notification-service/notification-service', () => ({
  NotificationService: {
    dismissNotification: vi.fn()
  }
}))

vi.mock('@/services/utils/date/date-utils', () => ({
  DateUtils: {
    formatDate: vi.fn()
  }
}))

const mockSync = vi.fn()
vi.mock('@/stores/notification-store/notification-store', () => ({
  useNotificationStore: () => ({
    sync: mockSync,
    notifications: []
  })
}))

describe('NewsNotification.vue', () => {
  const mockNews = {
    author: 'Test Author',
    authorAvatar: 'avatar.png',
    title: 'Test News Title',
    content: 'Test news content goes here.',
    created_at: '2025-03-01T12:00:00Z'
  }

  const mockNotification: UserNotification = {
    externalId: 'test-id-123',
    template: NotificationType.News,
    sender: { name: 'Sender', friend_code: 'ABC123' },
    receiver: { name: 'Receiver', friend_code: 'XYZ789' },
    news: mockNews
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(DateUtils.formatDate).mockReturnValue('March 1, 2025')
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('renders the component with correct data', () => {
    const wrapper = mount(NewsNotification, {
      props: {
        notification: mockNotification
      }
    })

    expect(wrapper.find('.v-card-title').text()).toBe('Test News Title')
    expect(wrapper.text()).toContain('Test news content goes here.')
    expect(wrapper.text()).toContain("- Neroli's Assistant")

    expect(DateUtils.formatDate).toHaveBeenCalledWith('2025-03-01T12:00:00Z')

    const avatar = wrapper.find('.v-avatar img')
    expect(avatar.attributes('src')).toBe('/images/sneasel/snote.png')

    expect(wrapper.find('.v-btn').text()).toBe('Dismiss')
  })

  it('dismisses notification when button is clicked', async () => {
    vi.mocked(NotificationService.dismissNotification).mockResolvedValue(true)

    const wrapper = mount(NewsNotification, {
      props: {
        notification: mockNotification
      }
    })

    await wrapper.find('.v-btn').trigger('click')

    expect(NotificationService.dismissNotification).toHaveBeenCalledWith('test-id-123')

    expect(mockSync).toHaveBeenCalled()
    expect(wrapper.vm.loading).toBe(false)
  })

  it('handles dismissal failure gracefully', async () => {
    vi.mocked(NotificationService.dismissNotification).mockResolvedValue(false)

    const wrapper = mount(NewsNotification, {
      props: {
        notification: mockNotification
      }
    })

    await wrapper.find('.v-btn').trigger('click')

    expect(NotificationService.dismissNotification).toHaveBeenCalledWith('test-id-123')
    expect(mockSync).not.toHaveBeenCalled()
    expect(wrapper.vm.loading).toBe(false)
  })

  it('handles missing externalId gracefully', async () => {
    const invalidNotification = { ...mockNotification, externalId: undefined } as unknown as UserNotification

    const loggerErrorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {})

    const wrapper = mount(NewsNotification, {
      props: {
        notification: invalidNotification
      }
    })

    await wrapper.find('.v-btn').trigger('click')

    expect(loggerErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Notification does not have an externalIdl'))
    expect(NotificationService.dismissNotification).not.toHaveBeenCalled()
    loggerErrorSpy.mockRestore()
  })

  it('does not dismiss in preview mode', async () => {
    const wrapper = mount(NewsNotification, {
      props: {
        notification: mockNotification,
        previewMode: true
      }
    })

    await wrapper.find('.v-btn').trigger('click')

    expect(NotificationService.dismissNotification).not.toHaveBeenCalled()
    expect(mockSync).not.toHaveBeenCalled()
  })
})
