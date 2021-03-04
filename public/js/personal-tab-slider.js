$(document).ready(() => {
	let scriptElement = $('script').last();
	console.log(scriptElement);
	let numberOfSections = 4;
	let currentSection = 1;
	for(let i = 2; i <= numberOfSections; i++) {
		$(`#section${i}`).hide();
	}
	$('#arrow-left').click((e) => {
		e.preventDefault();
    $(`#section${currentSection}`).hide();
    currentSection--;
    if(currentSection === 0) {
      currentSection = 1;
    }
    $(`#section${currentSection}`).show();
	});
	$('#arrow-right').click((e) => {
		e.preventDefault();
    $(`#section${currentSection}`).hide();
    currentSection++;
    if(currentSection === 1 + parseInt(numberOfSections)) {
      currentSection = numberOfSections;
    }
    $(`#section${currentSection}`).show();
	});
});