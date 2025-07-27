using Xunit;

namespace PetWhenua.Tests;

public class UnitTest1
{
    [Fact]
    public void Test1()
    {
        // Arrange
        var expected = 4;
        var a = 2;
        var b = 2;

        // Act
        var result = a + b;

        // Assert
        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData(1, 1, 2)]
    [InlineData(2, 2, 4)]
    [InlineData(3, 3, 6)]
    public void AddNumbers_ReturnsExpectedSum(int a, int b, int expected)
    {
        // Act
        var result = a + b;

        // Assert
        Assert.Equal(expected, result);
    }
} 