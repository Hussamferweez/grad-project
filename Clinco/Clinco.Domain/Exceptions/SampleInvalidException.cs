using Clinco.Shared.Abstractions.Exceptions;

namespace Clinco.Domain.Exceptions;

    public class SampleInvalidException : PublicException
    {

        public SampleInvalidException() : base("Sample ID cannot be empty.")
        {
        }
    }

