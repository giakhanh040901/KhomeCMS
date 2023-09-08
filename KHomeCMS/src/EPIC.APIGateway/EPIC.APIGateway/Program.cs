using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace EPIC.APIGateway
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.ConfigureAppConfiguration(ic => 
                    {
                        var aspEnv = $"{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}";
                        var ocelotEnv = $"{Environment.GetEnvironmentVariable("OCELOT_ENVIRONMENT")}";
                        if (string.IsNullOrEmpty(ocelotEnv))
                        {
                            ocelotEnv = aspEnv;
                        }
                        ic.AddJsonFile($"ocelot{(ocelotEnv != null ? "." + ocelotEnv : "")}.json", false, true);
                        ic.AddEnvironmentVariables();
                    });
                    //webBuilder.UseUrls("http://*:5003");
                    webBuilder.UseStartup<Startup>()
                    .UseKestrel(options =>
                    {
                        options.Limits.MaxRequestBodySize = Int32.MaxValue;
                    });
                });
    }
}
