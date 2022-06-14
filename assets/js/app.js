
var svgWidth = 960;
var svgHeight = 500;
var margin = {
  top: 20,
  right: 100,
  bottom: 80,
  left: 50
};


var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)


// Append an SVG group
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Set initial parmes
var XAxis = "poverty";
var YAxis = "healthcare";

// function for x-scale/y-scale update
// x-scale
function xScale(data, XAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[XAxis])*0.9, d3.max(data, d => d[XAxis])*1.1])
    .range([0, width]);
  return xLinearScale;
}
// y-scale
function yScale(data, YAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[YAxis])*0.8,d3.max(data, d => d[YAxis])*1.1])
    .range([height, 0]);
  return yLinearScale;
}

// function for x-Axis/y-Axis label update
// x-label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}
// y-label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// functions for circles update
// x-circles
function renderXCircles(circlesGroup, newXScale, XAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[XAxis]))
    .attr("dx", d => newXScale(d[XAxis]));
  return circlesGroup;
}
// y-circles
function renderYCircles(circlesGroup, newYScale, YAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[YAxis]))
    .attr("dy", d => newYScale(d[YAxis]))
  return circlesGroup;
}

// functions used for text update
// XText
function renderXText(circlesGroup, newXScale, XAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[XAxis]));
  return circlesGroup;
}
//YText
function renderYText(circlesGroup, newYScale, YAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("dy", d => newYScale(d[YAxis])+5)
  return circlesGroup;
}

// function for tooltip update
function updateToolTip(XAxis, YAxis, circlesGroup) {
  // update output text
  var xlabel;
  var ylabel;
  if (XAxis === "poverty") {
    xlabel = "Poverty:";
  }
  else if (XAxis === "age") {
    xlabel = "Age:";
  }
  else if (XAxis === "income"){
      xlabel = "Household income:"
  }
  if (YAxis === 'healthcare'){
      ylabel = "Health:"
  }
  else if (YAxis === 'obesity'){
      ylabel = "Obesity:"
  }
  else if (YAxis === 'smokes'){
      ylabel = "Smokes:"
  }
  // Initialize tool tip
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([40, -60])
    .html(function (d) {
    return (`${d.state}<br>Poverty: ${d.poverty}%<br>Obesity: ${d.obesity}% `);
    });
  // Create tooltip in the chart
  circlesGroup.call(toolTip);
  // Create event listeners
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data,this);
  })
  // onmouseout event
  .on("mouseout", function(data) {
  toolTip.hide(data);
  });
  return circlesGroup;
}

// Retrieve data from the CSV file
d3.csv("./assets/data/data.csv").then(function(data, err) {
  if (err) throw err;
  // parse data
  data.forEach(d => {
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
    //// y axis - parse int
    d.healthcare = +d.healthcare;
    d.obesity = +d.obesity;
    d.smokes = +d.smokes;
  });
  // xLinearScale function above csv import
  var xLinearScale = xScale(data, XAxis);
  var yLinearScale = yScale(data, YAxis);
  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x/y axis
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
    // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("g");
  

  var circles = circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d[XAxis]))
    .attr("cy", d => yLinearScale(d[YAxis]))
    .attr("r", 15)
    .classed('stateCircle', true);

  // append initial text
  var circlesText = circlesGroup.append("text")
    .text(d => d.abbr)
    .attr("dx", d => xLinearScale(d[XAxis]))
    .attr("dy", d => yLinearScale(d[YAxis])+5)
    .classed('stateText', true);
  
  // Create group for three x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  // poverty
  var PovertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty (%)");
  // Age (Median)
  var AgeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)");
  // Household Income (Median)
  var IncomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");

 //==================================================== 
  // Create group for three y-axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
    
  // Healthcare (%)
  var HealthLabel = ylabelsGroup.append("text")
    .attr("y", -40)
    .attr("x", -(height/2))
    .attr("dy", "1em")
    .attr("value", "healthcare") 
    .classed("active", true)
    .text("Lacks Healthcare (%)");
    // Obese (%)
  var ObeseLabel = ylabelsGroup.append("text")
    .attr("y", -80)
    .attr("x", -(height/2))
    .attr("dy", "1em")
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obese (%)");
  // Smokes (%)
  var SmokesLabel = ylabelsGroup.append("text")
    .attr("y", -60)
    .attr("x", -(height/2))
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)");
  
  // updateToolTip function above csv import
  circlesGroup = updateToolTip(XAxis, YAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== XAxis) {

        // update new value for x
        XAxis = value;
        xLinearScale = xScale(data, XAxis);
        xAxis = renderXAxes(xLinearScale, xAxis);
        circles = renderXCircles(circles, xLinearScale, XAxis);
        circlesText = renderXText(circlesText, xLinearScale, XAxis)
        
        // updates tooltips with new info  
        circlesGroup = updateToolTip(XAxis, YAxis, circlesGroup);
        if (XAxis === "age") {
          AgeLabel
            .classed("active", true)
            .classed("inactive", false);
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if(XAxis === 'income'){
          IncomeLabel
            .classed("active", true)
            .classed("inactive", false);
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          AgeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if(XAxis === 'poverty'){
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
          AgeLabel
            .classed("active", false)
            .classed("inactive", true);
          PovertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

    // y axis labels event listener
  ylabelsGroup.selectAll("text")
              .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== YAxis) {
      // update new value for y
      YAxis = value;
      yLinearScale = yScale(data, YAxis);
      yAxis = renderYAxes(yLinearScale, yAxis);
      circles = renderYCircles(circles, yLinearScale, YAxis);
      circlesText = renderYText(circlesText, yLinearScale, YAxis) 
      circlesGroup = updateToolTip(XAxis, YAxis, circlesGroup);
      if (YAxis === "obesity") {
        ObeseLabel
          .classed("active", true)
          .classed("inactive", false);
        SmokesLabel
          .classed("active", false)
          .classed("inactive", true);
        HealthLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if(YAxis === 'smokes'){
        SmokesLabel
          .classed("active", true)
          .classed("inactive", false);
        HealthLabel
          .classed("active", false)
          .classed("inactive", true);
        ObeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if(YAxis === 'healthcare'){
        HealthLabel
          .classed("active", true)
          .classed("inactive", false);
        SmokesLabel
          .classed("active", false)
          .classed("inactive", true);
        ObeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }
    }
  });
}).catch(function(error) {
  console.log(error);
});
