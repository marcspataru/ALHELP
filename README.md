# ALHELP
Adaptive Learning for Higher Education based on Learning Preferences

To run or test the project, you must have Node JS installed on your machine. Please make sure npm is working properly. In addition, you will have to set up the database with the files from ./models.
* Install MongoDB (Community Server), check the "Run service as network user" and check the option for MongoDB Compass ("Install MongoDB Compass"). This is a graphical UI that makes it easier to manipulate collections.
* Open MongoDB Compass, initiate the connection and click on the "+" to create a new database.
* Choose "alehns" as the Database Name, and "users" as the Collection Name (a collection must be specified when creating a database)
* Expand the database on the left corner and choose the "users" collection. 
* Click on "Import Data" and choose the *users.json* file from ./models
* Hover over the "alhens" database on the left and click on the "+" to create another collection
* Name it "questions" and choose the corresponding JSON file from the ./models
* Repeat for "courses" and *courses.json*
* Clone the repository
* In the directory's root, run *npm install*
* To start the application, run *npm run watch*
* In a modern browser (Chrome is recommended), navigate to localhost:3000
