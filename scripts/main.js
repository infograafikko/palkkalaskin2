//Nouislider

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

//Select option value
var e = document.getElementById("sektoriValue");
var sektoriValue = e.options[e.selectedIndex].value;


//////////////////////
//Let's use d3.js   //
//////////////////////

//Get ratio
function getRatio (side) {
  return ((margin[side] / width) * 100) + '%'
}

// set the dimensions and margins of the graph
var margin = {left: 42, top: 50, right: 80, bottom: 60}
    width = 900;
    height = 400;

var marginRatio = {
  left: getRatio('left'),
  top: getRatio('top'),
  right: getRatio('right'),
  bottom: getRatio('bottom')
}

// set the ranges
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the line
var valueline = d3.line()
    .x(function(d) { return x(d.salary); })
    .y(function(d) { return y(d.cumulativepct); })
    .curve(d3.curveBasis);


// define the area
var area = d3.area()
    .x(function(d) { return x(d.salary); })
    .y0(height)
    .y1(function(d) { return y(d.cumulativepct); })
    .curve(d3.curveBasis);
    
//Bisector for tooltip
var bisectSalary = d3.bisector(function(d) { return d.salary; }).left;

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin

var svg = d3.select("div#chart")
  .append("div")
  .attr("id", "svg-container") //container class to make it responsive
  .append("svg")
  // Add margin to show axes
  .style('padding', marginRatio.top + ' ' + marginRatio.right + ' ' + marginRatio.bottom + ' ' + marginRatio.left)
  //responsive SVG needs these 2 attributes and no width and height attr
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
  //class to make it responsive
  .attr("id", "svg-content-responsive");

  svg = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    d3.csv("data/palkkadata2.csv", function(error, data) {      
      if (error) throw error;
      
      //Filter data

        //if viestintatoimisto
        if(sektoriValue == "viestinta") {
          data = data.filter(function (d) { return d.q3 === "3"});          
        } 

        //else if yksityinen then...
        else if(sektoriValue == "yksityinen") {
          data = data.filter(function (d) { return d.q12 === "10000000" | d.q12 === "01000000"});                    
        }

        //elseif julkinen then...
        else if(sektoriValue == "julkinen") {
          data = data.filter(function (d) { return d.q12 === "00100000" | d.q12 === "00010000" | d.q12 === "00001000" | d.q12 === "00000100"});                    
        }

        //elseif järjestö, liitto, säätiö then
        else if(sektoriValue == "jarjesto") {
          data = data.filter(function (d) { return d.q12 === "00000010"});                    
        }

        //else kaikki 
        else {

        }


      //Convert string to number
      data.forEach(function(d) {
        d.q27a = +d.q27a;
        })

      //Sort data from smallest to largest
      data.sort(function(x, y){
        return d3.ascending(x.q27a, y.q27a);
      })

      //Data for the chart
      data.forEach(function(d,i) {
        d.palkka = Math.round(d.q27a/100)*100;
        d.cumupct = (100/data.length*i)+(100/data.length);
      })

      console.log(data)

      //Count how many smaller values
      var bisectValue = d3.bisector(function(d) { return d.q27a; }).right;
      var smaller = bisectValue(data, userSalary);

      //Count how many smaller by percentage
      var smallerPCT = (smaller / data.length) * 100;

      //Display text
      var editSalarytext = document.getElementById("salary-text");
      editSalarytext.innerHTML = "Tienaat enemmän kuin " + Math.round(smallerPCT) + " % viestinnän alan palkansaajista.";
      editSalarytext.style.display = "block";

      //Display text
      var editSalarytopic = document.getElementById("salary-topic");
      editSalarytopic.innerHTML = "Viestinnän palkat, kumulatiivinen, % (" + sektoriValue + ")";
      editSalarytopic.style.display = "block";

      //Display filtering
     // var editSalaryFilter= document.getElementById("filter");
     // editSalaryFilter.style.display = "block";
      

      console.log(data);
      
      //////
      //Make dataset for the graph with cumupct and salary rounded to hundreds
      //////
      
      var salaryMax = d3.max(data, function(d) { return d.palkka; });
      var graphData = [];
      var filterMaxPCT = 0;

      for (i = 0; i <= salaryMax; i=i+100) {
        var obj = new Object();
        var filterSalaries = data.filter(function (d) { return d.palkka === i})

        if (d3.max(filterSalaries, function(d) { return d.cumupct; }) != null) {
          filterMaxPCT = d3.max(filterSalaries, function(d) { return d.cumupct; });
        }

        //Push items to object. Max cumpct in a salary category
        obj.cumulativepct = filterMaxPCT;
        obj.salary = i;

        
        graphData.push(obj)
      }

      console.log(graphData)
      

      
      ///////////////////////
      //It's time to draw////
      ///////////////////////



        // Scale the range of the data
          x.domain(d3.extent(graphData, function(d) { return d.salary; }));
          y.domain([0, d3.max(graphData, function(d) { return d.cumulativepct; })]);

        // Add the valueline path.
          svg.append("path")
          .data([graphData])
          .attr("class", "line")
          .attr("d", valueline);

        // Add the area 
          svg.append("path")
          .data([graphData])
          .attr("class", "area")
          .attr("d", area);

        // Add the X Axis
        svg.append("g")
          .attr("class", "xaxis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
          .call(d3.axisLeft(y))
          .attr("class", "yaxis")

        // Add the userSalaryLine
        var userSalaryLine = svg.append("g")
          .attr("class", "userSalaryLine");
        
        userSalaryLine.append("line")
          .attr("y1", -20)
          .attr("y2", height)
          .attr("x1", x(userSalary))
          .attr("x2", x(userSalary));

        // Add the userSalaryCircle
        var userSalaryCircle = svg.append("g")
        .attr("class", "userSalaryCircle");

        userSalaryCircle.append("circle")
          .attr("cx", x(userSalary + 5))
          .attr("cy", y(smallerPCT))
          .attr("r", 10)
          .attr("fill", "#e30577")
    
        // Add soon to be dynamic features,. pctText
        var userPctText = svg.append("g")
          .attr("class", "userPctText")
          .attr("font-size", "150%")

        userPctText.append("text")
          .attr("x", x(userSalary) + 10)
          .attr("y", y(smallerPCT) + 5)
          .text(Math.round(smallerPCT) + " %")
          
        var userSalaryRect = svg.append("g")
          .attr("class", "userSalaryRect")

        userSalaryRect.append("rect")
          .attr("x", x(userSalary) - 60)
          .attr("y", -45)
          .attr("width", 120)
          .attr("height", 35)
          .attr("fill", "lightgray")
          .attr("rx", 15)
          .attr("ry", 15)

        
        var userSalaryText = svg.append("g")
          .attr("class", "userSalaryText")

        userSalaryText.append("text")
          .attr("x", x(userSalary) - 40)
          .attr("y", -20)
          .text(sliderFormat.noUiSlider.get() + " €")
          .attr("fill", "black")
          .attr("font-size", "150%");


      //var min =  d3.max(data, function(d) { return d.q27a; });    
      //var max =  d3.min(data, function(d) { return d.q27a; });    
      //var med =  d3.median(data, function(d) { return d.q27a; });
      //console.log(min);
      //console.log(max);
      //console.log(med);      
      //console.log(bisectValue(data, 0));
      //console.log(data.length);
      
    })

  }

}

