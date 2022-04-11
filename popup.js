/*
  Created By: Paul Felten
  Prerequisites: Requires a personal token from ADO
  Description: Copies necessary information from Jira Server (not cloud)
      and creates an ADO test case via API with required field. Also 
	  sets the first step as the story and AC.
  Notes:
	  This extension uses Google Extensions Manifest v3 and uses 
	  async methods, which is why the nesting is necessary right now.
	  
	  StackOverflow Link for adding Test Steps via API: https://stackoverflow.com/questions/54105690/how-to-add-test-steps-in-a-test-case-work-item-using-rest-api-tfs2018-python
*/


//Enable saving of token via JS
let tkn = document.getElementById("token_save");
  
//set onclick for element
tkn.onclick = function() {
  setToken();
  console.log("Token set.");
};

//hide button until enabled
hideButton();

getToken();

let jiraTab = false;

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.active) {
		console.log('updated from contentscript');
		
		let url = tab.url;
		console.log("url: " + url);
		
		if(url.includes("jira.<domain>.com/browse/")){
			sleep(2000);
				
			chrome.scripting.executeScript(
			{
				target: {tabId: tabId, allFrames: true},
				func: getTitle,
			},
			(results) => { 
				let title = results[0].result;
				console.log("title: " + title);
				
				chrome.scripting.executeScript(
				{
					target: {tabId: tabId, allFrames: true},
					func: getDescription,
				},
				(results) => { 
					let desc = results[0].result;
					console.log("desc: " + desc);
					
					chrome.storage.sync.get(['token'], function(result) {
						console.log('Token retrieved: ' + result.token);
						document.getElementById("ado_token").value = result.token;
						
						enableButton(url, title, desc, result.token);
					});
				});
			});
		}
	};	
});
 
function getTitle() {
	return document.getElementById("summary-val").innerText;
};

function getDescription() {
	return document.getElementById("description-val").innerText;
};
 
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
};

function enableButton(url, title, desc, token) {
  let btn = document.getElementById("tc_button");
  btn.innerHTML = "+";
  btn.style.background = "green";
  btn.style.display = "block";
  console.log("Button displayed");
  
  btn.onclick = function() {
	  createTestCase(url, title, desc, token);
  };
};

function hideButton() {
  document.getElementById("tc_button").style.display = "none";
  console.log("Button hidden");
};

function openTestCase(tcUrl) {
	chrome.tabs.create({ url: tcUrl });
};

function setToken() {
	let pw = document.getElementById("ado_token").value;
	
	chrome.storage.sync.set({'token': pw}, function() {
		console.log('Token is set to: ' + pw);
	});
};

function getToken() {
	try {
		chrome.storage.sync.get(['token'], function(result) {
			console.log('Token retrieved: ' + result.token);
			document.getElementById("ado_token").value = result.token;
			return result.key;
		});
	}
	catch {
		return "";
	}
};

function convertNewLines(str)  {
    return str.replace(/\r\n/g, "<BR/>");
}

function createTestCase(url, title, description, token) {
	console.log("tc url:" + url);
	console.log("tc title:" + title);
	console.log("tc description:" + description);
	console.log("tc token:" + token);

	//Escape new lines and carraige returns
	let desc = convertNewLines(description);
	console.log("tc desc:" + desc);
	
	//Set payload for Azure API	
	let obj = `[{"op":"add","path":"/fields/System.Title","from":null,"value":"${title}"},{"op":"add","path":"/fields/System.Description","from":null,"value":"<div><a href='${url}'>${url}</a></div>"},{"op":"add","path":"/fields/Microsoft.VSTS.TCM.Steps","from":null,"value":"<steps id='0'><step id='2' type='ValidateStep'><parameterizedString isformatted='true'>${desc}</parameterizedString><parameterizedString isformatted='true'></parameterizedString><description/></step></steps>"}]`;
	console.log("obj: " + obj);
	console.log("base64 token: " + btoa(':'+token));
	
	fetch('https://dev.azure.com/<org>/<project>/_apis/wit/workitems/$Test%20Case?api-version=6.0', {
	  method: 'POST',
	  body: obj,
	  headers: {
		'Authorization': 'Basic '+btoa(':'+token),
		'Content-type': 'application/json-patch+json; charset=utf-8'
	  }
	})
	.then(response => response.json())
	.then(data => {
		let href = data._links.html.href;
		console.log("href: " + href);
		console.log("Opening test case");
		openTestCase(href);
		hideButton(); 
	});
};