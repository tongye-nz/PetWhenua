using System.ComponentModel.DataAnnotations;

public class Pet
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    public string? Type { get; set; }
    public int Age { get; set; }
}