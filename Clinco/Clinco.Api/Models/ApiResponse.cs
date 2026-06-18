namespace API.Common;

/// <summary>
/// Uniform JSON envelope returned by every endpoint.
/// Success:  { succeeded: true,  data: T,    errors: null }
/// Failure:  { succeeded: false, data: null, errors: [...] }
/// </summary>
public sealed record ApiResponse<T>
{
    public bool Succeeded { get; init; }
    public T? Data { get; init; }
    public IReadOnlyList<string>? Errors { get; init; }

    public static ApiResponse<T> Ok(T data) =>
        new() { Succeeded = true, Data = data };

    public static ApiResponse<T> Fail(params string[] errors) =>
        new() { Succeeded = false, Errors = errors };
}

public static class ApiResponse
{
    public static ApiResponse<object> Ok() =>
        new() { Succeeded = true };

    public static ApiResponse<object> Fail(params string[] errors) =>
        new() { Succeeded = false, Errors = errors };
}
