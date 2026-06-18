namespace Application.Common.Exceptions;

/// <summary>Thrown when a requested resource does not exist → 404.</summary>
public sealed class NotFoundException : Exception
{
    public NotFoundException(string entityName, object key)
        : base($"{entityName} with id '{key}' was not found.") { }
}

/// <summary>Thrown when the caller lacks permission → 403.</summary>
public sealed class ForbiddenException : Exception
{
    public ForbiddenException(string message = "Access denied.") : base(message) { }
}

/// <summary>Thrown when credentials are invalid → 401.</summary>
public sealed class UnauthorizedException : Exception
{
    public UnauthorizedException(string message = "Authentication failed.") : base(message) { }
}

/// <summary>Thrown when a business rule is violated → 409 Conflict.</summary>
public sealed class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}
