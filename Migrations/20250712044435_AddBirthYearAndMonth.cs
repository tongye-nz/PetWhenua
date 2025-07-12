using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetWhenua.Migrations
{
    /// <inheritdoc />
    public partial class AddBirthYearAndMonth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BirthMonth",
                table: "Pets",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BirthYear",
                table: "Pets",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BirthMonth",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "BirthYear",
                table: "Pets");
        }
    }
}
