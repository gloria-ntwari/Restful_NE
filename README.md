project description

XWZ LTD is a company responsible for managing and charging parking in Kigali city and some other areas in Rwanda in terms of providing security for their automobiles and collecting both street and private parking fees for local government and private entities respectively. XWZ LTD already has a car parking management system which was developed in Monolithic Architecture where it was facing various problems of scalability because the entire application runs a single unit, developing updates which requires redeployment of the entire application and increasing downtime and risks.

Due to the mentioned issues caused by Monolithic Architecture, XWZ LTD would like to upgrade the car parking management system using microservices Architecture to allow independent scaling of individual services, update and deploy independent where their users can book parking space, check available space, pay fees, monitor parking duration find out the number of cars entered in parking at different location and have real time reporting.

As as full stack developer, you have been hired to upgrade for them car parking management system with these minimum features below:

Task1
1. Define and design database model
2. Design system architecture
3. Create user registration/signup mockup using Figma with the following details User(id,firstName,lastName,email and password).

Task2
1. Implement user roles (admin, parking attendant)
2. Implement the User Registration design
3. Implement user authentication using either Token-Based Authentication (JWT) or session-based Authentication
4. Allow admin and users to login into the system after signing up

Task3
You're required to:
1. Register parking with details(code, parking name, number of available spaces, location, charging fee per hour);
2. Allow parking attendants (drivers) to view available parking and available space, charging fees per hour.

Task4
1. Register car entry with details(id, plate number, parking code, entry date time, exit date time, and charged amount: by default the exit date time should be null and the charged Amount is set to zero (0). These two fields charged amount and exit date time should be updated when the car exit (outgoing) the parking
2. Generate ticket on entry car in the parking
3. Generate the bill indicating how long the car is parked and the total amount charged on outgoing.
4. Update the number of vacant spaces in the parking for each incoming and outgoing

Task 5
Generate reports
You're required to :
1. Display all outgoing of cars in the parking with total amount charged between two date times
2.Display all Entered cars in the parking between two date times

Instructions
As a starting point, you should read  carefully the problem to be solved and write down appropriate software requirements such as design including but not limited to the database design,data flow of your application and name of possible forms that need to be developed
2. Other requirements
3.You should design the mockup of this system first using figma. Design only One page(user registration/signup form).
4.You should build a frontend using react.js or any other JavaScript framework of your choice.
5. You should build a backend using either Node.js or any other framework. 
5. Signup and login should be performed using the frontend form
7. Registering details, car entry and car exit should be added using designed forms.
8. Other records not mentioned in the requirements may be registered using forms or any other UI tools
9. You should use any db as your db
10. You should document your backend APIs with swagger UI
11. You should  use jwt in authentication and authorization
12. Ensure all records are displayed in pagination manner
13.Displaye logs properly
14. Handle exceptions and validation properly where applicable.
15. Handle CORS and any other common web security attacks properly
16.Good looking and responsive system wins more points.