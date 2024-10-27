using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Diagnostics.Contracts;
using System.Net;
using System.Net.NetworkInformation;
using System.Text.RegularExpressions;
using Salaros.Configuration;

namespace ServiceDiscoverer
{
    public struct Service
    {
        public string name;
        public string type; // webserver OR application

        public int port;
        public Process processInfo;
    }

    internal class ServiceInitializer
    {
        
        ConfigParser config;
        TemplateParser templateParser = new TemplateParser();
        List<Service> serviceList = new List<Service>();
        public List<Service> InitializeAllServices()
        {
            Console.WriteLine("initializing services");
            Console.WriteLine("Reading services from config file");
            config = new ConfigParser(@"C:\\Users\\yiche\\screentime\\v2\\ServiceDiscoverer\\ServiceConfig.cnf");
            serviceList = parseServices();
            assignServicePort(serviceList);
            
            initializeServices(serviceList);
            foreach (var item in serviceList)
            {
                Console.WriteLine(item.name);
                Console.WriteLine(item.type);
                Console.WriteLine(item.port);
                Console.WriteLine(item.processInfo);
                Console.WriteLine("--------------------");
            }
            
            string template_test = templateParser.parse("SELF.port", serviceList, "ExpressBackend");
            Console.WriteLine(template_test);
            return serviceList;
        }

        void initializeServices(List<Service> services)
        {
            for (int i = 0; i < services.Count; i++)
            {
                if (services[i].type == "Application")
                {
                    Service thisServiceMutator = services[i];
                    Process appProcess = initializeApplication(services[i]);
                    thisServiceMutator.processInfo = appProcess;
                    services[i] = thisServiceMutator;
                }
                if (services[i].type == "Webserver")
                {
                    Service thisServiceMutator = services[i];
                    Process serverProcess = initializeWebserver(services[i]);
                    thisServiceMutator.processInfo = serverProcess;
                    services[i] = thisServiceMutator;
                }
            }
        }
        Process initializeWebserver(Service service)
        {
            string command = config.GetValue(service.name, "cmd");

            var regex = new Regex("{(.*?)}");
            var matches = regex.Matches(command);
            foreach (Match match in matches)
            {
                string replaceTarget = match.Value;
                string replaceResult = templateParser.parse(match.Groups[1].Value, serviceList, service.name);
                command = command.Replace(replaceTarget, replaceResult);
            }

            Console.WriteLine(command);
            Process thisProcessService = Process.Start("cmd.exe", command);
            return thisProcessService;
        }
        Process initializeApplication(Service service)
        {
            string arguments = config.GetValue(service.name, "args");


            var regex = new Regex("{(.*?)}");
            var matches = regex.Matches(arguments);
            foreach (Match match in matches) 
            {
                string replaceTarget = match.Value;
                string replaceResult = templateParser.parse(match.Groups[1].Value, serviceList, service.name);
                arguments = arguments.Replace(replaceTarget, replaceResult);
            }

            Console.WriteLine(config.GetValue(service.name, "path"));
            Console.WriteLine(arguments);
            Process thisApplicationProcess = Process.Start(config.GetValue(service.name, "path"), arguments);

            return thisApplicationProcess;
        }
        void assignServicePort(List<Service> services)
        {
            for (int i = 0; i < services.Count; i++)
            {
                if (services[i].type == "Application") { continue; }
                string[] portRange = config.GetValue(services[i].name, "portRange").Split('-');
                Service newServiceMutation = services[i];
                newServiceMutation.port = assignFreePort(Int32.Parse(portRange[0]), Int32.Parse(portRange[1]));
                services[i] = newServiceMutation;
            }
        }
        int assignFreePort(int startRange, int endRange)
        {
            for (int i = startRange; i <= endRange; i++)
            {
                if (!portInUse(i))
                {
                    return i;
                }
            }
            return -1;
        }
        List<Service> parseServices()
        {
            List<Service> serviceList = new List<Service>();
            string[] services = config.GetValue("Services", "ServiceList").Split(',');
            trimServices(services);
            foreach (var serviceName in services)
            {
                string serviceType = config.GetValue(serviceName, "type").Trim();
                Service thisService = new Service();
                thisService.name = serviceName;
                thisService.type = serviceType;
                serviceList.Add(thisService);
            }
            return serviceList;
        }
        void trimServices(string[] services)
        {
            for (int i = 0; i < services.Length; i++)
            {
                services[i] = services[i].Trim();
            }
        }
        bool portInUse(int port)
        {
            bool inUse = false;
            IPGlobalProperties ipProperties = IPGlobalProperties.GetIPGlobalProperties();
            IPEndPoint[] ipEndPoints = ipProperties.GetActiveTcpListeners();
            foreach (IPEndPoint endPoint in ipEndPoints)
            {
                if (endPoint.Port == port)
                {
                    inUse = true;
                    break;
                }
            }
            return inUse;
        }
    }
}
