function create_line_chart(csv_file, data_set, div_id, contents){
    $(div_id).empty();

    var DATA_SET;
    var margin = {top: 20, right: 20, bottom: 20, left: 30}
        , width = $( div_id).width() - margin.left - margin.right // Use the div's width
        , height = 200 - margin.top - margin.bottom; // Use the div's height

    function get_data_from_csv( callback){
        /*
            when we use data that receive from server, we don`t use this function.
            for testing.
         */
        if (data_set){
            DATA_SET = data_set;
            callback();
        }
        else {
            d3.csv(csv_file).then(function (_data) {
                DATA_SET = _data;
                callback()
            });
        }

    }

    function create_graph(){
        /*
            X scale will use the index(according to timestamp) of our data
            Y scale will use the acc X data

            Call the x, y axis in a group tag

            Append the path, bind the data, and call the line generator
         */
        var xScale = d3.scaleLinear()
            .domain( [0, DATA_SET.length - 1])
            .range( [0, width])
        var yScale = d3.scaleLinear()
            .domain( [-2,2])
            .range( [height, 0])

        var line = d3.line()
            .x( function( d, i){ return xScale(i)})
            .y( function( d){ return yScale(d[contents])})
            .curve( d3.curveMonotoneX); // apply smoothing to the line.

        var svg = d3.select(div_id).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append( "g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append( "g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call( d3.axisBottom(xScale));

        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScale));

        svg.append("path")
            .datum(DATA_SET)
            .attr("class", "line")
            .attr("d", line);

        var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("circle")
            .attr("r", 4);

        focus.append("text")
            .attr("x", 9)
            .attr("dy", ".35em");

    }

    // create graph after read data from csv
    get_data_from_csv( function(){
        create_graph()
    })

}