# ALHELP
Adaptive Learning for Higher Education based on Learning Preferences

For the dissertation assessors: you do not have to clone the repository, since all of the source code and misc. files are included in the ZIP file (the zip file is a clone of the repository). Note that the installation steps were tested on Windows machines with Chrome installed. Also note that the important parts of the code have comments that explain them (documentation).

To run or test the project, you must clone the repository and have Node JS installed on your machine. Please make sure npm is working properly. In addition, you will have to set up the database with the files from ./models first.
* Install MongoDB (Custom install) (Community Server), (Windows link https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-4.4.5-signed.msi) check the "Run service as network user" and check the option for MongoDB Compass ("Install MongoDB Compass"). This is a graphical UI that makes it easier to manipulate collections.
* Open MongoDB Compass, initiate the connection ("Connect" green button) and click on the "+" to create a new database.
* Choose "alhens" as the Database Name, and "users" as the Collection Name (a collection must be specified when creating a database)
* Expand the database on the left corner and choose the "users" collection. 
* Click on "Import Data" and choose the *users.json* file from ./models
* Hover over the "alhens" database on the left and click on the "+" to create another collection
* Name it "questions" and choose the corresponding JSON file from the ./models
* Repeat for "courses" and *courses.json*
* In the directory's root, run *npm install*
* To start the application, run *npm start*
* In a modern browser (Chrome is recommended), navigate to localhost:3000
