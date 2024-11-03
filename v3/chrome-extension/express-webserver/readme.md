<i>API FOR CHROME EXTENSION ONLY. FILEWRITES FOR DESKTOP WINDOWS ARE HANDLED BY C# APP</i>

## building
- install pkg using npm
- bundle into exe with ```pkg server.js --targets node18-win --output server.exe ```
- install nssm
- install as a service with: ```nssm.exe install <servicename> <servicepath>```

more info: https://nssm.cc/commands