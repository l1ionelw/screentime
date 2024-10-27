# Plan 

## Server:
- C# server, storing window change data and onwindow change event handler
- Saves to file every 5 minutes or 5 window changes
- Custom webserver with specified port to send ondevice screntime data (called by html)


## Web Screentime
Chrome extension
on tab or window change, add to localstorage

## Website
- server generates a desktop icon + windows search lnk
- on click, server opens html file with /{port}
- embedded javascript reads /{port} and requests file from port
- chrome extension sees file:// with app path and injects custom DOM data for the chrome screen time