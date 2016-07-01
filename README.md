# zendesk-code-challenge
A client + server node app for accessing Tickets from the Zendesk API and storing them in a memory, with backups on disk.

# Installation & Running
### Install Node.JS
This app has been tested on v4.4.6 of Node.js. You can find a binary for your OS here:
https://nodejs.org/en/download/

### Git CLONE
We assume a working knowledge of git! 

### Run NPM INSTALL and then NPM RUN BUILD
In the app's root directory, on the command line, run NPM INSTALL. This will populate the node_modules directory with any dependencies the app has.

Once done, run NPM RUN BUILD. This will run a test suite, and compile the scripts for execution.

### NPM START
Once the installation of node modules is complete and the tests have run, the 'NPM START --' command will run the 'server.js' file. Consider appending & to run this in the background.

When the server is run with 'NPM START --', two parameters must be passed:
```
--username <username>
--password <password>
```

These two parameters will enable the server to perform API transactions.

Note: The '--' after NPM START are required to recognize the username and password parameters.

### Connect at localhost:8080
You will now be able to connect to the local server as a client on port 8080. The server will serve you a list of the most recent tickets. Your client will subscribe to the server's I/O stream, and will periodically receive any new updates. Scrolling down will request any additional past Tickets from the server.

# Code Explanation & Design
### Client <-> Server
This is where we explain why I went with the Client <-> Server model.

### Server Cache
This is where I explain the server cache.

### Dynamic Refresh
And here is where I explain dynamic refresh.

### Fixed Client Packets
Here is where I explain why I chose to limit Client ticket requests.

### Test Framework
Here is where I explain and justify the test framework.

### Error Handling
This is where I explain error handling, traces, faults, etc.

### Scalability vs Complexity
I talk briefly about allowing for room to expand the app vs cluttering it, and obfuscating its purpose.

# TODO
* Write more Tests
* Specifically: CustomDate + React Modules
* Explain / Justify Design
