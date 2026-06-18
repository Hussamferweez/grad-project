using Domain.Common;
using Domain.Enums;
using Domain.ValueObjects;

namespace Domain.Entities;

/// <summary>
/// Core user aggregate root — covers Patient, Doctor, Receptionist, and Admin.
/// Role-specific behaviour is controlled via the RoleId / UserRole enum.
/// </summary>
public class User : BaseEntity
{
    // ── Identity ─────────────────────────────────────────────────
    public string Username { get; private set; } = default!;
    public string PasswordHash { get; private set; } = default!;

    // ── Personal info ─────────────────────────────────────────────
    public string FirstName { get; private set; } = default!;
    public string LastName { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public string PhoneNumber { get; private set; } = default!;
    public DateOnly? DateOfBirth { get; private set; }
    public Gender Gender { get; private set; }
    public string? Address { get; private set; }
    public string? EmergencyContact { get; private set; }

    // ── Medical (relevant for patients) ──────────────────────────
    public string? MedicalNotes { get; private set; }

    // ── Role ──────────────────────────────────────────────────────
    public int RoleId { get; private set; }
    public Role Role { get; private set; } = default!;

    // ── Audit ─────────────────────────────────────────────────────
    public DateTime RegistrationDate { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? LastLogin { get; private set; }
    public bool IsActive { get; private set; }

    // ── Navigation ────────────────────────────────────────────────
    public ICollection<Appointment> PatientAppointments { get; private set; } = [];
    public ICollection<Appointment> DentistAppointments { get; private set; } = [];
    public ICollection<Schedule> Schedules { get; private set; } = [];

    private User() { }

    public static User Create(
        string username,
        string passwordHash,
        string firstName,
        string lastName,
        Email email,
        PhoneNumber phoneNumber,
        int roleId,
        Gender gender = Gender.Other,
        DateOnly? dateOfBirth = null,
        string? address = null,
        string? emergencyContact = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(username, nameof(username));
        ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash, nameof(passwordHash));
        ArgumentException.ThrowIfNullOrWhiteSpace(firstName, nameof(firstName));
        ArgumentException.ThrowIfNullOrWhiteSpace(lastName, nameof(lastName));

        var now = DateTime.UtcNow;

        return new User
        {
            Username = username.Trim(),
            PasswordHash = passwordHash,
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            Email = email.Value,
            PhoneNumber = phoneNumber.Value,
            RoleId = roleId,
            Gender = gender,
            DateOfBirth = dateOfBirth,
            Address = address,
            EmergencyContact = emergencyContact,
            RegistrationDate = now,
            CreatedAt = now,
            IsActive = true
        };
    }

    // ── Behaviour ─────────────────────────────────────────────────

    public void UpdateProfile(
        string firstName,
        string lastName,
        PhoneNumber phoneNumber,
        string? address,
        string? emergencyContact)
    {
        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        PhoneNumber = phoneNumber.Value;
        Address = address;
        EmergencyContact = emergencyContact;
    }

    public void UpdateEmail(Email email)
        => Email = email.Value;

    public void UpdatePasswordHash(string newHash)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(newHash, nameof(newHash));
        PasswordHash = newHash;
    }

    public void AddMedicalNote(string note)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(note, nameof(note));
        MedicalNotes = string.IsNullOrWhiteSpace(MedicalNotes)
            ? note
            : $"{MedicalNotes}\n{note}";
    }

    public void RecordLogin() => LastLogin = DateTime.UtcNow;

    public void Deactivate() => IsActive = false;

    public void Activate() => IsActive = true;

    public string FullName => $"{FirstName} {LastName}";
}
