using Clinco.Application.Commands;
using Clinco.Shared.Abstractions.Commands;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clinco.Api.Controllers;

public class ServicesController(
    ICommandDispatcher commandDispatcher,
    IServiceRepository serviceRepository) : BaseController
{
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Service>>> Get()
    {
        var services = await serviceRepository.GetAllAsync();
        return Ok(services);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateService command)
    {
        await commandDispatcher.DispatchAsync(command);
        return Ok();
    }
}
