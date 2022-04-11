# JiraServerStoryToAzureTestCase
A Chrome extension that detects a Jira Server Story URL and allows for using Story UI elements to generate an Azure Test case via API


To use:
1. Replace `<domain>`, `<org>`, and `<project>` in manifest.json and popup.js with:
  
    a. `<domain>` = Jira server domain (not tested with Jira Cloud)
  
    b. `<org>` = Azure DevOps domain
  
    c. `<project>` = Azure DevOps project
  
2. Make sure you have a valid subscription/license for Azure DevOps AND Test Plans
3. Load (or Pack and Load) the extension in Chrome.
4. Create a personal Azure DevOps token.
5. Click the new Chrome extension icon and paste your personal token, then click the save button.
6. Navigate to a Jira story page, click the icon (should display after 2 seconds), and then a new tab will be opened with the Azure Test Plans Test Case URL!
  
*Note: The personal token is saved in Chrome persistent memory and should only need to be entered once.
