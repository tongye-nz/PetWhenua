using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetWhenua.Migrations
{
    /// <inheritdoc />
    public partial class AddPetWeddingEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add Address column to Posts table
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Posts",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            // Create UserFollows table
            migrationBuilder.CreateTable(
                name: "UserFollows",
                columns: table => new
                {
                    UserFollowId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FollowerId = table.Column<int>(type: "int", nullable: false),
                    FollowingId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserFollows", x => x.UserFollowId);
                    table.ForeignKey(
                        name: "FK_UserFollows_Users_FollowerId",
                        column: x => x.FollowerId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserFollows_Users_FollowingId",
                        column: x => x.FollowingId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create PetConnections table
            migrationBuilder.CreateTable(
                name: "PetConnections",
                columns: table => new
                {
                    PetConnectionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Pet1Id = table.Column<int>(type: "int", nullable: false),
                    Pet2Id = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequestedById = table.Column<int>(type: "int", nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RequestMessage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ResponseMessage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PetConnections", x => x.PetConnectionId);
                    table.ForeignKey(
                        name: "FK_PetConnections_Pets_Pet1Id",
                        column: x => x.Pet1Id,
                        principalTable: "Pets",
                        principalColumn: "PetId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PetConnections_Pets_Pet2Id",
                        column: x => x.Pet2Id,
                        principalTable: "Pets",
                        principalColumn: "PetId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PetConnections_Users_RequestedById",
                        column: x => x.RequestedById,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create PetWeddingParticipants table
            migrationBuilder.CreateTable(
                name: "PetWeddingParticipants",
                columns: table => new
                {
                    ParticipantId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PostId = table.Column<int>(type: "int", nullable: false),
                    PetId = table.Column<int>(type: "int", nullable: false),
                    OwnerId = table.Column<int>(type: "int", nullable: false),
                    HasApproved = table.Column<bool>(type: "bit", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PetWeddingParticipants", x => x.ParticipantId);
                    table.ForeignKey(
                        name: "FK_PetWeddingParticipants_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "PostId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PetWeddingParticipants_Pets_PetId",
                        column: x => x.PetId,
                        principalTable: "Pets",
                        principalColumn: "PetId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PetWeddingParticipants_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create indexes
            migrationBuilder.CreateIndex(
                name: "IX_UserFollows_FollowerId_FollowingId",
                table: "UserFollows",
                columns: new[] { "FollowerId", "FollowingId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserFollows_FollowerId",
                table: "UserFollows",
                column: "FollowerId");

            migrationBuilder.CreateIndex(
                name: "IX_UserFollows_FollowingId",
                table: "UserFollows",
                column: "FollowingId");

            migrationBuilder.CreateIndex(
                name: "IX_PetConnections_Pet1Id_Pet2Id",
                table: "PetConnections",
                columns: new[] { "Pet1Id", "Pet2Id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PetConnections_Pet1Id",
                table: "PetConnections",
                column: "Pet1Id");

            migrationBuilder.CreateIndex(
                name: "IX_PetConnections_Pet2Id",
                table: "PetConnections",
                column: "Pet2Id");

            migrationBuilder.CreateIndex(
                name: "IX_PetConnections_RequestedById",
                table: "PetConnections",
                column: "RequestedById");

            migrationBuilder.CreateIndex(
                name: "IX_PetWeddingParticipants_PostId_PetId",
                table: "PetWeddingParticipants",
                columns: new[] { "PostId", "PetId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PetWeddingParticipants_PostId",
                table: "PetWeddingParticipants",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_PetWeddingParticipants_PetId",
                table: "PetWeddingParticipants",
                column: "PetId");

            migrationBuilder.CreateIndex(
                name: "IX_PetWeddingParticipants_OwnerId",
                table: "PetWeddingParticipants",
                column: "OwnerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserFollows");

            migrationBuilder.DropTable(
                name: "PetConnections");

            migrationBuilder.DropTable(
                name: "PetWeddingParticipants");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Posts");
        }
    }
}
