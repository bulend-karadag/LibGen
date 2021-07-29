var booklist=[];
var articlelist=[];

function titleCase(str) {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   return splitStr.join(' '); 
}

//Setting url query
function setQuery(q,page,col,type) {
	if (type=='book'){
	bookSearcher.searchLibGen_ = 'http://gen.lib.rus.ec/search.php?' +
      'req='+ q +'&' +
	  'phrase=1&open=0&res=100&view=simple&column='+col+'&sort=extension&sortmode=ASC'+
	  '&page='+page;
	 // console.log("The query is : "+bookSearcher.searchLibGen_);
	  }
	  
	 else if (type=='article'){
	articleSearcher.searchLibGen_ = 'http://libgen.is/scimag/?q='+q+'&page='+page;}	 
}

//Main function to retrieve the list of books
var bookSearcher = {
   
  searchLibGen_: '',
  PageCheck: false,

//Connect to the prepared url	
  getJSONResults: function() {
    var req = new XMLHttpRequest(); 
    req.open("GET", this.searchLibGen_, true); 
    req.onloadend = this.logResults_.bind(this);
    req.send(null);
  
  },

// Retrieve the table of books in the link
  logResults_: function (e) {
	var tab = e.target.responseText,
		rHtml = $.parseHTML(tab);
		//console.log(rHtml);
	
	var key, table;
	for(key in rHtml) {
		if(rHtml[key].nodeName == "TABLE") {
			if($(rHtml[key]).attr('class') == "c"){
				table = $(rHtml[key])[0];
			}
		}	
		if(rHtml[key].nodeName == "DIV") {
			if($(rHtml[key]).attr('class') == "paginator"){
				selector = $(rHtml[key])[0];
			}
		}
	}
	//console.log(selector);	
	var bookObjs = this.tableToJSON_(table);
	if (Object.keys(bookObjs).length==0){this.PageCheck=true;}
	this.crapOutHtml(bookObjs);
	

  },
 
 // Put books into HTML table 
  crapOutHtml: function(books) {
	var booksLen = books.length;
	for (let i=0; i<booksLen; i++) {
		let book = books[i];
		//book.language=book.language.trim();
		let trEl = document.createElement("tr");
		let bookCol = document.createElement("td"),
			dlCol = document.createElement("td");
		urls = book.mirrors;
		links = [];
		$.each(urls, function(index, value){
			currentMir = document.createElement('a');
			currentMir.href = value;
			currentMir.innerHTML = "["+(index+1)+"] ";
			$(currentMir).bind("click", function(){
				chrome.tabs.create({url: value});
			});
			links.push(currentMir);
		});		
		$(bookCol).append("<b>["+book.extension+"]</b> " + book.title + "<br><i>"+book.authors+"</i><br>"+book.publisher );
		$(dlCol).append(links);
		$(trEl).append(bookCol).append(dlCol);
		$("#resultsTable").append(trEl);	
	}
	booklist = booklist.concat(...Object.values(books));
	document.getElementById("booknumber").innerHTML=booklist.length+" books are found ...";
  },

//identify columns of the table and put it into JSON 
  tableToJSON_: function(table) {
	var data = [];
	var $rows = $(table).find("tr").not(":first");
	
	for (let i=0; i<$rows.length; i++){
		var $row = $($rows)[i];
		var $cols = $($row).find("td");
		entry = new Object(); 
		entry.mirrors = [];
		for (j=0;j<$cols.length; j++){
			switch(j) {
				case 1:
					entry.authors = $cols[j].innerText.trim();
					break;
				case 2:
					var titStr = $cols[j].innerText;
					entry.title = titStr.split("\n")[0];
					break;
				case 3:
					entry.publisher = $cols[j].innerText.trim();
					break;
				case 4:
					entry.year = $cols[j].innerText.trim();
					break;
				case 6:
					entry.language= titleCase($cols[j].innerText.trim());
					break;
				case 8:
					entry.extension = $cols[j].innerText.trim();
					break;
				case 9:
				case 10:
				case 11:
				case 12:
					entry.mirrors.push($cols[j].innerHTML);
					break;
			}
		}
		newMirrors = [];
		
		for (k=1; k<entry.mirrors.length; k++){
			mir = entry.mirrors[k];
			mir = $(mir).attr("href");
			mir = mir.replace("../", "http://gen.lib.rus.ec/");
			newMirrors.push(mir);
		}	
		entry.mirrors = newMirrors;
		data.push(entry);
	}
	return data;
  }
  
  
};

//Main function to retrieve the list of articles
var articleSearcher = {
   
  searchLibGen_: '',

//Connect to the prepared url	
  getJSONResults: function() {
    var req = new XMLHttpRequest();
    req.open("GET", this.searchLibGen_, true); 
    req.onloadend = this.logResults_.bind(this);
    req.send(null);
  },

// Retrieve the table of books in the link
  logResults_: function (e) {
	var tab = e.target.responseText,
		rHtml = $.parseHTML(tab);
	
	var key, table, selector;
	for(key in rHtml) {
		if(rHtml[key].nodeName == "TABLE") {
			if($(rHtml[key]).attr('class') == "catalog"){
				table = $(rHtml[key])[0];
			}
		}
		//console.log(rHtml[key].nodeName);
		
		if(rHtml[key].nodeName == "DIV") {
			if($(rHtml[key]).attr('class') == "catalog_paginator"){
				selector = $(rHtml[key])[0];
			}
		}
		
	}
	var bookObjs = this.tableToJSON_(table);
	var pageNumber=this.findPageNumber(selector);
	this.crapOutHtml(bookObjs);
	
  },
 
 // Put books into HTML table 
  crapOutHtml: function(articles) {
	var articlesLen = articles.length;
	for (let i=0; i<articlesLen; i++) {
		let article = articles[i];
		//book.language=book.language.trim();
		let trEl = document.createElement("tr");
		let articleCol = document.createElement("td"),
			dlCol = document.createElement("td");
		urls = article.mirrors;
		links = [];
		$.each(urls, function(index, value){			
			currentMir = document.createElement('a');
			currentMir.href = value;
			currentMir.innerHTML = "["+(index+1)+"] ";
			$(currentMir).bind("click", function(){
				chrome.tabs.create({url: value});
			});
			links.push(currentMir);
		});		
		$(articleCol).append("<b>["+article.authors+"]</b></br><i>"+article.title+"</i></br>"+article.publisher);
		$(dlCol).append(links);
		$(trEl).append(articleCol).append(dlCol);
		$("#resultsTable").append(trEl);
	}
	articlelist = articlelist.concat(...Object.values(articles));
	document.getElementById("booknumber").innerHTML=articlelist.length+" books are found ...";
  },

//identify columns of the table and put it into JSON 
  tableToJSON_: function(table) {
	var data = [];
	var $rows = $(table).find("tr").not(":first");
	
	for (let i=0; i<$rows.length; i++){
		var $row = $($rows)[i];
		var $cols = $($row).find("td");
		entry = new Object(); 
		entry.mirrors = [];
		for (j=0;j<$cols.length; j++){
			switch(j) {
				case 0:
					entry.authors = $cols[j].innerText.trim();
					break;
				case 1:
					entry.title = $cols[j].innerText;
					break;
				case 2:
					entry.publisher = $cols[j].innerText.trim();
					break;
				case 4:
					entry.mirrors=$cols[j].innerHTML;
					break;
			}
		}
		newMirrors = [];
		var mirrors=$(entry.mirrors).find("li>a");
		for (k=1; k<mirrors.length; k++){
			mir = mirrors[k];
			mir = $(mir).attr("href");
			//console.log(mir);
			newMirrors.push(mir);
		}	
		entry.mirrors = newMirrors;
		data.push(entry);
	}
	
	return data;
  },
  
  findPageNumber: function(selector) {
	var page = $(selector).find("span").text();
	if (page){
		pageNum=page.split('/')[1].trim();
		//console.log(pageNum);
	} else {pageNum=1;}
	
	return pageNum;
  }
  
  
};

//Filter book list for extension and language
function filteredextension() {
	let FilteredExt=[];
	let FilteredLan=[];
	//let FilteredPub=[];
	var booksNum = booklist.length;
		for (i=0; i<booksNum; i++) {
			let book = booklist[i];
			FilteredExt.push(book.extension);
			FilteredLan.push(book.language);
			//FilteredLan.push(book.publisher);				
		}	
	FilteredExt=sortByFrequency(FilteredExt);
	FilteredLan=sortByFrequency(FilteredLan);
	
  return[FilteredExt, FilteredLan];	
  
}

function sortByFrequency(array) {
    var frequency = {}, value;
    for(var i = 0; i < array.length; i++) {
        value = array[i];
        if(value in frequency) {
            frequency[value]++;
        }
        else {
            frequency[value] = 1;
        }
    }
    var uniques = [];
    for(value in frequency) {
        uniques.push(value);
    }
    function compareFrequency(a, b) {
        return frequency[b] - frequency[a];
    }
    return uniques.sort(compareFrequency);
}

function createCheckbox(parent, name, arr) {	
	$(parent).empty();
	for (var a in arr){
		var checkbox = document.createElement('input');
		var label = document.createElement('label');
		label.append(document.createTextNode(arr[a]))
		checkbox.type = 'checkbox';
		checkbox.name=name;
		checkbox.value=arr[a];
		$(label).append("<br>");
		$(parent).append(checkbox);
		$(parent).append(label);
	}
}

function createRadio(parent, name, arr) {	
	$(parent).empty();
	for (var a in arr){
		var checkbox = document.createElement('input');
		var label = document.createElement('label');
		label.append(document.createTextNode(arr[a]))
		checkbox.type = 'radio';
		checkbox.name=name;
		checkbox.value=arr[a];
		$(label).append("<br>");
		$(parent).append(checkbox);
		$(parent).append(label);
	}
}

function hideShow(button){
	if (button=='searchButton'){
		$("#optionsButton").show();
		$("#downButton").hide();
		$("#filterButton").hide();
		$("#radioExtension").hide();
		$("#radioLanguage").hide();
	} else if (button=='optionsButton'){
		$("#downButton").hide();
		$("#filterButton").show();
		$("#optionsButton").hide();
		$("#radioExtension").show();
		$("#radioLanguage").show();
	} else if (button=='filterButton'){
		$("#downButton").show();
	}
	
}
 
$(function(){
	$("#resultsTable").hide();
	$("hr:first").hide();
	
	var input = document.getElementById("searchInput");
	input.addEventListener("keyup", function(event) {
  	if (event.keyCode === 13) {
   	event.preventDefault();
   	document.getElementById("searchButton").click();
  	}
	});
//Click the search button	
$('#searchButton').click(function(){
		hideShow('searchButton');
		//$("#radioPublisher").hide();
		var inpVal = $('#searchInput').val().trim();
		bookSearcher.PageCheck=false;
		booklist=[];
		var filteredBooklist=[];
		
		if (inpVal.length > 3){
			$("#resultsTable tr:gt(0)").remove();
			inpVal = encodeURIComponent(inpVal);
				
			// wait for 1,5 sec between requests
			var counter = 1;
			if (bookSearcher.PageCheck==true) {counter=21;}	
			var timer = setInterval(function () {
				console.log("turn no. " + counter);
				if  (!bookSearcher.PageCheck) {
					setQuery(inpVal,counter,$("input[name=search]:checked").val(),'book'); 
					bookSearcher.getJSONResults(); 
				}
				if (counter >=6 || bookSearcher.PageCheck) {
					clearInterval(timer);
					counter = 0;
				}
				counter++;
			}, 1500);
						

			$("hr:first").show();
			$("#resultsTable").show();
			document.getElementById("booknumber").innerHTML="please wait a few seconds to fetch enough number of books ...";
			
		} else {
			$("#searchInput").val("");
			alert("Searches must be at least 4 characters long.");
		}
});
	
//click show options button
$('#optionsButton').click(function(){
		hideShow('optionsButton');
		const [extensions, languages] = filteredextension();
		createCheckbox("#radioExtension","extension", extensions);
  		createRadio("#radioLanguage","language", languages);
		
});

//Apply filter button	
$('#filterButton').click(function(){
	hideShow('filterButton');
	var selectedLan = $("input[name=language]:checked").val() ;
	var selectedExt=[];
		let CBExt = document.getElementsByName('extension');
		for (let i = 0; i < CBExt.length; i++) {
			if(CBExt[i].checked){
				selectedExt.push(CBExt[i].attributes["value"].value);
			}
		}

	if ((selectedExt !== undefined)&&(selectedLan !== undefined)){	
				var filters = {
				extension: selectedExt,
				language: selectedLan
				};
    					
				filteredBooklist=[];
				for (let i = 0; i < selectedExt.length; i++) {
				tempBooklist = booklist.filter(obj => obj.extension == filters.extension[i] && obj.language == filters.language);
				filteredBooklist = [...filteredBooklist, ...tempBooklist];
				}
			
			$("#resultsTable tr:gt(0)").remove();
			for (let i=0; i<filteredBooklist.length; i++) {
				let book = filteredBooklist[i];		
				let trEl = document.createElement("tr");
				let bookCol = document.createElement("td"),
					dlCol = document.createElement("td");
				let dlLink= document.createElement('a');
				dlLink.href = book.mirrors[0];
				dlLink.innerHTML = "Download";
				$(dlLink).bind("click", function(){	chrome.tabs.create({url: book.mirrors[0], active: false});});
				$(bookCol).append("<b>["+book.extension+"]</b> " + book.title + "<br><i>"+book.authors+"</i> -  "+book.publisher);
				$(dlCol).append(dlLink);
				$(trEl).append(bookCol).append(dlCol); 	
				$("#resultsTable").append(trEl);	
			}
			document.getElementById("booknumber").innerHTML="There are "+ filteredBooklist.length+" books with selected properties";	
					
	}
});
	
// Download selected books
$('#downButton').click(function(){
		//$("#filterButton").hide();
				var counter=1;
				for (let i=0; i<filteredBooklist.length; i++){
				
				setTimeout( function timer(){ 
				book = filteredBooklist[i];	
				chrome.tabs.create({url: book.mirrors[0],  active: false});
				//console.log(book.mirrors[0]);
				//console.log(counter);
				document.getElementById("booknumber").innerHTML=counter+ " out of "+ filteredBooklist.length+ " books are downloaded ...";			
				document.getElementById("message").innerHTML="As long as this window open, Download will keep on ... There will be 10 sec between downloading each book";
				
				counter++;
				}, i*15000 );			
				}
});

$('#testButton').click(function(){
		hideShow('searchButton');
		//$("#radioPublisher").hide();
		var inpVal = $('#searchInput').val().trim();
		booklist=[];
		
		if (inpVal.length > 3){
			$("#resultsTable tr:gt(0)").remove();
			inpVal = encodeURIComponent(inpVal);
					var counter = 1;
					setQuery(inpVal,counter,$("input[name=search]:checked").val(),$("input[name=type]:checked").val()); 
					articleSearcher.getJSONResults(); 

			$("hr:first").show();
			$("#resultsTable").show();
			//document.getElementById("booknumber").innerHTML="please wait a few seconds to fetch enough number of books ...";
			
		} else {
			$("#searchInput").val("");
			alert("Searches must be at least 4 characters long.");
		}
});
	

});



