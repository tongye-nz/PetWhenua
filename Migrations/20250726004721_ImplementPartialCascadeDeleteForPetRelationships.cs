using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetWhenua.Migrations
{
    /// <inheritdoc />
    public partial class ImplementPartialCascadeDeleteForPetRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PetConnections_Pets_Pet1Id",
                table: "PetConnections");

            migrationBuilder.DropForeignKey(
                name: "FK_PetConnections_Pets_Pet2Id",
                table: "PetConnections");

            migrationBuilder.DropForeignKey(
                name: "FK_PetWeddingParticipants_Pets_PetId",
                table: "PetWeddingParticipants");

            migrationBuilder.AddForeignKey(
                name: "FK_PetConnections_Pets_Pet1Id",
                table: "PetConnections",
                column: "Pet1Id",
                principalTable: "Pets",
                principalColumn: "PetId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PetConnections_Pets_Pet2Id",
                table: "PetConnections",
                column: "Pet2Id",
                principalTable: "Pets",
                principalColumn: "PetId");

            migrationBuilder.AddForeignKey(
                name: "FK_PetWeddingParticipants_Pets_PetId",
                table: "PetWeddingParticipants",
                column: "PetId",
                principalTable: "Pets",
                principalColumn: "PetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PetConnections_Pets_Pet1Id",
                table: "PetConnections");

            migrationBuilder.DropForeignKey(
                name: "FK_PetConnections_Pets_Pet2Id",
                table: "PetConnections");

            migrationBuilder.DropForeignKey(
                name: "FK_PetWeddingParticipants_Pets_PetId",
                table: "PetWeddingParticipants");

            migrationBuilder.AddForeignKey(
                name: "FK_PetConnections_Pets_Pet1Id",
                table: "PetConnections",
                column: "Pet1Id",
                principalTable: "Pets",
                principalColumn: "PetId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PetConnections_Pets_Pet2Id",
                table: "PetConnections",
                column: "Pet2Id",
                principalTable: "Pets",
                principalColumn: "PetId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PetWeddingParticipants_Pets_PetId",
                table: "PetWeddingParticipants",
                column: "PetId",
                principalTable: "Pets",
                principalColumn: "PetId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
