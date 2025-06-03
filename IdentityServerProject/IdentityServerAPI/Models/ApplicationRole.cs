// IdentityServerAPI/Models/ApplicationRole.cs
using AspNetCore.Identity.MongoDbCore.Models; // THÊM USING NÀY
using System; // Cho Guid

namespace IdentityServerAPI.Models
{
    // SỬA ĐỔI: Kế thừa từ MongoIdentityRole và sử dụng Guid làm kiểu khóa
    public class ApplicationRole : MongoIdentityRole<Guid>
    {
        // Thêm các thuộc tính tùy chỉnh cho Role
    }
}