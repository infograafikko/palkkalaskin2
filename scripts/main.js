window.onload = function() {
  var sliderFormat = document.getElementById('slider-step');
  
  noUiSlider.create(sliderFormat, {
    start: [ 3000 ],
    step: 100,
    range: {
      'min': [ 0 ],
      'max': [ 20000 ]
    },
    format: wNumb({
      decimals: 0,
      thousand: ' '
    })
  });

  

var inputFormat = document.getElementById('salary');

sliderFormat.noUiSlider.on('update', function( values, handle ) {
	inputFormat.value = values[handle];
});

inputFormat.addEventListener('change', function(){
	sliderFormat.noUiSlider.set(this.value);
});
}