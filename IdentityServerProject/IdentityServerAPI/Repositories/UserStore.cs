// using Microsoft.AspNetCore.Identity;
// using MongoDB.Driver;
// using IdentityServerAPI.Models;
// using System;
// using System.Threading;
// using System.Threading.Tasks;

// namespace IdentityServerAPI.Repositories
// {
//     public class UserStore : 
//         IUserStore<ApplicationUser>, 
//         IUserPasswordStore<ApplicationUser>,
//         IUserEmailStore<ApplicationUser>  // Thêm interface này
//     {
//         private readonly IMongoCollection<ApplicationUser> _users;

//         public UserStore(IMongoDatabase database)
//         {
//             _users = database.GetCollection<ApplicationUser>("AspNetUsers");
//         }

//         public Task<IdentityResult> CreateAsync(ApplicationUser user, CancellationToken cancellationToken)
//         {
//             return Task.Run(() =>
//             {
//                 _users.InsertOne(user);
//                 return IdentityResult.Success;
//             });
//         }

//         public Task<IdentityResult> DeleteAsync(ApplicationUser user, CancellationToken cancellationToken)
//         {
//             return Task.Run(() =>
//             {
//                 _users.DeleteOne(u => u.Id == user.Id);
//                 return IdentityResult.Success;
//             });
//         }

//         public Task<ApplicationUser> FindByIdAsync(string userId, CancellationToken cancellationToken)
//         {
//             return Task.Run(() => 
//                 _users.Find(u => u.Id == Guid.Parse(userId)).FirstOrDefault());
//         }

//         public Task<ApplicationUser> FindByNameAsync(string normalizedUserName, CancellationToken cancellationToken)
//         {
//             return Task.Run(() => 
//                 _users.Find(u => u.NormalizedUserName == normalizedUserName).FirstOrDefault());
//         }

//         public Task<string> GetUserIdAsync(ApplicationUser user, CancellationToken cancellationToken) =>
//             Task.FromResult(user.Id.ToString());

//         public Task<string> GetUserNameAsync(ApplicationUser user, CancellationToken cancellationToken) =>
//             Task.FromResult(user.UserName);

//         public Task SetUserNameAsync(ApplicationUser user, string userName, CancellationToken cancellationToken)
//         {
//             user.UserName = userName;
//             return Task.CompletedTask;
//         }

//         public Task<string> GetNormalizedUserNameAsync(ApplicationUser user, CancellationToken cancellationToken) =>
//             Task.FromResult(user.NormalizedUserName);

//         public Task SetNormalizedUserNameAsync(ApplicationUser user, string normalizedName, CancellationToken cancellationToken)
//         {
//             user.NormalizedUserName = normalizedName;
//             return Task.CompletedTask;
//         }

//         public Task SetPasswordHashAsync(ApplicationUser user, string passwordHash, CancellationToken cancellationToken)
//         {
//             user.PasswordHash = passwordHash;
//             return Task.CompletedTask;
//         }

//         public Task<string> GetPasswordHashAsync(ApplicationUser user, CancellationToken cancellationToken) =>
//             Task.FromResult(user.PasswordHash);

//         public Task<bool> HasPasswordAsync(ApplicationUser user, CancellationToken cancellationToken) =>
//             Task.FromResult(!string.IsNullOrEmpty(user.PasswordHash));

//         public Task<IdentityResult> UpdateAsync(ApplicationUser user, CancellationToken cancellationToken)
//         {
//             return Task.Run(() =>
//             {
//                 var filter = Builders<ApplicationUser>.Filter.Eq(u => u.Id, user.Id);
//                 var result = _users.ReplaceOne(filter, user);
//                 return result.IsAcknowledged ? IdentityResult.Success : IdentityResult.Failed();
//             });
//         }

//         // ==============================
//         // Triển khai IUserEmailStore
//         // ==============================
//         public Task SetEmailAsync(ApplicationUser user, string email, CancellationToken cancellationToken)
//         {
//             user.Email = email;
//             return Task.CompletedTask;
//         }

//         public Task<string> GetEmailAsync(ApplicationUser user, CancellationToken cancellationToken) =>
//             Task.FromResult(user.Email);

//         public Task<bool> GetEmailConfirmedAsync(ApplicationUser user, CancellationToken cancellationToken) =>
//             Task.FromResult(user.EmailConfirmed);

//         public Task SetEmailConfirmedAsync(ApplicationUser user, bool confirmed, CancellationToken cancellationToken)
//         {
//             user.EmailConfirmed = confirmed;
//             return Task.CompletedTask;
//         }

//         public Task<ApplicationUser> FindByEmailAsync(string normalizedEmail, CancellationToken cancellationToken)
//         {
//             return Task.Run(() => 
//                 _users.Find(u => u.NormalizedEmail == normalizedEmail).FirstOrDefault());
//         }

//         public Task<string> GetNormalizedEmailAsync(ApplicationUser user, CancellationToken cancellationToken) =>
//             Task.FromResult(user.NormalizedEmail);

//         public Task SetNormalizedEmailAsync(ApplicationUser user, string normalizedEmail, CancellationToken cancellationToken)
//         {
//             user.NormalizedEmail = normalizedEmail;
//             return Task.CompletedTask;
//         }

//         public void Dispose() { }
//     }
// }
