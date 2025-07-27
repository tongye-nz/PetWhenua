using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using PetWhenua.Controllers;
using PetWhenua.Services;
using PetWhenua.Models.Dtos;
using PetWhenua.Hubs;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace PetWhenua.Tests.Controllers;

public class PostsControllerTests : IDisposable
{
    private readonly Mock<IPostService> _mockPostService;
    private readonly Mock<IImageService> _mockImageService;
    private readonly Mock<IPostAuthorizationService> _mockAuthorizationService;
    private readonly Mock<IHubContext<NotificationHub>> _mockHubContext;
    private readonly AppDbContext _mockContext;
    private readonly Mock<ILogger<PostsController>> _mockLogger;
    private readonly PostsController _controller;

    public PostsControllerTests()
    {
        _mockPostService = new Mock<IPostService>();
        _mockImageService = new Mock<IImageService>();
        _mockAuthorizationService = new Mock<IPostAuthorizationService>();
        _mockHubContext = new Mock<IHubContext<NotificationHub>>();
        
        // Create in-memory database for testing
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _mockContext = new AppDbContext(options);
        
        _mockLogger = new Mock<ILogger<PostsController>>();

        _controller = new PostsController(
            _mockPostService.Object,
            _mockImageService.Object,
            _mockAuthorizationService.Object,
            _mockHubContext.Object,
            _mockContext,
            _mockLogger.Object);
    }

    [Fact]
    public async Task GetPosts_ValidRequest_ReturnsOkWithPaginatedPosts()
    {
        // Arrange
        var posts = new List<Post>
        {
            new Post { PostId = 1, Title = "Test Post 1", Content = "Content 1", PostType = PostType.Moment },
            new Post { PostId = 2, Title = "Test Post 2", Content = "Content 2", PostType = PostType.BuySell }
        };
        var totalCount = 2;
        var page = 1;
        var pageSize = 10;

        _mockPostService.Setup(x => x.GetPostsPagedAsync(null, null, null, null, page, pageSize))
            .ReturnsAsync((posts, totalCount));

        // Act
        var result = await _controller.GetPosts();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = okResult.Value;
        Assert.NotNull(response);
        
        // Use reflection to check the anonymous object properties
        var postsProperty = response.GetType().GetProperty("posts");
        var paginationProperty = response.GetType().GetProperty("pagination");
        
        Assert.NotNull(postsProperty);
        Assert.NotNull(paginationProperty);
        
        var returnedPosts = postsProperty.GetValue(response) as IEnumerable<Post>;
        Assert.Equal(2, returnedPosts?.Count());
    }

    [Theory]
    [InlineData("Moment")]
    [InlineData("5")] // numeric value for PostType.Moment
    public async Task GetPosts_ValidPostType_ReturnsFilteredPosts(string postTypeParam)
    {
        // Arrange
        var posts = new List<Post>
        {
            new Post { PostId = 1, Title = "Moment Post", Content = "Content", PostType = PostType.Moment }
        };
        
        _mockPostService.Setup(x => x.GetPostsPagedAsync(PostType.Moment, null, null, null, 1, 10))
            .ReturnsAsync((posts, 1));

        // Act
        var result = await _controller.GetPosts(postTypeParam);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
        _mockPostService.Verify(x => x.GetPostsPagedAsync(PostType.Moment, null, null, null, 1, 10), Times.Once);
    }

    [Fact]
    public async Task GetPosts_InvalidPostType_ReturnsBadRequest()
    {
        // Act
        var result = await _controller.GetPosts("InvalidType");

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("Invalid postType", badRequestResult.Value?.ToString());
    }

    [Fact]
    public async Task GetPosts_NegativePage_DefaultsToPageOne()
    {
        // Arrange
        var posts = new List<Post>();
        _mockPostService.Setup(x => x.GetPostsPagedAsync(null, null, null, null, 1, 10))
            .ReturnsAsync((posts, 0));

        // Act
        var result = await _controller.GetPosts(page: -1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        _mockPostService.Verify(x => x.GetPostsPagedAsync(null, null, null, null, 1, 10), Times.Once);
    }

    [Fact]
    public async Task GetPosts_InvalidPageSize_DefaultsToTen()
    {
        // Arrange
        var posts = new List<Post>();
        _mockPostService.Setup(x => x.GetPostsPagedAsync(null, null, null, null, 1, 10))
            .ReturnsAsync((posts, 0));

        // Act
        var result = await _controller.GetPosts(pageSize: 150);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        _mockPostService.Verify(x => x.GetPostsPagedAsync(null, null, null, null, 1, 10), Times.Once);
    }

    [Fact]
    public async Task GetPosts_ServiceThrowsException_ReturnsInternalServerError()
    {
        // Arrange
        _mockPostService.Setup(x => x.GetPostsPagedAsync(It.IsAny<PostType?>(), It.IsAny<int?>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<int>(), It.IsAny<int>()))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _controller.GetPosts();

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, statusCodeResult.StatusCode);
        Assert.Contains("Internal server error", statusCodeResult.Value?.ToString());
    }

    [Fact]
    public async Task GetPost_ValidId_ReturnsOkWithPost()
    {
        // Arrange
        var postId = 1;
        var post = new Post { PostId = postId, Title = "Test Post", Content = "Test Content" };
        
        _mockPostService.Setup(x => x.GetPostByIdAsync(postId))
            .ReturnsAsync(post);

        // Act
        var result = await _controller.GetPost(postId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedPost = Assert.IsType<Post>(okResult.Value);
        Assert.Equal(postId, returnedPost.PostId);
        Assert.Equal("Test Post", returnedPost.Title);
    }

    [Fact]
    public async Task GetPost_NonExistentId_ReturnsNotFound()
    {
        // Arrange
        var postId = 999;
        _mockPostService.Setup(x => x.GetPostByIdAsync(postId))
            .ReturnsAsync((Post?)null);

        // Act
        var result = await _controller.GetPost(postId);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains($"Post with ID {postId} not found", notFoundResult.Value?.ToString());
    }

    [Fact]
    public async Task GetPost_ServiceThrowsException_ReturnsInternalServerError()
    {
        // Arrange
        var postId = 1;
        _mockPostService.Setup(x => x.GetPostByIdAsync(postId))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _controller.GetPost(postId);

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, statusCodeResult.StatusCode);
    }

    [Fact]
    public async Task CreatePost_ValidPost_ReturnsCreatedResult()
    {
        // Arrange
        var post = new Post
        {
            PostId = 1,
            UserId = 1,
            Title = "New Post",
            Content = "New Content",
            PostType = PostType.Moment
        };

        _mockPostService.Setup(x => x.CreatePostAsync(It.IsAny<Post>()))
            .ReturnsAsync(post);

        // Act
        var result = await _controller.CreatePost(post);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(_controller.GetPost), createdResult.ActionName);
        Assert.Equal(post.PostId, createdResult.RouteValues?["id"]);
        Assert.Equal(post, createdResult.Value);
    }

    [Fact]
    public async Task CreatePost_ServiceThrowsInvalidOperationException_ReturnsBadRequest()
    {
        // Arrange
        var post = new Post { Title = "Test", Content = "Test" };
        var errorMessage = "User not found";
        
        _mockPostService.Setup(x => x.CreatePostAsync(post))
            .ThrowsAsync(new InvalidOperationException(errorMessage));

        // Act
        var result = await _controller.CreatePost(post);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(errorMessage, badRequestResult.Value);
    }

    [Fact]
    public async Task CreatePost_ServiceThrowsGenericException_ReturnsInternalServerError()
    {
        // Arrange
        var post = new Post { Title = "Test", Content = "Test" };
        
        _mockPostService.Setup(x => x.CreatePostAsync(post))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _controller.CreatePost(post);

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, statusCodeResult.StatusCode);
    }

    [Fact]
    public async Task CreatePostWithRole_ValidRequest_ReturnsCreatedResult()
    {
        // Arrange
        var request = new CreatePostWithRoleRequest
        {
            UserId = 1,
            UserRole = "member",
            PostType = PostType.Moment,
            Title = "Test Post",
            Content = "Test Content"
        };

        var createdPost = new Post
        {
            PostId = 1,
            UserId = 1,
            Title = request.Title,
            Content = request.Content,
            PostType = request.PostType
        };

        _mockPostService.Setup(x => x.CreatePostWithUserRoleAsync(
            request.UserId, 
            request.UserRole, 
            request.PostType, 
            request.Title, 
            request.Content, 
            request.Images, 
            request.Location, 
            request.Address, 
            request.Price, 
            request.EventDate, 
            request.Category))
            .ReturnsAsync(createdPost);

        // Act
        var result = await _controller.CreatePostWithRole(request);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(createdPost, createdResult.Value);
    }

    [Fact]
    public async Task CreatePostWithImages_ValidRequest_ReturnsCreatedResult()
    {
        // Arrange
        var request = new CreatePostWithImagesRequest
        {
            UserId = 1,
            PostType = PostType.Moment,
            Title = "Test Post",
            Content = "Test Content",
            Images = new List<IFormFile>()
        };

        var createdPost = new Post
        {
            PostId = 1,
            UserId = 1,
            Title = request.Title,
            Content = request.Content,
            PostType = request.PostType
        };

        _mockPostService.Setup(x => x.CreatePostAsync(It.IsAny<Post>()))
            .ReturnsAsync(createdPost);

        // Act
        var result = await _controller.CreatePostWithImages(request);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(createdPost, createdResult.Value);
    }

    [Fact]
    public async Task CreatePostWithImages_TooManyImages_ReturnsBadRequest()
    {
        // Arrange
        var request = new CreatePostWithImagesRequest
        {
            UserId = 1,
            PostType = PostType.Moment,
            Title = "Test Post",
            Content = "Test Content",
            Images = Enumerable.Range(1, 10).Select(i => Mock.Of<IFormFile>()).ToList()
        };

        // Act
        var result = await _controller.CreatePostWithImages(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("Maximum 9 images allowed", badRequestResult.Value?.ToString());
    }

    [Fact]
    public async Task UpdatePost_ValidRequest_ReturnsNoContent()
    {
        // Arrange
        var postId = 1;
        var userId = 1;
        var userRole = "member";
        
        var updateDto = new UpdatePostDto
        {
            PostId = postId,
            UserId = userId,
            Title = "Updated Title",
            Content = "Updated Content",
            PostType = PostType.Moment,
            Status = PostStatus.Active
        };

        var existingPost = new Post
        {
            PostId = postId,
            UserId = userId,
            Title = "Original Title",
            Content = "Original Content",
            PostType = PostType.Moment,
            Status = PostStatus.Active
        };

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        _mockPostService.Setup(x => x.GetPostByIdAsync(postId))
            .ReturnsAsync(existingPost);
        
        _mockAuthorizationService.Setup(x => x.CanEditPost(userRole, existingPost, userId))
            .Returns(true);
        
        _mockPostService.Setup(x => x.UpdatePostAsync(It.IsAny<Post>()))
            .ReturnsAsync(existingPost);

        // Act
        var result = await _controller.UpdatePost(postId, updateDto);

        // Assert
        Assert.IsType<NoContentResult>(result);
        _mockPostService.Verify(x => x.UpdatePostAsync(It.IsAny<Post>()), Times.Once);
    }

    [Fact]
    public async Task UpdatePost_PostIdMismatch_ReturnsBadRequest()
    {
        // Arrange
        var postId = 1;
        var updateDto = new UpdatePostDto
        {
            PostId = 2, // Different ID
            Title = "Updated Title"
        };

        // Act
        var result = await _controller.UpdatePost(postId, updateDto);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("Post ID mismatch", badRequestResult.Value?.ToString());
    }

    [Fact]
    public async Task UpdatePost_PostNotFound_ReturnsNotFound()
    {
        // Arrange
        var postId = 1;
        var userId = 1;
        var userRole = "member";
        
        var updateDto = new UpdatePostDto
        {
            PostId = postId,
            Title = "Updated Title"
        };

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        _mockPostService.Setup(x => x.GetPostByIdAsync(postId))
            .ReturnsAsync((Post?)null);

        // Act
        var result = await _controller.UpdatePost(postId, updateDto);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains($"Post with ID {postId} not found", notFoundResult.Value?.ToString());
    }

    [Fact]
    public async Task UpdatePost_UnauthorizedUser_ReturnsForbid()
    {
        // Arrange
        var postId = 1;
        var userId = 1;
        var userRole = "member";
        
        var updateDto = new UpdatePostDto
        {
            PostId = postId,
            Title = "Updated Title"
        };

        var existingPost = new Post
        {
            PostId = postId,
            UserId = 2, // Different user owns this post
            Title = "Original Title"
        };

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        _mockPostService.Setup(x => x.GetPostByIdAsync(postId))
            .ReturnsAsync(existingPost);
        
        _mockAuthorizationService.Setup(x => x.CanEditPost(userRole, existingPost, userId))
            .Returns(false);

        // Act
        var result = await _controller.UpdatePost(postId, updateDto);

        // Assert
        var forbidResult = Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task DeletePost_ValidRequest_ReturnsNoContent()
    {
        // Arrange
        var postId = 1;
        var userId = 1;
        var userRole = "member";

        var post = new Post
        {
            PostId = postId,
            UserId = userId,
            Title = "Test Post",
            PostType = PostType.Moment
        };

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        _mockPostService.Setup(x => x.GetPostByIdAsync(postId))
            .ReturnsAsync(post);
        
        _mockPostService.Setup(x => x.DeletePostAsync(postId))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeletePost(postId);

        // Assert
        Assert.IsType<NoContentResult>(result);
        _mockPostService.Verify(x => x.DeletePostAsync(postId), Times.Once);
    }

    [Fact]
    public async Task DeletePost_PostNotFound_ReturnsNotFound()
    {
        // Arrange
        var postId = 1;
        var userId = 1;
        var userRole = "member";

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        _mockPostService.Setup(x => x.GetPostByIdAsync(postId))
            .ReturnsAsync((Post?)null);

        // Act
        var result = await _controller.DeletePost(postId);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains($"Post with ID {postId} not found", notFoundResult.Value?.ToString());
    }

    [Fact]
    public async Task DeletePost_UnauthorizedUser_ReturnsForbid()
    {
        // Arrange
        var postId = 1;
        var userId = 1;
        var userRole = "member";

        var post = new Post
        {
            PostId = postId,
            UserId = 2, // Different user owns this post
            Title = "Test Post"
        };

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        _mockPostService.Setup(x => x.GetPostByIdAsync(postId))
            .ReturnsAsync(post);

        // Act
        var result = await _controller.DeletePost(postId);

        // Assert
        var forbidResult = Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task GetPostsByUser_ValidUserId_ReturnsOkWithPosts()
    {
        // Arrange
        var userId = 1;
        var posts = new List<Post>
        {
            new Post { PostId = 1, UserId = userId, Title = "User Post 1" },
            new Post { PostId = 2, UserId = userId, Title = "User Post 2" }
        };

        _mockPostService.Setup(x => x.GetPostsByUserAsync(userId))
            .ReturnsAsync(posts);

        // Act
        var result = await _controller.GetPostsByUser(userId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedPosts = Assert.IsAssignableFrom<IEnumerable<Post>>(okResult.Value);
        Assert.Equal(2, returnedPosts.Count());
    }

    [Fact]
    public async Task GetPostsByUser_UserNotFound_ReturnsNotFound()
    {
        // Arrange
        var userId = 999;
        var errorMessage = "User not found";

        _mockPostService.Setup(x => x.GetPostsByUserAsync(userId))
            .ThrowsAsync(new InvalidOperationException(errorMessage));

        // Act
        var result = await _controller.GetPostsByUser(userId);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal(errorMessage, notFoundResult.Value);
    }

    [Fact]
    public async Task GetPostsByType_ValidPostType_ReturnsOkWithPosts()
    {
        // Arrange
        var postType = PostType.Meetup;
        var posts = new List<Post>
        {
            new Post { PostId = 1, PostType = postType, Title = "Meetup 1" },
            new Post { PostId = 2, PostType = postType, Title = "Meetup 2" }
        };

        _mockPostService.Setup(x => x.GetPostsByTypeAsync(postType))
            .ReturnsAsync(posts);

        // Act
        var result = await _controller.GetPostsByType(postType);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedPosts = Assert.IsAssignableFrom<IEnumerable<Post>>(okResult.Value);
        Assert.Equal(2, returnedPosts.Count());
        Assert.All(returnedPosts, post => Assert.Equal(postType, post.PostType));
    }

    [Fact]
    public async Task GetPostsByType_ServiceThrowsException_ReturnsInternalServerError()
    {
        // Arrange
        var postType = PostType.Meetup;
        
        _mockPostService.Setup(x => x.GetPostsByTypeAsync(postType))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _controller.GetPostsByType(postType);

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, statusCodeResult.StatusCode);
    }

    public void Dispose()
    {
        _mockContext?.Dispose();
    }
} 