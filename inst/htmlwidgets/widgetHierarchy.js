HTMLWidgets.widget({

  name: 'widgetHierarchy',

  type: 'output',

  initialize: function(el, width, height) {
      d3.select(el).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");
    return d3.layout.tree();
  },
  
  doRenderValue: function(el, x, instance) {
      console.log("here", d3.event.translate, d3.event.scale);
  },

  renderValue: function(el, x, instance) {
    var spaceLR = 1.2, spaceUD = 2;

    // select the svg element and remove existing children
    var svg = d3.select(el).select("svg");
    svg.selectAll("*").remove();
    //
    instance.nodeSize([x.options.boxWidth*spaceLR, x.options.boxHeight*spaceUD]);
    posX0 = parseInt(x.options.tx);
    posY0 = parseInt(x.options.ty+x.options.boxHeight);
    //
    svg = svg.call( zm = d3.behavior.zoom().scaleExtent([0,3]).on("zoom", redraw) )
        .append("g")
        .attr("transform", "translate("+posX0+","+posY0+") rotate("+x.options.angle+") scale("+parseFloat(x.options.scale)+")");
    // Necessary so that zoom knows where to zoom and unzoom from
    zm.translate([posX0, posY0]);
    // Redraw for zoom
    function redraw() { 
        //console.log("here", d3.event.translate, d3.event.scale);
        svg.attr("transform", "translate("+d3.event.translate+")"+" scale("+d3.event.scale+")");
    }
    x.root.x0 = posY0;
    x.root.y0 = posX0;
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }
    //x.root.children.forEach(collapse);
    //this.doRenderValue(el, x, instance);
    
    // *********** Convert flat data into a nice tree ***************
    //var root = JSON.parse(x.root); // not if root is already a JSON file
    // create a name: node map
        var dataMap = x.root.reduce(function(map, node) {
                map[node.name] = node;
                return map;
        }, {});
        // create the tree array
        var treeData = [];
        x.root.forEach( function(node) {
                // add to parent
                var parent = dataMap[node.parent];
                if (parent) {
                // create child array if it doesn't exist // add node to child array
                (parent.children || (parent.children = [])).push(node);
                } else {
                // parent is null or missing
                treeData.push(node);
                }
        });
    
    /* ********************************************* */
    var fontSize = 12, lineSpace = 2;
    var duration = 750;
        
    var nodes =  instance.nodes(treeData[0]);
    var linked = nodes.filter(function(d) {
            return d.depth < 2 ;
    });
    links =  instance.links(linked);
      
      var link = svg.selectAll("path.link")
            .data(links).enter().append("path")
            .attr("class", "link");
        
            
      // https://www.dashingd3js.com/svg-paths-and-d3js
      var diagonal = d3.svg.diagonal();
      diagonal = function() {
            // radial().projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
            var mprojection = function(d) { return [d.x, d.y]; };
            //
            var mpath = function(pathData) { 
                //return "M" + pathData[0] + ' C ' + pathData[1] + " " + pathData[2]+ " " + pathData[3]; 
                return "M" + pathData[0] + "L" + pathData[1] + " " + pathData[2] + " " + pathData[3];
            };
            function mdiagonal(diagonalPath, i) {
                    var source = diagonalPath.source,
                        target = diagonalPath.target,
                        mid = (source.y + target.y) / 2,
          pathData = [source, {x: source.x, y: mid}, {x: target.x, y: mid}, target];
          pathData = pathData.map(mprojection);
          return mpath(pathData);
        }

        return mdiagonal;
      };
      link.attr("d",  diagonal());

        var parents = nodes.filter(function(d) {
            return d.depth === 2;
        });
        var alternatives = nodes.filter(function(d) {
            return d.depth === 3 ;
        });
        multiParents = [];
        parents.forEach(function(pa) {
            alternatives.forEach( function(al) {
                //JSON.parse('{ parent: '+ pa +', child: '+ al +'}'
                multiParents.push( {parent: pa, child: al} );
            });
        });
        multiParents.forEach(function(multiPair) {
            svg.append("path", "g")
                .attr("class", "alternativeLink")
                .attr("d",  function() {
                        var mprojection = function(d) { return [d.x, d.y]; };
                        var mpath = function(pathData) {
                                return " M " + pathData[0] + " L  " + pathData[1];
                        };
                        pathData = [
                        {x: multiPair.child.x, y: (multiPair.child.y-(x.options.boxHeight/2))}, 
                        {x: multiPair.parent.x, y: (multiPair.parent.y+(x.options.boxHeight/2))}
                        ];
                        pathData = pathData.map(mprojection);
                        return mpath(pathData);
                        });
                });

    var node = svg.selectAll("g.node").data(nodes).enter().append("g");
    node.attr("class", "node")
     .on("mouseover", mouseover)
     .on("mouseout", mouseout);
//    if ( (d.name).substing(1, 4) !== 'Site' && d.depth === 0) {
        node.attr("transform", function(d) { return "translate("+ d.x +","+ d.y +")"+ "rotate("+ 0 +")"; });
//    } else {
//        node.attr("transform", function(d) { return "translate("+ d.x +","+ d.y+20 +")"+ "rotate("+ 0 +")"; });
//    }
    node.append("rect")
     .attr("class", "recBox")
     .attr("x", -x.options.boxWidth/2).attr("y", -x.options.boxHeight/2)
     .attr("width", x.options.boxWidth).attr("height", x.options.boxHeight)
     .attr("rx", 0);
    node.append("text")
     .attr("id", "nodetitle")
     .attr("class", "nodeTitle")
     .attr("y", -x.options.boxHeight/2 + fontSize + 2*lineSpace)
     .attr("text-anchor", "middle")
     .text( function(d) { 
         if ( isRealValue(d.name) ) { 
             if( d.name.length > 20 ) {
                 //nTit.append("tspan").attr("x", "0").attr("dy", "1.2em").text( d.name.substring(1, d.name.length/2) );
                 //nTit.append("tspan").attr("x", "0").attr("dy", "1.2em").text( d.name.substring(d.name.length/2, d.name.length) );
                 return d.name;
             } else {
                 return d.name;
             }
        } else return d;
     });
    node.append("text")
      .attr("id", "nodetext")
      .attr("class", "nodeText")
      .attr("y", -x.options.boxHeight/2 + 2*fontSize + 4*lineSpace)
      .attr("text-anchor", "middle").text('Score: 00');

     function isRealValue(obj){ 
         return obj && obj !== "null" && obj!== "undefined" && obj!=="";
     }

    // mouseover event handler
    function mouseover() {
        var newFontSize = 18;
      d3.select(this).select("rect").transition().duration(50)
        //.attr("width", x.options.boxWidth*1.5).attr("height", x.options.boxHeight*1.5)
        .style("opacity", 1)
        .style("fill", "#c8e4f8").style("stroke", "orange").style("stroke-width", "6px");
    d3.select(this).select("text#nodetitle").transition().duration(50)
    .attr("y", -x.options.boxHeight/2 + newFontSize + 2*lineSpace)
        .style("font-weight", "bold")
        .style("font-size", "18px");
    d3.select(this).select("text#nodetext").transition().duration(50)
    .attr("y", -x.options.boxHeight/2 + 2*newFontSize + 4*lineSpace)
        .style("font-size", "16px");
//        displayInfoBox(thisNode)
    }
    
    // mouseout event handler
    function mouseout() {
      d3.select(this).select("rect").transition(0.5).duration(50)
        //.attr("width", x.options.boxWidth).attr("height", x.options.boxHeight)
        .style("opacity", 1)
        .style("fill", "white").style("stroke", "purple").style("stroke-width", "2.5px");
        d3.select(this).select("text#nodetitle").transition().duration(50)
        .attr("y", -x.options.boxHeight/2 + fontSize + 2*lineSpace)
        .style("font-weight", "normal")
        .style("font-size", "14px");
        d3.select(this).select("text#nodetext").transition().duration(50)
    .attr("y", -x.options.boxHeight/2 + 2*fontSize + 4*lineSpace)
        .style("font-size", "12px");
    }
  },
  
  resize: function(el, width, height, instance) {
    var svg = d3.select(el).selectAll("svg")
        .attr("width", width)
        .attr("height", height);
    
    var margin = {top: 20, right: 20, bottom: 20, left: 20};
    width = width - margin.right - margin.left;
    height = height - margin.top - margin.bottom;
    
    //instance.size([height, width]);
    d3.select(el).selectAll("svg").select("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

});
