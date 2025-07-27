using Microsoft.AspNetCore.Mvc;
using Xunit;
using PetWhenua.Controllers;

namespace PetWhenua.Tests.Controllers;

public class HomeControllerTests
{
    private readonly HomeController _controller;

    public HomeControllerTests()
    {
        _controller = new HomeController();
    }

    [Fact]
    public void Get_ReturnsOkWithApiInfo()
    {
        // Act
        var result = _controller.Get();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
        
        // Verify the response structure
        var response = okResult.Value;
        var responseType = response?.GetType();
        Assert.NotNull(responseType);
        
        // Check if the response has expected properties
        var messageProperty = responseType.GetProperty("message");
        var versionProperty = responseType.GetProperty("version");
        var timestampProperty = responseType.GetProperty("timestamp");
        var endpointsProperty = responseType.GetProperty("endpoints");
        
        Assert.NotNull(messageProperty);
        Assert.NotNull(versionProperty);
        Assert.NotNull(timestampProperty);
        Assert.NotNull(endpointsProperty);
        
        // Verify property values
        var message = messageProperty?.GetValue(response)?.ToString();
        var version = versionProperty?.GetValue(response)?.ToString();
        
        Assert.Equal("PetWhenua API is running successfully!", message);
        Assert.Equal("1.0.0", version);
    }

    [Fact]
    public void Health_ReturnsOkWithHealthStatus()
    {
        // Act
        var result = _controller.Health();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
        
        // Verify the response structure
        var response = okResult.Value;
        var responseType = response?.GetType();
        Assert.NotNull(responseType);
        
        // Check if the response has expected properties
        var statusProperty = responseType.GetProperty("status");
        var timestampProperty = responseType.GetProperty("timestamp");
        
        Assert.NotNull(statusProperty);
        Assert.NotNull(timestampProperty);
        
        // Verify property values
        var status = statusProperty?.GetValue(response)?.ToString();
        Assert.Equal("healthy", status);
        
        // Verify timestamp is recent (within last 5 seconds)
        var timestamp = timestampProperty?.GetValue(response);
        Assert.NotNull(timestamp);
        Assert.IsType<DateTime>(timestamp);
        
        var timestampValue = (DateTime)timestamp;
        var timeDifference = DateTime.UtcNow - timestampValue;
        Assert.True(timeDifference.TotalSeconds < 5, "Timestamp should be very recent");
    }

    [Fact]
    public void Get_ResponseContainsEndpoints()
    {
        // Act
        var result = _controller.Get();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = okResult.Value;
        var responseType = response?.GetType();
        
        var endpointsProperty = responseType?.GetProperty("endpoints");
        Assert.NotNull(endpointsProperty);
        
        var endpoints = endpointsProperty.GetValue(response);
        Assert.NotNull(endpoints);
        
        var endpointsType = endpoints.GetType();
        
        // Check for expected endpoint properties
        var swaggerProperty = endpointsType.GetProperty("swagger");
        var apiProperty = endpointsType.GetProperty("api");
        var notificationsProperty = endpointsType.GetProperty("notifications");
        
        Assert.NotNull(swaggerProperty);
        Assert.NotNull(apiProperty);
        Assert.NotNull(notificationsProperty);
        
        // Verify endpoint values
        Assert.Equal("/swagger", swaggerProperty.GetValue(endpoints)?.ToString());
        Assert.Equal("/api", apiProperty.GetValue(endpoints)?.ToString());
        Assert.Equal("/hubs/notifications", notificationsProperty.GetValue(endpoints)?.ToString());
    }

    [Theory]
    [InlineData("message")]
    [InlineData("version")]
    [InlineData("timestamp")]
    [InlineData("endpoints")]
    public void Get_ResponseContainsExpectedProperty(string propertyName)
    {
        // Act
        var result = _controller.Get();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = okResult.Value;
        var responseType = response?.GetType();
        
        var property = responseType?.GetProperty(propertyName);
        Assert.NotNull(property);
        
        var value = property.GetValue(response);
        Assert.NotNull(value);
    }

    [Fact]
    public void Health_TimestampIsUtc()
    {
        // Act
        var result = _controller.Health();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = okResult.Value;
        var responseType = response?.GetType();
        
        var timestampProperty = responseType?.GetProperty("timestamp");
        var timestamp = (DateTime)timestampProperty?.GetValue(response)!;
        
        // Verify it's close to UTC now (within 1 second)
        var utcNow = DateTime.UtcNow;
        var difference = Math.Abs((utcNow - timestamp).TotalSeconds);
        Assert.True(difference < 1.0, $"Timestamp should be UTC. Difference: {difference} seconds");
    }

    [Fact]
    public void MultipleCallsToHealth_ReturnDifferentTimestamps()
    {
        // Act
        var result1 = _controller.Health();
        Thread.Sleep(10); // Small delay to ensure different timestamps
        var result2 = _controller.Health();

        // Assert
        var okResult1 = Assert.IsType<OkObjectResult>(result1);
        var okResult2 = Assert.IsType<OkObjectResult>(result2);
        
        var response1 = okResult1.Value;
        var response2 = okResult2.Value;
        
        var timestamp1 = (DateTime)response1?.GetType().GetProperty("timestamp")?.GetValue(response1)!;
        var timestamp2 = (DateTime)response2?.GetType().GetProperty("timestamp")?.GetValue(response2)!;
        
        Assert.NotEqual(timestamp1, timestamp2);
        Assert.True(timestamp2 > timestamp1, "Second timestamp should be later than first");
    }
} 