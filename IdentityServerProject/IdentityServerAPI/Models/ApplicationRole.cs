// IdentityServerAPI/Models/ApplicationRole.cs
using AspNetCore.Identity.MongoDbCore.Models;
using System; // Cho Guid

namespace IdentityServerAPI.Models
{
    public class ApplicationRole : MongoIdentityRole<Guid>
    {
        // Constructor mặc định cần thiết cho việc tạo instance bởi ASP.NET Core Identity
        public ApplicationRole() : base()
        {
        }

        // Constructor nhận roleName, hữu ích khi tạo role mới bằng code
        public ApplicationRole(string roleName) : base(roleName)
        {
        }
        // Thêm các thuộc tính tùy chỉnh cho Role nếu cần
        // public string Description { get; set; }
    }
}