using System.Collections.Generic;

public static class UserRoles
{
    public const string Member = "member";
    public const string SiteAdmin = "site_admin";
    public const string MeetupAdmin = "meetup_admin";
    public const string Vet = "vet";

    public static readonly List<string> AllRoles = new()
    {
        Member,
        SiteAdmin,
        MeetupAdmin,
        Vet
    };

    public static readonly Dictionary<string, string> RoleDisplayNames = new()
    {
        { Member, "Member" },
        { SiteAdmin, "Site Administrator" },
        { MeetupAdmin, "Meetup Administrator" },
        { Vet, "Veterinarian" }
    };

    public static bool IsValidRole(string role)
    {
        return AllRoles.Contains(role);
    }

    public static string GetDisplayName(string role)
    {
        return RoleDisplayNames.TryGetValue(role, out var displayName) ? displayName : role;
    }

    // Role hierarchy for permission checks
    public static readonly Dictionary<string, int> RoleHierarchy = new()
    {
        { Member, 1 },
        { Vet, 2 },
        { MeetupAdmin, 3 },
        { SiteAdmin, 4 }
    };

    public static bool HasPermission(string userRole, string requiredRole)
    {
        var userLevel = RoleHierarchy.TryGetValue(userRole, out var uLevel) ? uLevel : 0;
        var requiredLevel = RoleHierarchy.TryGetValue(requiredRole, out var rLevel) ? rLevel : int.MaxValue;
        return userLevel >= requiredLevel;
    }

    public static bool IsAdmin(string role) => role == SiteAdmin;
    public static bool IsMeetupAdmin(string role) => role == MeetupAdmin || IsAdmin(role);
    public static bool IsVet(string role) => role == Vet || IsAdmin(role);
}
