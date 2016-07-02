# zendesk-code-challenge
A client + server Node.js app for accessing Tickets from the Zendesk API and storing them in a memory, with backups on disk.

# Installation & Running
### Install Node.JS
This app has been tested on v4.4.6 of Node.js. You can find a binary for your OS here:
https://nodejs.org/en/download/

### Git CLONE
See the following links for information on using git and cloning this repo:
https://git-scm.com/docs/git-clone 
https://help.github.com/articles/cloning-a-repository/

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
You will now be able to connect to the running server as a client on port 8080. 

# Web App Usage
On initial loading of the page you'll receive a batch of the most recent Tickets as collected by the server.

If the server receives new Tickets (test this by modifying a Ticket or creating a new one), you'll be prompted to retrieve them with the click of a button.

If you scroll down, you'll be able to request older Tickets.

If you click on a Ticket row, you'll receive more information about the Ticket, namely the description and its tags.

The web app is responsive, but isn't optimized for mobile experiences.

# Code Explanation & Design
### Client <-> Server
The Server is a persistent data store and a single point of contact for the Zendesk API. The following design points motivated this model:
* Availability
* Latency
* Consistency

The data is stored on-disk, in a JSON file, covered more below. The Server updates its store through heartbeats timed to the Zendesk rate limits, ensuring the data is as consistent as possible.

The Server also renders a stateful markup of the web app before sending it to the Client, reducing visible latency. The Client was built with React + Handlebars for easy handling of state and data binding.

### Ticket Storage
The Tickets are currently stored on disk in JSON files, which are loaded into memory, and saved periodically. First, the most up-to-date Tickets are saved, then the Metadata. If for some reason the Metadata isn't saved, and the program halts or fails, the next execution will re-request previous Tickets. This model ensures Tickets are never missed.

This storage solution doesn't scale, which is partly what motivated a move from MongoDB. If and when this app needs to scale, it'll first need to solve the problem of only storing relevant Tickets in-memory.

### Test Framework
The testing framework I used was Jest. It ensures correct functionality of our models, and is a great choice for future testing on the React modules.

### Error Handling
The app uses error-first callbacks to ensure non-blocking flow.