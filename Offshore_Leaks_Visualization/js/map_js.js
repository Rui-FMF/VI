let svg_map = 0;

let width = 0;

let height = 0;

let country_data = {};

let sankey_data = {};

let topo_data = {};

let min_year = 0;

let max_year = 0;

let chosen_year = 0;

let chosen_country = "";

let mouse_pos =[];

window.onload=function(){

    svg_map = d3.select('#map_svg');

    width = document.getElementById('map_svg').clientWidth;

    height = document.getElementById('map_svg').clientHeight;

    Promise.all([
    // Load Data
    d3.json("dataset/world.json"),
    d3.csv("dataset/dataset1.csv"),
    d3.csv("dataset/dataset2.csv")
    ])
    .then((data) => {
        
        topo_data = data[0]

        let newdata = preProcess(data[1]);

        draw(newdata);

        preProcessSankey(data[2]);
    })
    .catch(err => {console.log(err)});
};



// display + interaction
function draw(newdata) {

    let scale = [-1,0,1, 10, 100, 500 ,1000];
    let scale_ranges = ["No Data","0","1-9", "10-99", "100-499", "500-999", "1000+" ]
    let legend_size = 20;

    const path = d3.geoPath();

    const projection = d3.geoMercator()
        .scale(120)
        .center([0,20])
        .translate([width/2.4, height/2.5]);

    //legend
    const colorScale = d3.scaleThreshold()
        .domain(scale)
        .range(d3.schemeBlues[6]);

        svg_map.selectAll("legend_squares")
        .data(scale)
        .enter()
        .append("rect")
          .attr("id","legend_squares")
          .attr("x", width/1.15)
          .attr("y", function(d,i){ return height/5 + i*(legend_size+5)}) 
          .attr("width", legend_size)
          .attr("height", legend_size)
          .style("fill", function(d){ return colorScale(d)})
      
    svg_map.selectAll("legend_labels")
        .data(scale_ranges)
        .enter()
        .append("text")
          .attr("id","legend_labels")
          .attr("x", width/1.15 + legend_size*1.2)
          .attr("y", function(d,i){ return height/5  + i*(legend_size+5) + (legend_size/2)}) 
          .style("fill", 'black')
          .text(function(d){ return d})
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle")

    //  map
    svg_map.append("g")
        .selectAll("path")
        .data(topo_data.features)
        .enter()
        .append("path")
            .attr("d", d3.geoPath()
            .projection(projection)
            )
            .attr("fill", function (d) {
                if (d.id in newdata){
                    d.total = newdata[d.id][chosen_year] 
                }
                else{
                    d.total = -1
                }
                return colorScale(d.total);
            })
            .style("stroke", "transparent")
            .attr("class", () => { return "Country" } )
            .attr("id", (d) => { return d.id + ":" + d.properties.name  } )
            .style("opacity", .8)
            .on("mouseover", mouseOver )
            .on("mouseleave", mouseLeave )
            .on("click", (d) => { chosen_country = d.path[0].id; selectCountry(); })
}

// tool tip
function mouseOver(e){
    let bound = document.getElementById("map_svg").getBoundingClientRect();

    d3.selectAll(".Country")
      .transition()
      .duration(50)
      .style("opacity", .5)
    d3.select(this)
      .transition()
      .duration(50)
      .style("opacity", 1)
      .style("stroke", "black")

    svg_map.append("rect")
        .attr("width", "300px")
        .attr("height", "50px")
        .style("opacity", .8)
        .attr("id","mouse_legend")
        .attr("x",  (d) => { 
                if(e.clientX+300 -bound.left>width){
                    return width-300 + "px";
                }
                else{
                    return e.clientX - bound.left+10+ "px";
                }
            }
        )
        .attr("y", (d) => { 
                if(e.clientY+50 -bound.top>height){
                    return height+50 + "px";
                }
                else{
                    return e.clientY - bound.top  + "px";
                }
            }
        );
        
    svg_map.append("text")
        .text((d) => { 
            let country= this.id.split(":")
            if(country[0] in country_data){
                return "Country: " + country_data[country[0]].name;
            }
            else{
                return "Country: " + country[1];
            }
             
        })
        .style('fill', 'white')
        .attr("id","mouse_legend")
        .attr("x",  (d) => { 
                if(e.clientX+300 - bound.left >width){
                    return width-300 + 5+ "px";
                }
                else{
                    return e.clientX - bound.left  + 15 + "px";
                }
            }
        )
        .attr("y", (d) => { 
                if(e.clientY+50 - bound.top >height){
                    return height-50 +20 + "px";
                }
                else{
                    return e.clientY - bound.top  + 20 + "px";
                }
            }
        );

    svg_map.append("text")
        .text((d) => { 
            let country= this.id.split(":")
            if(country[0] in country_data){
                return "Number of offshores: " + country_data[country[0]][chosen_year];
            }
            else{
                return "No data."
            }
             
        })
        .style('fill', 'white')
        .attr("id","mouse_legend")
        .attr("x",  (d) => { 
            if(e.clientX+300 - bound.left >width){
                return width-300 + 5+ "px";
            }
            else{
                return e.clientX - bound.left + 15 + "px";
            }
            }
        )
        .attr("y", (d) => { 
                if(e.clientY+50 - bound.top >height){
                    return height-50 + 40 + "px";
                }
                else{
                    return e.clientY - bound.top  + 40 + "px";
                }
            }
        );
        
        
}

// dismiss tooltip
function mouseLeave(){
    d3.selectAll(".Country")
      .transition()
      .duration(50)
      .style("opacity", .8)
    d3.select(this)
      .style("stroke", "transparent")

    d3.selectAll('#mouse_legend').remove(); 
}

// choosing a country using the select
function selectCountrySelect(){
    

    let selection = document.getElementById("country_select").value;

    if(selection != "0"){

        chosen_country = selection;
        selectCountry();
    }
    else{

        chosen_country = "";

    }
    

}

// choosing a country by clicking on it
function selectCountry(){

    document.getElementById("country_select").value = chosen_country;

    d3.selectAll('.links').remove(); 

    d3.selectAll('.nodes').remove(); 

    d3.selectAll('.labels').remove();

    if(!(chosen_country.split(":")[0] in country_data) || country_data[chosen_country.split(":")[0]][chosen_year]==0){
        document.getElementById("sankey_title").innerText="No offshores found";
        document.getElementById("sankey_discription").style.display = "none";
        return;
    }
    
    let svg = d3.select('#sankey_svg');

    document.getElementById("sankey_title").innerText="Number of offshores in " + chosen_country.split(":")[1] + " per location";
    
    document.getElementById("sankey_discription").style.display = "block";

    let color = d3.scaleOrdinal().domain(Object.keys(country_data)).range(d3.schemePaired);


    const sankey = d3.sankey()
                    .size([width/1.2, height/1.2])
                    .nodeId(d => d.id)
                    .nodeWidth(20)
                    .nodePadding(20)
                    .nodeAlign(d3.sankeyCenter);

    let graph = sankey(getGraph(chosen_country.split(":")));


    var link = svg.append("g")
                .append("g")
                .attr("class","links")
                .selectAll("path")
                .data(graph.links)
                .enter()
                    .append("path")
                    .attr("class", "link")
                    .attr("d", d3.sankeyLinkHorizontal())
                    .attr("fill", "none")
                    .attr("id", (d) => "link"+d.id)
                    .attr("stroke", "#606060")
                    .attr("stroke-width", d => d.width)
                    .attr("stoke-opacity", 0.3)
                    .attr("opacity", 0.5);


    let nodes = svg.append("g")
                    .attr("class","nodes")
                    .selectAll("rect")
                    .data(graph.nodes)
                    .enter()
                        .append("rect")
                            .attr("class","node")
                            .attr("x", d => d.x0)
                            .attr("y", d => d.y0)
                            .attr("width", d => d.x1 - d.x0)
                            .attr("height", d => d.y1 - d.y0)
                            .attr("fill", (d) => { return d.color = color(d.id.replace(/ .*/, ""));})
                            .attr("opacity", 0.8)
                        
    svg.append("g").attr("class", "labels")
                .selectAll("text")
                .data(graph.nodes) 
                .enter()
                    .append("text")
                    .attr("x", width/1.2 + 3)
                    .attr("y", function(d) {return (d.y0+d.y1)/ 2; })
                    .attr("fill", "#606060")
                    .text((d) => { 
                        
                        if(chosen_country.split(":")[0] == d.id){
                            return "";
                        }

                        let offshores = sankey_data[chosen_country.split(":")[0]]["offshores"];

                        sum=0;

                        for(let i =0; i<offshores.length; i++){
                            sum+= parseInt(offshores[i][chosen_year]);
                        }
                        
                        return  d.id + " " + d.value + " offshores (" + Math.round(d.value/sum*100) + ")%" ;
                });

}

// preprocess the data for the map
function preProcess(data) {

    let entries = Object.entries(data);
    
    let first_entry = Object.entries(entries[0][1]);

    let select = document.getElementById('country_select');

    let options = [];
    
    min_year = first_entry[0][0];
    
    document.getElementById("range_years").setAttribute("min", min_year);

    max_year = first_entry[first_entry.length-3][0];

    document.getElementById("range_years").setAttribute("max", max_year);

    chosen_year = max_year;

    document.getElementById("range_years").setAttribute("value", chosen_year);

    for(let i=0; i<data.length; i++){

        let c_data= Object.entries(entries[i][1]);

        country_data[c_data[c_data.length-2][1]] = {"name":c_data[c_data.length-1][1]};

        for(let j=0; j< c_data.length-2; j++){

            let year = c_data[j][0];

            let number = c_data[j][1];

            country_data[c_data[c_data.length-2][1]][year]=number;
        }

        options.push(c_data[c_data.length-1][1]+":"+ c_data[c_data.length-2][1])
                
    }

    options.sort()

    for(let i=0; i<options.length; i++){

        let opt = document.createElement('option');
        opt.value = options[i].split(":")[1]+ ":" + options[i].split(":")[0];
        opt.innerHTML = options[i].split(":")[0];
        select.appendChild(opt);
    }

    return country_data;
}
 
// preprocess the data for the sankey
function preProcessSankey(data){

    let entries = Object.entries(data);

    for(let i = 0; i< data.length; i++){

        let s_data = Object.entries(entries[i][1]);

        if(! (s_data[s_data.length-4][1]  in sankey_data)){

            sankey_data[s_data[s_data.length-4][1]] = {"name": s_data[s_data.length-3][1], "offshores":[] }
        
        }

        let index = sankey_data[s_data[s_data.length-4][1]]["offshores"].push({"name": s_data[s_data.length-1][1] , "id": s_data[s_data.length-2][1]})

        for(let j=0; j<s_data.length - 4; j++){

            sankey_data[s_data[s_data.length-4][1]]["offshores"][index-1][s_data[j][0]]= s_data[j][1];

        }
    }

}

// generate sankey graph
function getGraph(country){

    let graph={"nodes":[], "links": []};

    let others = 0;

    let off_data = sankey_data[country[0]]["offshores"];

    graph["nodes"].push({ "id": country[0], "name": country[1]});

    off_data.sort((a,b) => parseInt(b[chosen_year])-parseInt(a[chosen_year]));

    for(let i=0; i<off_data.length; i++){

        if(off_data[i][chosen_year]>0 && i<9){
            console.log(off_data[i][chosen_year])
            console.log(off_data[i]["id"])
            graph["nodes"].push({ "id": off_data[i]["name"]});

            graph["links"].push({ "source": country[0], "target": off_data[i]["name"], "value": off_data[i][chosen_year]});

        }
        else if(off_data[i][chosen_year]>0){

            others += parseInt(off_data[i][chosen_year]);
        }
    }
    
    console.log( graph["nodes"])
    if(others >0){

        graph["nodes"].push({ "id": "Others"});

        graph["links"].push({ "source": country[0], "target": "Others", "value": others});
    }
    
    return graph;

}

// update data 
function newdata(){

    chosen_year = document.getElementById("range_years").value;

    if(chosen_year > max_year){

        document.getElementById("range_years").value =  max_year;

    }
    else if(chosen_year < min_year){

        document.getElementById("range_years").value =  min_year;

    }
    else{

        d3.selectAll('#legend_labels').remove();

        d3.selectAll('#legend_squares').remove();
    
        d3.selectAll('g').remove();
    
        draw(country_data);
    
        if(chosen_country!=""){
            selectCountry();
        }
    }   
    
}

