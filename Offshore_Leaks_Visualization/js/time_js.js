all_data={}

country_dict = {}
reverse_country_dict = {}

let svg_time = 0;

let width = 0;

let height = 0;

let margin = 0;

let bisect = 0;

let focus = 0;

let focusText = 0;

let min_date = '1865-1'
let max_date = '2022-12'

let start_date = min_date

let end_date = max_date

let time_country = "World"


window.onload=function(){

  width = document.getElementById('time_div').clientWidth;
  height = width*0.5


  //Read the data
  Promise.all([
  d3.csv("dataset/dataset1.csv"),
  d3.csv("dataset/dataset4.csv")])
    .then((d) => {
      make_country_dict(d[0])

      let newdata = preProcess(d[1]);

      draw(newdata);

    })
    .catch(err => {console.log(err)});


};

function draw(newdata) {

  
  var parseTime = d3.timeParse("%Y-%m");

  newdata = Object.entries(newdata)
  newdata = newdata.filter(k => parseTime(k[0])>=parseTime(start_date) && parseTime(k[0])<=parseTime(end_date))

  total = 'total'
  if(time_country!="World"){
    total = time_country
  }


  dates = newdata.map(k =>parseTime(k[0]))
  totals = newdata.map(k => k[1][total])

  // append the svg object to the body of the page
  svg_time = d3.select("#time_div")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform",
        "translate(" + 60 + "," + 10 + ")");

  // Add X axis --> it is a date format
  var x = d3.scaleTime()
  .domain(d3.extent(dates))
  .range([ 0, width*0.75 ]);

  svg_time.append("g")
  .attr("transform", "translate(0," + height*0.75 + ")")
  .call(d3.axisBottom(x));


  // Add Y axis
  var y = d3.scaleLinear()
  .domain([Math.min(...totals), Math.max(...totals)])
  .range([ height*0.75, 0 ]);

  svg_time.append("g")
  .call(d3.axisLeft(y));


  // Add the line
  svg_time.append("path")
  .datum(newdata)
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 1.5)
  .attr("d", d3.line()
  .x((d) => { return x(parseTime(d[0])) })
  .y((d) => { return y(d[1][total]) })
  );

  // create a tooltip
    const Tooltip = d3.select("#time_div")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function(event,d) {
      Tooltip
        .style("opacity", 1)
    }
    const mousemove = function(event,d) {
      Tooltip
        .html("<p>Number of Offshores: " + d[1][total]+"</p><p>Date: "+d[0]+"</p>")
        .style("left", `${event.layerX+10}px`)
        .style("top", `${event.layerY}px`)
    }
    const mouseleave = function(event,d) {
      Tooltip
        .style("opacity", 0)
    }

      

    // Add the points
    svg_time
      .append("g")
      .selectAll("dot")
      .data(newdata)
      .join("circle")
        .attr("class", "myCircle")
        .attr("cx", d => x(parseTime(d[0])))
        .attr("cy", d => y(d[1][total]))
        .attr("r", d => newdata.length>300 ? 1 : 3 )
        .attr("stroke", "#4169E1")
        .attr("stroke-width", 3)
        .attr("fill", "white")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

}

function make_country_dict(data){

  let entries = Object.entries(data);

  for(let i = 0; i< data.length; i++){

    let row = entries[i][1];

    country_dict[row['country_code']]=row['country_name']
    
    reverse_country_dict[row['country_name']]=row['country_code']
  }


}

function preProcess(data){

  let s_select = document.getElementById('s_date_select');
  let e_select = document.getElementById('e_date_select');
  let c_select = document.getElementById('country_select');
  let options = [];
  let country_options = data['columns'].slice(2);

  let entries = Object.entries(data);

  for(let i = 0; i< data.length; i++){

      let row = entries[i][1];

      all_data[row['date']]={}

      options.push(row['date'])

      for (key in row) {
        if (key != 'date'){
          all_data[row['date']][key]=row[key]
        }
      }
  }

  for(let i=0; i<options.length; i++){
    let opt1 = document.createElement('option');
    opt1.value = options[i];
    opt1.innerHTML = options[i];
    
    let opt2 = document.createElement('option');
    opt2.value = options[i];
    opt2.innerHTML = options[i];
    if(i==options.length-1){
      opt2.selected = "selected"
    }

    s_select.appendChild(opt1);
    e_select.appendChild(opt2);
}

for(let i=0; i<country_options.length; i++){
  let opt = document.createElement('option');
  opt.value = country_dict[country_options[i]];
  opt.innerHTML = country_dict[country_options[i]];

  c_select.appendChild(opt);
}

  return all_data
}

function changedate(){
  let s_selection = document.getElementById("s_date_select").value;
  let e_selection = document.getElementById("e_date_select").value;

  start_date = s_selection
  end_date = e_selection


  if(end_date<start_date){
    end_date=max_date
    document.getElementById("e_date_select").selectedIndex = document.getElementById("e_date_select").options.length-1
  }
  d3.selectAll('svg').remove();
  draw(all_data)
}

function changecountry(){
  
  let c_selection = reverse_country_dict[document.getElementById("country_select").value];

  time_country = c_selection
  d3.selectAll('svg').remove();
  draw(all_data)
}



