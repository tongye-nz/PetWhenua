import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils/test-utils'
import LikeButton from './LikeButton'

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

// Mock the like API service
vi.mock('../../../api/like.api', () => ({
  likeService: {
    getLikeStatus: vi.fn(),
    toggleLike: vi.fn()
  }
}))

// Mock MUI icons
vi.mock('@mui/icons-material', () => ({
  Favorite: vi.fn().mockImplementation(() => <div data-testid="favorite-icon" />),
  FavoriteBorder: vi.fn().mockImplementation(() => <div data-testid="favorite-border-icon" />)
}))

describe('LikeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: mockUser })
  })

  describe('authentication handling', () => {
    it('should show disabled state for unauthenticated users', () => {
      mockUseAuth.mockReturnValue({ user: null })
      
      render(<LikeButton postId={1} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(screen.getByLabelText('Sign in to like posts')).toBeInTheDocument()
      expect(screen.getByTestId('favorite-border-icon')).toBeInTheDocument()
    })

    it('should show like count for unauthenticated users', () => {
      mockUseAuth.mockReturnValue({ user: null })
      
      render(<LikeButton postId={1} initialLikeCount={5} />)
      
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should hide count when showCount is false for unauthenticated users', () => {
      mockUseAuth.mockReturnValue({ user: null })
      
      render(<LikeButton postId={1} initialLikeCount={5} showCount={false} />)
      
      expect(screen.queryByText('5')).not.toBeInTheDocument()
    })
  })

  describe('authenticated user interactions', () => {
    it('should fetch like status on mount', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 3
      })

      render(<LikeButton postId={1} />)
      
      await waitFor(() => {
        expect(likeService.getLikeStatus).toHaveBeenCalledWith(1, 1)
      })
    })

    it('should display initial like state correctly', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 3
      })

      render(<LikeButton postId={1} initialLikeCount={5} initialIsLiked={true} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('favorite-border-icon')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument() // Should use fetched count
      })
    })

    it('should toggle like when clicked', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 3
      })
      vi.mocked(likeService.toggleLike).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: true,
        likeCount: 4
      })

      render(<LikeButton postId={1} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('favorite-border-icon')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(likeService.toggleLike).toHaveBeenCalledWith({
          postId: 1,
          userId: 1
        })
      })
    })

    it('should update UI after successful like toggle', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 3
      })
      vi.mocked(likeService.toggleLike).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: true,
        likeCount: 4
      })

      render(<LikeButton postId={1} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('favorite-border-icon')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByTestId('favorite-icon')).toBeInTheDocument()
        expect(screen.getByText('4')).toBeInTheDocument()
      })
    })

    it('should call onLikeChange callback when provided', async () => {
      const { likeService } = await import('../../../api/like.api')
      const onLikeChange = vi.fn()
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 3
      })
      vi.mocked(likeService.toggleLike).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: true,
        likeCount: 4
      })

      render(<LikeButton postId={1} onLikeChange={onLikeChange} />)
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(onLikeChange).toHaveBeenCalledWith(true, 4)
      })
    })

    it('should prevent event bubbling when clicked', async () => {
      const { likeService } = await import('../../../api/like.api')
      const parentClickHandler = vi.fn()
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 0
      })
      
      render(
        <div onClick={parentClickHandler}>
          <LikeButton postId={1} />
        </div>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(parentClickHandler).not.toHaveBeenCalled()
    })
  })

  describe('size variants', () => {
    it('should render small size correctly', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 0
      })

      render(<LikeButton postId={1} size="small" />)
      
      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toHaveClass('MuiIconButton-sizeSmall')
      })
    })

    it('should render medium size correctly (default)', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 0
      })

      render(<LikeButton postId={1} size="medium" />)
      
      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toHaveClass('MuiIconButton-sizeMedium')
      })
    })

    it('should render large size correctly', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 0
      })

      render(<LikeButton postId={1} size="large" />)
      
      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toHaveClass('MuiIconButton-sizeLarge')
      })
    })
  })

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 0
      })

      render(<LikeButton postId={1} disabled />)
      
      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
      })
    })

    it('should not call API when disabled and clicked', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 0
      })

      render(<LikeButton postId={1} disabled />)
      
      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
      })

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(likeService.toggleLike).not.toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('should disable button during API call', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 0
      })
      vi.mocked(likeService.toggleLike).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          postId: 1,
          userId: 1,
          isLiked: true,
          likeCount: 1
        }), 100))
      )

      render(<LikeButton postId={1} />)
      
      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled()
      })

      const button = screen.getByRole('button')
      fireEvent.click(button)

      // Button should be disabled during API call
      expect(button).toBeDisabled()
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('should handle getLikeStatus API errors gracefully', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockRejectedValue(new Error('API Error'))
      
      render(<LikeButton postId={1} />)
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to fetch like status:', expect.any(Error))
      })
    })

    it('should handle toggleLike API errors gracefully', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 0
      })
      vi.mocked(likeService.toggleLike).mockRejectedValue(new Error('Toggle Error'))
      
      render(<LikeButton postId={1} />)
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to toggle like:', expect.any(Error))
      })
    })
  })

  describe('count display', () => {
    it('should show count by default', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 42
      })

      render(<LikeButton postId={1} />)
      
      await waitFor(() => {
        expect(screen.getByText('42')).toBeInTheDocument()
      })
    })

    it('should hide count when showCount is false', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 42
      })

      render(<LikeButton postId={1} showCount={false} />)
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })
      
      expect(screen.queryByText('42')).not.toBeInTheDocument()
    })

    it('should make count bold when liked', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: true,
        likeCount: 5
      })
      
      render(<LikeButton postId={1} />)
      
      await waitFor(() => {
        const countElement = screen.getByText('5')
        expect(countElement).toHaveStyle({ fontWeight: 600 })
      })
    })
  })

  describe('tooltip functionality', () => {
    it('should show "Like" tooltip when not liked', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: false,
        likeCount: 0
      })

      render(<LikeButton postId={1} />)
      
      const button = screen.getByRole('button')
      await waitFor(() => expect(button).toBeInTheDocument())
      
      // Hover over the button to trigger tooltip
      fireEvent.mouseEnter(button)
      
      await waitFor(() => {
        expect(screen.getByText('Like')).toBeInTheDocument()
      })
    })

    it('should show "Unlike" tooltip when liked', async () => {
      const { likeService } = await import('../../../api/like.api')
      vi.mocked(likeService.getLikeStatus).mockResolvedValue({
        postId: 1,
        userId: 1,
        isLiked: true,
        likeCount: 1
      })
      
      render(<LikeButton postId={1} />)
      
      const button = screen.getByRole('button')
      await waitFor(() => expect(button).toBeInTheDocument())
      
      // Hover over the button to trigger tooltip
      fireEvent.mouseEnter(button)
      
      await waitFor(() => {
        expect(screen.getByText('Unlike')).toBeInTheDocument()
      })
    })
  })
}) 