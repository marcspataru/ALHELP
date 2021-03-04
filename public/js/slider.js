$(document).ready(() => {
	let scriptElement = $('script').last();
	console.log(scriptElement);
	let numberOfSections = scriptElement.attr('data-numberOfSections');
	let currentSection = 1;
	for(let i = 2; i <= numberOfSections; i++) {
		$(`#section${i}`).hide();
		$('#quiz').hide();
	}
	$('#arrow-left').click((e) => {
		e.preventDefault();
		if($('#quiz').is(':hidden')) {
			$(`#section${currentSection}`).hide();
			currentSection--;
			if(currentSection === 0) {
				currentSection = 1;
			}
			$(`#section${currentSection}`).show();
		} else {
			$('#quiz').hide();
			$(`#section${numberOfSections}`).show();
			currentSection = numberOfSections;
		}
	});
	$('#arrow-right').click((e) => {
		e.preventDefault();
		if($('#quiz').is(':hidden')) {
			$(`#section${currentSection}`).hide();
			currentSection++;
			if(currentSection === 1 + parseInt(numberOfSections)) {
				$('#quiz').show();
			} else {
				$(`#section${currentSection}`).show();
			}
		}
	});
});