// Checks if a page exists and is accessible.
var pageExists = function(url) {
	// Open a HEAD request and check for a status code outside the 300 and 400 blocks.
	var request = new XMLHttpRequest();
	request.open('HEAD', url, false);
	request.send(null);
	if (request.status >= 300 && request.status <= 499 ) return false;
	else					  							 return true;
}

// Array of guesses to make. Each item has a pattern and a replacement to be used when modifying the URL.
var guesses = [

	// Class references for standard foundation classes that are present on both platforms with the same name, like NSString.
	{pattern: /\/library\/mac\//g, replacement: '/library/ios/'},
	{pattern: /\/library\/ios\//g, replacement: '/library/mac/'},
	
	// Class references for classes that are present on both platforms but have different prefixes, like NSTableView.
	{pattern: /\/library\/mac\/documentation\/Cocoa\/Reference\/ApplicationKit\/Classes\/NS/g,
	 replacement: '/library/ios/documentation/uikit/reference/UI'},
	{pattern: /\/library\/ios\/documentation\/(?:uik|UIK)it\/[Rr]eference\/UI(\w+)_[Cc]lass\//g,
	 replacement: '/library/mac/documentation/Cocoa/Reference/ApplicationKit/Classes/NS$1_Class/'},
	 
	// Protocol references for protocols that are present on both platforms but have different prefixes, like NSTextInput.
	{pattern: /\/library\/mac\/documentation\/Cocoa\/Reference\/(?:ApplicationKit\/Protocols\/)?NS(\w+)\//g,
	 replacement: '/library/ios/documentation/uikit/reference/UI$1/'},
	{pattern: /\/library\/ios\/documentation\/(?:uik|UIK)it\/[Rr]eference\/UI(\w+)_Protocol\//g,
	 replacement: '/library/mac/documentation/Cocoa/Reference/ApplicationKit/Protocols/NS$1_Protocol/'},
	// Handle non-AppKit protocols (handled implicitly by Mac -> iOS guess), like NSApplicationDelegate.
	{pattern: /\/library\/ios\/documentation\/(?:uik|UIK)it\/[Rr]eference\/UI(\w+)_Protocol\//g,
	 replacement: '/library/mac/documentation/Cocoa/Reference/NS$1_Protocol/'},
	 
	// Class reference pages whose file names are {className}.html on iOS and Reference.html on Mac, like NSScrollView.
	{pattern: /\/library\/mac\/documentation\/Cocoa\/Reference\/ApplicationKit\/Classes\/NS(\w+)_Class\/Reference\/Reference\.html/g,
	 replacement: '/library/ios/documentation/uikit/reference/UI$1_Class/Reference/UI$1.html'},
	{pattern: /\/library\/ios\/documentation\/uikit\/reference\/UI(\w+)\/Reference\/(?:(?!Reference\.html).)*(#.*)?$/g,
	 replacement: '/library/mac/documentation/Cocoa/Reference/ApplicationKit/Classes/NS$1/Reference/Reference.html'},
	
	// Class reference pages whose files are in a folder with the name of the class on iOS but not on Mac, like NSView.
	{pattern: /\/library\/mac\/documentation\/Cocoa\/Reference\/ApplicationKit\/Classes\/NS(\w+)_Class\/Reference\/\w*.html/g,
	 replacement: '/library/ios/documentation/uikit/Reference/UI$1_Class/UI$1/UI$1.html'},
	{pattern: /\/library\/ios\/documentation\/uikit\/[Rr]eference\/(?:UI|ui)(\w+)_[Cc]lass\/(?:UI|ui)\w+\/(?:UI|ui)\w+.html/g,
	 replacement: '/library/mac/documentation/Cocoa/Reference/ApplicationKit/Classes/NS$1_Class/Reference/NS$1.html'},
	
	// Protocol reference pages whose URLs end in Introduction/Introduction.html on iOS and Reference/Reference.html on Mac, like NSAccessibility.
	{pattern: /\/library\/mac\/documentation\/[Cc]ocoa\/[Rr]eference\/ApplicationKit\/Protocols\/NS(\w+)\/Reference\/Reference\.html/g,
	 replacement: '/library/ios/documentation/uikit/reference/UI$1/Introduction/Introduction.html'},
	{pattern: /\/library\/ios\/documentation\/(?:uik|UIK)it\/[Rr]eference\/UI(\w+)_Protocol\/Introduction\/Introduction\.html/g,
	 replacement: '/library/mac/documentation/Cocoa/Reference/ApplicationKit/Protocols/NS$1_Protocol/Reference/Reference.html'}
	 
];

// Iterates over the passed array of guesses looking for one that works. Returns a URL if a guess works or false if none is found.
var findWorkingGuess = function(guessesArray) {
	
	var currentUrl = document.location.href.replace('#', ''); // Stripping the '#' allows us to check if the page exists doesn't break anything.
	
	for (var i = 0; i < guessesArray.length; i++) {
		console.log('trying guess ' + i);
		var currentGuess = guessesArray[i];
		// Don't do anything if the current URL doesn't match the guess' pattern.
		if ( currentUrl.match(currentGuess.pattern) !== null ) {
			console.log('matched guess ' + i);
			// If it does match, modify the URL. If the new URL exists, return it.
			var modifiedUrl = currentUrl.replace(currentGuess.pattern, currentGuess.replacement);
			if ( pageExists(modifiedUrl) ) {
				console.log('guess ' + i + ' worked');
				return modifiedUrl;
			}
		}
	}
	
	// Only run when no guesses have worked.
	return false;
}

// Looks for a working guess. If one is found, updates the link in the DOM. If not, removes the link if it exists.
var setUpDocFlip = function() {

	var foundUrl = findWorkingGuess(guesses);
	var docFlipEl = document.getElementById('docFlipLink');
	
	// If a working URL was found, insert/modify the link.
	if (foundUrl) {
		// If the DocFlip link is already in the document, update its href attribute with the new URL.
		if (docFlipEl) {
			docFlipEl.href = foundUrl;
		// If not, make the element and add it.
		} else {
			docFlipEl = document.createElement('a');
			docFlipEl.id = 'docFlipLink';
			docFlipEl.href = foundUrl;
			docFlipEl.innerHTML = '⩆';
			var libraryTitle = document.getElementById('ssi_LibraryTitle');
			libraryTitle.parentNode.insertBefore(docFlipEl, libraryTitle.nextSibling);
		}
	// If no working URL was found, remove the link if it exists.
	} else if (docFlipEl) {
		docFlipEl.parentNode.removeChild(docFlipEl);
	}
}

// Set up DocFlip when the page loads.
setUpDocFlip();

// Listen for hash changes and update the DocFlip link when they occur.
// This is necessary because clicking links in a document doesn't trigger a hard reload.
window.addEventListener('hashchange', setUpDocFlip, false);