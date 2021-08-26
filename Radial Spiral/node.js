var width = 1300,
    height = 600,
    start = 0,
    end = 2,
    numSpirals = 3,
    margin = {top:10,bottom:50,left:50,right:50};

  var theta = function(r) {
    return numSpirals * Math.PI * r;
  };

  //size of the spiral
  var r = d3.min([width, height]) / 2-3;

  //define radius angle for making spiral
  var radius = d3.scaleLinear()
    .domain([start, end])
    .range([100, r]);

  //center the entire chart
  var svg = d3.select("#chart").append("svg")
    .attr("viewBox", "0 0 1450 2260")
    .attr("class","chart")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", "translate(700, 1200) scale(3.4)");

  var points = d3.range(start, end + 0.001, (end - start) / 1000);

  var spiral = d3.radialLine()
    .curve(d3.curveCardinal)
    .angle(theta)
    .radius(radius);

  //draw spiral path
  var path = svg.append("path")
    .datum(points)
    .attr("id", "spiral")
    .attr("d", spiral)
    .style("fill", "none")
    .style("stroke", "white")
    .style("stroke-dasharray", ("6, 5"))
    .style("opacity", 0)
    .transition()
    .duration(2000)
    .style("opacity",0.2);

  //defining spiral length
  var spiralLength = path.node().getTotalLength(),
      N = 365,
      barWidth = (spiralLength / N) - 1;;

d3.csv('Test-data.csv', function(error, someData) {
      if (error) throw error;

      // format the data
      someData.forEach(function(d) {
        d.idx = +d.idx;
        d.birthYear = +d.birthYear;
      });

  //plot circles so that it's plotted all the way across spiral
  var timeScale = d3.scaleLinear()
    .domain(d3.extent(someData, function(d){
      return d.birthYear; }))
    .range([0, spiralLength]);

  var nodes = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(someData)
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr("fill", "white")

  // Apply default forces to simulation
  var simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceCollide().radius(5))
    .force("r", d3.forceRadial(function(d) { return d.cy; }))
    .force('collision', d3.forceCollide().radius(function(d) {
      return 200;
    }))
    //.on("tick", ticked);

      //DRAW CIRCLES
      nodes
        .attr("cx", function(d,i) {

      var linePer = timeScale(d.birthYear)
      var posOnLine = path.node(linePer).getPointAtLength(linePer)

      d.linePer = linePer; // % distance are on the spiral: we need this for labels
      d.cx = posOnLine.x; // x postion on the spiral
      d.cy = posOnLine.y; // y position on the spiral

      return d.cx;
    })

//    function ticked() {
//      nodes
      .attr("cy", function(d,i) { return d.cy; });

  // add date labels
  svg.selectAll("text")
    .data(someData)
    .enter()
    .append("text")
    .attr("dy", 20)
    .style("text-anchor", "start")
    .style("font", "10px arial")
    .append("textPath")
    // print certain birth years
    .filter(d=>d.first==1)
    .text(d=>d.birthYear)
    // place text along spiral
    .attr("xlink:href", "#spiral")
    .style("fill", "none")
    .attr("startOffset", function(d){
      return ((d.linePer / (spiralLength + 20)) * 100) + "%"
    })
    .style("fill", "white");
// };

  //tooltip
 var tooltip = d3.select("#chart")
  .append('div')
  .attr('class', 'tooltip');


//on hover...
  svg.selectAll("circle")
  .on('mouseover', function(d) {
      d3.select(this)
      .style("fill", "rgba(252, 209, 1, 1)")
      .attr('r', 12)

      tooltip
            .style('position', 'absolute')
            .style('left', `610px`)
            .style('top', `390px`)
            .style('display', 'inline-block')
            .style('opacity', '0.9')
            //print hover info
            .html(`
              <span><b>${d.name}</b></span>
              <br><span> Born ${d.birthYear} </span>`);
        })

  //When no longer hovering...
  .on('mouseout', function(d) {
    //...turn back to white and original radius size
    d3.select(this)
      .style("fill", "white")
      .attr("r", 5);

      tooltip.style('display', 'none');
      tooltip.style('opacity', 0);
  })

 .exit().remove();
})
