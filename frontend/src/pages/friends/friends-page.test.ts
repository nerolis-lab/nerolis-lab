import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import FriendsPage from './friends-page.vue'; // The component to test
import { useFriendStore } from '@/stores/friend-store/friend-store';
import { useUserStore } from '@/stores/user-store';
import type { BaseUser } from 'sleepapi-common';

// Mock stores
vi.mock('@/stores/friend-store/friend-store');
vi.mock('@/stores/user-store');

// Mock child component UserAvatar
const MockUserAvatar = defineComponent({
  name: 'UserAvatar',
  props: ['avatar', 'name', 'size', 'class'],
  template: '<div data-testid="mock-user-avatar" :class="class"></div>',
});

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(),
};
Object.defineProperty(global.navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

// Mock alert
global.alert = vi.fn();


describe('FriendsPage.vue', () => {
  let mockFriendStore: ReturnType<typeof createMockFriendStore>;
  let mockUserStore: ReturnType<typeof createMockUserStore>;

  // Helper to create mock stores with fresh state and spies for each test
  function createMockFriendStore() {
    return {
      friends: [] as BaseUser[],
      loading: false,
      sync: vi.fn().mockResolvedValue(undefined),
      sendFriendRequest: vi.fn().mockResolvedValue(true),
      removeFriend: vi.fn().mockResolvedValue(true),
    };
  }

  function createMockUserStore() {
    return {
      details: { friend_code: 'USERCODE1' },
      isLoggedIn: true, // Assuming user is logged in for most tests
      // Add other properties if FriendsPage starts using them
    };
  }

  beforeEach(() => {
    mockFriendStore = createMockFriendStore();
    mockUserStore = createMockUserStore();

    vi.mocked(useFriendStore).mockReturnValue(mockFriendStore as any);
    vi.mocked(useUserStore).mockReturnValue(mockUserStore as any);

    mockClipboard.writeText.mockReset().mockResolvedValue(undefined);
    vi.mocked(global.alert).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function createWrapper() {
    return mount(FriendsPage, {
      global: {
        stubs: {
          UserAvatar: MockUserAvatar,
          // Stub Vuetify components if they cause issues or for shallow mounting
          'v-container': true,
          'v-row': true,
          'v-col': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true,
          'v-progress-circular': true,
          'v-btn': true,
          'v-text-field': { template: '<input data-testid="v-text-field" @input="$emit(\'update:modelValue\', $event.target.value)" :value="modelValue" />', props: ['modelValue', 'label'] },
          'v-list': true,
          'v-list-item': { template: '<div><slot name="prepend" /><slot /><slot name="append" /></div>', props: ['key'] }, // Simplified stub
        },
      },
    });
  }

  it('renders user friend code on mount', async () => {
    mockUserStore.details.friend_code = 'MYCODE123';
    const wrapper = createWrapper();
    await flushPromises(); // Wait for onMounted and computed properties

    expect(wrapper.text()).toContain('MYCODE123');
  });

  it('calls friendStore.sync on mount', () => {
    createWrapper();
    expect(mockFriendStore.sync).toHaveBeenCalledTimes(1);
  });

  it('displays loading indicator when friendStore.loading is true', async () => {
    mockFriendStore.loading = true;
    const wrapper = createWrapper();
    await nextTick();

    expect(wrapper.findComponent({ name: 'v-progress-circular' }).exists()).toBe(true);
    expect(wrapper.text()).toContain('Loading friends...');
  });

  it('displays "no friends" message when friends list is empty and not loading', async () => {
    mockFriendStore.friends = [];
    mockFriendStore.loading = false;
    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain('You currently have no friends.');
  });

  it('renders list of friends correctly', async () => {
    mockFriendStore.friends = [
      { name: 'Friend One', friend_code: 'FRIEND01', avatar: 'avatar1.png' },
      { name: 'Friend Two', friend_code: 'FRIEND02', avatar: 'avatar2.png' },
    ];
    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.findAllComponents(MockUserAvatar).length).toBe(2);
    expect(wrapper.text()).toContain('Friend One');
    expect(wrapper.text()).toContain('FRIEND01');
    expect(wrapper.text()).toContain('Friend Two');
    expect(wrapper.text()).toContain('FRIEND02');
  });

  describe('Add Friend', () => {
    it('does not call sendFriendRequest if friend code input is empty', async () => {
      const wrapper = createWrapper();
      // Find the "Add Friend" button - assuming it's the one with primary color or specific text
      const addButton = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add friend'));
      await addButton!.trigger('click');
      
      expect(mockFriendStore.sendFriendRequest).not.toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith('Please enter a friend code.');
    });

    it('calls friendStore.sendFriendRequest with input value and shows success alert', async () => {
      const wrapper = createWrapper();
      const input = wrapper.find('[data-testid="v-text-field"]');
      await input.setValue('NEWFRIEND');
      
      const addButton = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add friend'));
      await addButton!.trigger('click');

      expect(mockFriendStore.sendFriendRequest).toHaveBeenCalledWith('NEWFRIEND');
      await flushPromises(); // for the alert
      expect(global.alert).toHaveBeenCalledWith('Friend request sent successfully!');
    });

    it('shows failure alert if sendFriendRequest returns false', async () => {
      mockFriendStore.sendFriendRequest.mockResolvedValue(false);
      const wrapper = createWrapper();
      const input = wrapper.find('[data-testid="v-text-field"]');
      await input.setValue('FAILFRIEND');

      const addButton = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('add friend'));
      await addButton!.trigger('click');
      await flushPromises();
      
      expect(mockFriendStore.sendFriendRequest).toHaveBeenCalledWith('FAILFRIEND');
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to send friend request.'));
    });
  });

  describe('Remove Friend', () => {
    it('calls friendStore.removeFriend with correct friend code and shows success alert', async () => {
      mockFriendStore.friends = [{ name: 'Friend One', friend_code: 'FRIEND01', avatar: 'avatar1.png' }];
      const wrapper = createWrapper();
      await flushPromises();

      // Find the remove button associated with FRIEND01
      // This relies on the structure including the friend_code or a specific button attribute
      // For simplicity, assuming the first "Remove Friend" button found corresponds to the first friend
      const removeButton = wrapper.findAll('button').find(b => b.attributes('title') === 'Remove Friend');
      await removeButton!.trigger('click');
      await flushPromises();

      expect(mockFriendStore.removeFriend).toHaveBeenCalledWith('FRIEND01');
      expect(global.alert).toHaveBeenCalledWith('Friend removed successfully!');
    });

    it('shows failure alert if removeFriend returns false', async () => {
      mockFriendStore.friends = [{ name: 'Friend One', friend_code: 'FRIEND01', avatar: 'avatar1.png' }];
      mockFriendStore.removeFriend.mockResolvedValue(false);
      const wrapper = createWrapper();
      await flushPromises();

      const removeButton = wrapper.findAll('button').find(b => b.attributes('title') === 'Remove Friend');
      await removeButton!.trigger('click');
      await flushPromises();

      expect(mockFriendStore.removeFriend).toHaveBeenCalledWith('FRIEND01');
      expect(global.alert).toHaveBeenCalledWith('Failed to remove friend.');
    });
  });
  
  describe('Copy Friend Code', () => {
    it('calls navigator.clipboard.writeText with user friend code', async () => {
      mockUserStore.details.friend_code = 'MYCODE123';
      const wrapper = createWrapper();
      await flushPromises();

      const copyButton = wrapper.findAll('button').find(b => b.attributes('title') === 'Copy Friend Code');
      await copyButton!.trigger('click');
      
      expect(mockClipboard.writeText).toHaveBeenCalledWith('MYCODE123');
      expect(global.alert).toHaveBeenCalledWith('Friend code copied to clipboard!');
    });

    it('shows failure alert if clipboard writeText fails', async () => {
      mockUserStore.details.friend_code = 'MYCODE123';
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'));
      const wrapper = createWrapper();
      await flushPromises();

      const copyButton = wrapper.findAll('button').find(b => b.attributes('title') === 'Copy Friend Code');
      await copyButton!.trigger('click');
      await flushPromises(); // for the catch block and alert

      expect(mockClipboard.writeText).toHaveBeenCalledWith('MYCODE123');
      expect(global.alert).toHaveBeenCalledWith('Failed to copy friend code.');
    });

     it('shows alert if friend code is not available to copy', async () => {
      mockUserStore.details.friend_code = null as any; // Simulate no friend code
      const wrapper = createWrapper();
      await flushPromises();

      const copyButton = wrapper.findAll('button').find(b => b.attributes('title') === 'Copy Friend Code');
      await copyButton!.trigger('click');
      
      expect(mockClipboard.writeText).not.toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith('Friend code not available to copy.');
    });
  });
});
