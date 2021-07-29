var link= document.getElementsByTagName('a')[0];

console.log("The link is : "+link.href);
link.click();

for (let i=1; i<6; i++){
				// wait for 3 sec between requests
				setTimeout( function timer(){ 
				chrome.runtime.sendMessage({closeThis: true}); 
				}, i*3000 );
				}
