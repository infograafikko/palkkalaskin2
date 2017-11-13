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

  var calcButton = document.getElementById('playCalc');
  calcButton.onclick = function() {

    //Convert userSalary to number
    var userSalary = sliderFormat.noUiSlider.get();
    userSalary = userSalary.split(' ').join('');
    userSalary = Number(userSalary);

    d3.csv("data/palkkadata2.csv", function(error, data) {

      //Convert string to number
      data.forEach(function(d) {
        d.q27a = +d.q27a;
        })

      //Sort data from smallest to largest
      data.sort(function(x, y){
        return d3.ascending(x.q27a, y.q27a);
      })

      //Count how many smaller values
      var bisectValue = d3.bisector(function(d) { return d.q27a; }).right;
      var smaller = bisectValue(data, userSalary);

      //Count how many smaller by percentage
      var smallerPCT = (smaller / data.length) * 100;

      //Display text
      var editSalarytext = document.getElementById("salary-text");
      editSalarytext.innerHTML = "Tienaat enemmän kuin " + Math.round(smallerPCT) + " % viestinnän alan palkansaajista.";
      editSalarytext.style.display = "block";
      



      var min =  d3.max(data, function(d) { return d.q27a; });    
      var max =  d3.min(data, function(d) { return d.q27a; });    
      var med =  d3.median(data, function(d) { return d.q27a; });
      console.log(min);
      console.log(max);
      console.log(med);      
      console.log(bisectValue(data, 0));
      console.log(data.length);
      
    })

  }

}

