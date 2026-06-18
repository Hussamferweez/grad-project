using Clinco.Application.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Clinco.Infrastructure.Services
{
    public class PasswordHasher : IPasswordHasher
    {
        public string Hash(string password)
        {
            // Example (use a real hasher in production)
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool Verify(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
    }
}
