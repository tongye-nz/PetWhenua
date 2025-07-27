import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils/test-utils'
import { ChatButton } from './ChatButton'

// Mock the auth context
const mockUser = {
  userId: 1,
  username: 'testuser',
  email: 'test@test.com'
}

const mockUseAuth = vi.fn()

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

// Mock the chat API service  
vi.mock('../../../api/chat.api', () => ({
  chatService: {
    getUnreadCount: vi.fn()
  }
}))

// Mock the ChatDialog component
vi.mock('../../features/chat', () => ({
  ChatDialog: vi.fn().mockImplementation(({ open, onClose, initialUserId }) => 
    open ? (
      <div data-testid="chat-dialog">
        <button onClick={onClose}>Close Chat</button>
        <span>User ID: {initialUserId}</span>
      </div>
    ) : null
  )
}))

// Mock MUI icons
vi.mock('@mui/icons-material', () => ({
  Chat: vi.fn().mockImplementation(() => <div data-testid="chat-icon" />),
  ChatBubble: vi.fn().mockImplementation(() => <div data-testid="chat-bubble-icon" />)
}))

describe('ChatButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockUseAuth.mockReturnValue({ user: mockUser })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('authentication handling', () => {
    it('should not render when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({ user: null })
      
      const { container } = render(<ChatButton />)
      
      expect(container).toBeEmptyDOMElement()
    })

    it('should render when user is authenticated', () => {
      render(<ChatButton />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(screen.getByTestId('chat-icon')).toBeInTheDocument()
    })
  })

  describe('basic functionality', () => {
    it('should render with default props', () => {
      render(<ChatButton />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(screen.getByText('Open chat')).toBeInTheDocument()
      expect(screen.getByTestId('chat-icon')).toBeInTheDocument()
    })

    it('should open chat dialog when clicked', () => {
      render(<ChatButton />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(screen.getByTestId('chat-dialog')).toBeInTheDocument()
      expect(screen.getByText('Close Chat')).toBeInTheDocument()
    })

    it('should close chat dialog when close is clicked', () => {
      render(<ChatButton />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(screen.getByTestId('chat-dialog')).toBeInTheDocument()
      
      const closeButton = screen.getByText('Close Chat')
      fireEvent.click(closeButton)
      
      expect(screen.queryByTestId('chat-dialog')).not.toBeInTheDocument()
    })

    it('should pass initialUserId to ChatDialog', () => {
      render(<ChatButton userId={123} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(screen.getByText('User ID: 123')).toBeInTheDocument()
    })
  })

  describe('variant prop', () => {
    it('should render icon variant by default', () => {
      render(<ChatButton />)
      
      expect(screen.getByTestId('chat-icon')).toBeInTheDocument()
    })

    it('should render fab variant when specified', () => {
      render(<ChatButton variant="fab" />)
      
      expect(screen.getByTestId('chat-bubble-icon')).toBeInTheDocument()
      
      const button = screen.getByRole('button')
      // Check that fab styles are applied (fixed position, etc.)
      expect(button).toHaveStyle({
        position: 'fixed',
        bottom: '16px',
        right: '16px'
      })
    })
  })

  describe('size prop', () => {
    it('should render with default medium size', () => {
      render(<ChatButton />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('MuiIconButton-sizeMedium')
    })

    it('should render with small size', () => {
      render(<ChatButton size="small" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('MuiIconButton-sizeSmall')
    })

    it('should render with large size', () => {
      render(<ChatButton size="large" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('MuiIconButton-sizeLarge')
    })
  })

  describe('color prop', () => {
    it('should render with default primary color', () => {
      render(<ChatButton />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('MuiIconButton-colorPrimary')
    })

    it('should render with secondary color', () => {
      render(<ChatButton color="secondary" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('MuiIconButton-colorSecondary')
    })

    it('should render with default color', () => {
      render(<ChatButton color="default" />)
      
      const button = screen.getByRole('button')
      expect(button).not.toHaveClass('MuiIconButton-colorPrimary')
      expect(button).not.toHaveClass('MuiIconButton-colorSecondary')
    })
  })

  describe('tooltip functionality', () => {
    it('should show default tooltip', async () => {
      render(<ChatButton />)
      
      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)
      
      await waitFor(() => {
        expect(screen.getByText('Open chat')).toBeInTheDocument()
      })
    })

    it('should show custom tooltip', async () => {
      render(<ChatButton tooltip="Start conversation" />)
      
      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)
      
      await waitFor(() => {
        expect(screen.getByText('Start conversation')).toBeInTheDocument()
      })
    })
  })

  describe('unread badge functionality', () => {
    it('should not show badge by default', () => {
      render(<ChatButton />)
      
      // Badge component shouldn't be present
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('should fetch unread count when showUnreadBadge is true', async () => {
      const { chatService } = await import('../../../api/chat.api')
      vi.mocked(chatService.getUnreadCount).mockResolvedValue(5)
      
      render(<ChatButton showUnreadBadge />)
      
      await waitFor(() => {
        expect(chatService.getUnreadCount).toHaveBeenCalled()
      })
    })

    it('should display unread count in badge', async () => {
      const { chatService } = await import('../../../api/chat.api')
      vi.mocked(chatService.getUnreadCount).mockResolvedValue(3)
      
      render(<ChatButton showUnreadBadge />)
      
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument()
      })
    })

    it('should not show badge when unread count is 0', async () => {
      const { chatService } = await import('../../../api/chat.api')
      vi.mocked(chatService.getUnreadCount).mockResolvedValue(0)
      
      render(<ChatButton showUnreadBadge />)
      
      await waitFor(() => {
        expect(chatService.getUnreadCount).toHaveBeenCalled()
      })
      
      // Badge with 0 count should not be visible
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('should periodically check for unread count', async () => {
      const { chatService } = await import('../../../api/chat.api')
      vi.mocked(chatService.getUnreadCount).mockResolvedValue(2)
      
      render(<ChatButton showUnreadBadge />)
      
      await waitFor(() => {
        expect(chatService.getUnreadCount).toHaveBeenCalledTimes(1)
      })

      // Fast-forward 30 seconds
      vi.advanceTimersByTime(30000)

      await waitFor(() => {
        expect(chatService.getUnreadCount).toHaveBeenCalledTimes(2)
      })
    })

    it('should reset unread count when chat is opened', async () => {
      const { chatService } = await import('../../../api/chat.api')
      vi.mocked(chatService.getUnreadCount).mockResolvedValue(5)
      
      render(<ChatButton showUnreadBadge />)
      
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')
      fireEvent.click(button)

      // Unread count should reset to 0 when chat opens
      expect(screen.queryByText('5')).not.toBeInTheDocument()
    })

    it('should not fetch unread count for unauthenticated users', () => {
      mockUseAuth.mockReturnValue({ user: null })
      
      render(<ChatButton showUnreadBadge />)
      
      // Component won't render, so API shouldn't be called
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('should handle unread count fetch errors gracefully', async () => {
      const { chatService } = await import('../../../api/chat.api')
      vi.mocked(chatService.getUnreadCount).mockRejectedValue(new Error('API Error'))
      
      render(<ChatButton showUnreadBadge />)
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to load unread count:', 
          expect.any(Error)
        )
      })
    })

    it('should not crash when user becomes null after mount', () => {
      const { rerender } = render(<ChatButton showUnreadBadge />)
      
      mockUseAuth.mockReturnValue({ user: null })
      rerender(<ChatButton showUnreadBadge />)
      
      // Component should not render anything
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('cleanup', () => {
    it('should cleanup interval when component unmounts', async () => {
      const { chatService } = await import('../../../api/chat.api')
      vi.mocked(chatService.getUnreadCount).mockResolvedValue(1)
      
      const { unmount } = render(<ChatButton showUnreadBadge />)
      
      await waitFor(() => {
        expect(chatService.getUnreadCount).toHaveBeenCalled()
      })

      unmount()

      // Fast-forward time after unmount
      vi.advanceTimersByTime(60000)

      // API should not be called again after unmount
      expect(chatService.getUnreadCount).toHaveBeenCalledTimes(1)
    })

    it('should cleanup interval when user becomes null', async () => {
      const { chatService } = await import('../../../api/chat.api')
      vi.mocked(chatService.getUnreadCount).mockResolvedValue(1)
      
      const { rerender } = render(<ChatButton showUnreadBadge />)
      
      await waitFor(() => {
        expect(chatService.getUnreadCount).toHaveBeenCalled()
      })

      mockUseAuth.mockReturnValue({ user: null })
      rerender(<ChatButton showUnreadBadge />)

      // Fast-forward time after user becomes null
      vi.advanceTimersByTime(60000)

      // API should not be called again
      expect(chatService.getUnreadCount).toHaveBeenCalledTimes(1)
    })
  })

  describe('edge cases', () => {
    it('should handle clicking when user is null (safety check)', () => {
      render(<ChatButton />)
      
      const button = screen.getByRole('button')
      
      // Change user to null after render
      mockUseAuth.mockReturnValue({ user: null })
      
      // Should not crash when clicking
      fireEvent.click(button)
      
      expect(screen.queryByTestId('chat-dialog')).not.toBeInTheDocument()
    })

    it('should show maximum of 99 in badge', async () => {
      const { chatService } = await import('../../../api/chat.api')
      vi.mocked(chatService.getUnreadCount).mockResolvedValue(150)
      
      render(<ChatButton showUnreadBadge />)
      
      await waitFor(() => {
        expect(screen.getByText('99+')).toBeInTheDocument()
      })
    })
  })
}) 