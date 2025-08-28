# TODO list Project

The goal of this project is to create a ToDo List web application using Node.js, Express.js, EJS and MongoDB. The application will allow users to create and view tasks. Styling will be an important aspect of this project to ensure a good user experience.

**Deliverables**

A Node project for the functionality of the website. It will include:
- At least one EJS file for the structure of the website
- At least one CSS file for the styling of the website

**Features**
- **Task Creation**: Users should be able to create new tasks.
- **Task Viewing**: Users should be able to view a list of all their tasks.
- **Task Completion**: Users should be able to strike through their completed tasks in the todo list. Tasks should be deleted.
- **Segmented Lists**: Users should be able to access at least 2 lists, one for the day's tasks and another for their work related tasks.
- **Styling**: The application should be well-styled and responsive, ensuring a good user experience on both desktop and mobile devices.

**Technical Requirements**

- **Node.js & Express.js**: The application will be a web server built using Node.js and Express.js. Express.js will handle routing and middleware.
- **EJS**: EJS will be used as the templating engine to generate dynamic HTML based on the application's state.
- **MongoDB**: The tasks should be persisted using a very simple model in a local mongo instance

## Instructions

This is a suggested workflow for planning and creating this app

**Planning**

- Gather content and design ideas, create wireframes and mockups.
- You are provided with a working sample application on the class repository that you can either use as the base, or you can decide to adjust to what you want.

**Setup**

- Set up the project repository, initialize the Node.js application, and install necessary dependencies (Express.js, EJS).
- Plan out the application structure, including routes, views, and static files.
- Set up the Express.js server and define the necessary routes.

**Implementation**

- Implement the task creation feature. This includes creating the form on the home page and handling the form submission in the server. You should also consider the step of saving it to the DB.
- Implement the task viewing feature. This includes displaying the list of tasks on the home page after gathering them from the DB.
- Implement the task cross-off feature. This allows the user to check a checkbox and make the task appear striked through, and then it should be deleted from our application.
- Implement the alternative list to show a different set of todo tasks.
- Test the application to ensure that task creation and viewing are working correctly.

**Styling and Polishing**

- Style the application. This includes creating a CSS file, linking it to your EJS templates, and writing CSS or using Bootstrap/Flexbox/Grid to style the application.
- Test the application on different devices and browsers to ensure the styling works correctly.
- Fix any bugs or issues that came up during testing.

---

### Planning the application

This is a very simple application, thus the planning can be easily solved. Let´s break our tasks into some actionables.

**What are the tasks we need to deal with?** 	
- Display 2 lists
- Create a task
- Mark a task as completed and delete the task

Given that I have to display 2 lists we would need an endpoint for each of them, we would also need an endpoint to add an element, and one to delete, thus we could implement the endpoints **/**, **/delete** and **/:listName**

### Define the DB model

The actual object that we need to save is just a list that in itself it has a list of elements, thus, a single definition could do the trick. But we have to be careful because although the items are just simple strings, we do need to keep track of them individually, since we will need to at some point delete them.

This fact, suggests that the best way of dealing with them is to create a schema for every item, and then a schema for the list that contains a list of items.

### Root display

When we first land on the root path, we have to display today's task list and give the user a link so that they could access the other list.

To do so we need to query the DB and get all the list elements available. Based on the return values, we must display today's tasks and provide a link so the user can switch to the other one.

Every task should have a checkbox related to it so that when we press on it, the task should be deleted from the list.

### Add task

According to our design, we will have a list of tasks and at the bottom a single input field with a submit button that will add a task to the current list. This should be done using a form and it should be directed to the **post** method of the **root** path.

### Delete task

This is the most challenging part of this task, since we have to identify how to do the deletion.

Thanks to the fact that we have a schema for every item, we have a unique id for it, thus, we can relate the value of that id to the checkbox in the display and then wrap every entry in a form that should receive the id of the item and delete it from the list.

We have to be smart and use the render loop in our ejs to place the information in the proper location.

### Display list 

Make sure that the link on top of the screen refreshes the list and displays the content of the other list

### Testing

Once these tasks are completed make sure that you test your application for every potential error. Observe the entries and then double check them with the DB so no information is lost.

---
[Sample solution](https://gist.github.com/gcastillo56/2e39aaf31338ef75b84117b4f2145ab3)