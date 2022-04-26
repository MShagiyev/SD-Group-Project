# To get started...
Install all dependencies for frontend with `yarn install` each time you're pulling a new commit<br/>
Open a new terminal and enter `yarn start` to start the development server <br/>
Ensure all dependencies are installed for Flask env (`pip install -r requirements.txt`) **virtual env must be active before running this command**<br/>
If you're in the root directory you can start the api with `yarn api_win` or `yarn api_mac` depending on your OS<br/>
## All good!


# Coverage Report
<img src="./Coverage_Report.png"/>

## To test the app yourself...
Ensure coverage is installed and the virtual environment is active (should be if you followed the getting started steps)<br/>
Run the command `yarn test_api` to run the unit tests and see which tests pass/fail<br/>
After running the tests you can either use `yarn report` (command line table) or `yarn web_report` (in depth review via html) to view the coverage report from the tests

