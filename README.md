# Student Performance Analysis 

A web application that enables faculty to analyze student performance by uploading students' marks in an Excel sheet. The application stores data in MongoDB and provides visualizations, including graphs, for easier analysis.

## Features
- **Excel Sheet Upload**: Faculty can upload a file with students' marks for processing.
- **Data Storage**: Student marks are stored in a MongoDB database.
- **Graphical Analysis**: Results are displayed in graphs for a clear and interactive analysis of student performance.
- **User-Friendly Interface**: Simplified dashboard for faculty to manage and review performance data.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Libraries**: 
  - `multer` for handling file uploads
  - `xlsx` for reading Excel files
  - `chart.js` (or another library of your choice) for rendering graphs

## Prerequisites
1. [Node.js](https://nodejs.org/) (version 12 or higher)
2. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account for database connection (or use a local MongoDB instance)

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Afsha0409/mini_project.git
   cd mini_project
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory.
   - Add the following variables:

     ```plaintext
     MONGODB_URI=<your_mongodb_connection_string>
     PORT=5000
     ```

   Replace `<your_mongodb_connection_string>` with your actual MongoDB connection string.

4. **Run the Application**:
   ```bash
   npm start
   ```

   The server will start on `http://localhost:5000`.

## Usage
1. **Uploading Excel Sheets**: Log in as a faculty member and upload an Excel file with students' marks. Ensure the Excel sheet is properly formatted for correct processing.
2. **Viewing Graphical Analysis**: After uploading, the app will process the data and display performance metrics in graphs, allowing for easy performance analysis.

## Troubleshooting
- **MongoDB Connection Issues**: Make sure the MongoDB URI is correct and that the IP address is whitelisted in MongoDB Atlas.
- **Excel File Upload Issues**: Ensure the Excel sheet follows the required format for correct parsing.

---

Let me know if you’d like additional customizations for the README!
