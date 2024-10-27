using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dynamitey;

namespace ServiceDiscoverer
{
    internal class TemplateParser
    {
        public TemplateParser()
        {
            Console.WriteLine("Template Parser Initialized");
        }
        // should def optimize to parse recursively but i do not care atp because I am going to kill my self. (ingame)
        public string parse(string templateName, List<Service> serviceDirectory, string requestedServiceName)
        {
            string[] templateArgs = templateName.Split('.');
            if (templateArgs[0] == "SELF")
            {
                string lookup_property = templateArgs[1];
                Service service = findServiceByName(serviceDirectory, requestedServiceName);
                return lookup_property == "port" ? service.port.ToString() : "";
            }
            if (templateArgs[0] == "SERVICE_DIR")
            {
                string lookup_service_name = templateArgs[1];
                string lookup_property = templateArgs[2];
                Service service = findServiceByName(serviceDirectory, lookup_service_name);
                return lookup_property == "port" ? service.port.ToString() : "";
            }


            return "undefined";
        }
        Service findServiceByName(List<Service> services, string serviceName)
        {
            foreach (var service in services)
            {
                if (service.name == serviceName)
                {
                    Console.WriteLine($"{serviceName} service {service.name}");
                    return service;
                }
            }
            return new Service();
        }
    }
}
