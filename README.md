# zendesk-code-challenge
A client + server node app for accessing Tickets from the Zendesk API and storing them in a backend mongoDB.

# Installation & Running
### Install Node.JS
This app has been tested on v4.4.6 of Node.js. You can find a binary for your OS here:
https://nodejs.org/en/download/

### Git CLONE
We assume a working knowledge of git! 

### Run NPM BUILD
In the app's root directory run the NPM BUILD command. This will run an NPM INSTALL to install all requisite node modules, followed by a series of unit tests.

### NPM START
Once the installation of node modules is complete and the tests have run, the NPM START command will run the 'server.js' file. As with 'mongod', consider appending & to run this in the background.

When the server is run with NPM START, two parametres must be passed:
--username <username>
--password <password>

These two parametres will enable the server to perform API transactions.

### Connect at localhost:8080
You should now be able to connect to the local server as a client on port 8080. React will serve you a list of the most recent tickets, and a pagination option. Your client will subscribe to the server's I/O stream, and will periodically recieve any new updates.

# Code Explanation & Design
Blah.
