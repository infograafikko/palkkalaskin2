var graphData = [];
var smallerPCT;
var drawCounter = 0;
var t = 500;




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

//////////////////////
//Let's use d3.js   //
//////////////////////

//Get ratio
function getRatio (side) {
  return ((margin[side] / width) * 100) + '%'
}

// set the dimensions and margins of the graph
var margin = {left: 60, top: 55, right: 140, bottom: 30}
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


  
  var calcButton = document.getElementById('playCalc');
  
  /////////////////////
  //Button is clicked//
  /////////////////////
  
  calcButton.onclick = function() {

  //Convert userSalary to number
  var userSalary = sliderFormat.noUiSlider.get();
  userSalary = userSalary.split(' ').join('');
  userSalary = Number(userSalary);

  //Select option value
  var e = document.getElementById("sektoriValue");
  var sektoriValue = e.options[e.selectedIndex].value;
  var e2 = document.getElementById("filterValue");
  var filterValue = e2.options[e2.selectedIndex].value;



    d3.csv("data/palkkadata4.csv", function(error, data) {      
      if (error) throw error;

      //Kokemus, ika ja palkka
      data.forEach(function(d) {
        d.q5 = +d.q5;
        d.q11 = +d.q11;    
        d.q27a = +d.q27a;    
        })


      //////////////////////////////////////
      //Draw graph for the very first time//
      //////////////////////////////////////

      if (drawCounter == 0) {

        filterData();

         //Show data or not
         if (data.length < 5) {
          //Display text
          var editSalarytext = document.getElementById("salary-text");
          editSalarytext.innerHTML = "Alle 5 havaintoa. Syötä eri rajaukset.";
          editSalarytext.style.display = "block";
          var graph = document.getElementById("svg-container");          
          graph.style.display = "none";
          
        } else {

        //Sort data from smallest to largest
        data.sort(function(x, y){
          return d3.ascending(x.q27a, y.q27a);
        })

        //Data for the chart
        data.forEach(function(d,i) {
          d.palkka = Math.round(d.q27a/100)*100;
          d.cumupct = (100/data.length*i)+(100/data.length);
        })

        calcUpdate();
        drawFirstTime();
        drawCounter = drawCounter + 1;
        
        }
      } 
      
      //////////////////////////////////////
      //Draw graph for the second+    time//
      //////////////////////////////////////
      
      else {
        filterData();

         //Show data or not
         if (data.length < 5) {
          //Display text
          var editSalarytext = document.getElementById("salary-text");
          editSalarytext.innerHTML = "Alle 5 havaintoa. Syötä eri rajaukset.";
          editSalarytext.style.display = "block";
          
          //hide elements
          var graph = document.getElementById("svg-container");          
          graph.style.display = "none";

          var salaryTopic = document.getElementById("salary-topic");          
          salaryTopic.style.display = "none";

          var salaryDetails = document.getElementById("salary-details");          
          salaryDetails.style.display = "none";
          
        } else {

        //Sort data from smallest to largest
        data.sort(function(x, y){
          return d3.ascending(x.q27a, y.q27a);
        })

        //Data for the chart
        data.forEach(function(d,i) {
          d.palkka = Math.round(d.q27a/100)*100;
          d.cumupct = (100/data.length*i)+(100/data.length);
        })

        calcUpdate();

          //show elements
          var graph = document.getElementById("svg-container");          
          graph.style.display = "block";

          var salaryTopic = document.getElementById("salary-topic");          
          salaryTopic.style.display = "block";

          var salaryDetails = document.getElementById("salary-details");          
          salaryDetails.style.display = "block";    
          
        updateGraph();

      }
    }
      

      
      ///////////////////////
      //It's time to draw////
      ///////////////////////

      function drawFirstTime() {

        // Scale the range of the data
          x.domain(d3.extent(graphData, function(d) { return d.salary; }));
          y.domain([0, 100]);

          console.log(graphData)
          
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
        

        var toolTip = svg.append("g")
        .attr("class", "toolTip")
        .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
          
        toolTip.append("line")
          .attr("class", "userSalaryLine")
          .attr("y1", -20)
          .attr("y2", height)
          .attr("x1", x(userSalary))
          .attr("x2", x(userSalary));

        // Add the userSalaryCircle
        toolTip.append("circle")
          .attr("class", "userSalaryCircle")
          .attr("cx", x(userSalary + 5))
          .attr("cy", y(smallerPCT))
          .attr("r", 10)
          .attr("fill", "#e30577");
    
        // Add soon to be dynamic features,. pctText
        toolTip.append("text")
          .attr("class", "userPctText")
          .attr("font-size", "150%")
          .attr("x", x(userSalary) + 15)
          .attr("y", y(smallerPCT) + 5)
          .text(smallerPCTtext + " %");
          
        toolTip.append("rect")
          .attr("class", "userSalaryRect")
          .attr("x", x(userSalary) - 60)
          .attr("y", -45)
          .attr("width", 120)
          .attr("height", 35)
          .attr("fill", "lightgray")
          .attr("rx", 15)
          .attr("ry", 15);
     
        toolTip.append("text")
          .attr("class", "userSalaryText")
          .attr("x", x(userSalary) - 45)
          .attr("y", -20)
          .text(sliderFormat.noUiSlider.get() + " €")
          .attr("fill", "black")
          .attr("font-size", "150%");


        //Let's make invisible dragging box

        toolTip.append("rect")
          .attr("class", "draggingBox")
          .attr("x", x(userSalary) - 60)
          .attr("y", -45)
          .attr("width", 120)
          .attr("height", height + 45)
          .attr("fill", "black")
          .attr("opacity", 0.2);

        }

        function dragstarted(d) {
          d3.select(this).select(".draggingBox").raise().classed("active", true);
        }
        
        function dragged(d) {

          //Count toolTipSlary when dragging
          var toolTipSalary = x.invert(d3.event.x - 50);
              toolTipSalary = Math.round(toolTipSalary/100)*100;
          var toolTipSalaryText = toolTipSalary.toLocaleString() + " €";

          var circlePct = graphData.find(y => y.salary === toolTipSalary).cumulativepct;
          var circlePctText;
          
          if (circlePct > 99 & circlePct < 100) {
            circlePctText = "> 99";
          } else if (circlePct < 1 & circlePct > 0) {
            circlePctText = "< 1";
          } else  {
            circlePctText = Math.round(circlePct);;
          }

          console.log(d3.event.x);


          d3.select(this).select(".draggingBox").attr("x", d3.event.x - 110);
          d3.select(this).select(".userSalaryLine").attr("x1", d3.event.x - 48).attr("x2", d3.event.x - 48);
          d3.select(this).select(".userSalaryRect").attr("x", d3.event.x - 110);
          d3.select(this).select(".userSalaryText").attr("x", d3.event.x - 95).text(toolTipSalaryText);
          d3.select(this).select(".userPctText").attr("x", d3.event.x - 25).attr("y", y(circlePct) + 5).text(circlePctText + " %");
          d3.select(this).select(".userSalaryCircle").attr("cx", d3.event.x - 50).attr("cy", y(circlePct));
          
        }
        
        function dragended(d) {
          d3.select(this).select(".draggingBox").classed("active", false);
        }


      //////////////////////////
      //Filter the data////////
      /////////////////////////

      function filterData() {
        //SEKTORI
        //if viestintatoimisto
        if(sektoriValue == "viestinta") {
          data = data.filter(function (d) { return d.q3 === "3"});          
        } 

        //else if yksityinen then...
        else if(sektoriValue == "yksityinen") {
          data = data.filter(function (d) { return d.q12a === "1" | d.q12b === "1"});                    
        }

        //elseif julkinen then...
        else if(sektoriValue == "julkinen") {
          data = data.filter(function (d) { return d.q12c === "1" | d.q12d === "1" | d.q12e === "1" | d.q12f === "1"});                    
        }

        //elseif järjestö, liitto, säätiö then
        else if(sektoriValue == "jarjesto") {
          data = data.filter(function (d) { return d.q12g === "1"});                    
        }

        //else kaikki 
        else {

        }

        //RAJAUKSET
        //Organisaation koko
        if (filterValue == "alle8000") {
          data = data.filter(function (d) { return d.q19 !== "8" & d.q19 !== "0" & d.q19 !== "9"; })                              
        } else if (filterValue == "8000+") {
          data = data.filter(function (d) { return d.q19 === "8" });                                        
        } 
        
          //Toimipaikan sijainti
          else if (filterValue == "pkseutu") {
            data = data.filter(function (d) { return d.q4 === "1"});
          } else if (filterValue == "pkseutu") {
            data = data.filter(function (d) { return d.q4 !== "1" & d.q4 !== "0" & d.q4 !== "4"; }) 
          }

          //Asema viestintäyksikössä
          else if (filterValue == "johtaja") {
            data = data.filter(function (d) { return d.q14 === "7"});
          } else if (filterValue == "ykspaallikkoal") {
            data = data.filter(function (d) { return d.q14 === "2" & d.q14 === "3" }) 
          } else if (filterValue == "esimieseialaisia") {
            data = data.filter(function (d) { return d.q14 === "1" }) 
          } else if (filterValue == "vastaayksin") {
            data = data.filter(function (d) { return d.q14 === "4"; }) 
          } else if (filterValue == "alainen") {
            data = data.filter(function (d) { return d.q14 === "5"; }) 
          } else if (filterValue == "toimiimuualla") {
            data = data.filter(function (d) { return d.q14 === "6"; }) 
          }
          
          //Päätehtävät
          else if (filterValue == "lehtitoiminta") {
            data = data.filter(function (d) { return d.q18a === "1"});
          } else if (filterValue == "markkinointiviestinta") {
            data = data.filter(function (d) { return d.q18b === "1"}) 
          } else if (filterValue == "maine") {
            data = data.filter(function (d) { return d.q18c === "1" }) 
          } else if (filterValue == "mediaviestinta") {
            data = data.filter(function (d) { return d.q18d === "1"; }) 
          } else if (filterValue == "sisainenviestinta") {
            data = data.filter(function (d) { return d.q18e === "1"; }) 
          } else if (filterValue == "talousviestinta") {
            data = data.filter(function (d) { return d.q18f === "1"; }) 
          } else if (filterValue == "sisallontuotanto") {
            data = data.filter(function (d) { return d.q18g === "1"}) 
          } else if (filterValue == "some") {
            data = data.filter(function (d) { return d.q18h === "1" }) 
          } else if (filterValue == "viestijohtaminen") {
            data = data.filter(function (d) { return d.q18i === "1"; }) 
          } else if (filterValue == "konsultointi") {
            data = data.filter(function (d) { return d.q18j === "1"; }) 
          } else if (filterValue == "yhteiskuntasuhteet") {
            data = data.filter(function (d) { return d.q18k === "1"; }) 
          } else if (filterValue == "yritysvastuu") {
            data = data.filter(function (d) { return d.q18l === "1"}) 
          } else if (filterValue == "projekti") {
            data = data.filter(function (d) { return d.q18m === "1" }) 
          } else if (filterValue == "muutosviestinta") {
            data = data.filter(function (d) { return d.q18n === "1"; }) 
          } else if (filterValue == "asiakasviestinta") {
            data = data.filter(function (d) { return d.q18o === "1"; }) 
          } else if (filterValue == "jokinmuualue") {
            data = data.filter(function (d) { return d.q18p === "1"; }) 
          }   
          
          //Koulutus
          else if (filterValue == "amk") {
            data = data.filter(function (d) { return d.q9 === "4"}) 
          } else if (filterValue == "yliopisto") {
            data = data.filter(function (d) { return d.q9 === "5" | d.q9 === "6" | d.q9 === "7"; }) 
          }
          
          //Viestinnan koulutus
          else if (filterValue == "paaaineyo") {
            data = data.filter(function (d) { return d.q6a === "1"});
          } else if (filterValue == "paaaineamk") {
            data = data.filter(function (d) { return d.q6b === "1"}) 
          } else if (filterValue == "paaaineopisto") {
            data = data.filter(function (d) { return d.q6c === "1" }) 
          } else if (filterValue == "sivuaineyo") {
            data = data.filter(function (d) { return d.q6d === "1"; }) 
          } else if (filterValue == "sisallontuotanto") {
            data = data.filter(function (d) { return d.q6e === "1"; }) 
          } else if (filterValue == "some") {
            data = data.filter(function (d) { return d.q6f === "1"; }) 
          } else if (filterValue == "viestijohtaminen") {
            data = data.filter(function (d) { return d.q6g === "1"; }) 
          } else if (filterValue == "konsultointi") {
            data = data.filter(function (d) { return d.q6h === "1"; }) 
          } else if (filterValue == "yhteiskuntasuhteet") {
            data = data.filter(function (d) { return d.q6i === "1"; }) 
          }

          //Sukupuoli
          else if (filterValue == "nainen") {
            data = data.filter(function (d) { return d.q10 === "1"});
          } else if (filterValue == "mies") {
            data = data.filter(function (d) { return d.q10 === "2"}) 
          }   

          //Kokemus
          else if (filterValue == "alle5") {
            data = data.filter(function (d) { return d.q5 <  5});
          } else if (filterValue == "510") {
            data = data.filter(function (d) { return d.q5 >= 5 & d.q5 <= 10}) 
          } else if (filterValue == "1115") {
            data = data.filter(function (d) { return d.q5 >= 11 & d.q5 <= 15 }) 
          } else if (filterValue == "yli15") {
            data = data.filter(function (d) { return d.q5 > 15; }) 
          }

          //Sukupuoli
          else if (filterValue == "alle30") {
            data = data.filter(function (d) { return d.q5 <= 3 & d.q11 < 30});
          } 

        else {
          
        }

       }

      //////////////////////////
      //Calc and update text////
      //////////////////////////

      function calcUpdate() {
      
        //Count how many smaller values
      var bisectValue = d3.bisector(function(d) { return d.q27a; }).right;
      var smaller = bisectValue(data, userSalary);

      //Count how many smaller by percentage
      smallerPCT = (smaller / data.length) * 100;
  


      if (smallerPCT > 99 & smallerPCT < 100) {
        smallerPCTtext = "> 99";
      } else if (smallerPCT < 1 & smallerPCT > 0) {
        smallerPCTtext = "< 1";
      } else  {
        smallerPCTtext = Math.round(smallerPCT);;
      }

      //    smallerPCT = Math.round(smallerPCT);

      //Display text
      var editSalarytext = document.getElementById("salary-text");
      editSalarytext.innerHTML = "Tienaat enemmän kuin " + smallerPCTtext + " % viestinnän alan palkansaajista valitsemillasi rajauksilla.";
      editSalarytext.style.display = "block";

      //Display text
      var editSalarytopic = document.getElementById("salary-topic");
      editSalarytopic.innerHTML = "Viestinnän alan palkat, kumulatiivinen (%)";
      editSalarytopic.style.display = "block";

      //Display detail text
      var editSalarydetails = document.getElementById("salary-details");      
      var Salarydetails1 = e.options[e.selectedIndex].text;
      var Salarydetails2 = e2.options[e2.selectedIndex].text;
      editSalarydetails.innerHTML = Salarydetails1 + " - " + Salarydetails2 + " (n = " + data.length + ")" + " <br /> Mediaani: " + d3.median(data, function(d) { return d.palkka; }) + " €, pienin palkka: " + d3.min(data, function(d) { return d.palkka; }) + " €, suurin palkka: " + d3.max(data, function(d) { return d.palkka; }) + " €";
      editSalarydetails.style.display = "block";


      
      //////
      //Make dataset for the graph with cumupct and salary rounded to hundreds
      //////
      
      var salaryMax = d3.max(data, function(d) { return d.palkka; });
      var filterMaxPCT = 0;

      graphData = [];

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
      }

      //////////////////////////
      //Update the graph here//
      //////////////////////////

      function updateGraph() {

        console.log(data);

        // Scale the range of the data
        x.domain(d3.extent(graphData, function(d) { return d.salary; }));

        var svg2 = d3.select("div#chart").transition();

        var updateLine = svg.select(".line").data([graphData]);
        var updateArea = svg.select(".area").data([graphData]);
        

        // Add the X Axis
        svg2.select(".xaxis")
        .call(d3.axisBottom(x));

        // Add the Y Axis
        svg2.select(".yaxis")
        .call(d3.axisLeft(y));

        console.log(graphData)

        updateLine.exit().remove();
        updateArea.exit().remove();

        // Update the valueline path.
        updateLine.transition()
        .duration(t)
        .attr("d", valueline);

        // Update the area path.
        updateArea.transition()
        .duration(t)
        .attr("d", area);

        //Update user salary line
        svg2.select(".userSalaryLine")
          .duration(t)
          .attr("x1", x(userSalary))
          .attr("x2", x(userSalary));

        // Update userSalaryCircle
        svg2.select(".userSalaryCircle")
          .duration(t)
          .attr("cx", x(userSalary + 5))
          .attr("cy", y(smallerPCT));

        // Update PCT text
        svg2.select(".userPctText")
          .attr("x", x(userSalary) + 15)
          .attr("y", y(smallerPCT) + 5)
          .text(smallerPCTtext + " %");

        svg2.select(".userSalaryRect")
          .attr("x", x(userSalary) - 60)
          .attr("y", -45);

        svg2.select(".userSalaryText")
          .attr("x", x(userSalary) - 45)
          .attr("y", -20)
          .text(sliderFormat.noUiSlider.get() + " €");
        
        svg2.select(".draggingBox")
          .attr("x", x(userSalary) - 60);


      }

    })
      
    }

  }



