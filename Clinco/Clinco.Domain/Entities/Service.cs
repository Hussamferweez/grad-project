using Domain.Common;

namespace Domain.Entities;

public class Service : BaseEntity
{
    public string Name { get; private set; } = default!;
    public int ApproximateDurationMinutes { get; private set; }

    public ICollection<Appointment> Appointments { get; private set; } = [];

    private Service() { }

    public static Service Create(string name, int approximateDurationMinutes)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name, nameof(name));
        if (approximateDurationMinutes <= 0 || approximateDurationMinutes > 480)
        {
            throw new ArgumentOutOfRangeException(nameof(approximateDurationMinutes),
                "Duration must be between 1 and 480 minutes.");
        }

        return new Service
        {
            Name = name.Trim(),
            ApproximateDurationMinutes = approximateDurationMinutes
        };
    }

    public void Update(string name, int approximateDurationMinutes)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name, nameof(name));
        if (approximateDurationMinutes <= 0 || approximateDurationMinutes > 480)
        {
            throw new ArgumentOutOfRangeException(nameof(approximateDurationMinutes),
                "Duration must be between 1 and 480 minutes.");
        }

        Name = name.Trim();
        ApproximateDurationMinutes = approximateDurationMinutes;
    }
}
