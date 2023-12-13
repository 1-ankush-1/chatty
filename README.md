# Chatty

## Description

This application is a dynamic, real-time chat platform that facilitates individual and group communication. It’s designed with a user-friendly interface where users can send text messages, images, and files instantly.

To ensure privacy and enhance user experience, the application requires users to be friends before they can engage in a one-on-one chat or be added to a group chat. Users can search for friends, send friend requests, and upon acceptance, start their communication journey.

One of the key features of this application is the ability to create groups. Group admins have the power to manage the group by adding or deleting users and promoting other users to admin status. Furthermore, users can share the group URL with others, allowing them to join the group directly from the link.

The application offers a customizable user experience with light and dark modes. This feature allows users to choose the theme that is most comfortable for their eyes.

## Tech Stack

- **HTML, CSS, JavaScript, and Bootstrap**: These are used for creating the front-end of the application.
- **Node.js and Express.js**: These are used for building the back-end of the application.
- **Socket.IO**: This is used for enabling real-time, bidirectional, and event-based communication between the browser and the server.
- **Sequelize**: This is a promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite, and Microsoft SQL Server. It is used for database schema definition, data validation, querying, and more.
- **SendinBlue**: This is used for sending email notifications.
- **AWS S3**: This is used for uploading and downloading files.
- **MySQL**: This is used as the database for storing user data and chat history.
- **AWS EC2 and RDS**: The application is deployed on AWS EC2, and AWS RDS is used for the database.
- **Jenkins and GitHub Webhooks**: These are used for continuous integration and continuous deployment (CI/CD).

## Setup

1. **Clone the repository**: Use the command `git clone <repository-url>`. Replace `<repository-url>` with the URL of this repository. This will copy all the files from this repository to your local machine.

2. **Navigate to the backend directory**: Use the command `cd backend`. This will take you to the `backend` directory where the server-side code is located.

3. **Install the dependencies**: Use the command `npm i`. This will install all the dependencies required for the project which are listed in the `package.json` file.

4. **Create a .env file**: You need to create a `.env` file in the `backend` directory. This file should contain all the environment variables which the project needs to run. You can use the `example.env` file as a reference.

5. **Start the server**: Use the command `npm start`. This will start the server on a certain port number. You will see a message in the console with the port number.

6. **Access the application**: Open a web browser and go to `localhost:<port>`. Replace `<port>` with the port number you saw in the console. This will open the application.

