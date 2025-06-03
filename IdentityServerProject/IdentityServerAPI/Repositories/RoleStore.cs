//COMMENT DO KHÔNG DÙNG NỮA
// using Microsoft.AspNetCore.Identity;
// using MongoDB.Driver;
// using IdentityServerAPI.Models;
// using System;
// using System.Threading;
// using System.Threading.Tasks;

// namespace IdentityServerAPI.Repositories
// {
//     public class RoleStore : IRoleStore<ApplicationRole>
//     {
//         private readonly IMongoCollection<ApplicationRole> _roles;

//         public RoleStore(IMongoDatabase database)
//         {
//             _roles = database.GetCollection<ApplicationRole>("AspNetRoles");
//         }

//         public Task<IdentityResult> CreateAsync(ApplicationRole role, CancellationToken cancellationToken)
//         {
//             return Task.Run(() =>
//             {
//                 _roles.InsertOne(role);
//                 return IdentityResult.Success;
//             });
//         }

//         public Task<IdentityResult> DeleteAsync(ApplicationRole role, CancellationToken cancellationToken)
//         {
//             return Task.Run(() =>
//             {
//                 _roles.DeleteOne(r => r.Id == role.Id);
//                 return IdentityResult.Success;
//             });
//         }

//         public Task<ApplicationRole> FindByIdAsync(string roleId, CancellationToken cancellationToken)
//         {
//             return Task.Run(() => _roles.Find(r => r.Id == Guid.Parse(roleId)).FirstOrDefault());
//         }

//         public Task<ApplicationRole> FindByNameAsync(string normalizedRoleName, CancellationToken cancellationToken)
//         {
//             return Task.Run(() => _roles.Find(r => r.NormalizedName == normalizedRoleName).FirstOrDefault());
//         }

//         public Task<string> GetRoleIdAsync(ApplicationRole role, CancellationToken cancellationToken) => 
//             Task.FromResult(role.Id.ToString());

//         public Task<string> GetRoleNameAsync(ApplicationRole role, CancellationToken cancellationToken) => 
//             Task.FromResult(role.Name);

//         public Task SetRoleNameAsync(ApplicationRole role, string roleName, CancellationToken cancellationToken)
//         {
//             role.Name = roleName;
//             return Task.CompletedTask;
//         }

//         public Task<string> GetNormalizedRoleNameAsync(ApplicationRole role, CancellationToken cancellationToken) => 
//             Task.FromResult(role.NormalizedName);

//         public Task SetNormalizedRoleNameAsync(ApplicationRole role, string normalizedName, CancellationToken cancellationToken)
//         {
//             role.NormalizedName = normalizedName;
//             return Task.CompletedTask;
//         }

//         public Task<IdentityResult> UpdateAsync(ApplicationRole role, CancellationToken cancellationToken)
//         {
//             return Task.Run(() =>
//             {
//                 var filter = Builders<ApplicationRole>.Filter.Eq(r => r.Id, role.Id);
//                 var updateResult = _roles.ReplaceOne(filter, role);

//                 return updateResult.IsAcknowledged ? IdentityResult.Success : IdentityResult.Failed();
//             });
//         }

//         public void Dispose() { }
//     }
// }
