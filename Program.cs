using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Net.Http;
using System.Threading.Tasks;
using System.IO;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient();

var app = builder.Build();

async Task HandleGet(HttpContext context, HttpClient httpClient)
{
    var formHtml = File.ReadAllText("index.html");
    await context.Response.WriteAsync(formHtml);
}

async Task HandlePost(HttpContext context, IHttpClientFactory httpClientFactory)
{
    var formFile = context.Request.Form.Files.GetFile("file");
    if (formFile == null || formFile.Length == 0)
    {
        await context.Response.WriteAsync("Please select a text file.");
        return;
    }

    try
    {
        var apiUrl = "https://adil23.pythonanywhere.com/api/SummarizeView"; 

        var httpClient = httpClientFactory.CreateClient();

        var formData = new MultipartFormDataContent();

        formData.Add(new StreamContent(formFile.OpenReadStream()), "text_input", formFile.FileName);

        // Send the multipart form data to the API
        var response = await httpClient.PostAsync(apiUrl, formData);

        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadAsStringAsync();
            await context.Response.WriteAsync(result);
        }
        else
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            await context.Response.WriteAsync($"API call failed with status {response.StatusCode}. Error: {errorContent}");
        }
    }
    catch (Exception ex)
    {
        await context.Response.WriteAsync($"Error: {ex.Message}");
    }
}


app.MapGet("/", async (HttpContext context) =>
{
    var httpClient = context.RequestServices.GetRequiredService<HttpClient>();
    await HandleGet(context, httpClient);
});

app.MapPost("/SummarizeView", async (HttpContext context) =>
{
    var httpClientFactory = context.RequestServices.GetRequiredService<IHttpClientFactory>();
    await HandlePost(context, httpClientFactory);
});

app.Run();
