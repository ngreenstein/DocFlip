#DocFlip
DocFlip is a Chrome extension that makes it easy to switch between the Mac and iOS versions of Apple's Developer Library documentation. It adds a 'flip' link to the header of any supported page: ![Screenshot of the DocFlip link](http://i.imgur.com/nppxJ.png) Clicking the link will take you to the corresponding document in the other platform's Developer Library.

#Installation
Install DocFlip from the Chrome Web Store [here](https://chrome.google.com/webstore/detail/docflip/pafmafifhicbmimdmmljhiaigkcnbkkl).

#Supported Pages
DocFlip should support reference docs for all classes and protocols that are present on both Mac and iOS. This includes items with the same name on both platforms like `NSString` and items that have the same name but different prefixes on each platform like `NSApplicationDelegate` and `UIApplicationDelegate`.

No flip link is shown on pages that aren't supported (either because the item doesn't exist on the other platform or because of a bug).

#I found a page where DocFlip doesn't work!
Apple's docs have a wide and sometimes-unpredictable variety of naming and URL schemes, which makes it difficult to support and test everything. **If you find a page where DocFlip doesn't work but shouldn't, add a GitHub issue** and I'll try to add support. Or, if you're feeling generous (or impatient), you can add support yourself. Follow the below directions to create and add your guess and submit a pull request.

#Adding Support For Additional Pages
##Overview
DocFlip finds corresponding pages by iterating over an array of 'guesses' and testing each one until it finds one that works. Guesses are just regex replacements that modify the URL of the page, so each guess contains a pattern and a replacement. If the current URL matches the pattern, the replacement is made and the resultant page is tested for existence with an Ajax HEAD request. If it exists, the DocFlip link adopts this URL.

##Adding Guesses
Guesses are stored in the `guesses` array, which is defined near the beginning of `docflip.js`. They usually come in pairs: one to go from the Mac page to the iOS page and one to go from iOS to Mac. Here's an example pair of guesses:

	// Protocol references for protocols that are present on both platforms but have different prefixes, like NSTextInput.
	{pattern: /\/library\/mac\/documentation\/Cocoa\/Reference\/ApplicationKit\/Classes\/NS/g,
	 replacement: '/library/ios/documentation/uikit/reference/UI'},
	{pattern: /\/library\/ios\/documentation\/(?:uik|UIK)it\/[Rr]eference\/UI(\w+)_[Cc]lass\//g,
	 replacement: '/library/mac/documentation/Cocoa/Reference/ApplicationKit/Classes/NS$1_Class/'}
	 
Both of these are for classes that are present on both platforms but have different prefixes. The first one goes from Mac pages to iOS pages, and the second one goes from iOS to Mac. 

##Guidelines
* **Try to make your pattern reasonably specific so that it's only tried for pages where it could potentially work.** For example, if you're writing a guess for protocol references make sure its pattern is not matched by class reference pages.
* **Order guesses based on how likely they are to be correct.** DocFlip tries guesses sequentially and stops when it reaches one that works, so putting guesses that are correct more often first improves performance.
* **Add a comment that explains what your guess does and notes a page where it is works.** See the existing guesses for examples.

*Thanks for contributing!*